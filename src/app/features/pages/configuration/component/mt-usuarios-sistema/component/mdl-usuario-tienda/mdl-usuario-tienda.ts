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
      this.storeService.getStores().subscribe((data) => {
        this.todasLasTiendas = data || [];
        this.tiendasFiltradas = [...this.todasLasTiendas];
      });


      // 2. Obtener las tiendas que ya tiene este usuario (tb_login_tienda)
      // La API debería devolver solo los IDs: [1, 5, 10]
      const asignadas = await this.http.get<number[]>(`/api/usuarios/${this.data.usuario.ID_LOGIN}/tiendas`).toPromise();
      this.tiendasSeleccionadas = asignadas || [];

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

    // Preparamos el payload para la tabla tb_login_tienda
    const payload = {
      ID_LOGIN_ASSIGN: this.data.usuario.ID_LOGIN,
      TIENDAS_IDS: this.tiendasSeleccionadas // El array que maneja el mat-selection-list
    };

    this.http.post('/api/usuarios/asignar-tiendas', payload).subscribe({
      next: () => {
        this.dialogRef.close(true); // Cerramos y avisamos que hubo éxito
      },
      error: (err) => {
        console.error('Error al guardar asignación', err);
        this.loading = false;
      }
    });
  }
}
