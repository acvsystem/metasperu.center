import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'mt-r-papeletas',
  standalone: false,
  templateUrl: './mt-r-papeletas.html',
  styleUrl: './mt-r-papeletas.scss',
})
export class MtRPapeletas {
  storeList: Array<any> = [];
  keyStore: string = "";
  keyStore_2: string = "";
  dataTable: Array<any> = [];
  columnsData: tableColumns[] = [
    { isSticky: true, matColumnDef: 'codigo_papeleta', titleColumn: 'Codigo Papeleta', propertyValue: 'codigo_papeleta', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tienda', titleColumn: 'Tienda', propertyValue: 'tienda', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'nombre_completo', titleColumn: 'Nombre Completo', propertyValue: 'nombre_empleado', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fecha_creacion', titleColumn: 'Fecha Creacion', propertyValue: 'fecha_creacion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fecha_compensa', titleColumn: 'Fecha Compensacion', propertyValue: 'fecha_papeleta', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'hora_solicitada', titleColumn: 'Horas Solicitadas', propertyValue: 'hora_solicitada', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'tipo_papeleta', titleColumn: 'Tipo Papeleta', propertyValue: 'concepto', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'view_papeleta', filterActive: false, isCboFilter: false, cboFilter: [] }]

  columnsTable = [...this.columnsData]
  displayedColumnsTable = this.columnsTable.map(col => col.matColumnDef);

  constructor(private storeService: StoreService) { }

  async ngOnInit() {

    await Promise.all([
      this.onStoreList()
    ]);

    const codeStoreEncrypted = localStorage.getItem('keyStore');
    const oldCodeStoreEncrypted = localStorage.getItem('keyStore_2');
    if (!codeStoreEncrypted) return;

    const serieDecrypted = this.storeService.decrypt(codeStoreEncrypted);
    const store = this.storeList.find(s => s.serie === serieDecrypted);
    this.keyStore = store ? store.serie : '';
    this.keyStore_2 = this.storeService.decrypt(oldCodeStoreEncrypted || '');

    this.onAllPapeletas();
  }

  onAllPapeletas() {
    const body = {
      codestore: this.keyStore,
      old_codestore: this.keyStore_2 == 'OF' ? '' : this.keyStore_2
    };

    this.storeService.postAllBAllot(body).subscribe((res: any) => {
      this.dataTable = res.data;
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