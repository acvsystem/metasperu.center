import {centerApiOrigin} from '../../core/runtime-config';
import { InjectionToken, effect, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SessionState } from '../../core/auth/session-state';

export const CENTER_SOCKET_FACTORY = new InjectionToken<typeof io>('CENTER_SOCKET_FACTORY', { providedIn: 'root', factory: () => io });

export class ManagedCenterSocket {
  protected readonly session = inject(SessionState);
  protected readonly socket: Socket;
  readonly connection = signal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  socketID = '';
  constructor(path: string) {
    this.socket = inject(CENTER_SOCKET_FACTORY)(centerApiOrigin(), {
      path, autoConnect: false, withCredentials: true,
      auth: callback => callback({ token: this.session.token() }),
      transports: ['websocket', 'polling'], reconnection: true, reconnectionDelay: 1000,
      reconnectionDelayMax: 15000, timeout: 15000,
    });
    this.socket.on('connect', () => { this.socketID = this.socket.id || ''; this.connection.set('connected'); });
    this.socket.on('disconnect', () => { this.socketID = ''; this.connection.set('disconnected'); });
    this.socket.on('session_expired',()=>this.session.expire());
    this.socket.on('connect_error', () => this.connection.set('disconnected'));
    effect(() => { if (this.session.active()) this.conectar(); else this.desconectar(); });
  }
  conectar() {
    if (!this.session.active() || this.socket.active) return;
    this.connection.set('connecting');
    this.socket.connect();
  }
  desconectar() { this.socket.disconnect(); this.socketID = ''; this.connection.set('disconnected'); }
  protected listen(event: string, callback: (value: any) => void): () => void {
    this.socket.on(event, callback);
    return () => this.socket.off(event, callback);
  }
}
