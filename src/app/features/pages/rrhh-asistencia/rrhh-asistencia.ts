import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
export type NotificationType = 'success' | 'warning' | 'danger';
import * as XLSX from 'xlsx';

@Component({
  selector: 'rrhh-asistencia',
  standalone: false,
  templateUrl: './rrhh-asistencia.html',
  styleUrl: './rrhh-asistencia.scss',
})
export class RrhhAsistencia {

  dataEmployes: any = {};
  dataTable: Array<any> = [];
  dataTableFeriado: Array<any> = [];
  propertyCode: string = "";
  selectedType: string = "";
  isLoading: boolean = false;
  titleLoader: string = 'Buscando Asistencias...';
  dateCalendar: Array<any> = [];
  periodoFeriado: string = "";
  typeCalendar: string = "isDefault";
  messageNotification: string = "";
  isViewDefault: boolean = true;
  isDetallado: boolean = false;
  isViewFeriados: boolean = false;
  dataEJBFeriado: Array<any> = [];
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
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
    { isSticky: false, matColumnDef: 'estatus_marcacion', titleColumn: 'Marcacion', propertyValue: 'marcacionesLen', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'accion', filterActive: false, isCboFilter: false, cboFilter: [] }];

  columnsFeriado: tableColumns[] = [
    { isSticky: false, matColumnDef: 'tienda', titleColumn: 'Tienda', propertyValue: 'tienda', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'codigo_ejb', titleColumn: 'Codigo EJB', propertyValue: 'ejb', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'nro_documento', titleColumn: 'N° Documento', propertyValue: 'documento', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'nombre_completo', titleColumn: 'Nombre Completo', propertyValue: 'nombre', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'feriadosTrabajados', titleColumn: 'Feriados Trabajados', propertyValue: 'feriadosTrabajados', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'horasTrabajadas', titleColumn: 'Horas Trabajadas', propertyValue: 'horasTotales', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'accion', filterActive: false, isCboFilter: false, cboFilter: [] }];


  displayedColumnsInventory = this.columnsInventory.map(col => col.matColumnDef);
  displayedColumnsFeriado = this.columnsFeriado.map(col => col.matColumnDef);

  constructor(private storeService: StoreService, private socketService: SocketResourcesHumanService) {
    this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
  }

  ngOnInit() {

    this.socketService.onRefreshEmployesAsistence((data: any) => {
      this.storeService.callRefreshAsistenceEmployes(this.propertyCode).subscribe((data: any) => {
        this.dataTable = this.obtenerDataPorPropiedad(data, this.propertyCode);
        if (this.isViewFeriados) {
          this.dataEJBFeriado = this.obtenerDataPorPropiedad(data, 'ejb');
          this.dataTableFeriado = this.obtenerFeriado(this.dataTable);
        }
        this.isLoading = false;
      });
    });
  }

  exportFeriados() {
    const empleadosMaestra = this.dataEJBFeriado; // Tu lista de todos los trabajadores
    const calculosFeriados = this.dataTableFeriado; // El array que generamos en el paso anterior
    const periodoActual = this.periodoFeriado;

    const datosParaExcel = empleadosMaestra.map(emp => {
      // 1. Limpiamos el documento (importante por los espacios en blanco)
      const numDocLimpio = emp.NUMDOC.trim();

      // 2. Buscamos si este empleado tiene registros en el cálculo de feriados
      const infoAsistencia = calculosFeriados.find(f => f.documento.trim() === numDocLimpio);

      // 3. Construimos el objeto con las columnas que pides
      return {
        "PERIODO": periodoActual,
        "CODIGO": emp.CODEJB.trim(),
        "TRABAJADOR": `${emp.APEPAT} ${emp.APEMAT} ${emp.NOMBRE}`.trim(),
        "DIA-NOC": '',
        "TAR-DIU": '',
        "HED-25%": '',
        "HED-35%": '',
        "HED-50%": '',
        "HED-100": '',
        "HSI-MPL": '',
        "DES-LAB": '',
        // Si no trabajó feriados, ponemos 0
        "DIA-FER": infoAsistencia ? infoAsistencia.feriadosTrabajados : 0,
        "DIA-SUM": '',
        "DIA-RES": '',
        "PER-HOR": '',
        "HE2-5DL": ''
      };
    });

    // Ordenar por trabajador (opcional, para que el Excel se vea prolijo)
    datosParaExcel.sort((a, b) => a.TRABAJADOR.localeCompare(b.TRABAJADOR));

    this.exportarAExcel(datosParaExcel);
  }

  exportarAExcel(datosParaExcel: Array<any>) {
    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Feriados');

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `Reporte_Feriados_${new Date().getTime()}.xlsx`);
  }

  obtenerFeriado(dataAsistence: any) {
    const data = dataAsistence; // Tu array de objetos
    const feriadosObjetivo = this.dateCalendar;
    // Función auxiliar para convertir "HH:mm" a minutos totales
    const aMinutos = (hms: any) => {
      if (!hms) return 0;
      const [hrs, mins] = hms.split(':').map(Number);
      return (hrs * 60) + mins;
    };

    // Función para volver a convertir minutos a "HH:mm"
    const aHHMM = (totalMinutos: any) => {
      const hrs = Math.floor(totalMinutos / 60);
      const mins = totalMinutos % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const resultado = Object.values(data.reduce((acc: any, curr: any) => {
      const id = curr.documento;

      if (!acc[id]) {
        acc[id] = {
          ejb: curr.ejb,
          documento: curr.documento,
          nombre: curr.nombre,
          tienda: curr.tienda,
          feriadosTrabajados: 0,
          minutosTotales: 0, // Acumulador interno
          horasTotales: "00:00",
          marcaciones: []
        };
      }

      // 1. Contar feriados
      if (feriadosObjetivo.includes(curr.fecha)) {
        acc[id].feriadosTrabajados += 1;
      }

      // 2. Sumar horas efectivas (convertimos a minutos para precisión)
      acc[id].minutosTotales += aMinutos(curr.horasEfectivas);

      // 3. Actualizamos el string legible
      acc[id].horasTotales = aHHMM(acc[id].minutosTotales);

      // Agregamos el registro actual a su historial (opcional)
      acc[id].marcaciones.push(curr);

      return acc;
    }, {}));

    // 2. Convertir a Array y ORDENAR POR TIENDA
    const resultadoFinal = Object.values(resultado).sort((a: any, b: any) => {
      // localeCompare es ideal para strings con tildes o caracteres especiales
      return a.tienda.localeCompare(b.tienda);
    });
    console.log(resultadoFinal);
    return resultadoFinal;
  }

  obtenerDataPorPropiedad(data: any, nombrePropiedad: string) {
    const resultado = data.asistencia.find((item: any) => item.property === nombrePropiedad);
    return resultado ? resultado.data : [];
  }

  onSearchAsistence() {

    if (this.typeCalendar.length == 0) {
      this.messageNotification = 'Seleccione el tipo de reporte.';
      this.abrirNotificacion('danger');
      return;
    }

    if (this.isViewFeriados && this.dateCalendar.length == 0) {
      this.messageNotification = 'Seleccione los dias feriados.';
      this.abrirNotificacion('danger');
      return;
    }

    if (this.isViewFeriados && this.periodoFeriado.length == 0) {
      this.messageNotification = 'Seleccione el periodo de feriados';
      this.abrirNotificacion('danger');
      return;
    }

    this.isLoading = true;
    this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
    console.log(this.typeCalendar);
    this.storeService.callAsistenceEmployes(this.dateCalendar, this.typeCalendar).subscribe((data: any) => {
      this.propertyCode = data.property;
    });
  }


  onCalendar(event: any): void {


    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;

    if (isPeriodo) {
      this.periodoFeriado = `${value[0]}-${value[1]}`;
    } else {
      this.dateCalendar = [];
      // 1. Manejo de estados simples
      this.dateCalendar = value;

      // 4. Determinar la fecha a validar (usando la más reciente del rango o la fecha única)
      const fechaAValidar = isRange ? new Date(value[value.length - 1]) : new Date(value);

      // 5. Validación de reglas de negocio
      if (this.esFechaFutura(fechaAValidar)) {
        // this.handleErrorFecha("La fecha seleccionada no puede ser posterior a la actual.");
        return;
      }
    }
  }

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

  private esFechaFutura(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    return fechaSeleccionada.getTime() > hoy.getTime();
  }

  async onChangeSelect(data: any) {
    this.dateCalendar = [];
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