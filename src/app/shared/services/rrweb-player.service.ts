import {centerApiOrigin} from '../../core/runtime-config';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, EMPTY, expand, reduce, map } from 'rxjs';

export interface RrwebSession {
  session_id: string;
  user_name: string | null;
  user_role: string | null;
  user_store: string | null;
  page_url: string | null;
  status: 'recording' | 'ended';
  event_count: number;
  started_at: string;
  ended_at: string | null;
  last_event_at: string | null;
}

export interface RrwebSessionEvents {
  sessionId: string;
  events: any[];
  nextCursor?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class RrwebPlayerService {
  private http = inject(HttpClient);
  private readonly API_URL = centerApiOrigin() + '/s1/center';

  listSessions(page=1,limit=25): Observable<{rows:RrwebSession[];total:number;page:number;limit:number}> {
    return this.http.get<{rows:RrwebSession[];total:number;page:number;limit:number}>(`${this.API_URL}/api/rrweb/sessions`, {params:{page,limit}});
  }

  getSessionEvents(sessionId: string): Observable<RrwebSessionEvents> {
    const chunk=(after=0)=>this.http.get<RrwebSessionEvents>(`${this.API_URL}/api/rrweb/session/${encodeURIComponent(sessionId)}/events`,{params:{after}});
    return chunk().pipe(
      expand(page=>page.nextCursor ? chunk(page.nextCursor) : EMPTY,1),
      reduce((result,page)=>{
        result.bytes+=JSON.stringify(page.events).length;
        if(result.bytes>32*1024*1024 || result.events.length+page.events.length>100000) throw new Error('La grabacion supera el limite de reproduccion.');
        result.events.push(...page.events);return result;
      },{events:[] as any[],bytes:0}),
      map(result=>({sessionId,events:result.events}))
    );
  }
}
