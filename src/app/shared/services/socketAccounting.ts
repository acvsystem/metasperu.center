// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketAccountingService {
    private socket: Socket | undefined;
    public socketID: any = "";

    constructor() {
        this.conectar();
    }

    conectar() {
        // URL de tu backend Node.js
        this.socket = io('https://api.metasperu.net.pe', {
            path: '/s6/socket/', // <--- IMPORTANTE: Nginx redirige esto al puerto 3001
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servicio de accounting');
            this.socketID = this.socket?.id;
        });

    }

    desconectar() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onUpdateKardex(callback: (data: any) => void) {
        this.socket?.on('dashboard_kardex_store', callback);
    }

    onReponseCamposLibres(callback: (data: any) => void) {
        this.socket?.on('dashboard_kardex_campos_libres', callback);
    }

    onUpdateCuo(callback: (data: any) => void) {
        this.socket?.on('dashboard_cuo_store', callback);
    }

    onResponseInsertCuo(callback: (data: any) => void) {
        this.socket?.on('dashboard_cuo_insert', callback);
    }

    onResponseExchangeRate(callback: (data: any) => void) {
        this.socket?.on('dashboard_exchange_rate_store', callback);
    }
}