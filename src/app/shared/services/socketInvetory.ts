// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketInventoryService {
    private socket: Socket | undefined;
    public socketID: any = "";

    constructor() {
        this.conectar();
    }

    conectar() {
        // URL de tu backend Node.js
        this.socket = io('https://api.metasperu.net.pe', {
            path: '/s4/socket/', // <--- IMPORTANTE: Nginx redirige esto al puerto 3001
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servicio de inventario');
            //this.socket?.emit('registrar_dashboard');
            //this.socketID = this.socket?.id;
        });

    }

    desconectar() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onUpdateInventory(callback: (data: any) => void) {
        this.socket?.on('update_inventory', callback);
    }

}