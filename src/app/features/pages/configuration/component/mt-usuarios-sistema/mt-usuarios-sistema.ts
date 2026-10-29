import { Subscription as ViewSubscriptions, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, catchError, of, finalize } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
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
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];


  displayedColumns: string[] = ['usuario', 'nivel', 'accesos', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  total=0;pageIndex=0;pageSize=25;loading=false;loadError='';
  private search='';private readonly reload=new Subject<void>();
  private readonly searches=new Subject<string>();
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;

  constructor(private dialog: MatDialog, private storeService: StoreService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.viewSubscriptions.add(this.searches.pipe(debounceTime(300),distinctUntilChanged()).subscribe(q=>{
      this.search=q;this.pageIndex=0;this.cargarUsuarios();
    }));
    this.viewSubscriptions.add(this.reload.pipe(startWith(undefined),switchMap(()=>{
      this.loading=true;this.loadError='';
      return this.storeService.getUsuarios(this.pageIndex+1,this.pageSize,this.search).pipe(
        catchError(()=>{this.loadError='No se pudieron cargar los usuarios.';return of({rows:[],total:0});}),
        finalize(()=>this.loading=false));
    })).subscribe(result=>{this.dataSource.data=result.rows;this.total=result.total;}));
  }
  cargarUsuarios(){this.reload.next();}
  applyFilter(event:Event){this.searches.next((event.target as HTMLInputElement).value.trim());}
  changePage(event:PageEvent){this.pageIndex=event.pageIndex;this.pageSize=event.pageSize;this.cargarUsuarios();}

  getNivelClass(nivel: string): string {
    switch (nivel) {
      case 'ADMINISTRADOR': return 'bg-admin';
      case 'VENDEDOR': return 'bg-vendedor';
      default: return 'bg-supervisor';
    }
  }

  gestionarTiendas(usuario: any) {
    this.viewSubscriptions.add(this.dialog.open(MdlUsuarioTienda, {
      width: '500px',
      data: { usuario: usuario },
      panelClass: 'modal-grande',
    }).afterClosed().subscribe(result => {

      if (result) this.cargarUsuarios();
    }));
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

    this.viewSubscriptions.add(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarNotificacion(result.message || 'Usuario actualizado.');
        this.cargarUsuarios();
      }
    }));
  }

  eliminarUsuario(id: number) {
    const body = { id: id };

    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.viewSubscriptions.add(this.storeService.deleteUsuario(body).subscribe((response) => {
        this.mostrarNotificacion((response || {})['message']);
        this.cargarUsuarios();
      }));
    }
  }

  abrirFormularioUsuario() {
    const dialogRef = this.dialog.open(MdlCreateUsuario, {
      width: '550px',
      panelClass: 'modal-grande'
    });

    this.viewSubscriptions.add(dialogRef.afterClosed().subscribe(nuevoUsuario => {
      if (nuevoUsuario) {
        this.mostrarNotificacion(nuevoUsuario.message || 'Usuario creado.');
        this.cargarUsuarios();
      }
    }));
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


  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
