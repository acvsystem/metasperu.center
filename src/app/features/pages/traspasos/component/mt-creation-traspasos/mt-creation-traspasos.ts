import { Component, Input } from '@angular/core';
import { SocketInventoryService } from '@metasperu/services/socketInvetory';
import { StoreService } from '@metasperu/services/store.service';
import * as XLSX from 'xlsx';
import { tableColumns } from '../../../rrhh-asistencia/rrhh-asistencia';
export type NotificationType = 'success' | 'warning' | 'danger';

@Component({
  selector: 'mt-creation-traspasos',
  standalone: false,
  templateUrl: './mt-creation-traspasos.html',
  styleUrl: './mt-creation-traspasos.scss',
})
export class MtCreationTraspasos {
  @Input() storeList: Array<any> = [];
  selectedUnidServicio: string = "";
  cboStoreOrigen: Array<any> = [];
  cboStoreDestino: Array<any> = [];
  storesSelectedOrigen: Array<any> = [];
  storesSelectedDestino: Array<any> = [];
  dataInventory: Array<any> = [];
  dataSelectStore: Array<any> = [{ key: 'BBW', value: 'BATH & BODY WORKS' }, { key: 'VS', value: 'VICTORIA SECRET' }, { key: 'TM', value: 'TUMI' }];
  dataExcelImport: Array<any> = [];
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
  messageNotification: string = '';
  unsOrigen: string = '';
  unsDestino: string = '';


