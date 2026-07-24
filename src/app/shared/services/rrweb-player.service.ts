import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class RrwebPlayerService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.metasperu.net.pe/s1/center';

  listSessions(): Observable<RrwebSession[]> {
    return this.http.get<RrwebSession[]>(`${this.API_URL}/api/rrweb/sessions`);
  }

  getSessionEvents(sessionId: string): Observable<RrwebSessionEvents> {
    return this.http.get<RrwebSessionEvents>(
      `${this.API_URL}/api/rrweb/session/${sessionId}/events`
    );
  }
}
