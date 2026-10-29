import { ManagedCenterSocket } from './managed-center-socket';
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketInventoryService extends ManagedCenterSocket {

    constructor() {
        super('/s4/socket/');
    }


    onUpdateInventory(callback: (data: any) => void) {
        return this.listen('update_inventory', callback);
        return () => this.socket?.off('update_inventory', callback);
    }

    onOneInvenrotyStore(callback: (data: any) => void) {
        return this.listen('dashboard_response_one_store_inventory', callback);
    }
}
