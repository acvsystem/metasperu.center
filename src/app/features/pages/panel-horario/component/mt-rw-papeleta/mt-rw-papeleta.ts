import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
export type NotificationType = 'success' | 'warning' | 'danger';
import { MtViewPapeleta } from '@metasperu/component/mt-view-papeleta/mt-view-papeleta';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';

@Component({
  selector: 'mt-rw-papeleta',
  standalone: false,
  templateUrl: './mt-rw-papeleta.html',
  styleUrl: './mt-rw-papeleta.scss',
  providers: [provideMomentDateAdapter()],
})
export class MtRwPapeleta implements OnInit {

  // Referencias a componentes hijos para reseteo manual
  @ViewChild('selEmploye') selEmploye!: any;
  @ViewChild('selStore') selStore!: any;
  @ViewChild('selType') selType!: any;
  @ViewChild('selCargo') selCargo!: any;
  @ViewChild('calDesde') calDesde!: any;
  @ViewChild('calHasta') calHasta!: any;
  @ViewChild('timeDesdeComp') timeDesdeComp!: any;
  @ViewChild('timeHastaComp') timeHastaComp!: any;

  // Listas de configuración para los selectores
  listaEmpleados: any[] = [];
  listaReportes: any[] = [
    { key: 'compensacion', value: 'Compensación de horas trabajadas' },
    { key: 'permiso', value: 'Permiso particular' },
    { key: 'comision', value: 'Comisión de servicio' }
  ];
  listaCargos: string[] = ['Gerentes', 'Cajeros', 'Asesores', 'Almaceneros', 'Asesores PartTime'];
  dialog = inject(MatDialog);

  // Variables vinculadas al formulario (ngModel)
  empleadoSeleccionado: any = null;
  tipoReporte: string = '';
  cargoSeleccionado: string = '';
  fechaSalida: string = '';
  fechaIngreso: string = '';
  horaSalida: string = '';
  horaRetorno: string = '';
  keyStore: string = '';
  comentarioPapeleta: string = '';
  fechaHoy: string = '';
  dateCalendarHasta: string = '';
  dateCalendarDesde: string = '';
  selectEmploye: any = {};
  selectTypeBallot: any = {};
  selectCargoEmploye: any = {};
  horasSolicitadas: string = '00:00';
  papeletaForm: any;
  typeNotification: NotificationType = 'success';
  // Datos de la tabla de horas extras
  horasExtras: any[] = [];
  horasExtrasOriginal: any[] = [];
  employeEJBList: any[] = [];
  storeList: any[] = [];
  typeBallotList: any[] = [];
  detallesAfectados: any[] = [];
  cboStore: any[] = [];
  listaMaestraTrabajadores: any[] = [];
  allEmplotes: any[] = [];
  acumuladoTotalCorrecto: string = '00:00';
  timeDesde: string = '';
  timeHasta: string = '';
  horasDisponibles: string = "00:00";
  totalHorasDisponiblesOriginal: string = "00:00";
  excesoPermitido: boolean = false;
  isLoading: boolean = false;
  isVacacionesProgramadas: boolean = false;
  isOtros: boolean = false;
  isCompensacion: boolean = true;
  titleLoader: string = 'Buscando Horas Extras...';
  horasCalculadas: string = "00:00";
  isNotification: boolean = false;
  messageNotification: string = '';
  nroPapeleta: string = "---------";
  cargoEmployes: Array<any> = [
    { key: 'Asesor', value: 'Asesor' },
    { key: 'Gerente', value: 'Gerente' },
    { key: 'Cajero', value: 'Cajero' },
    { key: 'Almacenero', value: 'Almacenero' }
  ];

  constructor(private storeService: StoreService, private socketService: SocketResourcesHumanService) {
    this.onEmpleadosList();
    this.storeService.getTypeBallot().subscribe((data) => {
      this.typeBallotList = data?.data.map((ballot: any) => ({ key: ballot.ID_TIPO_PAPELETA, value: ballot.DESCRIPCION }));
    });

    this.socketService.onHoursWorksEmployes((hours) => {
      console.log(hours);
      this.horasDisponibles = hours.data.totalHorasFormato;
      this.totalHorasDisponiblesOriginal = hours.data.totalHorasFormato;

      this.horasExtras = hours.data.horasExtras;

      this.horasExtrasOriginal = [...hours.data.horasExtras];
      this.isLoading = false;
    });

  }

