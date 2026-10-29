import { Subscription as ViewSubscriptions, switchMap, tap, finalize } from 'rxjs';
import { Component, Input } from '@angular/core';
import { SocketInventoryService } from '@metasperu/services/socketInvetory';
import { StoreService } from '@metasperu/services/store.service';
import { SpreadsheetService } from '@metasperu/page/core/spreadsheets/spreadsheet.service';
import { tableColumns } from '../../../rrhh-asistencia/rrhh-asistencia';
export type NotificationType = 'success' | 'warning' | 'danger';
import { Router } from '@angular/router';

@Component({
  selector: 'mt-creation-traspasos',
  standalone: false,
  templateUrl: './mt-creation-traspasos.html',
  styleUrl: './mt-creation-traspasos.scss',
})
export class MtCreationTraspasos {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

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
  searchCodigoBarra: string = '';
  searchCantidad: number = 0;
  sending=false;
  private pendingRegistration:any=null;


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

  constructor(private socketInventoryService: SocketInventoryService, private storeService: StoreService, private router: Router, private sheets:SpreadsheetService) { }

  ngOnInit() {
    this.socketCleanup.push(this.socketInventoryService.onOneInvenrotyStore((data: any) => {
      console.log(data);
      this.dataInventory = data.dataCode;

    }));
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

  async onImportarExcel(event:any):Promise<void> {

    if (this.selectedUnidServicio === '' || this.storesSelectedOrigen.length === 0 || this.storesSelectedDestino.length === 0) {
      this.messageNotification = 'Seleccione Unidad de Servicio, Tienda Origen y Tienda Destino.';
      this.abrirNotificacion('danger');
      return;
    }

    const file: File = event.target.files[0];
    if (!file) return;

    const dataJson=await this.sheets.readFirstSheet(file);
    if(!dataJson)return;
    const imported=dataJson.slice(1).filter(row=>row.length>=2&&row[0]!==''&&row[0]!==undefined).map(row=>({
      codigo_barra:String(row[0]??'').trim(),cantidad_solicitada:Number(row[1]??0)
    }));
    if(imported.some(row=>!/^[A-Za-z0-9._-]{1,80}$/.test(row.codigo_barra)||!Number.isFinite(row.cantidad_solicitada)||row.cantidad_solicitada<=0||row.cantidad_solicitada>1000000)){
      this.messageNotification='Revisa los codigos y cantidades del archivo. No se modificaron los datos anteriores.';this.abrirNotificacion('danger');return;
    }
    this.dataExcelImport=imported;this.onSearchInventory();
  }

  onNewTraspaso() {
    this.router.navigate(['/traspaso_inventario', { ts: Date.now() }], {
      replaceUrl: true
    });
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

    this.viewSubscriptions.add(this.storeService.postOneInventoryStore(body).subscribe((data: any) => {
      console.log(data);
    }));
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
    if(this.sending)return;
    if(this.pendingRegistration){this.persistTransfer();return;}
    // 1. Generar ID único más robusto
    const idFile = Math.floor(Math.random() * 98001) + 1000;
    const fileName = `traspaso_stock_${idFile}.txt`;

    // 2. Obtener almacenes con desestructuración y seguridad
    const almacenOrigen = this.storeList.find(s => s.serie === this.storesSelectedOrigen[0]?.serie);
    const almacenDestino = this.storeList.find(s => s.serie === this.storesSelectedDestino[0]?.serie);

    if (!almacenOrigen || !almacenDestino) {
      this.messageNotification = 'No se pudo determinar el origen o destino.';
      this.abrirNotificacion('danger');
      return;
    }

    this.unsOrigen = almacenOrigen.tipo_tienda;
    this.unsDestino = almacenDestino.tipo_tienda;

    const nmCarpeta = this.onVerificarTipoTienda(); // Asumo que usas esto para la ruta real

    if (nmCarpeta === '') {
      this.messageNotification = `No se pudo determinar la carpeta destino ITPERU/${nmCarpeta}.`;
      this.abrirNotificacion('danger');
      return;
    }

    // 3. Transformar datos (usando template literals para mayor claridad)
    const contenido = this.dataInventory
      .map(item =>
        `${almacenOrigen.codigo_almacen}|${almacenDestino.codigo_almacen}|${item.cCodigoArticulo}|${item.cColor}|${item.cTalla}|${item.cCantidadSolicitada}`
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

    const archivo = new File([blob], fileName, { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('ftpDirectorio', nmCarpeta);
    formData.append('origin_serie', almacenOrigen.serie);
    formData.append('destination_serie', almacenDestino.serie);
    formData.append('origenStore', almacenOrigen.nombre || 'Origen'); // Para el cuerpo del email
    formData.append('destinoStore', almacenDestino.nombre || 'Destino');
    formData.append('email', 'andrecanalesv@gmail.com'); // El correo del solicitante

    const body={
      requestId:crypto.randomUUID(),
      origin_serie:almacenOrigen.serie,destination_serie:almacenDestino.serie,
      unid_service:this.selectedUnidServicio,store_origin:almacenOrigen.nombre,store_destination:almacenDestino.nombre,
      code_warehouse_origin:almacenOrigen.codigo_almacen,code_warehouse_destination:almacenDestino.codigo_almacen,
      datetime:this.obtenerFechaMysql(),details:this.dataInventory.map(dt=>({barcode:dt.cCodigoBarra,
        article_code:dt.cCodigoArticulo,description:dt.cDescripcion,size:dt.cTalla,color:dt.cColor,
        stock:dt.cStock,stock_required:dt.cCantidadSolicitada}))
    };
    this.sending=true;
    this.viewSubscriptions.add(this.storeService.postTraspasos(formData).pipe(
      tap(()=>this.pendingRegistration=body),switchMap(()=>this.storeService.postInsertTraspasos(body)),
      finalize(()=>this.sending=false)
    ).subscribe({next:()=>this.transferSaved(),error:()=>this.transferFailed()}));
  }
  private persistTransfer(){
    this.sending=true;
    this.viewSubscriptions.add(this.storeService.postInsertTraspasos(this.pendingRegistration).pipe(
      finalize(()=>this.sending=false)
    ).subscribe({next:()=>this.transferSaved(),error:()=>this.transferFailed()}));
  }
  private transferSaved(){
    this.pendingRegistration=null;this.dataInventory=[];this.dataExcelImport=[];
    this.messageNotification='Traspaso enviado y registrado correctamente.';this.abrirNotificacion('success');
  }
  private transferFailed(){
    this.messageNotification=this.pendingRegistration?'El archivo ya se envio. Vuelve a pulsar Generar para reintentar solo su registro.':'No se confirmo el envio del traspaso. Revisa el estado antes de reenviar.';
    this.abrirNotificacion('danger');
  }

  onChangeInput(ev: any, property?: string) {
    const value = ev.target.value;

    if (property === 'searchCantidad') {
      this.searchCantidad = Number(value);
    }

    if (property === 'searchCodigoBarra') {
      this.searchCodigoBarra = String(value).trim();
    }

    if (this.searchCodigoBarra.length >= 12) {

      if (this.searchCantidad <= 0) {
        this.messageNotification = `Ingrese la cantidad a solicitar.`;
        this.abrirNotificacion('danger');
        return;
      }

      if (this.selectedUnidServicio === '' || this.storesSelectedOrigen.length === 0 || this.storesSelectedDestino.length === 0) {
        this.messageNotification = 'Seleccione Unidad de Servicio, Tienda Origen y Tienda Destino.';
        this.abrirNotificacion('danger');
        return;
      }

      let dataSearch = {
        codigo_barra: String(this.searchCodigoBarra ?? '').trim(),
        cantidad_solicitada: this.searchCantidad
      };

      this.dataExcelImport.push(dataSearch);

      const body = {
        "serieStore": this.storesSelectedOrigen[0].serie,
        "socketId": this.socketInventoryService.socketID,
        "dataCode": this.dataExcelImport
      }

      this.viewSubscriptions.add(this.storeService.postOneInventoryStore(body).subscribe((data: any) => {
        console.log(data);
      }));
    }
  }

  obtenerFechaMysql(): string {
    const ahora = new Date();

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
    const dia = String(ahora.getDate()).padStart(2, '0');

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${dia}-${mes}-${año} ${horas}:${minutos}:${segundos}`;
  }

  onVerificarTipoTienda(): string {
    let tipoTienda = "";

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VS';
    }

    if ((this.unsOrigen == 'VSBA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VS';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSBA')) {
      tipoTienda = 'VS';
    }

    if ((this.unsOrigen == 'VSFA' && this.unsDestino == 'VSFA')) {
      tipoTienda = 'VS';
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

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
