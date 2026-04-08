import { Component, Input, ViewChild } from '@angular/core';
import { SocketAccountingService } from '@metasperu/services/socketAccounting';
import { StoreService } from '@metasperu/services/store.service';
export type NotificationType = 'success' | 'warning' | 'danger';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mt-cuo',
  standalone: false,
  templateUrl: './mt-cuo.html',
  styleUrl: './mt-cuo.scss',
})
export class MtCuo {
  @Input() cboStore: Array<any> = [];
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
  storesSelected: Array<any> = [];
  dateCalendar: Array<any> = [];
  displayedColumns: string[] = ['tabla', 'documento', 'fecha', 'comentario', 'cuo'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private accService: SocketAccountingService, private storeService: StoreService) { }

  ngOnInit() {
    this.accService.onUpdateCuo((data: any) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });

    this.accService.onResponseInsertCuo((data: any) => {
      this.messageNotification = data.message;
      this.abrirNotificacion('success');
    });
  }

  onChangeSelect(item: any) {
    this.storesSelected = [];
    this.storesSelected = [{ serie: item.key, nombre: item.value }];
  }

  onCalendar(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendar = value;
  }

  // Función para capturar el cambio en la celda editable
  onCuoChange(element: any, newValue: string) {
    element.dtCuo = newValue;
    // Aquí puedes marcar el elemento como "isUpdate = true" para el guardado masivo
    console.log(`Nuevo CUO para ${element.dtDocumento}: ${newValue}`);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSearchCuo() {
    if (this.storesSelected.length == 0) {
      this.messageNotification = 'Seleccione una tienda.';
      this.abrirNotificacion('danger');
    } else if (this.dateCalendar.length == 0) {
      this.messageNotification = 'Seleccione un rango de fechas.';
      this.abrirNotificacion('danger');
    } else {
      const body = {
        serieStore: this.storesSelected[0].serie,
        socket: this.accService.socketID,
        init: this.dateCalendar[0],
        end: this.dateCalendar[1]
      };
      this.storeService.postCuo(body).subscribe((data: any) => {
        //console.log(data);
      });
    }
  }

  onSaveCuo() {
    let bodyCuo = this.dataSource.data.map((item: any) => {
      return { tabla: item.dtTabla, cuo: item.dtCuo, valor: item.dtDocumento }
    });

    const body = {
      "serieStore": this.storesSelected[0].serie,
      "socketId": this.accService.socketID,
      "data": bodyCuo
    }

    this.storeService.postInsertCuo(body).subscribe((data: any) => {
      //console.log(data);
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
