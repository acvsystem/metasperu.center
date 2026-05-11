import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MdlUsuarioTienda } from './component/mdl-usuario-tienda/mdl-usuario-tienda';
import { MdlPermisosMenu } from './component/mdl-permisos-menu/mdl-permisos-menu';
@Component({
  selector: 'mt-usuarios-sistema',
  standalone: false,
  templateUrl: './mt-usuarios-sistema.html',
  styleUrl: './mt-usuarios-sistema.scss',
})
export class MtUsuariosSistema {

  displayedColumns: string[] = ['usuario', 'nivel', 'accesos', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    // Aquí conectas con tu API
    this.dataSource.data = [
      { ID_LOGIN: 1, USUARIO: 'jflores', EMAIL: 'jflores@metas.pe', NIVEL: 'SISTEMAS', CODE_STORE: '7A' },
      { ID_LOGIN: 2, USUARIO: 'mrodriguez', EMAIL: 'mrodriguez@metas.pe', NIVEL: 'TIENDA', CODE_STORE: '9N' }
    ];
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

  editarUsuario(usuario: any) { /* ... */ }
  eliminarUsuario(id: number) { /* ... */ }
  abrirFormularioUsuario() { /* ... */ }

}
