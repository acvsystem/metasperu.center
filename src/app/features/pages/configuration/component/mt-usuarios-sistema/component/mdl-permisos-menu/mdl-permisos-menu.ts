import { Subscription as ViewSubscriptions,forkJoin,finalize } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'mdl-permisos-menu',
  standalone: false,
  templateUrl: './mdl-permisos-menu.html',
  styleUrl: './mdl-permisos-menu.scss',
})
export class MdlPermisosMenu {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  listaMenus: any[] = []; // Todos los menús de tb_menu (ID_MENU, NOMBRE_MENU, ICONO)
  idsMenusPermitidos: Set<number> = new Set(); // IDs en tb_permiso_sistema para este nivel
  loading=false;ready=false;dirty=false;error='';

  constructor(
    public dialogRef: MatDialogRef<MdlPermisosMenu>,
    @Inject(MAT_DIALOG_DATA) public data: { nivel: string },
    private serviceStore: StoreService
  ) { }

  ngOnInit(): void {
    this.cargarDatosPermisos();
  }

  cargarDatosPermisos(){
    this.loading=true;this.ready=false;
    this.viewSubscriptions.add(forkJoin({menus:this.serviceStore.getMenu(),permissions:this.serviceStore.getPermissionMenu(this.data.nivel)}).pipe(
      finalize(()=>this.loading=false)
    ).subscribe({next:({menus,permissions})=>{
      this.listaMenus=menus;this.idsMenusPermitidos=new Set(permissions.map((item:any)=>Number(item.id)));this.ready=true;
    },error:()=>this.error='No se pudieron cargar los permisos. Cierra el formulario e intenta nuevamente.'}));
  }

  // Verifica si el toggle debe estar encendido
  menuActivo(idMenu: any): boolean {
    return this.idsMenusPermitidos.has(Number(idMenu));
  }

  // Maneja el cambio del slide-toggle
  toggleMenu(idMenu: number) {
    if(this.loading||!this.ready)return;
    if (this.idsMenusPermitidos.has(idMenu)) {
      this.idsMenusPermitidos.delete(idMenu);
    } else {
      this.idsMenusPermitidos.add(idMenu);
    }

    this.dirty=true;this.dialogRef.disableClose=true;
  }

  guardarPermisos(){
    if(this.loading||!this.ready||!this.dirty)return;
    this.loading=true;this.error='';
    this.viewSubscriptions.add(this.serviceStore.postAsingPermissionMenuUser({NIVEL:this.data.nivel,MENUS:[...this.idsMenusPermitidos]}).pipe(
      finalize(()=>this.loading=false)
    ).subscribe({next:()=>{this.dirty=false;this.dialogRef.close(true);},error:()=>this.error='No se pudo guardar. Tus cambios siguen aqui para reintentar.'}));
  }
  cerrar(){
    if(this.loading)return;
    if(!this.dirty||confirm('Hay cambios sin guardar. ¿Quieres descartarlos?'))this.dialogRef.close(false);
  }

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
