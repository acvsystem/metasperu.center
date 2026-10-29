import { Subscription as ViewSubscriptions, Subject, switchMap, startWith, catchError, of, finalize } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { tableColumns } from '../../../rrhh-asistencia/rrhh-asistencia';

@Component({
  selector: 'mt-registros-traspasos',
  standalone: false,
  templateUrl: './mt-registros-traspasos.html',
  styleUrl: './mt-registros-traspasos.scss',
})
export class MtRegistrosTraspasos {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];


  columnsTraspasos: tableColumns[] = [
    { isSticky: true, matColumnDef: 'codigoTraspaso', titleColumn: 'Codigo Traspaso', propertyValue: 'code_transfer', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'unidadServicio', titleColumn: 'Unidad de Servicio', propertyValue: 'unid_service', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tiendaOrigen', titleColumn: 'Tienda Origen', propertyValue: 'store_origin', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tiendaDestino', titleColumn: 'Tienda Destino', propertyValue: 'store_destination', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'almacenOrigen', titleColumn: 'Almacen Origen', propertyValue: 'code_warehouse_origin', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'almacenDestino', titleColumn: 'Almacen Destino', propertyValue: 'code_warehouse_destination', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'Creacion', titleColumn: 'Fecha de Creacion', propertyValue: 'datetime', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsTraspasos = this.columnsTraspasos.map(col => col.matColumnDef);
  dataTraspasos: Array<any> = [];

  total=0;pageIndex=0;pageSize=25;loading=false;loadError='';
  private readonly reload=new Subject<void>();

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.viewSubscriptions.add(this.reload.pipe(startWith(undefined),switchMap(()=>{
      this.loading=true;this.loadError='';
      return this.storeService.getTraspasos(this.pageIndex+1,this.pageSize).pipe(
        catchError(()=>{this.loadError='No se pudieron cargar los traspasos.';return of({data:[],total:0});}),
        finalize(()=>this.loading=false));
    })).subscribe(result=>{this.dataTraspasos=result.data||[];this.total=result.total||0;}));
  }
  changePage(event:PageEvent){this.pageIndex=event.pageIndex;this.pageSize=event.pageSize;this.reload.next();}

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
