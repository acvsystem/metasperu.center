import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { record } from 'rrweb';

@Injectable({
  providedIn: 'root'
})
export class RrwebRecorderService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.metasperu.net.pe/s1/center';
  private readonly batchSize = 25;
  private readonly flushIntervalMs = 10000;
  private readonly excludedUsers = ['JOHNNY'];
  private readonly excludedRoles = ['SISTEMAS'];

  private sessionId = '';
  private sequenceNumber = 0;
  private eventsBuffer: any[] = [];
  private stopRecording?: () => void;
  private flushTimer?: number;
  private isStarted = false;

  start() {
    if (this.isStarted || typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;
    if (this.isExcludedUser()) return;

    this.isStarted = true;
    this.sessionId = this.createSessionId();
    this.sequenceNumber = 0;
    this.eventsBuffer = [];

    this.http.post(`${this.API_URL}/api/rrweb/session/start`, {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      metadata: this.getMetadata()
    }).subscribe({ error: (err) => console.warn('No se pudo iniciar rrweb:', err) });

    this.stopRecording = record({
      emit: (event) => {
        this.eventsBuffer.push(event);

        if (this.eventsBuffer.length >= this.batchSize) {
          this.flush();
        }
      },
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: true,
        tel: true,
        text: true,
        textarea: true,
        number: true
      },
      blockClass: 'rrweb-block',
      ignoreClass: 'rrweb-ignore',
      checkoutEveryNms: 60000
    });

    this.flushTimer = window.setInterval(() => this.flush(), this.flushIntervalMs);
    window.addEventListener('beforeunload', this.flushWithFetch);
  }

  stop() {
    if (!this.isStarted) return;

    this.flush();
    this.stopRecording?.();

    if (this.flushTimer) {
      window.clearInterval(this.flushTimer);
    }

    this.http.post(`${this.API_URL}/api/rrweb/session/end`, {
      sessionId: this.sessionId
    }).subscribe({ error: (err) => console.warn('No se pudo finalizar rrweb:', err) });

    window.removeEventListener('beforeunload', this.flushWithFetch);
    this.isStarted = false;
    this.stopRecording = undefined;
    this.flushTimer = undefined;
  }

  flush() {
    if (!this.isStarted || this.eventsBuffer.length === 0) return;

    const events = this.eventsBuffer.splice(0, this.eventsBuffer.length);
    const sequenceNumber = ++this.sequenceNumber;

    this.http.post(`${this.API_URL}/api/rrweb/events`, {
      sessionId: this.sessionId,
      sequenceNumber,
      events
    }).subscribe({
      error: (err) => {
        console.warn('No se pudo guardar lote rrweb:', err);
        this.eventsBuffer.unshift(...events);
      }
    });
  }

  private flushWithFetch = () => {
    if (!this.isStarted || this.eventsBuffer.length === 0) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const events = this.eventsBuffer.splice(0, this.eventsBuffer.length);
    const sequenceNumber = ++this.sequenceNumber;

    fetch(`${this.API_URL}/api/rrweb/events`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        sequenceNumber,
        events
      })
    }).catch(() => undefined);
  };

  private createSessionId() {
    if (crypto?.randomUUID) return crypto.randomUUID();

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private getMetadata() {
    return {
      userName: localStorage.getItem('name'),
      role: localStorage.getItem('role'),
      store: localStorage.getItem('marca')
    };
  }

  private isExcludedUser() {
    const userName = (localStorage.getItem('name') || '').trim().toUpperCase();
    const role = (localStorage.getItem('role') || '').trim().toUpperCase();

    return this.excludedUsers.includes(userName) || this.excludedRoles.includes(role);
  }
}
