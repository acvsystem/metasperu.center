import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreService } from '@metasperu/services/store.service';
import { MdlInUpdParametroStore } from './component/mdl-in-upd-parametro-store/mdl-in-upd-parametro-store';

@Component({
  selector: 'mt-parametros-tienda',
  standalone: false,
  templateUrl: './mt-parametros-tienda.html',
  styleUrl: './mt-parametros-tienda.scss',
})
export class MtParametrosTienda {
  // Columnas a mostrar en la tabla (las más relevantes)
  displayedColumns: string[] = ['nro_caja', 'mac', 'serie_tienda', 'database_instance', 'database_name', 'cod_tipo_factura', 'cod_tipo_boleta', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private storeService: StoreService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.listarParametros();
  }

  listarParametros() {
    this.storeService.getTiendaParametros().subscribe({
      next: (data: any) => this.dataSource.data = data,
      error: (err: any) => this.mostrarNotificacion('Error al cargar datos')
    });
  }

  abrirDialogo(data?: any) {
    const dialogRef = this.dialog.open(MdlInUpdParametroStore, {
      width: '800px',
      disableClose: true,
      panelClass: 'modal-grande',
      data: data || null // Si data existe es edición, si no, es creación
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) this.listarParametros();
    });
  }

  eliminar(id: number) {
    if (confirm('¿Está seguro de eliminar esta configuración?')) {
      this.storeService.deleteTiendaParametro(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Eliminado correctamente');
          this.listarParametros();
        }
      });
    }
  }

  mostrarNotificacion(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
