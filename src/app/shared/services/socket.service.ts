// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;
    public socketID: any = "";
    // Usamos BehaviorSubject para que el UI siempre tenga la última lista de tiendas
    private tiendasSubject = new BehaviorSubject<any[]>([]);
    public tiendas$ = this.tiendasSubject.asObservable();

    constructor() {
        // URL de tu backend Node.js
        this.socket = io('https://api.metasperu.net.pe', {
            path: '/s1/socket/', // <--- IMPORTANTE: Nginx redirige esto al puerto 3001
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servidor de monitoreo');
            this.socket.emit('registrar_dashboard');
            this.socketID = this.socket.id;
        });

        // Escuchar actualización de estados de las tiendas
        this.socket.on('actualizar_dashboard', (tiendas: any[]) => {
            console.log(tiendas);
            this.tiendasSubject.next(tiendas);
        });
    }

    // Método para pedir documentos a una tienda específica
    solicitarDocumentos(idTienda: string) {
        console.log(idTienda);
        this.socket.emit('solicitar_documentos', idTienda);
    }

    // Escuchar respuesta específica de documentos faltantes
    onDocumentosRecibidos(callback: (docs: any) => void) {
        this.socket.on('documents_response_dashboard', callback);
    }

    // Escuchar respuesta específica de transacciones
    onTransactionsFrontRetail(callback: (docs: any) => void) {
        this.socket.on('transactions_response_dashboard', callback);
    }

    onClientBlank(callback: (client: any) => void) {
        this.socket.on('client_blank_response_dashboard', callback);
    }

    onTrafficCounter(callback: (client: any) => void) {
        this.socket.on('traffic_response_dashboard', callback);
    }
}