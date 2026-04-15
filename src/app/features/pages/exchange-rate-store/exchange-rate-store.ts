import { Component } from '@angular/core';
import { tableColumns } from '../rrhh-asistencia/rrhh-asistencia';
import { StoreService } from '@metasperu/services/store.service';
import { SocketAccountingService } from '@metasperu/services/socketAccounting';
export type NotificationType = 'success' | 'warning' | 'danger';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, lastValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'exchange-rate-store',
  standalone: false,
  templateUrl: './exchange-rate-store.html',
  styleUrl: './exchange-rate-store.scss',
})
export class ExchangeRateStore {

  dataExchangeRate: Array<any> = [];
  dateCalendar: Array<any> = [];
  storeList: Array<any> = [];
  cboStoreList: Array<any> = [];
  selectedStore: any = {};
  titleLoader: string = 'Buscando Tipo de Cambio...';
  typeNotification: NotificationType = 'success';
  messageNotification: string = '';
  isNotification: boolean = false;
  isLoading: boolean = false;
  tcActual: string = "";
  tcSunat: string = "";

  columnsExchangeRate: tableColumns[] = [
    { isSticky: true, matColumnDef: 'fecha', titleColumn: 'Fecha', propertyValue: 'cFecha', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'descripcion', titleColumn: 'Descripcion', propertyValue: 'cDescripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'iniciales', titleColumn: 'Iniciales', propertyValue: 'cIniciales', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tipo-cambio-historico', titleColumn: 'TC Historico', propertyValue: 'cCotizacion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tipo-cambio-sunat', titleColumn: 'TC Sunat', propertyValue: 'cCotiSunat', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'estado', titleColumn: 'Estado', propertyValue: 'cEstado', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsExchangeRate = this.columnsExchangeRate.map(col => col.matColumnDef);

  constructor(private storeService: StoreService, private socketAccountingService: SocketAccountingService) { }

  ngOnInit() {
    this.cargarTipoCambio(new Date().toISOString().split('T')[0]);

    this.socketAccountingService.onResponseExchangeRate((data: any) => {
      this.isLoading = false;
      this.dataExchangeRate = data;
      this.tcActual = data[0]['cCotiActual'];
    });

    this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
        this.cboStoreList = this.storeList.map(store => ({ key: store.serie, value: store.nombre }));
      }
    );
  }

  onCalendar(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendar = value;
  }

  async onChangeSelect(data: any) {
    this.selectedStore = data;
  }

  async cargarTipoCambio(fecha: string) {
    const res = await lastValueFrom(this.storeService.postTipoCambioSunat({ fecha }));
    this.tcSunat = res.data.venta; // Aquí el texto ya está asignado
  }

  async onSincronizarSunat() {
    this.isLoading = true;

    // 1. Recorremos tu tabla (donde 'fila' es cada objeto de la lista)
    for (let fila of this.dataExchangeRate) {

      try {
        // 2. Hacemos la petición y ESPERAMOS (await) a que llegue el valor
        // Usamos lastValueFrom para convertir el observable en algo que espera el texto
        const response = await lastValueFrom(
          this.storeService.postTipoCambioSunat({ fecha: fila.cFecha })
        );

        // 3. Insertamos el texto directamente en la propiedad de la fila
        // Aquí ya NO es una promesa, es el valor real (ej: "3.75")
        fila.cCotiSunat = response?.data?.venta || "0.00";
        fila.cEstado = fila.cCotizacion != fila.cCotiSunat ? 'Diferencia' : 'Correcto';
      } catch (error) {
        console.error(`Error en la fecha ${fila.fecha}:`, error);
        fila.tipoCambio = "Error";
      }
    }
    this.isLoading = false;
    this.messageNotification = 'Sincronización realizada con éxito.';
    this.abrirNotificacion('success');
  }

  onTipoCambioSunat(fecha: string): Observable<string> {
    return this.storeService.postTipoCambioSunat({ fecha }).pipe(
      map(response => response.data.venta),
      catchError(error => {
        console.error(error);
        return of(""); // Retorna un string vacío en caso de error
      })
    );
  }
  onSearch() {

    if (this.dateCalendar.length === 0) {
      this.messageNotification = 'Seleccione un rango de fecha';
      this.abrirNotificacion('danger');
      return;
    }

    if (Object.keys(this.selectedStore).length === 0) {
      this.messageNotification = 'Seleccione una tienda';
      this.abrirNotificacion('danger');
      return;
    }

    this.isLoading = true;
    const body = {
      serieStore: this.selectedStore.key,
      socketId: this.socketAccountingService.socketID,
      init: this.dateCalendar[0],
      end: this.dateCalendar[1]
    };

    this.storeService.postExchangeRate(body).subscribe((response) => {

    });
  }

  exportarAExcel() {
    if (this.dataExchangeRate.length === 0) {
      this.messageNotification = 'No hay datos que exportar.';
      this.abrirNotificacion('danger');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(this.dataExchangeRate);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Feriados');

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `Reporte_exchange_rate_${new Date().getTime()}.xlsx`);
  }


  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

}
