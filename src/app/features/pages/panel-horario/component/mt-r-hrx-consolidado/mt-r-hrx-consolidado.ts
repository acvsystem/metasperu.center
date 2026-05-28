import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
import { StoreService } from '@metasperu/services/store.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'mt-r-hrx-consolidado',
  standalone: false,
  templateUrl: './mt-r-hrx-consolidado.html',
  styleUrl: './mt-r-hrx-consolidado.scss',
})
export class MtRHrxConsolidado implements OnInit, OnDestroy {
  storeList: Array<any> = [];
  keyStore: string = '';
  selectEmploye: any = {};
  cboStore: Array<any> = [];
  employeEJBList: any[] = [];
  dataEJB: any[] = [];
  listaMaestraTrabajadores: any[] = [];
  dataTable: Array<any> = [];
  selectedStore: any = {};
  columnsData: tableColumns[] = [
    { isSticky: true, matColumnDef: 'nombre_completo', titleColumn: 'Nombre Completo', propertyValue: 'nombre_completo', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'documento', titleColumn: 'Documento', propertyValue: 'documento', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'hora_acumulado', titleColumn: 'Hora Acumulada', propertyValue: 'hora_acumulada', filterActive: false, isCboFilter: false, cboFilter: [] },
  ]

  columnsTable = [...this.columnsData]
  displayedColumnsTable = this.columnsTable.map(col => col.matColumnDef);

  // Control de estado para ejecución sincronizada
  private dataReady = { employes: false, socket: false, store: false };
  private subscriptions: Subscription = new Subscription();
  private refreshCallbackEmployes = (data: any) => {

    const serieStore = Object.keys(this.selectedStore).length ? this.selectedStore.key : this.keyStore;
    const store = this.storeList.find(s => s.serie === serieStore);

    this.procesarDataEJB(data, store);
  };


  constructor(
    private storeService: StoreService,
    private socketService: SocketResourcesHumanService
  ) { }

  async ngOnInit() {
    // 1. Cargar lista base de empleados
    await Promise.all([this.onStoreList(), this.onEmpleadosList()])

    const codeStoreEncrypted = localStorage.getItem('keyStore') || "";
    const serieDecrypted = this.storeService.decrypt(codeStoreEncrypted);
    const store = this.storeList.find(s => s.serie === serieDecrypted);
    this.keyStore = store ? store.serie : 'OF';

    this.socketService.onRefreshEmployesEJB((data: any) => {
      this.dataEJB = data || [];

      if (!Object.keys(this.selectedStore).length && this.keyStore != 'OF') {
        this.refreshCallbackEmployes(this.dataEJB);
      }

    });



    // 3. Validar estado del Socket ID
    // Si el socket ya tiene ID, marcamos como listo
    this.socketService.socket$.subscribe((id) => {
      this.dataReady.socket = true;
      this.checkAndExecute();
    });

    // 4. Escuchar respuesta de horas (resultado del procesamiento)
    this.socketService.onHoursWorksEmployes((hours) => {
      if (hours?.data) {
        const index = this.dataTable.findIndex(item => item.documento === hours.data.documento);
        if (index !== -1) {
          this.dataTable[index].hora_acumulada = hours.data.totalHorasDecimal == 0 ? '--------' : hours.data.totalHorasFormato;
        }
      }
    });
  }

  /**
   * Verifica que ambas condiciones se cumplan antes de pedir las horas
   */
  private checkAndExecute() {
    if (this.dataReady.employes && this.dataReady.socket) {
      this.onHoursWorksEmployes();
    }
  }

  procesarDataEJB(dataEmployes: any, store: any) {
    if (!dataEmployes) return;

    const codigo_unid_ejb = store ? store.codigo_ejb : '0001';

    const filtrados = dataEmployes.filter((emp: any) => emp.code_unid_servicio === codigo_unid_ejb);

    this.employeEJBList = filtrados.map((ejb: any) => ({
      key: ejb.nro_documento,
      value: ejb.nombre_completo
    }));

    this.dataTable = filtrados.map((item: any) => {
      return {
        nombre_completo: item.nombre_completo,
        documento: item.nro_documento,
        hora_acumulada: ""
      }
    });

    this.listaMaestraTrabajadores = [...filtrados];


    // Marcar empleados como listos y validar ejecución
    this.dataReady.employes = true;
    this.checkAndExecute();
  }

  async onStoreList(): Promise<any[]> {
    try {
      // 1. Usamos lastValueFrom para convertir el observable en una promesa
      const stores = await lastValueFrom(this.storeService.getStores());

      // 2. Validación de seguridad: aseguramos que siempre sea un array
      this.storeList = Array.isArray(stores) ? stores : [];
      this.cboStore = stores.map(store => ({ key: store.serie, value: store.nombre }));
      this.dataReady.store = true;
      this.checkAndExecute();

      return this.storeList;
    } catch (error) {
      // 3. Gestión de errores específica
      console.error('Error crítico al obtener tiendas:', error);

      // 4. Mantenemos el estado de la UI consistente incluso tras el error
      this.storeList = [];

      // 5. Opcional: Podrías relanzar el error si el componente padre necesita saber que falló
      return [];
    }
  }

  onEmpleadosList() {
    return new Promise((resolve) => {
      this.socketService.socket$.subscribe((id) => {
        if ((id || "").length) {
          const socketId = this.socketService.socketID || '';
          const sub = this.storeService.callRegisterEmployes(socketId).subscribe({
            next: (data: any) => {
              // this.storeList = data; // Asumiendo que asignas la data a storeList
              resolve(true);
            },
            error: () => resolve(false)
          });
          this.subscriptions.add(sub);
        }
      });
    });
  }

  onHoursWorksEmployes() {
    const fechaHasta = this.formatDate(new Date());
    const fechaDesde = this.formatDate(this.substractDays(new Date(), 75));
    console.log(this.employeEJBList);
    this.employeEJBList.forEach((item) => {
      const body = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        documento: item.key,
        socket: this.socketService.socketID
      };

      const sub = this.storeService.postHoursWorksEmployes(body).subscribe();
      this.subscriptions.add(sub);
    });
  }

  // --- Helpers de utilidad ---

  private substractDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Retorna YYYY-MM-DD
  }

  ngOnDestroy() {
    // Limpiamos suscripciones para evitar memory leaks
    this.subscriptions.unsubscribe();
    this.socketService.offRefreshEmployesEJB(this.refreshCallbackEmployes);
  }

  async onChangeSelect(event: any) {

    this.selectedStore = { key: event.key, value: event.value };

    this.refreshCallbackEmployes(this.dataEJB);
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