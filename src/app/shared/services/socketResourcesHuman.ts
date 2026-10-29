import { ManagedCenterSocket } from './managed-center-socket';
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { StoreService } from '@metasperu/services/store.service';
@Injectable({
    providedIn: 'root'
})
export class SocketResourcesHumanService extends ManagedCenterSocket {
    private socketSubject = new BehaviorSubject<any[]>([]);
    public socket$ = this.socketSubject.asObservable();

    constructor() {
        super('/s5/socket/');
        this.socket.on('connect', () => this.socketSubject.next(this.socketID as any));
    }


    onRefreshEmployesAsistence(callback: (data: any) => void) {
        return this.listen('dashboard_refresh_empleados', callback);
    }

    onRefreshEmployesEJB(callback: (data: any) => void) {
        return this.listen('dashboard_empleados_horario', callback);
    }

    offRefreshEmployesEJB(callback: (data: any) => void) {
        this.socket?.off('dashboard_empleados_horario', callback);
    }

    onHoursWorksEmployes(callback: (data: any) => void) {
        return this.listen('py_works_hours_employes_response', callback);
    }

    offHoursWorksEmployes(callback: (data: any) => void) {
        this.socket?.off('py_works_hours_employes_response', callback);
    }

    onAsistenceOneEmploye(callback: (data: any) => void) {
        return this.listen('py_asistence_employes_response', callback);
    }



}