import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
@Component({
  selector: 'rrhh-asistencia',
  standalone: false,
  templateUrl: './rrhh-asistencia.html',
  styleUrl: './rrhh-asistencia.scss',
})
export class RrhhAsistencia {

  dataEmployes: any = {};
  dataTable: Array<any> = [];
  propertyCode: string = "";
  selectedType: string = "";
  isLoading: boolean = false;
  titleLoader: string = 'Buscando Asistencias...';
  dateCalendar: Array<any> = [];
  typeCalendar: string = "isDefault";
  isViewDefault: boolean = true;
  isDetallado: boolean = false;
  isViewFeriados: boolean = false;
  cboStoreList: Array<any> = [{ key: 'isDefault', value: 'General' }, { key: 'isDetallado', value: 'Detallado' }, { key: 'isFeriados', value: 'Feriados' }]
  columnsInventory: tableColumns[] = [
    { isSticky: true, matColumnDef: 'tienda', titleColumn: 'Tienda', propertyValue: 'tienda', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: true, matColumnDef: 'nombre_completo', titleColumn: 'Nombre Completo', propertyValue: 'nombre', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'codigo_ejb', titleColumn: 'Codigo EJB', propertyValue: 'ejb', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'nro_documento', titleColumn: 'N° Documento', propertyValue: 'documento', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'dia', titleColumn: 'Dia', propertyValue: 'dia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'ingreso_turno', titleColumn: 'Ing Turno', propertyValue: 'entrada', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'salida_break', titleColumn: 'Ing Break', propertyValue: 'salidaBreak', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tiempo_break', titleColumn: 'Tiempo Break', propertyValue: 'tiempoBreak', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'retorno_break', titleColumn: 'Ret Break', propertyValue: 'retornoBreak', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'salida_turno', titleColumn: 'Sal Turno', propertyValue: 'salidaFinal', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'horas_trabajadas', titleColumn: 'H. Trabajadas', propertyValue: 'horasEfectivas', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'rango_horario', titleColumn: 'Rango Horario', propertyValue: 'rango', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tardanza', titleColumn: 'Tardanza', propertyValue: 'tardanza', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'excesoBreak', titleColumn: 'Exc.Break', propertyValue: 'excesoBreak', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'jornada_completa', titleColumn: 'J.Completa', propertyValue: 'jornadaIncompleta', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'estatus_papeleta', titleColumn: 'Papeleta', propertyValue: 'isPapeleta', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'accion', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsInventory = this.columnsInventory.map(col => col.matColumnDef);

  constructor(private storeService: StoreService, private socketService: SocketResourcesHumanService) {
    this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
  }

  ngOnInit() {

    this.socketService.onRefreshEmployesAsistence((data: any) => {
      this.storeService.callRefreshAsistenceEmployes(this.propertyCode).subscribe((data: any) => {
        this.dataTable = this.obtenerDataPorPropiedad(data, this.propertyCode);
        this.isLoading = false;
      });
    });
  }

  obtenerDataPorPropiedad(data: any, nombrePropiedad: string) {
    const resultado = data.asistencia.find((item: any) => item.property === nombrePropiedad);
    return resultado ? resultado.data : [];
  }

  onSearchAsistence() {
    this.isLoading = true;
    this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
    console.log(this.typeCalendar);
    this.storeService.callAsistenceEmployes(this.dateCalendar, this.typeCalendar).subscribe((data: any) => {
      this.propertyCode = data.property;
    });
  }


  onCalendar(event: any): void {

    this.dateCalendar = [];
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;

    console.log(this.dateCalendar);
    // 1. Manejo de estados simples
    this.dateCalendar = value;

    // 4. Determinar la fecha a validar (usando la más reciente del rango o la fecha única)
    const fechaAValidar = isRange ? new Date(value[value.length - 1]) : new Date(value);

    // 5. Validación de reglas de negocio
    if (this.esFechaFutura(fechaAValidar)) {
      this.handleErrorFecha("La fecha seleccionada no puede ser posterior a la actual.");
      return;
    }
  }

  // Método auxiliar para centralizar errores
  private handleErrorFecha(mensaje: string): void {
    // this.isErrorFecha = true;
    // this.openSnackBar(mensaje);
  }

  private esFechaFutura(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    return fechaSeleccionada.getTime() > hoy.getTime();
  }

  async onChangeSelect(data: any) {
    console.log(data);
    if (data.id == 'typeReport') {
      this.typeCalendar = data.key;
      this.isViewDefault = false;
      this.isDetallado = false;
      this.isViewFeriados = false;

      if (this.typeCalendar == 'isFeriados') {
        this.isViewFeriados = true;
      }

      if (this.typeCalendar == 'isDefault') {
        this.isViewDefault = true;
      }

      if (this.typeCalendar == 'isDetallado') {
        this.isDetallado = true;
      }
    }
  }

}


export interface tableColumns {
  isSticky: boolean;
  matColumnDef: string;
  titleColumn: string;
  extraProperty?: string;
  propertyValue: string;
  filterActive: boolean;
  isCboFilter: boolean;
  cboFilter: Array<any>;
}