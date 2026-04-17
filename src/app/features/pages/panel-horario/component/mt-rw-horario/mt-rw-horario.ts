import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MtMdlRangoHora } from '../mt-mdl-rango-hora/mt-mdl-rango-hora'
import { MtMdlAsignarPersonal } from '../mt-mdl-asignar-personal/mt-mdl-asignar-personal';
export type NotificationType = 'success' | 'warning' | 'danger';
import { HostListener } from '@angular/core';
import { CanComponentDeactivate } from '@metasperu/page/core/auth/pending-changes.guard';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
import { lastValueFrom } from 'rxjs';
import { MtMdlInfoHorario } from '../mt-mdl-info-horario/mt-mdl-info-horario';
@Component({
  selector: 'mt-rw-horario',
  standalone: false,
  templateUrl: './mt-rw-horario.html',
  styleUrl: './mt-rw-horario.scss',
})
export class MtRwHorario implements CanComponentDeactivate {

  @Input() dataSearch: any = {};
  @Input() isCreateHorario: boolean = false;
  public readonly MtMdlRangoHora = MtMdlRangoHora;
  public readonly MtMdlAsignarPersonal = MtMdlAsignarPersonal;
  isLoading: boolean = false;
  titleLoader: string = `Procesando Horario...`;
  dataHorario: Array<any> = [];
  //VARIABLE DE PERMISO PARA EDITAR HORARIOS PASADOS
  puedeEditarPasado: boolean = false;
  horariosProcesados: any[] = [];
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
  dateCalendar: any[] = [];
  hayCambios: boolean = false;
  isEditing: boolean = false;
  keyStore: string = "";
  storeList: Array<any> = [];
  employeEJBList: Array<any> = [];

