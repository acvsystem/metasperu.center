import { Subscription as ViewSubscriptions,forkJoin,finalize } from 'rxjs';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'app-mdl-usuario-tienda',
  standalone: false,
  templateUrl: './mdl-usuario-tienda.html',
  styleUrl: './mdl-usuario-tienda.scss',
})
export class MdlUsuarioTienda {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  // Referencia a la lista para manipular la selección si es necesario
  @ViewChild('listaTiendas') listaTiendas!: MatSelectionList;

  todasLasTiendas: any[] = [];
  tiendasFiltradas: any[] = [];
  tiendasSeleccionadas: number[] = []; // Array de IDs (ID_TIENDA)
  tiendasBody: any[] = []; // Array para enviar al backend
  loading=false;ready=false;error='';

  constructor(
    public dialogRef: MatDialogRef<MdlUsuarioTienda>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: any },
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(){
    this.loading=true;this.ready=false;this.error='';
    this.viewSubscriptions.add(forkJoin({stores:this.storeService.getStores(),assigned:this.storeService.postPermissionUserStore({id:this.data.usuario.ID_LOGIN})}).pipe(
      finalize(()=>this.loading=false)
    ).subscribe({
      next:({stores,assigned})=>{
        this.todasLasTiendas=[...stores];
        for(const item of assigned as any[])if(!this.todasLasTiendas.some(store=>store.id===item.ID_TIENDA_TASG))
          this.todasLasTiendas.push({id:item.ID_TIENDA_TASG,nombre:(item.DESCRIPCION_TIENDA||'Tienda archivada')+' (inactiva)'});
        this.tiendasFiltradas=[...this.todasLasTiendas];
        this.tiendasSeleccionadas=(assigned as any[]).map(item=>Number(item.ID_TIENDA_TASG));this.ready=true;
      },error:()=>this.error='No se pudo cargar la asignacion. Cierra el formulario e intenta nuevamente.'
    }));
  }

  // Lógica del buscador interno
  filtrarTiendas(event: Event) {
    const valor = (event.target as HTMLInputElement).value.toLowerCase();
    this.tiendasFiltradas = this.todasLasTiendas.filter(t =>
      t.nombre.toLowerCase().includes(valor) ||
      t.id.toString().includes(valor)
    );
  }

  guardar(){
    if(this.loading||!this.ready)return;
    this.loading=true;this.error='';this.dialogRef.disableClose=true;
    const payload={ID_USUARIO:Number(this.data.usuario.ID_LOGIN),TIENDAS:this.tiendasSeleccionadas.map(id=>({id:Number(id)}))};
    this.viewSubscriptions.add(this.storeService.postAsingPermissionUserStore(payload).pipe(
      finalize(()=>{this.loading=false;this.dialogRef.disableClose=false;})
    ).subscribe({next:()=>this.dialogRef.close(true),error:()=>this.error='No se pudo guardar. La seleccion sigue aqui para reintentar.'}));
  }

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
