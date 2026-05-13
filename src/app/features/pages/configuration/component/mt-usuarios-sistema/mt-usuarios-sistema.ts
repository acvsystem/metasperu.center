import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MdlUsuarioTienda } from './component/mdl-usuario-tienda/mdl-usuario-tienda';
import { MdlPermisosMenu } from './component/mdl-permisos-menu/mdl-permisos-menu';
import { MdlUpdateUsuario } from './component/mdl-update-usuario/mdl-update-usuario';
import { MdlCreateUsuario } from './component/mdl-create-usuario/mdl-create-usuario';
import { StoreService } from '@metasperu/services/store.service';
import { MatSnackBar } from '@angular/material/snack-bar';
export type NotificationType = 'success' | 'warning' | 'danger';

@Component({
  selector: 'mt-usuarios-sistema',
  standalone: false,
  templateUrl: './mt-usuarios-sistema.html',
  styleUrl: './mt-usuarios-sistema.scss',
})
export class MtUsuariosSistema {

  displayedColumns: string[] = ['usuario', 'nivel', 'accesos', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;

  constructor(private dialog: MatDialog, private storeService: StoreService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.storeService.getUsuarios().subscribe((usuarios: any) => {
      this.dataSource.data = usuarios;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getNivelClass(nivel: string): string {
    switch (nivel) {
      case 'ADMINISTRADOR': return 'bg-admin';
      case 'VENDEDOR': return 'bg-vendedor';
      default: return 'bg-supervisor';
    }
  }

  gestionarTiendas(usuario: any) {
    this.dialog.open(MdlUsuarioTienda, {
      width: '500px',
      data: { usuario: usuario },
      panelClass: 'modal-grande',
    }).afterClosed().subscribe(result => {
      console.log('Resultado del modal de tiendas:', result);
      if (result) this.cargarUsuarios();
    });
  }

  gestionarPermisosMenu(usuario: any) {
    this.dialog.open(MdlPermisosMenu, {
      width: '600px',
      panelClass: 'modal-grande',
      data: { nivel: usuario.NIVEL }
    });
  }

  editarUsuario(usuario: any) {
    const dialogRef = this.dialog.open(MdlUpdateUsuario, {
      width: '600px',
      data: usuario, // Le pasas el objeto que recibió la fila
      panelClass: 'modal-mediano'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos a enviar al API:', result);
        this.storeService.updateUsuario(result).subscribe((response) => {
          this.mostrarNotificacion((response || {})['message']);
          this.cargarUsuarios();
        });
      }
    });
  }

  eliminarUsuario(id: number) {
    const body = { id: id };

    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.storeService.deleteUsuario(body).subscribe((response) => {
        this.mostrarNotificacion((response || {})['message']);
        this.cargarUsuarios();
      });
    }
  }

  abrirFormularioUsuario() {
    const dialogRef = this.dialog.open(MdlCreateUsuario, {
      width: '550px',
      panelClass: 'modal-grande'
    });

    dialogRef.afterClosed().subscribe(nuevoUsuario => {
      if (nuevoUsuario) {
        this.storeService.createUsuario(nuevoUsuario).subscribe((response) => {
          this.mostrarNotificacion((response || {})['message']);
          this.cargarUsuarios();
        });
      }
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

  mostrarNotificacion(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }

}
