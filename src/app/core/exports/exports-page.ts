import {centerApiOrigin} from '../runtime-config';
import { Component,DestroyRef,computed,inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { exhaustMap,timer,takeWhile,Subscription,timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
interface ExportJob{id:string;kind:string;status:'queued'|'running'|'completed'|'failed'|'cancelled';progress:number;processedRows:number;errorCode?:string;downloadReady:boolean;}

@Component({selector:'center-exports',standalone:true,imports:[CommonModule,FormsModule],template:`
  <section class="export-card">
    <p class="eyebrow">METAS PERÚ CENTER</p><h1>Exportaciones</h1>
    <p>Prepara el reporte en segundo plano. Puedes continuar trabajando y regresar aqui para descargarlo.</p>
    <label for="export-kind">Reporte</label><select id="export-kind" [(ngModel)]="kind" [disabled]="busy()||starting()">
      <option value="transfers">Historial de traspasos</option><option value="recordings">Registro de sesiones</option>
    </select>
    <label for="export-filter">Filtro opcional</label><input id="export-filter" [(ngModel)]="filter" maxlength="120" [disabled]="busy()||starting()" placeholder="Codigo, tienda o usuario">
    <button type="button" class="btn btn-primary" [disabled]="busy()||starting()" (click)="start()">{{starting()?'Preparando…':'Preparar reporte CSV'}}</button>
    <p class="muted">El archivo CSV se puede abrir en Excel. Estara disponible durante 24 horas para tu cuenta.</p>
    @if(job();as current){
      <div class="job" aria-live="polite"><h2>{{statusLabel()}}</h2>
        @if(busy()){
          <progress [value]="current.progress" max="100" aria-label="Progreso de exportacion"></progress>
          <p>{{current.progress}}% · {{current.processedRows | number}} filas procesadas</p>
          <button type="button" class="btn btn-outline-secondary" [disabled]="cancelling()" (click)="cancel()">{{cancelling()?'Cancelando…':'Cancelar reporte'}}</button>
        }
        @if(current.downloadReady){<p>{{current.processedRows | number}} filas listas.</p>
          <button type="button" class="btn btn-primary" [disabled]="downloading()" (click)="download()">{{downloading()?'Descargando…':'Descargar CSV'}}</button>}
      </div>
    }
    <p role="status">{{message()}}</p>
    @if(job()&&message()) {<button type="button" class="btn btn-outline-primary" (click)="watch(job()!.id)">Consultar estado</button>}
  </section>`,styles:[`
  :host{display:block;padding:24px;color:var(--center-ink)}.export-card{max-width:800px;margin:0 auto;padding:28px;background:var(--center-surface);border:1px solid var(--center-line);border-radius:10px}
  h1{font-size:24px;margin:8px 0 20px}h2{font-size:18px}.eyebrow,.muted{color:var(--center-muted);font-size:12px}p{line-height:1.6}
  label{display:block;margin:18px 0 6px;font-size:13px}input,select{display:block;width:min(100%,380px);margin-bottom:18px;padding:9px 12px;border:1px solid var(--center-line);border-radius:6px;background:var(--center-surface);color:var(--center-ink)}
  .job{margin-top:24px;padding-top:18px;border-top:1px solid var(--center-line)}progress{width:100%;height:16px;accent-color:#193f72}
  @media(max-width:600px){:host{padding:12px}.export-card{padding:20px}button{width:100%}}
  `]})
export class ExportsPage {
  private readonly http=inject(HttpClient);
  private readonly auth=inject(AuthService);
  private readonly destroy=inject(DestroyRef);
  private readonly api=centerApiOrigin() + '/s1/center/api/exports';
  private polling?:Subscription;
  private creationId?:string;
  private creationSignature?:string;
  readonly job=signal<ExportJob|null>(null);
  readonly message=signal('');readonly starting=signal(false);readonly downloading=signal(false);readonly cancelling=signal(false);
  readonly busy=computed(()=>['queued','running'].includes(this.job()?.status||''));
  readonly statusLabel=computed(()=>({queued:'Reporte en cola',running:'Preparando reporte',completed:'Reporte listo',failed:'No se pudo completar',cancelled:'Reporte cancelado'})[this.job()?.status||'queued']);
  kind='transfers';filter='';
  private readonly storageKey='center-export:'+encodeURIComponent(String(this.auth.user()?.id||this.auth.user()?.username||''));
  constructor(){
    try{const id=localStorage.getItem(this.storageKey);if(id&&/^[a-f0-9-]{36}$/i.test(id))this.watch(id);}catch{}
    this.destroy.onDestroy(()=>this.polling?.unsubscribe());
  }
  start(){
    if(this.starting()||this.busy())return;
    const signature=JSON.stringify([this.kind,this.filter]);
    if(this.job()||!this.creationId||signature!==this.creationSignature)this.creationId=crypto.randomUUID();
    this.creationSignature=signature;
    this.job.set(null);this.starting.set(true);this.message.set('');
    try{localStorage.setItem(this.storageKey,this.creationId);}catch{}
    this.http.post<{id:string}>(this.api,{requestId:this.creationId,kind:this.kind,q:this.filter}).pipe(timeout(15000),takeUntilDestroyed(this.destroy)).subscribe({
      next:result=>{this.job.set({id:result.id,kind:this.kind,status:'queued',progress:0,processedRows:0,downloadReady:false});this.starting.set(false);try{localStorage.setItem(this.storageKey,result.id);}catch{}this.watch(result.id);},
      error:error=>{this.starting.set(false);this.message.set(error.status===503?'El procesador de reportes no esta disponible. Intenta mas tarde.':'No se pudo crear el reporte. Intenta nuevamente.');}
    });
  }
  watch(id:string){
    this.polling?.unsubscribe();this.message.set('');
    // A saved job may still be running even while its first status request is pending.
    if(!this.job())this.job.set({id,kind:this.kind,status:'queued',progress:0,processedRows:0,downloadReady:false});
    this.polling=timer(0,1500).pipe(exhaustMap(()=>this.http.get<ExportJob>(this.api+'/'+encodeURIComponent(id)).pipe(timeout(15000))),
      takeWhile(job=>['queued','running'].includes(job.status),true),takeUntilDestroyed(this.destroy)).subscribe({
      next:job=>{this.job.set(job);if(job.status==='failed')this.message.set(job.errorCode==='EXPORT_TOO_LARGE'?'El reporte supera el limite. Reduce el filtro para generar uno mas pequeño.':'No se pudo completar el reporte. Puedes preparar uno nuevo.');},
      error:error=>{this.message.set(error.status===404?'El reporte ya no esta disponible. Puedes preparar uno nuevo.':'No se pudo consultar el estado. Tu reporte puede seguir en proceso.');
        if(error.status===404){this.job.set(null);try{localStorage.removeItem(this.storageKey);}catch{}}}
    });
  }
  cancel(){
    if(!this.job()||this.cancelling())return;this.cancelling.set(true);
    this.http.post<ExportJob>(this.api+'/'+this.job()!.id+'/cancel',{}).pipe(timeout(15000),takeUntilDestroyed(this.destroy)).subscribe({
      next:job=>{this.cancelling.set(false);this.job.set(job);},error:()=>{this.cancelling.set(false);this.message.set('No se pudo confirmar la cancelacion. Consulta el estado.');}
    });
  }
  download(){
    const job=this.job();if(!job?.downloadReady||this.downloading())return;this.downloading.set(true);
    this.http.get(this.api+'/'+job.id+'/download',{responseType:'blob'}).pipe(timeout(60000),takeUntilDestroyed(this.destroy)).subscribe({
      next:blob=>{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=job.kind+'-'+job.id.slice(0,8)+'.csv';
        document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);this.downloading.set(false);this.message.set('Archivo preparado para descargar.');},
      error:()=>{this.downloading.set(false);this.message.set('No se pudo descargar el archivo. Puedes intentarlo nuevamente.');}
    });
  }
}
