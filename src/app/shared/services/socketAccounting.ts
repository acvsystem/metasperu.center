import { ManagedCenterSocket } from './managed-center-socket';
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketAccountingService extends ManagedCenterSocket {

    constructor() {
        super('/s6/socket/');
    }


    onUpdateKardex(callback: (data: any) => void) {
        return this.listen('dashboard_kardex_store', callback);
    }

    onReponseCamposLibres(callback: (data: any) => void) {
        return this.listen('dashboard_kardex_campos_libres', callback);
    }

    onUpdateCuo(callback: (data: any) => void) {
        return this.listen('dashboard_cuo_store', callback);
    }

    onResponseInsertCuo(callback: (data: any) => void) {
        return this.listen('dashboard_cuo_insert', callback);
    }

    onResponseExchangeRate(callback: (data: any) => void) {
        return this.listen('dashboard_exchange_rate_store', callback);
    }
}