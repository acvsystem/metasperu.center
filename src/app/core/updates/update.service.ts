import { Injectable,InjectionToken,DestroyRef,inject,signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { CURRENT_RELEASE } from './release-info';
export const RELOAD_APP=new InjectionToken<()=>void>('RELOAD_APP',{providedIn:'root',factory:()=>()=>location.reload()});
export interface ReleaseInfo {version:string;notes:readonly string[];}

@Injectable({providedIn:'root'})
export class UpdateService {
  private readonly sw=inject(SwUpdate);
  private readonly reload=inject(RELOAD_APP);
  readonly current:ReleaseInfo=CURRENT_RELEASE;
  readonly available=signal<ReleaseInfo|null>(null);
  readonly checking=signal(false);
  readonly applying=signal(false);
  readonly message=signal('');
  readonly enabled=this.sw.isEnabled;
  private canReload=()=>true;
  constructor(){
    if(!this.enabled)return;
    const subscription=this.sw.versionUpdates.subscribe(event=>{
      if(event.type==='VERSION_READY'){
        const metadata=event.latestVersion.appData as Partial<ReleaseInfo>|undefined;
        this.available.set({version:typeof metadata?.version==='string'?metadata.version:event.latestVersion.hash.slice(0,12),
          notes:Array.isArray(metadata?.notes)?metadata.notes.filter(note=>typeof note==='string'):[]});
        this.message.set('Hay una nueva version lista para instalar.');
      }else if(event.type==='VERSION_INSTALLATION_FAILED')this.message.set('No se completo la descarga. Puedes intentarlo nuevamente.');
    });
    const check=()=>{if(navigator.onLine&&document.visibilityState==='visible')void this.check();};
    const timer=setInterval(check,5*60*1000);window.addEventListener('focus',check);
    inject(DestroyRef).onDestroy(()=>{subscription.unsubscribe();clearInterval(timer);window.removeEventListener('focus',check);});
    check();
  }
  protectReload(check:()=>boolean){this.canReload=check;}
  canLeaveForUpdate(){
    if(this.canReload())return true;
    this.message.set('Guarda tus cambios y cierra los formularios antes de actualizar.');return false;
  }
  async check(){
    if(!this.enabled||this.checking())return;
    this.checking.set(true);
    try {if(!await this.sw.checkForUpdate()&&!this.available())this.message.set('Ya tienes la version mas reciente.');}
    catch{this.message.set('No se pudo comprobar la version. Revisa tu conexion.');}
    finally{this.checking.set(false);}
  }
  async apply(){
    if(!this.available()||this.applying()||!this.canLeaveForUpdate())return;
    this.applying.set(true);
    try {await this.sw.activateUpdate();this.reload();}
    catch{this.message.set('No se pudo activar la actualizacion. Tus datos siguen guardados.');this.applying.set(false);}
  }
}