  columnsInventory: tableColumns[] = [
    { isSticky: true, matColumnDef: 'codigoBarra', titleColumn: 'Codigo Barra', propertyValue: 'cCodigoBarra', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'codigoArticulo', titleColumn: 'Codigo Articulo', propertyValue: 'cCodigoArticulo', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'descripcion', titleColumn: 'Descripcion', propertyValue: 'cDescripcion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'talla', titleColumn: 'Talla', propertyValue: 'cTalla', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'color', titleColumn: 'Color', propertyValue: 'cColor', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'stock', titleColumn: 'Stock', propertyValue: 'cStock', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'stock_solicitado', titleColumn: 'Stock Solicitado', propertyValue: 'cCantidadSolicitada', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'estado', titleColumn: 'Estado', propertyValue: 'cStatus', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'accion', titleColumn: 'Accion', propertyValue: 'cAccion', filterActive: false, isCboFilter: false, cboFilter: [] }];

  displayedColumnsInventory = this.columnsInventory.map(col => col.matColumnDef);

  constructor(private socketInventoryService: SocketInventoryService, private storeService: StoreService) { }

  ngOnInit() {
    this.socketInventoryService.onOneInvenrotyStore((data: any) => {
      console.log(data);
      this.dataInventory = data.dataCode;

    });
  }

  calcularSumaTotal(): number {
    return this.dataInventory.reduce((acc, item) => acc + Number(item.cCantidadSolicitada || 0), 0);
  }

  onChangeSelect(item: any, property?: string) {
    // 1. Cuando cambia la Unidad de Servicio: Filtramos el Origen
    if (property === 'selectedUnidServicio') {
      this.selectedUnidServicio = item.key;
      this.cboStoreOrigen = this.storeList
        .filter(store => store.unidad_servicio === item.key)
        .map(store => ({ key: store.serie, value: store.nombre }));

      // Limpiamos el destino por si había algo seleccionado previamente
      this.cboStoreDestino = [];
    }

    // 2. Cuando se selecciona un Origen: Llenamos Destino excluyendo el actual
    if (property === 'cboStoreOrigen') {
      this.cboStoreDestino = this.storeList
        .filter(store =>
          store.unidad_servicio === this.selectedUnidServicio && // Misma unidad
          store.serie !== item.key                              // EXCLUIR el seleccionado
        )
        .map(store => ({ key: store.serie, value: store.nombre }));

      this.storesSelectedOrigen = [{ serie: item.key, nombre: item.value }];
    }

    if (property === 'cboStoreDestino') {
      this.storesSelectedDestino = [{ serie: item.key, nombre: item.value }];
    }
  }

  onImportarExcel(event: any): void {

    if (this.selectedUnidServicio === '' || this.storesSelectedOrigen.length === 0 || this.storesSelectedDestino.length === 0) {
      this.messageNotification = 'Seleccione Unidad de Servicio, Tienda Origen y Tienda Destino.';
      this.abrirNotificacion('danger');
      return;
    }

    const file: File = event.target.files[0];
    if (!file) return;

    // 1. Validación de extensión más limpia
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isExcel) {
      console.error('Formato no válido');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (!result) return;

      // 2. Procesamiento del Workbook
      const workbook = XLSX.read(result, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 3. Transformación directa
      // Convertimos a JSON omitiendo la primera fila (header: 1)
      const dataJson = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

      // 4. Mapeo eficiente
      // Usamos slice(1) para saltar cabecera y map/filter para procesar
      this.dataExcelImport = dataJson
        .slice(1) // Quitamos la cabecera
        .filter(row => row.length >= 2 && row[0] !== undefined) // Validamos fila mínima
        .map(row => ({
          codigo_barra: String(row[0] ?? '').trim(),
          cantidad_solicitada: Number(row[1] ?? 0)
        }));

      console.log('Datos importados:', this.dataExcelImport);

      this.onSearchInventory();
    };

    reader.readAsArrayBuffer(file);
  }

  onSearchInventory() {

    if (!this.dataExcelImport.length) {
      this.messageNotification = 'Importe un archivo Excel con datos válidos.';
      this.abrirNotificacion('danger');
      return;
    }

    if (this.selectedUnidServicio === '' || this.storesSelectedOrigen.length === 0 || this.storesSelectedDestino.length === 0) {
      this.messageNotification = 'Seleccione Unidad de Servicio, Tienda Origen y Tienda Destino.';
      this.abrirNotificacion('danger');
      return;
    }

    const body = {
      "serieStore": this.storesSelectedOrigen[0].serie,
      "socketId": this.socketInventoryService.socketID,
      "dataCode": this.dataExcelImport
    }

    this.storeService.postOneInventoryStore(body).subscribe((data: any) => {
      console.log(data);
    });
  }

  onGenerarTraspaso() {
    if (!this.dataExcelImport.length) {
      this.messageNotification = 'Importe un archivo Excel con datos válidos.';
      this.abrirNotificacion('danger');
      return;
    }

    if (this.selectedUnidServicio === '' || this.storesSelectedOrigen.length === 0 || this.storesSelectedDestino.length === 0) {
      this.messageNotification = 'Seleccione Unidad de Servicio, Tienda Origen y Tienda Destino.';
      this.abrirNotificacion('danger');
      return;
    }

    const esTodoCorrecto = this.dataInventory.every(item => item.cStatus === 'Correcto');

    if (esTodoCorrecto) {
      this.exportarTxt();
    } else {
      this.messageNotification = 'Hay artículos con errores o faltantes.';
      this.abrirNotificacion('danger');
    }
  }

  exportarTxt() {
    // 1. Generar ID único más robusto
    const idFile = Math.floor(Math.random() * 98001) + 1000;
    const fileName = `traspaso_stock_${idFile}.txt`;

    // 2. Obtener almacenes con desestructuración y seguridad
    const almacenOrigen = this.storeList.find(s => s.serie === this.storesSelectedOrigen[0]?.serie);
    const almacenDestino = this.storeList.find(s => s.serie === this.storesSelectedDestino[0]?.serie);

    if (!almacenOrigen || !almacenDestino) {
      console.error('No se pudo determinar el origen o destino');
      return;
    }

    this.unsOrigen = almacenOrigen.tipo_tienda;
    this.unsDestino = almacenDestino.tipo_tienda;

    // 3. Transformar datos (usando template literals para mayor claridad)
    const contenido = this.dataInventory
      .map(item =>
        `${almacenOrigen.codigo_almacen} | ${almacenDestino.codigo_almacen} | ${item.cCodigoArticulo} | ${item.cColor} | ${item.cTalla} | ${item.cCantidadSolicitada}`
      )
      .join('\n');

    // 4. Crear Blob y archivo
    const blob = new Blob([contenido], { type: 'text/plain' });

    // --- OPCIONAL: Descarga local (Solo si realmente la necesitas en el cliente) ---
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    // 5. Preparar envío al servidor (Metas Perú API)

    let tipoTienda = "";

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VSBA';
    }

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VSBA_VSFA';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VSFA_VSBA';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VSFA';
    }

    if (this.unsOrigen == 'BBW' && this.unsDestino == 'BBW') {
      tipoTienda = 'BBW';
    }

    const archivo = new File([blob], fileName, { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('ftpDirectorio', tipoTienda);
    formData.append('origenStore', almacenOrigen.nombre || 'Origen'); // Para el cuerpo del email
    formData.append('destinoStore', almacenDestino.nombre || 'Destino');
    formData.append('email', 'andrecanalesv@gmail.com'); // El correo del solicitante
    console.log('FormData preparado para envío:', this.unsOrigen, this.unsDestino, tipoTienda);
    // 6. Suscripción con manejo de estados
   /* this.storeService.postTraspasos(formData).subscribe({
      next: (resp) => {
        this.messageNotification = resp.message;
        this.abrirNotificacion(resp.status);
        // Aquí podrías disparar un SweetAlert o notificación de éxito
      },
      error: (err) => {
        console.error('Error al procesar traspaso:', err);
        this.messageNotification = 'Error al procesar el traspaso.';
        this.abrirNotificacion('danger');
      }
    });*/
  }


  onVerificarTipoTienda(): string {
    let tipoTienda = "";

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VSBA';
    }

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VSBA_VSFA';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VSFA_VSBA';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VSFA';
    }

    if (this.unsOrigen == 'BBW' && this.unsDestino == 'BBW') {
      tipoTienda = 'BBW';
    }

    return tipoTienda;
  }

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }
}
