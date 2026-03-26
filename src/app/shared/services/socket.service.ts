// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket | undefined;
    public socketID: any = "";
    // Usamos BehaviorSubject para que el UI siempre tenga la última lista de tiendas
    private tiendasSubject = new BehaviorSubject<any[]>([]);
    public tiendas$ = this.tiendasSubject.asObservable();

    constructor() {
        this.conectar();
    }

    conectar() {
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
            this.socket?.emit('registrar_dashboard');
            this.socketID = this.socket?.id;
        });

        // Escuchar actualización de estados de las tiendas
        this.socket.on('actualizar_dashboard', (tiendas: any[]) => {
            this.tiendasSubject.next(tiendas);
        });
    }

    desconectar() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    


    // Método para pedir documentos a una tienda específica
    solicitarDocumentos(idTienda: string) {
        console.log(idTienda);
        this.socket?.emit('solicitar_documentos', idTienda);
    }

    // Escuchar respuesta específica de documentos faltantes
    onDocumentosRecibidos(callback: (data: any) => void) {
        this.socket?.on('documents_response_dashboard', callback);
    }

    // Escuchar respuesta específica de transacciones
    onTransactionsFrontRetail(callback: (data: any) => void) {
        this.socket?.on('transactions_response_dashboard', callback);
    }

    onClientBlank(callback: (data: any) => void) {
        this.socket?.on('client_blank_response_dashboard', callback);
    }

    onTrafficCounter(callback: (data: any) => void) {
        this.socket?.on('traffic_response_dashboard', callback);
    }

    onResponseTransfer(callback: (data: any) => void) {
        this.socket?.on('transfer_response_dashboard', callback);
    }

    onResponseDeleteClient(callback: (data: any) => void) {
        this.socket?.on('delete_client_esponse_dashboard', callback);
    }

    onResponseDeleteColaPnm(callback: (data: any) => void) {
        this.socket?.on('delete_cola_panama_dashboard', callback);
    }

    onStatusServerBackup(callback: (data: any) => void) {
        this.socket?.on('status_server_backup_dashboard', callback);
    }

}