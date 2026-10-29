import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateService } from './update.service';
@Component({selector:'center-updates',standalone:true,imports:[CommonModule],template:`
  <section class="updates-card">
    <p class="eyebrow">METAS PERÚ CENTER</p><h1>Actualizaciones</h1>
    <p class="muted">Version instalada: <strong>{{updates.current.version}}</strong></p>
    @if(updates.available(); as release){
      <div class="release"><span class="tag">Nueva version</span><h2>{{release.version}}</h2>
        <ul><li *ngFor="let note of release.notes">{{note}}</li></ul>
        <p>Se recargara la aplicacion. No se borraran los datos guardados ni tus preferencias.</p>
        <button type="button" class="btn btn-primary" [disabled]="updates.applying()" (click)="updates.apply()">
          {{updates.applying()?'Actualizando…':'Actualizar ahora'}}</button>
      </div>
    } @else {
      <h2>{{updates.enabled?'Tu aplicacion esta al dia':'Vista de desarrollo'}}</h2>
      <ul><li *ngFor="let note of updates.current.notes">{{note}}</li></ul>
    }
    <p role="status">{{updates.message()}}</p>
    <button type="button" class="btn btn-outline-primary" [disabled]="!updates.enabled||updates.checking()||updates.applying()" (click)="updates.check()">
      {{updates.checking()?'Buscando…':'Buscar actualizaciones'}}</button>
  </section>`,styles:[`
  :host{display:block;padding:24px;color:var(--center-ink)}
  .updates-card{max-width:800px;margin:0 auto;padding:28px;border:1px solid var(--center-line);border-radius:10px;background:var(--center-surface)}
  h1{font-size:24px;margin:8px 0 20px}h2{font-size:18px;margin:18px 0}.eyebrow,.muted{color:var(--center-muted);font-size:12px}
  li{margin:10px 0;line-height:1.6}p{line-height:1.6}.release{padding-top:20px;border-top:1px solid var(--center-line)}
  .tag{background:var(--center-blue-soft);color:var(--center-link);padding:5px 10px;border-radius:20px;font-size:12px}
  @media(max-width:600px){:host{padding:12px}.updates-card{padding:20px}button{width:100%}}
  `]})
export class UpdatesPage{readonly updates=inject(UpdateService);}
