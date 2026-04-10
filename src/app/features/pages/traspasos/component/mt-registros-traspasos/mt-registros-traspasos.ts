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

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.storeService.getTraspasos().subscribe((traspasos: any) => {
      this.dataTraspasos = traspasos.data;
    });

  }
}
