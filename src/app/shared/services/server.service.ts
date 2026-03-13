import { EventEmitter, Injectable, Output, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SocketService } from '@metasperu/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    @Output() onNotification: EventEmitter<any> = new EventEmitter();
    @Output() onMenu: EventEmitter<any> = new EventEmitter();


    constructor(private socketService: SocketService) { }

    private http = inject(HttpClient);

    // Cambia esta URL según tu entorno de desarrollo/producción
    private readonly API_URL = 'https://api.metasperu.net.pe/s1/center';

    /**
     * Manejo centralizado de errores de HTTP
     */
    private handleError(error: HttpErrorResponse) {
        const self = this;
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.status === 401) {
            errorMessage = 'Sesión expirada o no autorizada. Por favor, inicie sesión.';
        } else if (error.status === 404) {
            errorMessage = 'El código de inventario no existe.';
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        }

        //console.error(`Error ${error.status}:`, error);

        return throwError(() => new Error(errorMessage));
    }

    callComparationsServer(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/server/comparation/documents/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

}