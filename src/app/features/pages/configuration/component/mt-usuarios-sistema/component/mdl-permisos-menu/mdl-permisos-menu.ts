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
  listaMenus: any[] = []; // Todos los menús de tb_menu (ID_MENU, NOMBRE_MENU, ICONO)
  idsMenusPermitidos: Set<number> = new Set(); // IDs en tb_permiso_sistema para este nivel
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MdlPermisosMenu>,
    @Inject(MAT_DIALOG_DATA) public data: { nivel: string },
    private serviceStore: StoreService
  ) { }

  ngOnInit(): void {
    this.cargarDatosPermisos();
  }

  async cargarDatosPermisos() {
    this.loading = true;
    try {
      // 1. Obtener el catálogo completo de menús del sistema
      this.serviceStore.getMenu().subscribe((menu: any) => {
        this.listaMenus = menu;
      });

      // 2. Obtener los permisos actuales para el NIVEL seleccionado
      // Endpoint sugerido: GET /api/permisos?nivel=ADMINISTRADOR
      this.serviceStore.getPermissionMenu(this.data.nivel).subscribe((permission) => {
        this.idsMenusPermitidos = new Set(permission?.map((p: any) => p.id));
      });

    } catch (error) {
      console.error('Error cargando permisos de menú', error);
    } finally {
      this.loading = false;
    }
  }

  // Verifica si el toggle debe estar encendido
  menuActivo(idMenu: any): boolean {
    return this.idsMenusPermitidos.has(Number(idMenu));
  }

  // Maneja el cambio del slide-toggle
  toggleMenu(idMenu: number) {
    if (this.idsMenusPermitidos.has(idMenu)) {
      this.idsMenusPermitidos.delete(idMenu);
    } else {
      this.idsMenusPermitidos.add(idMenu);
    }

    this.guardarPermisos();
  }

  guardarPermisos() {
    this.loading = true;

    const payload = {
      NIVEL: this.data.nivel,
      MENUS: Array.from(this.idsMenusPermitidos) // Convertimos el Set a Array para el JSON
    };

    this.serviceStore.postAsingPermissionMenuUser(payload).subscribe({
      next: () => {
        this.loading = false;
      }
    });
  }
}
