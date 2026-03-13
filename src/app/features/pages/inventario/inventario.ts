import { Component } from '@angular/core';
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
export class Inventario {

  columnsInventory: tableColumns[] = [
    { isSticky: true, matColumnDef: 'codigoBarra', titleColumn: 'Codigo Barra', propertyValue: 'cCodigoBarra', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'codigoArticulo', titleColumn: 'Codigo Articulo', propertyValue: 'cCodigoArticulo', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'referencia', titleColumn: 'Referencia', propertyValue: 'cReferencia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'departamento', titleColumn: 'Departamento', propertyValue: 'cDepartamento', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'seccion', titleColumn: 'Seccion', propertyValue: 'cSeccion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'familia', titleColumn: 'Familia', propertyValue: 'cFamilia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'subFamilia', titleColumn: 'Subfamilia', propertyValue: 'cSubFamilia', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'talla', titleColumn: 'Talla', propertyValue: 'cTalla', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'color', titleColumn: 'Color', propertyValue: 'cColor', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'temporada', titleColumn: 'Temporada', propertyValue: 'cTemporada', filterActive: false, isCboFilter: false, cboFilter: [] }];

  expColumnsInventory = [...this.columnsInventory]
  displayedColumnsInventory = this.columnsInventory.map(col => col.matColumnDef);
  expDisplayedColumnsInventory = [...this.displayedColumnsInventory];
  dataInventory: Array<any> = [];
  dataStoreOnline: Array<any> = [];
  storeList: Array<any> = [];
  dataSelectStore: Array<any> = [{ key: 'BBW', value: 'BATH & BODY WORKS' }, { key: 'VS', value: 'VICTORIA SECRET' }, { key: 'TM', value: 'TUMI' }];
  selectedStore: any = null;
  isNotification: boolean = false;
  isLoading: boolean = false;
  typeNotification: NotificationType = 'success';
  messageNotification: string = 'No hay tiendas online para mostrar el inventario';
  titleLoader: string = 'Procesando Inventario';
  serieStore: string = '';
  countOnlienStore: number = 0;
  constructor(private socketInventoryService: SocketInventoryService, private storeService: StoreService) { }

  ngOnInit() {

    this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
      }
    );

    this.socketInventoryService.onUpdateInventory((data: any) => {
      this.serieStore = data.serieStore;
      this.storeService.callUpdateInventory(this.selectedStore.key, `${this.serieStore}`).subscribe(
        response => {
          this.countOnlienStore += 1;
          this.titleLoader = `Obteniendo Inventario ${this.countOnlienStore}/${this.dataStoreOnline.length}`;

          if (this.countOnlienStore === this.dataStoreOnline.length) {

            this.dataInventory = response.inventory;
            this.onAddUpdateColumn(this.selectedStore.key);

            setTimeout(() => {
              this.isLoading = false;
            }, 500); // Pequeña pausa para asegurar que el usuario vea el 100%
          }


        },
        error => {
          console.error('Error al actualizar el inventario:', error);
        }
      );
      // Aquí puedes actualizar tu UI con los nuevos datos de inventario
    });
  }

  async onChangeSelect(data: any) {
    this.selectedStore = data;
    this.onAddUpdateColumn(this.selectedStore.key);
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

  onSendInventory() {
    this.isLoading = true;
    this.titleLoader = `Obteniendo Inventario...`;
    this.countOnlienStore = 0;

    this.storeService.callInventory(`${this.selectedStore.key}`).subscribe(
      response => {

        if (!response.online.length) {
          this.isLoading = false;
          this.messageNotification = 'No hay tiendas online para mostrar el inventario';
          this.abrirNotificacion('danger');
        } else {
          this.dataStoreOnline = response.online.map((store: any) => store.tiendaId);
          this.titleLoader = `Obteniendo Inventario 0/${response.online.length}`;
        }
      },
      error => {
        console.error('Error al obtener el inventario:', error);
      }
    );
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
    const dataParaExportar = this.dataInventory.map(item => {
      const objReturn: Record<string, any> = {
        cCodigoTienda: item.cCodigoTienda,
        cCodigoArticulo: item.cCodigoArticulo,
        cCodigoBarra: item.cCodigoBarra,
        cReferencia: item.cReferencia,
        cDescripcion: item.cDescripcion,
        cDepartamento: item.cDepartamento,
        cSeccion: item.cSeccion,
        cFamilia: item.cFamilia,
        cSubFamilia: item.cSubFamilia,
        cTemporada: item.cTemporada,
        cTalla: item.cTalla,
        cColor: item.cColor,
        cStock: item.cStock
      };
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