  async ngOnInit(): Promise<void> {

    try {

      const ahora = new Date();
      this.fechaHoy = `${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${String(ahora.getDate()).padStart(2, '0')}`;
      // 2. Esperar a que las listas carguen (asumiendo que retornan Promesas u Observables)
      // Usamos await si tus métodos son async, o convertimos a promesa.
      await Promise.all([
        this.onStoreList(),
        this.onEmpleadosList()
      ]);

      // 3. Obtener y validar tienda
      const codeStoreEncrypted = localStorage.getItem('keyStore');
      if (!codeStoreEncrypted) return;

      const serieDecrypted = this.storeService.decrypt(codeStoreEncrypted);
      const store = this.storeList.find(s => s.serie === serieDecrypted);
      this.keyStore = store ? store.serie : 'OF';

      if (!store) {
        console.warn('No se encontró la tienda con serie:', serieDecrypted);
        //  return;
      }

      // 4. Escuchar el socket con filtrado reactivo
      this.socketService.onRefreshEmployesEJB((data: any[]) => {
        if (!data) return;
        this.allEmplotes = data;

        const codigo_unid_ejb = store ? store.codigo_ejb : '0001';

        // Filtramos y asignamo
        const filtrados = data.filter(emp => emp.code_unid_servicio === codigo_unid_ejb);

        this.employeEJBList = filtrados.map(ejb => ({ key: ejb.nro_documento, value: ejb.nombre_completo }));
        this.listaMaestraTrabajadores = [...filtrados]; // Clonamos para evitar problemas de referencia

      });

    } catch (error) {
      console.error('Error al inicializar datos de tienda:', error);
    }
  }


  async onStoreList() {
    try {
      // Convertimos el observable en promesa para poder usar 'await'
      const stores = await lastValueFrom(this.storeService.getStores());
      this.storeList = stores;
      this.cboStore = stores.map(store => ({ key: store.serie, value: store.nombre }));
      return stores; // Ahora sí devuelve los datos
    } catch (error) {
      console.error('Error obteniendo tiendas:', error);
      this.storeList = [];
      throw error;
    }
  }

  onEmpleadosList() {
    return this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
  }

  onChangeInput(ev: any, property: string) {
    const value = ev.target.value;
    const key = property as keyof MtRwPapeleta;

    // Convertimos 'this' a any para permitir la asignación dinámica
    (this as any)[key] = value;

    setTimeout(() => {
      if (this.timeDesde && this.timeHasta) {
        this.calcularHoras(this.timeDesde, this.timeHasta);
      }
    }, 1000);
  }

