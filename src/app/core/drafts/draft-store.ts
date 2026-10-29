import { Injectable,inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/** Draft ownership comes from the verified session, never the last stored username. */
@Injectable({providedIn:'root'})
export class DraftStore {
  private readonly auth=inject(AuthService);
  private key(store:string,kind:string):string {
    const id=this.auth.user()?.id;
    if(!Number.isSafeInteger(id)||!id||!store||!kind)throw new Error('No hay una cuenta y tienda verificadas para el borrador.');
    return ['center-draft-v1',id,encodeURIComponent(store),encodeURIComponent(kind)].join(':');
  }
  read<T>(store:string,kind:string):T|null {
    const raw=localStorage.getItem(this.key(store,kind));
    if(!raw)return null;
    // Corrupt content is preserved for recovery rather than deleted or automatically adopted.
    return JSON.parse(raw) as T;
  }
  save(store:string,kind:string,value:unknown):void {
    localStorage.setItem(this.key(store,kind),JSON.stringify(value));
  }
  remove(store:string,kind:string):void {
    localStorage.removeItem(this.key(store,kind));
  }
}
