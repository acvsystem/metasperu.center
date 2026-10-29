import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom,retry,timeout } from 'rxjs';
import { record } from 'rrweb';
import { SessionState } from '../../core/auth/session-state';
import { RecordingBuffer } from './recording-buffer';

@Injectable({providedIn:'root'})
export class RrwebRecorderService {
  private readonly http=inject(HttpClient);
  private readonly session=inject(SessionState);
  private readonly API_URL='https://api.metasperu.net.pe/s1/center/api/rrweb';
  private sessionId='';
  private buffer=new RecordingBuffer();
  private ready:Promise<boolean>=Promise.resolve(false);
  private sending?:Promise<void>;
  private stopping?:Promise<void>;
  private stopRecording?:()=>void;
  private timer?:number;
  private active=false;

  start() {
    if(this.stopping){void this.stopping.then(()=>this.start());return;}
    if(this.active||!this.session.active())return;
    if((localStorage.getItem('role')||'').toUpperCase()==='SISTEMAS')return;
    this.active=true;this.sessionId=crypto.randomUUID();this.buffer=new RecordingBuffer();
    this.ready=firstValueFrom(this.http.post(`${this.API_URL}/session/start`,{
      sessionId:this.sessionId,pageUrl:location.origin+location.pathname,userAgent:navigator.userAgent,
    }).pipe(timeout(10000))).then(()=>true,()=>{console.warn('No se pudo iniciar la grabacion.');this.stopRecording?.();return false;});
    this.stopRecording=record({emit:event=>{
      if(!this.buffer.push(event)){this.stopRecording?.();return;}
    },maskAllInputs:true,maskTextSelector:'body',blockClass:'rrweb-block',ignoreClass:'rrweb-ignore',checkoutEveryNms:60000});
    this.timer=window.setInterval(()=>void this.flush(),10000);
    window.addEventListener('beforeunload',this.unload);
  }

  flush():Promise<void> {
    if(this.sending)return this.sending;
    const id=this.sessionId,buffer=this.buffer;
    this.sending=(async()=>{
      if(!await this.ready)return;
      let batch=buffer.take();
      while(batch&&id===this.sessionId){
        try {
          await firstValueFrom(this.http.post(`${this.API_URL}/events`,{sessionId:id,...batch}).pipe(timeout(10000),retry({count:2,delay:500})));
          buffer.acknowledge(batch.sequenceNumber);batch=buffer.take();
        } catch {console.warn('Se reintentara el lote de grabacion pendiente.');break;}
      }
    })().finally(()=>this.sending=undefined);
    return this.sending;
  }

  stop():Promise<void> {
    if(this.stopping)return this.stopping;
    if(!this.active)return Promise.resolve();
    this.active=false;this.stopRecording?.();this.stopRecording=undefined;
    if(this.timer)window.clearInterval(this.timer);this.timer=undefined;
    window.removeEventListener('beforeunload',this.unload);
    const id=this.sessionId;
    this.stopping=(async()=>{
      let deadline:ReturnType<typeof setTimeout>|undefined;
      await Promise.race([this.flush(),new Promise<void>(resolve=>{deadline=setTimeout(resolve,8000);})]);
      clearTimeout(deadline);
      // Never close a session ahead of an unacknowledged batch. Server retention handles abandoned sessions.
      if(!this.buffer.take() && await this.ready)await firstValueFrom(this.http.post(`${this.API_URL}/session/end`,{sessionId:id}).pipe(timeout(5000))).catch(()=>undefined);
    })().finally(()=>this.stopping=undefined);
    return this.stopping;
  }

  private unload=()=>{
    if(!this.active)return;
    const batch=this.buffer.take();if(!batch)return;
    const body=JSON.stringify({sessionId:this.sessionId,...batch});
    if(new Blob([body]).size>60000)return;
    const token=this.session.token();
    void fetch(`${this.API_URL}/events`,{method:'POST',credentials:'include',keepalive:true,
      headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body}).catch(()=>undefined);
  };
}
