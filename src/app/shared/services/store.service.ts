import { EventEmitter, Injectable, Output, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SocketService } from '@metasperu/services/socket.service';
import * as CryptoJS from 'crypto-js';
export interface Store {
    id?: number;
    serie: string;
    nombre: string;
    codigo_almacen: string;
    unidad_servicio: string;
    marca: string;
    email: string;
    codigo_ejb: string;
    estado?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    @Output() onNotification: EventEmitter<any> = new EventEmitter();
    private readonly secretKey = 'D3SP4RANCUT1R1M1CU4R0';

    constructor(private socketService: SocketService) { }

    private http = inject(HttpClient);

    // Cambia esta URL según tu entorno de desarrollo/producción
    private readonly API_URL = 'https://api.metasperu.net.pe/s1/center';
    private readonly API_URL_INVENTORY = 'https://api.metasperu.net.pe/s4/center/inventory';
    private readonly API_URL_RESOURCES_HUMAN = 'https://api.metasperu.net.pe/s5/center/resources/human';
    private readonly API_URL_ACCOUNTING = 'https://api.metasperu.net.pe/s6/center/accounting';
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


    callRefreshDashboard(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/dashboard/store/refresh`
        ).pipe(
            catchError(this.handleError)
        );
    }

    // Dentro de la clase InventoryService
    getStores(): Observable<Store[]> {
        return this.http.get<Store[]>(`${this.API_URL}/api/store`);
    }

    postStore(bodyStore: Store): Observable<any> {
        return this.http.post(
            `${this.API_URL}/api/store`,
            {
                serie: bodyStore.serie,
                nombre: bodyStore.nombre,
                codigo_almacen: bodyStore.codigo_almacen,
                unidad_servicio: bodyStore.unidad_servicio,
                marca: bodyStore.marca,
                email: bodyStore.email,
                codigo_ejb: bodyStore.codigo_ejb
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    putStore(bodyStore: Store): Observable<any> {
        return this.http.put(
            `${this.API_URL}/api/store`,
            {
                id: bodyStore.id,
                serie: bodyStore.serie,
                nombre: bodyStore.nombre,
                codigo_almacen: bodyStore.codigo_almacen,
                unidad_servicio: bodyStore.unidad_servicio,
                marca: bodyStore.marca,
                email: bodyStore.email,
                codigo_ejb: bodyStore.codigo_ejb,
                estado: bodyStore.estado
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    delStore(id: number): Observable<any> {
        return this.http.delete(
            `${this.API_URL}/api/store/${id}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callDocumentsMissing(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/documents/missing/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callTransactions(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/transactions/frontretail/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callClientBlank(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/client/blank/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callClientDelete(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/delete/client/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callTrafficCounterStatus(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/traffic/verification/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callTransferTerminal(terminal: any): Observable<any> {
        return this.http.post(
            `${this.API_URL}/api/transactions/transfer/terminal`,
            {
                socketId: this.socketService.socketID,
                serie: terminal.serie,
                terminalIn: terminal.terminalIn,
                terminalOut: terminal.terminalOut
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    callDeleteColaPanama(): Observable<any> {
        return this.http.get(
            `${this.API_URL}/api/delete/cola/panama/${this.socketService.socketID}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callInventory(marca: any): Observable<any> {
        return this.http.get(
            `${this.API_URL_INVENTORY}/api/inventory/store/${marca}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callUpdateInventory(marca: string, serieStore: string): Observable<any> {
        return this.http.get(
            `${this.API_URL_INVENTORY}/api/inventory/consolidated/${marca}/${serieStore}`,
        ).pipe(
            catchError(this.handleError)
        );
    }

    callInventoryEmail(email: string, stores: Array<any>): Observable<any> {
        return this.http.post(
            `${this.API_URL_INVENTORY}/api/inventory/application/inventary/email`,
            {
                "email": email,
                "serieStore": stores
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    callRegisterEmployes(): Observable<any> {
        return this.http.get(
            `${this.API_URL_RESOURCES_HUMAN}/api/asistence/ejb/register/employes`
        ).pipe(
            catchError(this.handleError)
        );
    }

    callAsistenceEmployes(fecha: any, type: string): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/asistence/employes/store`,
            {
                "fecha": fecha,
                "tipoConsulta": type
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    callRefreshAsistenceEmployes(propertyCode: string): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/asistence/employes/store/refresh`,
            {
                "property": propertyCode
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    getOneBallot(codeBallot: string): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/ballot/employes/store`,
            {
                "codeBallot": codeBallot
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    postKardex(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/kardex/store`,
            {
                serieStore: bodyStore.serieStore,
                socketId: bodyStore.socket,
                init: bodyStore.init,
                end: bodyStore.end
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    postKardexCamposLibres(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/kardex/camposlibres`, bodyStore
        ).pipe(
            catchError(this.handleError)
        );
    }

    postCuo(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/cuo/store`,
            {
                serieStore: bodyStore.serieStore,
                socketId: bodyStore.socket,
                init: bodyStore.init,
                end: bodyStore.end
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    postInsertCuo(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/cuo/insert`, bodyStore
        ).pipe(
            catchError(this.handleError)
        );
    }

    postOneInventoryStore(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_INVENTORY}/api/inventory/one/search`, bodyStore
        ).pipe(
            catchError(this.handleError)
        );
    }

    postTraspasos(formData: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_INVENTORY}/api/inventory/traspasos`, formData
        ).pipe(
            catchError(this.handleError)
        );
    }

    getTraspasos(): Observable<any> {
        return this.http.get(
            `${this.API_URL_INVENTORY}/api/inventory/traspasos`
        ).pipe(
            catchError(this.handleError)
        );
    }

    postInsertTraspasos(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_INVENTORY}/api/inventory/traspasos/insert`, body
        ).pipe(
            catchError(this.handleError)
        );
    }


    getHorarios(): Observable<any> {
        return this.http.get(
            `${this.API_URL_RESOURCES_HUMAN}/api/schedule/store`
        ).pipe(
            catchError(this.handleError)
        );
    }

    postSearchHorarios(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/search/schedule/store`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    postRegisterHorarios(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/register/schedule/store`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    postoneSearchHorarios(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/one/search/schedule/store`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    putHorario(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/update/schedule/store`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    postExchangeRate(bodyStore: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/exchange-rate/store`, bodyStore
        ).pipe(
            catchError(this.handleError)
        );
    }

    postTipoCambioSunat(bodySunat: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_ACCOUNTING}/api/exchange-rate/sunat`, bodySunat
        ).pipe(
            catchError(this.handleError)
        );
    }



    encrypt(text: string): string {
        return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    }

    /**
     * Desencripta un hash/texto cifrado (Dos vías)
     */
    decrypt(cipherText: string): string {
        const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    getTypeBallot(): Observable<any> {
        return this.http.get(
            `${this.API_URL_RESOURCES_HUMAN}/api/type/ballot`
        ).pipe(
            catchError(this.handleError)
        );
    }

    postHoursWorksEmployes(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/hours/works/employes`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    postSaveBallot(body: Ballot): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/create/ballot/employes`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    postSolicitarAprobacionHextra(body: SolicitudHrx): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/solicitude/approval/hours/works/employes`, body
        ).pipe(
            catchError(this.handleError)
        );
    }

    getAllHorasExtrasEmployes(): Observable<any> {
        return this.http.get(
            `${this.API_URL_RESOURCES_HUMAN}/api/all/solicitude/hours/works/employes`
        ).pipe(
            catchError(this.handleError)
        );
    }

    postRespuestaAprobacionHextra(body: any): Observable<any> {
        return this.http.post(
            `${this.API_URL_RESOURCES_HUMAN}/api/approval/hours/works/employes`, body
        ).pipe(
            catchError(this.handleError)
        );
    }
}

export interface Ballot {
    empleado: {
        codigoTienda: string,
        nroDocumento: string,
        nombre: string,
        idTipoPapeleta: string,
        cargo: string
    },
    papeleta: {
        fechaDesde: string,
        fechaHasta: string,
        horaSalida: string,
        horaLlegada: string,
        horaAcumulada: string,
        horaSolicitada: string,
        descripcion: string
    },
    detalles: BallotDetail[]
}

export interface BallotDetail {
    idHrExtra: string,
    hrExtraAcumulado: string,
    hrExtraSolicitado: string,
    hrExtraSobrante: string,
    fecha: string
}

export interface SolicitudHrx {
    nroDocumento: string,
    nombreCompleto: string,
    horasAcumuladas: string,
    fecha: string,
    codigoTienda: string,
    comentario: string
}