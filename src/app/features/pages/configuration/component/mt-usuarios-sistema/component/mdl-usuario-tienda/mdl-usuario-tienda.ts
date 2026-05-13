import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { HttpClient } from '@angular/common/http'; // O tu servicio personalizado
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'app-mdl-usuario-tienda',
  standalone: false,
  templateUrl: './mdl-usuario-tienda.html',
  styleUrl: './mdl-usuario-tienda.scss',
})
export class MdlUsuarioTienda {
  // Referencia a la lista para manipular la selección si es necesario
  @ViewChild('listaTiendas') listaTiendas!: MatSelectionList;

  todasLasTiendas: any[] = [];
  tiendasFiltradas: any[] = [];
  tiendasSeleccionadas: number[] = []; // Array de IDs (ID_TIENDA)
  tiendasBody: any[] = []; // Array para enviar al backend
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MdlUsuarioTienda>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: any },
    private http: HttpClient,
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.loading = true;
    try {
      // 1. Obtener todas las tiendas activas del sistema
      // Supongamos que tu API devuelve: [{ID_TIENDA: 1, NOMBRE_TIENDA: 'Jockey'}, ...]
      this.storeService.getStores().subscribe((response) => {
        this.todasLasTiendas = response || [];
        this.tiendasFiltradas = [...this.todasLasTiendas];
      });

      this.storeService.postPermissionUserStore({ id: this.data.usuario.ID_LOGIN }).subscribe((response) => {
        this.tiendasSeleccionadas = response.map((item: any) => item.ID_TIENDA_TASG) || [];
        this.tiendasBody = response.map((item: any) => ({
          id: item.ID_TIENDA_TASG,
          nombre: item.DESCRIPCION_TIENDA
        })) || [];
      });

    } catch (error) {
      console.error('Error al cargar datos de tiendas', error);
    } finally {
      this.loading = false;
    }
  }

  // Lógica del buscador interno
  filtrarTiendas(event: Event) {
    const valor = (event.target as HTMLInputElement).value.toLowerCase();
    this.tiendasFiltradas = this.todasLasTiendas.filter(t =>
      t.nombre.toLowerCase().includes(valor) ||
      t.id.toString().includes(valor)
    );
  }

  guardar() {
    this.loading = true;

    const newSelections = this.tiendasFiltradas.filter(t => this.tiendasSeleccionadas.includes(t.id));

    this.tiendasBody = newSelections.map((item: any) => ({
      id: item.id,
      nombre: item.nombre
    })) || [];

    // Preparamos el payload para la tabla tb_login_tienda
    const payload = {
      ID_USUARIO: this.data.usuario.ID_LOGIN,
      TIENDAS: this.tiendasBody // El array que maneja el mat-selection-list
    };

    this.storeService.postAsingPermissionUserStore(payload).subscribe(
      (response) => {
        console.log('Permisos de tienda actualizados:', response);
        this.dialogRef.close(true);
      },
      (error) => {
        console.error('Error al guardar asignación', error);
        this.loading = false;
      }
    );
  }
}
