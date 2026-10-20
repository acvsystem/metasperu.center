import { Component, OnDestroy } from '@angular/core';
import { EMPTY, Subject, Subscription, catchError, concatMap, takeUntil, tap } from 'rxjs';
import { SocketInventoryService } from '@metasperu/page/shared/services/socketInvetory';
import { StoreService } from '@metasperu/services/store.service';
export type NotificationType = 'success' | 'warning' | 'danger';
import * as XLSX from 'xlsx';

@Component({
  selector: 'inventario',
  standalone: false,
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario implements OnDestroy {

  columnsInventory: tableColumns[] = [
    { isSticky: true, matColumnDef: 'codigoBarra', titleColumn: 'Codigo Barra', propertyValue: 'cCodigoBarra', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'codigoArticulo', titleColumn: 'Codigo Articulo', propertyValue: 'cCodigoArticulo', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'referencia', titleColumn: 'Referencia', propertyValue: 'cReferencia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'descripcion', titleColumn: 'Descripcion', propertyValue: 'cDescripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'seccion', titleColumn: 'Seccion', propertyValue: 'cSeccion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'familia', titleColumn: 'Familia', propertyValue: 'cFamilia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'subFamilia', titleColumn: 'Subfamilia', propertyValue: 'cSubFamilia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'talla', titleColumn: 'Talla', propertyValue: 'cTalla', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'color', titleColumn: 'Color', propertyValue: 'cColor', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'esencia', titleColumn: 'Esnencia', propertyValue: 'cEsnencia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'styleDesc', titleColumn: 'Style Description', propertyValue: 'cStyleDesc', filterActive: false, isCboFilter: false, cboFilter: [] }];

  expColumnsInventory = [...this.columnsInventory]
  displayedColumnsInventory = this.columnsInventory.map(col => col.matColumnDef);
  expDisplayedColumnsInventory = [...this.displayedColumnsInventory];
  dataInventory: Array<any> = [];
  dataStoreOnline: Array<any> = [];
  storeList: Array<any> = [];
  datosExportar: Array<any> = [];
  dataSelectStore: Array<any> = [{ key: 'BBW', value: 'BATH & BODY WORKS' }, { key: 'VS', value: 'VICTORIA SECRET' }, { key: 'MT', value: 'TUMI' }];
  cboStoreList: Array<any> = [];
  storesSelected: Array<any> = [];
  selectedStore: any = null;
  isNotification: boolean = false;
  isLoading: boolean = false;
  typeNotification: NotificationType = 'success';
  messageNotification: string = 'No hay tiendas online para mostrar el inventario';
  titleLoader: string = 'Procesando Inventario';
  serieStore: string = '';
  countOnlienStore: number = 0;
  emailInvetorySend: string = '';
  marcaSelected: string = '';
  searchCodigoBarra: string = '';
  isPendingStoresOpen = false;
  hasInventoryQuery = false;
  inventoryTimedOut = false;
  private readonly inventoryWaitMs = 90 * 1000;
  private inventoryTimer?: ReturnType<typeof setTimeout>;
  private readonly cancelInventory = new Subject<void>();
  private readonly destroy = new Subject<void>();
  private readonly inventoryUpdates = new Subject<string>();
  private readonly receivedStores = new Set<string>();
  private readonly requestedStores = new Set<string>();
  private readonly announcedStores = new Set<string>();
  private inventorySubscription?: Subscription;
  private removeInventoryListener?: () => void;
  private inventoryBrand = '';
  private inventoryBarcode = '';
  private latestInventory: any[] = [];
  private rosterLoaded = false;
  isCollectingInventory = false;

  get pendingInventoryStores(): Array<{ serie: string; nombre: string; online: boolean }> {
    const stores = new Map<string, { serie: string; nombre: string; online: boolean }>();
    this.storeList.filter(store => store.marca === this.inventoryBrand).forEach(store => {
      const serie = String(store.serie);
      stores.set(serie, { serie, nombre: store.nombre, online: this.dataStoreOnline.includes(serie) });
    });
    this.dataStoreOnline.forEach(serie => {
      if (!stores.has(serie)) stores.set(serie, { serie, nombre: serie, online: true });
    });
    return [...stores.values()].filter(store => !this.receivedStores.has(store.serie));
  }
  constructor(private socketInventoryService: SocketInventoryService, private storeService: StoreService) { }

  ngOnInit() {


    this.storeService.getStores().pipe(takeUntil(this.destroy)).subscribe(
      response => {
        this.storeList = response;
        this.cboStoreList = this.storeList.map(store => ({ key: store.serie, value: store.nombre }));

        this.marcaSelected = localStorage.getItem('marca') || 'OF';

        if (this.marcaSelected == 'BBW' || this.marcaSelected == 'VS' || this.marcaSelected == 'TM') {
          this.selectedStore = this.dataSelectStore.find(store => store.key === this.marcaSelected);
          this.onAddUpdateColumn(this.selectedStore.key);
        }
      }
    );

    this.removeInventoryListener = this.socketInventoryService.onUpdateInventory((data: any) => {
      if (!this.hasInventoryQuery || data?.serieStore == null) return;
      const serie = String(data.serieStore);
      this.announcedStores.add(serie);
      this.requestStoreInventory(serie);
    });
  }

  private requestStoreInventory(serie: string) {
    if (!this.rosterLoaded || !this.dataStoreOnline.includes(serie) || this.requestedStores.has(serie)) return;
    this.requestedStores.add(serie);
    this.inventoryUpdates.next(serie);
  }

  private restartInventoryTimer() {
    this.clearInventoryTimer();
    this.inventoryTimer = setTimeout(() => this.finishInventory(true), this.inventoryWaitMs);
  }

  private clearInventoryTimer() {
    if (this.inventoryTimer !== undefined) clearTimeout(this.inventoryTimer);
    this.inventoryTimer = undefined;
  }

  private displayInventory() {
    // El consolidado puede contener stock anterior de tiendas que aún no respondieron.
    this.dataInventory = this.latestInventory.map(item => ({
      ...item,
      cStock: Object.fromEntries(Object.entries(item.cStock || {})
        .filter(([serie]) => this.receivedStores.has(serie)))
    }));
    if (this.inventoryBarcode) {
      const match = this.dataInventory.find(item => item.cCodigoBarra === this.inventoryBarcode);
      this.dataInventory = match ? this.dataInventory
        .filter(item => item.cSubFamilia === match.cSubFamilia && item.cColor === match.cColor)
        .sort((a, b) => String(a.cTalla).localeCompare(String(b.cTalla))) : [];
    }
    this.onAlmacenarDatosExportar();
    this.onAddUpdateColumn(this.inventoryBrand);
    this.expColumnsInventory = this.expColumnsInventory.filter(column =>
      column.extraProperty !== 'cStock' || this.receivedStores.has(column.propertyValue));
    this.expDisplayedColumnsInventory = this.expColumnsInventory.map(column => column.matColumnDef);
  }

  private finishInventory(timedOut: boolean) {
    this.clearInventoryTimer();
    this.isCollectingInventory = false;
    this.inventoryTimedOut = timedOut;
    this.displayInventory();
    this.isLoading = false;
    if (timedOut) {
      this.messageNotification = this.countOnlienStore
        ? `Han pasado 1 minuto y medio sin nuevas respuestas. Se muestra el inventario de ${this.countOnlienStore}/${this.dataStoreOnline.length} tiendas conectadas. Consulte las tiendas pendientes.`
        : 'Han pasado 1 minuto y medio sin respuestas. No se recibió inventario; consulte las tiendas pendientes.';
      this.abrirNotificacion('warning');
    }
  }

  ngOnDestroy() {
    this.clearInventoryTimer();
    this.cancelInventory.next();
    this.cancelInventory.complete();
    this.inventorySubscription?.unsubscribe();
    this.inventoryUpdates.complete();
    this.removeInventoryListener?.();
    this.destroy.next();
    this.destroy.complete();
  }

  async onChangeSelect(data: any) {
    this.selectedStore = data;
    this.onAddUpdateColumn(this.selectedStore.key);
  }

  onSearchCodigoBarra(ev: any, property?: string) {
    const value = ev.target.value;

    if (property === 'searchCodigoBarra') {
      this.searchCodigoBarra = String(value).trim();
    }

    if (this.searchCodigoBarra.length >= 12) {

      if (!this.selectedStore?.key) {
        this.messageNotification = 'Seleccione Unidad de Servicio.';
        this.abrirNotificacion('danger');
        return;
      }

      this.onSendInventory();
    }
  }

  onAlmacenarDatosExportar() {

    const nombresTiendas = this.storeList.reduce((acc, t: any) => {
      acc[t.serie] = t.nombre;
      return acc;
    }, {} as { [key: string]: string });
    
    const articulosAplanados = this.dataInventory.map(item => {
      // Desestructuramos cStock, cMarca y cTemporada fuera del objeto
      const { cStock, marca, cTemporada, ...resto } = item;

      const stockConNombres: any = {};

      Object.keys(cStock).forEach(key => {
        const nombreTienda = nombresTiendas[key] || key;
        stockConNombres[nombreTienda] = cStock[key];
      });

      return {
        ...resto,           // todo lo demás excepto cStock, cMarca y cTemporada
        ...stockConNombres  // stock con nombres de tienda como columnas
      };
    });

    this.datosExportar = articulosAplanados;
  }

  onChangeInput(ev: any) {
    const email = ev.target.value;
    this.emailInvetorySend = email;
    console.log(email);
  }

  onAddUpdateColumn(marca: string) {
    this.expDisplayedColumnsInventory = [...this.displayedColumnsInventory];
    this.expColumnsInventory = [...this.columnsInventory];
    this.displayedColumnsInventory = [];
    this.displayedColumnsInventory = this.expColumnsInventory.map(col => col.matColumnDef);

    this.storeList.filter((store) => {
      if (marca == store.marca) {
        const indexColumn = this.expColumnsInventory.findIndex(col => col.matColumnDef === store.serie);
        if (indexColumn !== -1) {
          const online = this.dataStoreOnline.includes(store.serie);
          this.expColumnsInventory[indexColumn]['isOnline'] = online;
        } else {
          const online = this.dataStoreOnline.includes(store.serie);
          this.expColumnsInventory.push({ isSticky: false, matColumnDef: store.serie, titleColumn: store.nombre, extraProperty: 'cStock', propertyValue: store.serie, filterActive: false, isCboFilter: false, cboFilter: [], isOnline: online });
          this.expDisplayedColumnsInventory.push(store.serie);
        }
      }
    });
  }

  onChangeSelectMultiple(ev: any) {
    this.storesSelected = [];
    this.storesSelected = ev.map((item: any) => ({ serie: item.key, nombre: item.value }));
  }

  onEmailInventory() {
    this.isLoading = true;
    this.titleLoader = `Enviando inventario...`;
    this.storeService.callInventoryEmail(this.emailInvetorySend, this.storesSelected).subscribe(
      response => {
        this.isLoading = false;
        this.messageNotification = 'Correo enviado exitosamente';
        this.abrirNotificacion('success');
      },
      error => {
        console.error('Error al enviar el email:', error);
        this.messageNotification = 'Error al enviar el email:' + error;
        this.abrirNotificacion('danger');
      }
    );
  }

  onSendInventory() {
    if (this.isCollectingInventory) return;
    if (!this.selectedStore?.key) {
      this.messageNotification = 'Seleccione Unidad de Servicio.';
      this.abrirNotificacion('danger');
      return;
    }
    this.cancelInventory.next();
    this.inventorySubscription?.unsubscribe();
    this.clearInventoryTimer();
    this.inventoryBrand = this.selectedStore.key;
    this.inventoryBarcode = this.searchCodigoBarra;
    this.receivedStores.clear();
    this.requestedStores.clear();
    this.announcedStores.clear();
    this.latestInventory = [];
    this.dataInventory = [];
    this.datosExportar = [];
    this.dataStoreOnline = [];
    this.rosterLoaded = false;
    this.hasInventoryQuery = true;
    this.inventoryTimedOut = false;
    this.isPendingStoresOpen = false;
    this.isNotification = false;
    this.isCollectingInventory = true;
    this.isLoading = true;
    this.titleLoader = 'Obteniendo Inventario...';
    this.countOnlienStore = 0;

    // Procesar los consolidados en orden evita que una respuesta antigua reemplace datos nuevos.
    this.inventorySubscription = this.inventoryUpdates.pipe(
      concatMap(serie => this.storeService.callUpdateInventory(this.inventoryBrand, serie).pipe(
        catchError(error => {
          console.error('Error al actualizar el inventario:', error);
          this.requestedStores.delete(serie);
          return EMPTY;
        }),
        tap(response => {
          if (!Array.isArray(response?.inventory)) {
            this.requestedStores.delete(serie);
            return;
          }
          this.latestInventory = response.inventory;
          this.receivedStores.add(serie);
          this.countOnlienStore = this.receivedStores.size;
          this.titleLoader = `Obteniendo Inventario ${this.countOnlienStore}/${this.dataStoreOnline.length}`;
          if (this.countOnlienStore === this.dataStoreOnline.length) {
            this.finishInventory(false);
          } else if (this.isCollectingInventory) {
            this.restartInventoryTimer();
          } else {
            // Las respuestas tardías de esta consulta también actualizan la tabla y el modal.
            this.displayInventory();
          }
        })
      ))
    ).subscribe();
    this.restartInventoryTimer();
    this.storeService.callInventory(this.inventoryBrand, this.socketInventoryService.socketID)
      .pipe(takeUntil(this.cancelInventory), takeUntil(this.destroy)).subscribe({
        next: response => {
          this.dataStoreOnline = [...new Set<string>((response.online || [])
            .map((store: any) => String(store.tiendaId)))];
          this.rosterLoaded = true;
          if (!this.dataStoreOnline.length) {
            this.finishInventory(false);
            this.messageNotification = 'No hay tiendas online para mostrar el inventario';
            this.abrirNotificacion('warning');
            return;
          }
          this.titleLoader = `Obteniendo Inventario 0/${this.dataStoreOnline.length}`;
          this.announcedStores.forEach(serie => this.requestStoreInventory(serie));
        },
        error: error => {
          console.error('Error al obtener el inventario:', error);
          this.finishInventory(false);
          this.messageNotification = 'Error al obtener el inventario. Intente consultar nuevamente.';
          this.abrirNotificacion('danger');
        }
      });
  }

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

  exportarExcel() {
    // 1. Mapeamos los datos (Tu lógica se mantiene igual)
    const dataParaExportar = this.datosExportar.map(item => {
      const objReturn: Record<string, any> = item;
      return objReturn;
    });

    // 2. Creamos la hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataParaExportar);

    // 3. --- LÓGICA PARA PINTAR CELDAS ---
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Empezamos en +1 para saltar el encabezado
      // Buscamos la columna 'cEstadoEscaneo'. 
      // Si sabes que es la columna 17 (por ejemplo), puedes usarla directo.
      const estadoCellAddress = XLSX.utils.encode_cell({ r: R, c: 16 }); // Ajusta el índice de columna
      const cell = worksheet[estadoCellAddress];

      if (cell && cell.v === 'NO ESCANEADO') {
        // Pintamos toda la fila o solo esa celda
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[address]) continue;

          worksheet[address].s = {
            fill: {
              fgColor: { rgb: "FFFF0000" } // Rojo (Formato ARGB)
            },
            font: {
              color: { rgb: "FFFFFF" }, // Texto blanco para que resalte
              bold: true
            }
          };
        }
      }
    }

    // 4. Generamos el libro y descargamos
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Inventario': worksheet },
      SheetNames: ['Inventario']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'inventario_sin_exponer');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName + '_' + new Date().getTime() + '.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
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
  isOnline?: boolean;
}
