import { Component, inject } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
export type NotificationType = 'success' | 'warning' | 'danger';
import { MatDialog } from '@angular/material/dialog';
import { MtComentario } from './component/mt-comentario/mt-comentario';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
import { MtMarcacionesEmployes } from '@metasperu/component/mt-datatable/component/mt-marcaciones-employes/mt-marcaciones-employes';

@Component({
  selector: 'autorizacion-horas-extras',
  standalone: false,
  templateUrl: './autorizacion-horas-extras.html',
  styleUrl: './autorizacion-horas-extras.scss',
})
export class AutorizacionHorasExtras {
  dialog = inject(MatDialog);
  dataTable: Array<any> = [];
  columnsInventory: tableColumns[] = [
    { isSticky: true, matColumnDef: 'tienda', titleColumn: 'Tienda', propertyValue: 'descripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'fecha_hora_extra', titleColumn: 'Fecha', propertyValue: 'fecha', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'hora_extra', titleColumn: 'Hora Extra', propertyValue: 'hr_extra', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'nombre_completo', titleColumn: 'Nombre Completo', propertyValue: 'nombre_completo', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'comentario', titleColumn: 'Comentario', propertyValue: 'comentario', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'usuario', titleColumn: 'Usuario', propertyValue: 'usuario_modf', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'estado_auth', titleColumn: 'Estado', propertyValue: 'estado_auth', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'autorizar', titleColumn: 'Autorizar', propertyValue: 'accion_autorizar', filterActive: false, isCboFilter: false, cboFilter: [] }]

  columnsTable = [...this.columnsInventory]
  displayedColumnsTable = this.columnsTable.map(col => col.matColumnDef);
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
  messageNotification: string = '';
  comentarioModal: string = "";
  marcacionesEmpleado: any[] = [];
  isLoading: boolean = false;
  titleLoader: string = "Cargando información...";
  isModalActive: boolean = false;
  isConectedSocket: boolean = false;
  constructor(private storeService: StoreService, private socketService: SocketResourcesHumanService) { }

  ngOnInit() {
    this.allAtorizacionHoraExtra();
    this.socketService.onAsistenceOneEmploye((response: any) => {
      this.marcacionesEmpleado = [];
      this.isLoading = false;
      this.marcacionesEmpleado = response?.data;
      if (this.marcacionesEmpleado.length && !this.isModalActive) {
        this.openDialog();
      }
    });

    this.socketService.socket$.subscribe((id) => {
      if ((id || "").length) {
        this.isConectedSocket = true;
      } else {
        this.isConectedSocket = false;
      }
    });
  }

  allAtorizacionHoraExtra() {
    this.storeService.getAllHorasExtrasEmployes().subscribe((res: any) => {
      this.dataTable = res.data;
    });
  }

  async onAuth(row: any) {
    if (row.accion != 'marcaciones') {
      this.comentarioModal = "";
      const usuario = localStorage.getItem('name') || "";

      if (row.accion == 'rechazar') {
        await this.openComentarioModal();
      }

      const body = {
        id_auth_hrx: row.id_auth_hr_ext,
        id_hrx: row.id_hora_extra,
        aprobado: row.accion == 'aprobado' ? true : false,
        comentario: this.comentarioModal,
        usuario: usuario,
        tienda: row.descripcion,
        fecha: row.fecha,
        hr_extra: row.hr_extra,
        nombre_empleado: row.nombre_completo,
        email: row.email
      }

      this.storeService.postRespuestaAprobacionHextra(body).subscribe((res: any) => {
        if (res.success) {
          this.messageNotification = 'Respuesta registrada exitosamente.';
          this.abrirNotificacion('success');
          this.allAtorizacionHoraExtra();
        }
      });
    } else {
      this.isLoading = true;
      this.titleLoader = "Cargando marcaciones...";
      const body = {
        "fecha_desde": row.fecha,
        "fecha_hasta": row.fecha,
        "documento": row.nro_documento,
        "socket": this.socketService.socketID,
        "isAsistencia": true,
        "serie": row.store_code
      };

      this.storeService.postHoursWorksEmployes(body).subscribe(() => {

      });
    }
  }

  openDialog() {
    this.isModalActive = true;
    const dialogRef = this.dialog.open(MtMarcacionesEmployes, {
      panelClass: 'modal-mediano',
      data: {
        dataDialog: this.marcacionesEmpleado,
        title: 'Marcaciones del empleado'
      }
    })
    dialogRef.afterClosed().subscribe((saved: boolean) => {
      this.isModalActive = false;
    });
  }

  openComentarioModal() {
    return new Promise((resolve, reject) => {
      const dialogRef = this.dialog.open(MtComentario, {
        panelClass: 'modal-mediano',
        data: {
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.comentarioModal = result;
          resolve(this.comentarioModal);
        }
      });
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

export interface tableColumns {
  isSticky: boolean;
  matColumnDef: string;
  titleColumn: string;
  extraProperty?: string;
  propertyValue: string;
  filterActive: boolean;
  isCboFilter: boolean;
  cboFilter: Array<any>;
}