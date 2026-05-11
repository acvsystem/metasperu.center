import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StoreService } from '@metasperu/services/store.service';
export type NotificationType = 'success' | 'warning' | 'danger';

@Component({
  selector: 'mt-permisos-tiendas',
  standalone: false,
  templateUrl: './mt-permisos-tiendas.html',
  styleUrl: './mt-permisos-tiendas.scss',
})
export class MtPermisosTiendas {
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;

  constructor(private serviceStore: StoreService) {

  }

  ngOnInit() {
    this.serviceStore.getPermissionStore().subscribe((data) => {
      this.dataSource.data = [];
      this.dataSource.data = data.map((item: any) => {
        return {
          id: item.id,
          nombre: item.nombre,
          horarioPermiso: item.horarioPermiso ? true : false,
          papeletaPermiso: item.papeletaPermiso ? true : false,
          avisosTraffic: item.avisosTraffic ? true : false
        }
      });
    });
  }

  // Columnas que coinciden con tu imagen
  displayedColumns: string[] = ['tienda', 'horario', 'papeleta', 'avisos'];

  dataSource = new MatTableDataSource<TiendaPermiso>([]);

  guardarCambios() {
    const body = this.dataSource.data.map((item: any) => {
      return {
        id: item.id,
        horarioPermiso: item.horarioPermiso ? 1 : 0,
        papeletaPermiso: item.papeletaPermiso ? 1 : 0,
        avisosTraffic: item.avisosTraffic ? 1 : 0
      }
    });


    this.serviceStore.postPermissionStore(body).subscribe((response) => {
      this.messageNotification = (response || {})['message'];
      this.abrirNotificacion('success');
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

export interface TiendaPermiso {
  nombre: string;
  horarioPermiso: boolean;
  papeletaPermiso: boolean;
  avisosTraffic: boolean;
}