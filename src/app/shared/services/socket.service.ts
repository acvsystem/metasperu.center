import { ManagedCenterSocket } from './managed-center-socket';
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService extends ManagedCenterSocket {
    // Usamos BehaviorSubject para que el UI siempre tenga la última lista de tiendas
    private tiendasSubject = new BehaviorSubject<any[]>([]);
    public tiendas$ = this.tiendasSubject.asObservable();

    constructor() {
        super('/s1/socket/');
        this.socket.on('connect', () => this.socket.emit('registrar_dashboard'));
        this.socket.on('actualizar_dashboard', (stores: any[]) => this.tiendasSubject.next(stores));
    }

    // Método para pedir documentos a una tienda específica
    solicitarDocumentos(idTienda: string) {
        console.log(idTienda);
        this.socket?.emit('solicitar_documentos', idTienda);
    }

    // Escuchar respuesta específica de documentos faltantes
    onDocumentosRecibidos(callback: (data: any) => void) {
        return this.listen('documents_response_dashboard', callback);
    }

    // Escuchar respuesta específica de transacciones
    onTransactionsFrontRetail(callback: (data: any) => void) {
        return this.listen('transactions_response_dashboard', callback);
    }

    onClientBlank(callback: (data: any) => void) {
        return this.listen('client_blank_response_dashboard', callback);
    }

    onTrafficCounter(callback: (data: any) => void) {
        return this.listen('traffic_response_dashboard', callback);
    }

    onResponseTransfer(callback: (data: any) => void) {
        return this.listen('transfer_response_dashboard', callback);
    }

    onResponseDeleteClient(callback: (data: any) => void) {
        return this.listen('client_refresh_dashboard', callback);
    }

    onResponseDeleteColaPnm(callback: (data: any) => void) {
        return this.listen('delete_cola_panama_dashboard', callback);
    }

    onStatusServerBackup(callback: (data: any) => void) {
        return this.listen('status_server_backup_dashboard', callback);
    }

    onTrafficCounterStatus(callback: (data: any) => void) {
        return this.listen('traffic_counter_dashboard', callback);
    }

    onRefreshColaPanama(callback: (data: any) => void) {
        return this.listen('transaction_refresh_dashboard', callback);
    }

    onInformeRendimiento(callback: (data: any) => void) {
        return this.listen('response_informe_rendimiento', callback);
    }
}