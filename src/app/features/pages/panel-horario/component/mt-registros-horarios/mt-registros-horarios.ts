import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { tableColumns } from '../../../rrhh-asistencia/rrhh-asistencia';

@Component({
  selector: 'mt-registros-horarios',
  standalone: false,
  templateUrl: './mt-registros-horarios.html',
  styleUrl: './mt-registros-horarios.scss',
})
export class MtRegistrosHorarios {

  columnsHorartio: tableColumns[] = [
    { isSticky: true, matColumnDef: 'tienda', titleColumn: 'Tienda', propertyValue: 'cDescripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'inicioSemana', titleColumn: 'Inicio Semana', propertyValue: 'cRango_1', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'terminoSemana', titleColumn: 'Termino Semana', propertyValue: 'cRango_2', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fechaHora', titleColumn: 'Fecha y Hora', propertyValue: 'cDatetime', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'cAccionHorario', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsHorarios = this.columnsHorartio.map(col => col.matColumnDef);
  dataHorarios: Array<any> = [];

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.onRegistrosHorarios();
  }

  onRegistrosHorarios() {
    this.storeService.getHorarios().subscribe((horarios) => {
      this.dataHorarios = horarios.data;
    });
  }

}