  listaMaestraTrabajadores: Array<any> = [];
  dialog = inject(MatDialog);
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hayCambios) {
      // Esto muestra el mensaje estándar del navegador
      $event.returnValue = true;
    }
  }

  constructor(private storeService: StoreService, private socketService: SocketResourcesHumanService) { }

  async ngOnInit() {
    // 1. Cargar datos base
    this.cargarDeCache();

    try {
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
        return;
      }

      // 4. Escuchar el socket con filtrado reactivo
      this.socketService.onRefreshEmployesEJB((data: any[]) => {
        if (!data) return;

        // Filtramos y asignamos
        const filtrados = data.filter(emp => emp.code_unid_servicio === store.codigo_ejb);

        this.employeEJBList = filtrados;
        this.listaMaestraTrabajadores = [...filtrados]; // Clonamos para evitar problemas de referencia

      });

    } catch (error) {
      console.error('Error al inicializar datos de tienda:', error);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hasOwnProperty('dataSearch')) {
      this.isLoading = true;
      this.dataSearch = changes['dataSearch'].currentValue;
      this.onSearhchHorario();
    }
  }

  canDeactivate(): boolean {
    return !this.hayCambios; // Si hay cambios, devuelve false y activa el confirm()
  }

  registrarCambio() {
    this.hayCambios = true;
    this.guardarEnCache(); // Aprovechamos para persistir en el LocalStorage
    localStorage.setItem('hayCambios', 'true');
  }

  onEmpleadosList() {
    return this.storeService.callRegisterEmployes().subscribe((data: any) => {
    });
  }

  async onStoreList() {
    try {
      // Convertimos el observable en promesa para poder usar 'await'
      const stores = await lastValueFrom(this.storeService.getStores());
      this.storeList = stores;
      return stores; // Ahora sí devuelve los datos
    } catch (error) {
      console.error('Error obteniendo tiendas:', error);
      this.storeList = [];
      throw error;
    }
  }

  obtenerDataPorPropiedad(data: any, nombrePropiedad: string) {
    const resultado = data.asistencia.find((item: any) => item.property === nombrePropiedad);
    return resultado ? resultado.data : [];
  }

  // Llama a esta función cuando recibas tus datos del servicio
  // mt-rw-horario.component.ts

  prepararDataHorario(data: any[]) {
    this.horariosProcesados = data.map(cargo => ({
      ...cargo,
      // 1. Filas para los rangos horarios
      filasTrabajo: cargo.rg_hora.map((rango: any) => ({
        rango: rango.rg,
        celdas: cargo.dias.map((dia: any) => ({
          trabajadores: cargo.dias_trabajo.filter((dt: any) =>
            dt.id_dia === dia.id && dt.rg === rango.id
          )
        }))
      })),
      // 2. Fila para Días Libres
      filaLibres: cargo.dias.map((dia: any) => ({
        trabajadores: cargo.dias_libres.filter((dl: any) => dl.id_dia === dia.id)
      })),
      // 3. Mapeo de observaciones por día (NUEVO)
      // Esto crea un acceso rápido: observacionesPorDia[id_del_dia]
      notasDia: cargo.dias.reduce((acc: any, dia: any) => {
        acc[dia.id] = cargo.observacion.filter((obs: any) =>
          obs.id_dia === dia.id && obs.observacion.trim() !== ''
        );
        return acc;
      }, {})
    }));
  }


  onInitHorario() {
    if (this.dateCalendar.length > 0) {
      this.validarFechaCreacion(this.dateCalendar[0]);
    } else {
      this.messageNotification = 'Seleccione un rango de fechas.';
      this.abrirNotificacion('danger');
    }

    this.isLoading = false;
  }

  generarHorarioMaestroVacio(fechaInicio: string) {
    this.isEditing = false;
    const nombresCargos = [
      'Gerentes',
      'Cajeros',
      'Asesores',
      'Almaceneros',
      'Asesores PartTime',
      'Vacaciones'
    ];

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // CORRECCIÓN: Reemplazamos '-' por '/' para evitar el desfase de zona horaria de JS
    // Esto asegura que la fecha se interprete como local y no como UTC.
    const fechaBase = new Date(fechaInicio.replace(/-/g, '\/'));

    const diasCalculados = Array.from({ length: 7 }, (_, i) => {
      const nuevaFecha = new Date(fechaBase);
      nuevaFecha.setDate(fechaBase.getDate() + i);

      const indiceDia = nuevaFecha.getDay(); // 0 = Domingo, 1 = Lunes...
      const nombreDia = diasSemana[indiceDia === 0 ? 6 : indiceDia - 1];

      // Formatear fecha manualmente a YYYY-MM-DD para evitar toISOString() que usa UTC
      const anio = nuevaFecha.getFullYear();
      const mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
      const diaNum = String(nuevaFecha.getDate()).padStart(2, '0');
      const fechaFormateada = `${anio}-${mes}-${diaNum}`;

      return {
        id: i + 1,
        dia: nombreDia,
        fecha: fechaFormateada
      };
    });

    this.horariosProcesados = nombresCargos.map(nombreCargo => ({
      cargo: nombreCargo,
      dias: diasCalculados,
      filasTrabajo: [],
      filaLibres: diasCalculados.map(dia => ({
        id_dia: dia.id,
        trabajadores: []
      })),
      notasDia: {}
    }));

    // Guardar en caché inmediatamente después de generar
    this.registrarCambio();
  }

  onSearhchHorario() {
    const body = {
      range_days: this.dataSearch.range_days,
      code_store: this.dataSearch.code_store
    };

    this.storeService.postSearchHorarios(body).subscribe(response => {
      this.isLoading = false;
      this.prepararDataHorario(response.data);
    });
  }

  // Añadimos el parámetro 'item' que representa al cargo (Gerentes, Cajeros, etc.)
  // fila es opcional: si viene, es EDICIÓN; si no, es CREACIÓN
  openDialog(component: any, item: any, fila?: any) {
    const dialogRef = this.dialog.open(component, {
      panelClass: 'modal-mediano',
      data: {
        rangosExistentes: item.filasTrabajo,
        // Pasamos los datos de la fila si vamos a editar
        edicion: fila ? { ...fila } : null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (fila) {
          // Lógica de Edición: actualizamos el texto del rango
          fila.rango = result.rango;
          this.registrarCambio();
        } else {
          // Lógica de Creación: insertamos nueva fila
          this.agregarFilaARango(item, result.rango);
          this.registrarCambio();
        }
      }
    });
  }


  openDialogRango(component: any, item: any, cargo?: any) {
    const dialogRef = this.dialog.open(component, {
      panelClass: 'modal-mediano',
      data: {
        rangosExistentes: item.filasTrabajo,
        // Pasamos los datos de la fila si vamos a editar
        cargo: cargo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.agregarFilaARango(item, result.rango);
        this.registrarCambio();
      }
    });
  }

  openDialogInfo() {
    const dialogRef = this.dialog.open(MtMdlInfoHorario, {
      panelClass: 'modal-grande',
      data: {}
    });
  }

  confirmarLimpieza() {
    if (confirm('¿Estás seguro de borrar todo el progreso actual?')) {
      this.limpiarCache();
      // Vuelves a generar la estructura vacía
      this.generarHorarioMaestroVacio(this.dateCalendar[0]);
    }
  }

  agregarFilaARango(item: any, nuevoRango: string) {
    // 1. Creamos la estructura de la nueva fila
    const nuevaFila = {
      rango: nuevoRango,
      // Creamos las 7 celdas (una por cada día que tiene el cargo)
      celdas: item.dias.map((dia: any) => ({
        id_dia: dia.id,
        trabajadores: [] // Lista de trabajadores vacía para empezar
      }))
    };

    // 2. La insertamos en el cargo correspondiente
    item.filasTrabajo.push(nuevaFila);

    console.log(`Rango ${nuevoRango} agregado a ${item.cargo}`);
  }


  // 2. Función para guardar en LocalStorage
  guardarEnCache() {
    try {
      const dataString = JSON.stringify(this.horariosProcesados);
      localStorage.setItem('horario_metas_peru', dataString);
      console.log('Progreso guardado automáticamente');
    } catch (e) {
      this.messageNotification = 'Error al guardar el horario.';
      this.abrirNotificacion('danger');
      console.error('Error guardando en caché', e);
    }
  }

  // 3. Función para recuperar los datos
  cargarDeCache() {
    const hayCambios = localStorage.getItem('hayCambios');
    if (hayCambios === 'true') {
      this.hayCambios = true;
    } else {
      this.hayCambios = false;
      localStorage.setItem('hayCambios', 'false');
    }

    const cache: any = localStorage.getItem('horario_metas_peru');

    if (JSON.parse(cache || "[]").length > 0) {
      this.horariosProcesados = JSON.parse(cache || "[]");
    } else {
      this.hayCambios = false;
      localStorage.setItem('hayCambios', 'false');
    }
  }

  // 4. Limpiar el horario (para cuando ya se envíe a la base de datos)
  limpiarCache() {
    localStorage.removeItem('horario_metas_peru');
  }

  // Esta función devuelve solo los trabajadores que NO están trabajando ese día
  obtenerDisponiblesPorDia(diaId: number): any[] {
    // 1. Obtener todos los IDs de trabajadores ya asignados en ese día específico
    const asignadosEseDia = new Set();

    this.horariosProcesados.forEach(cargo => {
      // Revisamos rangos de trabajo
      cargo.filasTrabajo.forEach((fila: any) => {
        const celdaDia = fila.celdas.find((c: any) => c.id_dia === diaId);
        celdaDia?.trabajadores.forEach((t: any) => asignadosEseDia.add(t.nro_documento));
      });

      // Revisamos también los días libres (porque si está libre, no está disponible para turnos)
      const celdaLibre = cargo.filaLibres.find((c: any) => c.id_dia === diaId);
      celdaLibre?.trabajadores.forEach((t: any) => asignadosEseDia.add(t.nro_documento));
    });

    // 2. Filtramos la lista maestra
    return this.listaMaestraTrabajadores.filter((t: any) => !asignadosEseDia.has(t.nro_documento));
  }


  abrirModalAsignar(celda: any, diaId: number) {
    const disponibles = this.obtenerDisponiblesPorDia(diaId);

    const dialogRef = this.dialog.open(MtMdlAsignarPersonal, {
      panelClass: 'modal-grande',
      data: { trabajadores: disponibles, diaNombre: this.obtenerNombreDia(diaId) }
    });

    dialogRef.afterClosed().subscribe((seleccionados: any[]) => {
      if (seleccionados && seleccionados.length > 0) {
        // Insertamos todos los trabajadores seleccionados de una vez
        seleccionados.forEach(trab => {
          // Validación extra por seguridad: que no exista ya en la celda
          if (!celda.trabajadores.some((t: any) => t.nro_documento === trab.nro_documento)) {
            celda.trabajadores.push(trab);
          }
        });

        this.registrarCambio();
      }
    });
  }

  // Esta función ahora sirve tanto para turnos de trabajo como para Días Libres
  abrirModalAsignarLibre(celda: any, diaId: number) {
    const disponibles = this.obtenerDisponiblesPorDia(diaId);

    const dialogRef = this.dialog.open(MtMdlAsignarPersonal, {
      panelClass: 'modal-grande',
      data: {
        trabajadores: disponibles,
        diaNombre: this.obtenerNombreDia(diaId)
      }
    });

    dialogRef.afterClosed().subscribe((seleccionados: any[]) => {
      if (seleccionados && seleccionados.length > 0) {
        seleccionados.forEach(trab => {
          // Evitamos duplicados en la misma celda de Día Libre
          const existe = celda.trabajadores.some((t: any) =>
            t.nro_documento === trab.nro_documento
          );

          if (!existe) {
            celda.trabajadores.push(trab);
          }
        });

        this.registrarCambio();
      }
    });
  }

  obtenerNombreDia(diaId: number): string {
    // Buscamos en el primer cargo de la lista los días que generamos
    const diaEncontrado = this.horariosProcesados[0]?.dias.find((d: any) => d.id === diaId);
    return diaEncontrado ? diaEncontrado.dia : 'Día';
  }

  // Función para remover trabajadores de la celda
  quitarTrabajador(celda: any, trab: any) {
    celda.trabajadores = celda.trabajadores.filter((t: any) =>
      t.nro_documento !== trab.nro_documento
    );
    this.registrarCambio();
  }



  validarFechaCreacion(fechaSeleccionada: string): boolean {
    const hoy = new Date();
    // Ajustar a lunes de esta semana
    const lunesEstaSemana = new Date(hoy);
    const diaHoy = hoy.getDay(); // 0 Dom, 1 Lun...
    const diff = hoy.getDate() - (diaHoy === 0 ? 6 : diaHoy - 1);
    lunesEstaSemana.setDate(diff);
    lunesEstaSemana.setHours(0, 0, 0, 0);

    // Definir lunes de la próxima semana
    const lunesProximaSemana = new Date(lunesEstaSemana);
    lunesProximaSemana.setDate(lunesEstaSemana.getDate() + 7);

    // Definir lunes de subsiguiente (2 semanas)
    const lunesSubSiguiente = new Date(lunesProximaSemana);
    lunesSubSiguiente.setDate(lunesProximaSemana.getDate() + 7);

    const fechaInput = new Date(fechaSeleccionada.replace(/-/g, '\/'));
    fechaInput.setHours(0, 0, 0, 0);

    // REGLA: Solo puede crear si es EXACTAMENTE la semana que viene
    if ((fechaInput.getTime() === lunesProximaSemana.getTime() || this.puedeEditarPasado)) {
      this.generarHorarioMaestroVacio(fechaSeleccionada);
      return true;
    } else {
      this.messageNotification = 'Solo se permite generar el horario de la próxima semana.';
      this.abrirNotificacion('danger');
      return false;
    }
  }

  esEditable(fechaStr: string): boolean {
    // Si tiene el permiso especial, siempre es editable
    if (this.puedeEditarPasado) return true;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaCelda = new Date(fechaStr.replace(/-/g, '\/'));
    // Si la fecha de la celda es menor a hoy, está bloqueado
    return fechaCelda > hoy;
  }


  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

  onCalendar(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendar = value;
  }

  async guardarHorarioCompleto() {
    this.titleLoader = "Cargando registros...";
    const ahora = new Date();
    const fechaHoyPC = ahora.toLocaleDateString('en-CA'); // 'en-CA' genera YYYY-MM-DD

    const payload = { codigoTienda: this.keyStore, fechaCabecera: fechaHoyPC, rangoDias: `${this.horariosProcesados[0].dias[0].fecha} al ${this.horariosProcesados[0].dias[6].fecha}`, datos: this.horariosProcesados };

    this.isLoading = false;
    this.hayCambios = false;
    // Enviar al servicio
    this.storeService.postRegisterHorarios(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.limpiarCache();
        this.onSearch();
        this.messageNotification = response.message || 'null';
        this.abrirNotificacion('success');

      },
      error: (error: any) => {
        this.isLoading = false;
        this.messageNotification = error.message || 'Error al guardar el horario.';
        this.abrirNotificacion('danger');
      }
    });
  }

  onVerificarHorario() {
    this.isLoading = true;
    this.storeService.postoneSearchHorarios({ rango_fecha: `${this.dateCalendar[0]} al ${this.dateCalendar[1]}`, codigoTienda: this.keyStore }).subscribe((response: any) => {

      if (response?.length > 0) {
        this.isLoading = false;
        this.messageNotification = 'Esta tratando de generar un horario ya existente.';
        this.abrirNotificacion('danger');
        return;
      }

      this.onInitHorario();

    });
  }

  onSearch() {
    if (this.dateCalendar.length > 0) {
      this.isLoading = true;

      this.storeService.postoneSearchHorarios({ rango_fecha: `${this.dateCalendar[0]} al ${this.dateCalendar[1]}`, codigoTienda: this.keyStore }).subscribe((response: any) => {
        this.isLoading = false;
        this.hayCambios = false;
        this.isEditing = true;
        localStorage.setItem('hayCambios', 'false');
        const data = response;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        this.horariosProcesados = data.map((cargo: any) => {
          return {
            ...cargo,
            // Mapeamos los días para inyectar dayBlock
            dias: cargo.dias.map((itemDia: any) => {
              const [anio, mes, dia] = itemDia.fecha.split('-').map(Number);
              const fechaCalendario = new Date(anio, mes - 1, dia);

              return {
                ...itemDia,
                // Si la fecha es menor a hoy, dayBlock es true
                dayBlock: fechaCalendario.getTime() < hoy.getTime()
              };
            })
          };
        });

        this.guardarEnCache();
      });


    } else {
      this.messageNotification = 'Seleccione un rango de fechas.';
      this.abrirNotificacion('danger');
    }

  }

  async editarHorarioCompleto() {
    this.isLoading = true;
    this.titleLoader = "Cargando registros...";
    const ahora = new Date();
    const fechaHoyPC = ahora.toLocaleDateString('en-CA'); // 'en-CA' genera YYYY-MM-DD

    const payload = { codigoTienda: this.keyStore, fechaCabecera: fechaHoyPC, rangoDias: `${this.horariosProcesados[0].dias[0].fecha} al ${this.horariosProcesados[0].dias[6].fecha}`, datos: this.horariosProcesados };

    this.isLoading = false;
    this.hayCambios = false;
    // Enviar al servicio
    this.storeService.putHorario(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.limpiarCache();
        this.messageNotification = response.message || 'null';
        this.abrirNotificacion('success');
      },
      error: (error: any) => {
        this.isLoading = false;
        this.messageNotification = error.message || 'Error al guardar el horario.';
        this.abrirNotificacion('danger');
      }
    });
  }


}
