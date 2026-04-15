import { Component } from '@angular/core';
import { tableColumns } from '../rrhh-asistencia/rrhh-asistencia';
import { StoreService } from '@metasperu/services/store.service';
import { SocketAccountingService } from '@metasperu/services/socketAccounting';
export type NotificationType = 'success' | 'warning' | 'danger';

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

  columnsExchangeRate: tableColumns[] = [
    { isSticky: true, matColumnDef: 'fecha', titleColumn: 'Fecha', propertyValue: 'cFecha', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'descripcion', titleColumn: 'Descripcion', propertyValue: 'cDescripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'iniciales', titleColumn: 'Iniciales', propertyValue: 'cIniciales', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tipo-cambio-historico', titleColumn: 'TC Historico', propertyValue: 'cCotizacion', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsExchangeRate = this.columnsExchangeRate.map(col => col.matColumnDef);

  constructor(private storeService: StoreService, private socketAccountingService: SocketAccountingService) { }

  ngOnInit() {
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

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

}
