// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketResourcesHumanService {
    private socket: Socket | undefined;
    public socketID: any = "";
    private socketSubject = new BehaviorSubject<any[]>([]);
    public socket$ = this.socketSubject.asObservable();

    constructor() {
        this.conectar();
    }

    conectar() {
        // URL de tu backend Node.js
        this.socket = io('https://api.metasperu.net.pe', {
            path: '/s5/socket/', // <--- IMPORTANTE: Nginx redirige esto al puerto 3001
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servicio de Resources Human');
            //this.socket?.emit('registrar_dashboard');
            this.socketID = this.socket?.id;
            this.socketSubject.next(this.socketID);
        });

    }

    desconectar() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onRefreshEmployesAsistence(callback: (data: any) => void) {
        this.socket?.on('dashboard_refresh_empleados', callback);
    }

    onRefreshEmployesEJB(callback: (data: any) => void) {
        this.socket?.on('dashboard_empleados_horario', callback);
    }

    offRefreshEmployesEJB(callback: (data: any) => void) {
        this.socket?.off('dashboard_empleados_horario', callback);
    }

    onHoursWorksEmployes(callback: (data: any) => void) {
        this.socket?.on('py_works_hours_employes_response', callback);
    }

    offHoursWorksEmployes(callback: (data: any) => void) {
        this.socket?.off('py_works_hours_employes_response', callback);
    }


}