  calcularHoras(salida: string, llegada: string) {
    if (!salida || !llegada) {
      this.horasSolicitadas = "00:00";
      return;
    }

    const [hSalida, mSalida] = salida.split(':').map(Number);
    const [hLlegada, mLlegada] = llegada.split(':').map(Number);

    const totalMinutosSalida = (hSalida * 60) + mSalida;
    const totalMinutosLlegada = (hLlegada * 60) + mLlegada;

    let diffMinutos = totalMinutosLlegada - totalMinutosSalida;

    if (diffMinutos < 0) {
      diffMinutos += (24 * 60);
    }

    // --- NUEVA CONDICIÓN DE LÍMITE (8 horas = 480 minutos) ---
    if (diffMinutos > 480) {
      this.horasSolicitadas = "00:00"; // Opcional: podrías resetear a "00:00"
      this.messageNotification = 'Maximo permitido por papeleta 8:00 horas.';
      this.abrirNotificacion('danger');
      this.horasExtras = this.horasExtrasOriginal;
      this.horasDisponibles = this.totalHorasDisponiblesOriginal;
      this.detallesAfectados = [];
      // Aquí podrías disparar un mensaje de error tipo Toast o Snackbar
      return;
    }

    // Convertir de nuevo a formato HH:mm
    const horas = Math.floor(diffMinutos / 60);
    const minutos = diffMinutos % 60;

    this.horasSolicitadas =
      `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

    // --- Lógica restante ---
    const totalOriginal = this.convertirAMinutos(this.totalHorasDisponiblesOriginal);
    const totalSolicitado = diffMinutos;
    this.horasDisponibles = this.convertirAFormato(Math.max(0, totalOriginal - totalSolicitado));

    this.excesoPermitido = this.esMayorQueDisponible(this.horasSolicitadas, this.horasDisponibles);

    if (!this.excesoPermitido) {
      this.distribuirHorasSolicitadas();
    }
  }

  distribuirHorasSolicitadas() {
    let minutosPorCubrir = this.convertirAMinutos(this.horasSolicitadas);
    this.detallesAfectados = []; // Reiniciamos el array de afectados

    this.horasExtras = this.horasExtrasOriginal.map(row => ({ ...row }));

    this.horasExtras.forEach(row => {
      if (!row.SELECCIONADO) {
        row.HR_EXTRA_SOLICITADO = row.HR_EXTRA_SOLICITADO;
        row.HR_EXTRA_SOBRANTE = row.HR_EXTRA_SOBRANTE;
        row.ESTADO = row.ESTADO; // Estado por defecto
      }
    });

    for (let row of this.horasExtras) {

      if (row.SELECCIONADO || row.ISAPROBACION == 1) {
        continue;
      }

      if (minutosPorCubrir <= 0) break;

      const minutosDisponibles = this.convertirAMinutos(row.HR_EXTRA_SOBRANTE || row.HR_EXTRA_ACUMULADO);
      const minutosYaSolicitados = this.convertirAMinutos(row.HR_EXTRA_SOLICITADO || "00:00");

      if (minutosDisponibles > 0) {
        const aDescontar = Math.min(minutosPorCubrir, minutosDisponibles);

        const nuevoTotalSolicitado = minutosYaSolicitados + aDescontar;

        // Asignar valores
        row.HR_EXTRA_SOLICITADO = this.convertirAFormato(nuevoTotalSolicitado);
        row.HR_EXTRA_SOBRANTE = this.convertirAFormato(minutosDisponibles - aDescontar);
        row.ESTADO = row.HR_EXTRA_SOBRANTE === '00:00' ? 'UTILIZADO' : row.ESTADO;

        // AGREGAR AL ARRAY DE AFECTADOS
        this.detallesAfectados.push({
          idHrExtra: row.ID_HR_EXTRA,
          hrExtraAcumulado: row.HR_EXTRA_ACUMULADO,
          hrExtraSolicitado: row.HR_EXTRA_SOLICITADO,
          hrExtraSobrante: row.HR_EXTRA_SOBRANTE,
          fecha: row.FECHA
        });

        minutosPorCubrir -= aDescontar;
      }
    }
  }

  // Helpers útiles
  convertirAMinutos(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h * 60) + m;
  }

  convertirAFormato(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }


  esMayorQueDisponible(calculadas: string, disponibles: string): boolean {
    const [h1, m1] = calculadas.split(':').map(Number);
    const [h2, m2] = disponibles.split(':').map(Number);

    return (h1 * 60 + m1) > (h2 * 60 + m2);
  }

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

  onCalendarDesde(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendarDesde = value;
  }

  onCalendarHasta(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendarHasta = value;
  }

  onHoursWorksEmployes() {

    this.isLoading = true;
    const hoy = new Date();
    const fechaInicio = new Date();

    // Restamos 75 días (2.5 meses)
    fechaInicio.setDate(hoy.getDate() - 75);

    // Función auxiliar para formato YYYY-MM-DD
    const formatearFecha = (fecha: any) => {
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    };


    const body = {
      "fecha_desde": formatearFecha(fechaInicio),
      "fecha_hasta": formatearFecha(hoy),
      "documento": this.selectEmploye.key,
      "socket": this.socketService.socketID
    };

    this.storeService.postHoursWorksEmployes(body).subscribe(() => {

    });
  }

  async onChangeSelect(data: any, property: any) {
    const value = data;
    const key = property as keyof MtRwPapeleta;
    // Convertimos 'this' a any para permitir la asignación dinámica
    (this as any)[key] = value;

    if (property == 'selectTypeBallot' || property == 'selectEmploye') {

      if (this.selectTypeBallot.value == 'Compensacion de horas trabajadas') {

        if (property != 'selectEmploye') {
          this.isVacacionesProgramadas = false;
          this.isOtros = false;
          this.isCompensacion = true;
        }

        if (Object.keys(this.selectEmploye).length) {
          this.onHoursWorksEmployes();
        }
      } else if (this.selectTypeBallot.value == 'Vacaciones programadas') {
        if (property != 'selectEmploye') {
          this.isVacacionesProgramadas = true;
          this.isOtros = false;
          this.isCompensacion = false;

          this.resetChangeType();
        }
      } else {
        if (property != 'selectEmploye') {
          this.isVacacionesProgramadas = false;
          this.isOtros = true;
          this.isCompensacion = false;

          this.resetChangeType();
        }
      }
    }

    if (property == 'selectStore') {
      const store = this.storeList.find(s => s.serie === data.key);
      const codigo_unid_ejb = store ? store.codigo_ejb : '0001';

      const original = [...this.allEmplotes];

      const filtrados = original.filter(emp => {
        // Si el código seleccionado es 0016, permitimos 0016 Y 0019
        if (codigo_unid_ejb === '0016') {
          return emp.code_unid_servicio === '0016' || emp.code_unid_servicio === '0019';
        }

        // Para cualquier otro código, mantenemos la comparación normal
        return emp.code_unid_servicio === codigo_unid_ejb;
      });

      this.employeEJBList = filtrados.map(ejb => ({
        key: ejb.nro_documento,
        value: ejb.nombre_completo
      }));
    }
  }
  onChangeInputComentario(ev: any) {
    const value = ev.target.value;
    console.log(value);
    this.comentarioPapeleta = value;
  }

  resetChangeType() {
    this.timeDesde = '';
    this.timeHasta = '';
    this.horasSolicitadas = '00:00';
    this.horasDisponibles = '00:00';
    this.totalHorasDisponiblesOriginal = '00:00';
    this.horasExtras = [];
    this.horasExtrasOriginal = [];
    this.detallesAfectados = [];
    this.excesoPermitido = false;
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'espera aprobacion': return 'text-bg-warning';
      case 'utilizado': return 'text-bg-warning';
      case 'aprobar': return 'text-bg-danger';
      case 'correcto': return 'text-bg-primary';
      case 'rechazado': return 'text-bg-danger';
      default: return '';
    }
  }

  validarSiEsHoy(desde: string, hasta: string) {
    // Generamos el formato YYYY-MM-DD local de hoy
    const hoyString = new Date().toISOString().split('T')[0];

    // Comparamos directamente
    const esDesdeHoy = desde.replace(/\//g, '-') === hoyString;
    const esHastaHoy = hasta.replace(/\//g, '-') === hoyString;

    if (esDesdeHoy || esHastaHoy) {
      return true;
    }
    return false;
  }

  onSaveBallot() {
    // 1. Validación de campos obligatorios
    if (Object.keys(this.selectEmploye).length === 0 ||
      Object.keys(this.selectTypeBallot).length === 0 ||
      Object.keys(this.selectCargoEmploye).length === 0) {
      this.messageNotification = 'Llene todos los campos.';
      this.abrirNotificacion('danger');
      return;
    }

    // 2. Validación: No puede ser hoy
    if (this.validarSiEsHoy(this.dateCalendarDesde || '', this.dateCalendarHasta || '')) {
      this.messageNotification = 'No puede crear papeleta con fecha de hoy.';
      this.abrirNotificacion('danger');
      return;
    }

    // 3. Validación: Límite de 7 días a futuro
    const fechaSeleccionada = new Date(this.dateCalendarDesde.split('/').reverse().join('-'));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche

    const diffTime = fechaSeleccionada.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      this.messageNotification = 'No puede registrar papeletas con más de 7 días de anticipación.';
      this.abrirNotificacion('danger');
      return;
    }

    // 4. Validación: Horas solicitadas presentes
    if ((this.timeDesde.length === 0 || this.timeHasta.length === 0) && this.isCompensacion) {
      this.messageNotification = 'No tiene horas solicitadas.';
      this.abrirNotificacion('danger');
      return;
    }

    // 5. Validación: Detalles asignados
    if (this.detallesAfectados.length === 0 && this.isCompensacion) {
      this.messageNotification = 'No tiene horas extras asignadas.';
      this.abrirNotificacion('danger');
      return;
    }

    if (this.comentarioPapeleta.length === 0 && (this.isOtros || this.isVacacionesProgramadas)) {
      this.messageNotification = 'Llene el campo razon del permiso.';
      this.abrirNotificacion('danger');
      return;
    }

    // --- Ejecución ---
    this.isLoading = true;
    this.titleLoader = 'Generando Papeleta...';

    const body = {
      empleado: {
        codigoTienda: this.keyStore,
        nroDocumento: this.selectEmploye.key,
        nombre: this.selectEmploye.value,
        idTipoPapeleta: this.selectTypeBallot.key,
        cargo: this.selectCargoEmploye.value,
      },
      papeleta: {
        fechaDesde: this.dateCalendarDesde.replace(/\//g, '-'),
        fechaHasta: this.dateCalendarHasta.replace(/\//g, '-'),
        horaSalida: this.timeDesde,
        horaLlegada: this.timeHasta,
        horaAcumulada: this.horasDisponibles,
        horaSolicitada: this.horasSolicitadas,
        descripcion: this.comentarioPapeleta || ""
      },
      detalles: this.detallesAfectados
    };

    this.storeService.postSaveBallot(body).subscribe((data) => {

      if ((data?.error || "").length > 0) {
        this.messageNotification = data.error || 'Error al guardar la papeleta.';
        this.abrirNotificacion('danger');
      }

      if (data?.success) {
        this.isLoading = false;
        this.openDialogBallot(data?.codigo);
        this.resetForm();
      }
      this.isLoading = false;
    });
  }

  resetForm() {
    // 1. Limpiar variables de estado
    this.selectEmploye = {};
    this.selectTypeBallot = {};
    this.selectCargoEmploye = {};
    this.dateCalendarDesde = '';
    this.dateCalendarHasta = '';
    this.timeDesde = '';
    this.timeHasta = '';
    this.horasSolicitadas = '00:00';
    this.horasDisponibles = '00:00';
    this.totalHorasDisponiblesOriginal = '00:00';
    this.horasExtras = [];
    this.horasExtrasOriginal = [];
    this.detallesAfectados = [];
    this.excesoPermitido = false;

    // 2. Limpiar componentes visualmente
    if (this.selEmploye) this.selEmploye.selectedText = '';
    if (this.selStore) this.selStore.selectedText = '';
    if (this.selType) this.selType.selectedText = '';
    if (this.selCargo) this.selCargo.selectedText = '';
    if (this.calDesde) this.calDesde.date.setValue(null);
    if (this.calHasta) this.calHasta.date.setValue(null);
    if (this.timeDesdeComp) this.timeDesdeComp.vTimer = '';
    if (this.timeHastaComp) this.timeHastaComp.vTimer = '';
  }

  openDialogBallot(codeBallot: string) {
    this.dialog.open(MtViewPapeleta, {
      panelClass: 'modal-grande',
      data: { codeBallot: codeBallot },
    });
  }

  onSolicitarAprobacionHrx(element: any) {

    const body = {
      id_hora_extra: element.ID_HR_EXTRA,
      nroDocumento: element.NRO_DOCUMENTO_EMPLEADO,
      nombreCompleto: this.selectEmploye.value,
      horasAcumuladas: element.HR_EXTRA_ACUMULADO,
      fecha: element.FECHA,
      codigoTienda: this.keyStore,
      comentario: element.OBSERVACION
    }

    this.storeService.postSolicitarAprobacionHextra(body).subscribe((data) => {
      const index = this.horasExtras.findIndex(hr => hr.ID_HR_EXTRA === data.id_hora_extra);
      this.horasExtras[index].ESTADO = data.estado;
      this.messageNotification = data.message;
      this.abrirNotificacion('success');
    });
  }
}
