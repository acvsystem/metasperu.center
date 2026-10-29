import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionState {
  readonly token = signal<string | null>(null);
  readonly active = signal(false);
  readonly expired = new Subject<void>();
  constructor() { localStorage.removeItem('auth_token'); }
  open(token?: string) { this.token.set(token || null); this.active.set(true); }
  clear() { this.token.set(null); this.active.set(false); }
  expire() {
    if (!this.active()) return;
    this.clear();
    this.expired.next();
  }
}
