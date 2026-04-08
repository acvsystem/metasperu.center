import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { SocketAccountingService } from '@metasperu/services/socketAccounting';
import { StoreService } from '@metasperu/services/store.service';
export type NotificationType = 'success' | 'warning' | 'danger';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import moment from 'moment';
@Component({
  selector: 'mt-kardex',
  standalone: false,
  templateUrl: './mt-kardex.html',
  styleUrl: './mt-kardex.scss',
})
export class MtKardex {
  @Input() cboStore: Array<any> = [];

  codeStore: string = "";
  v_num_albaran: string = "";
  v_num_serie: string = "";
  v_n: string = "";
  v_numero_despacho: string = "";
  v_tasa_cambio: string = "";
  v_total_gastos: string = "";
  v_flete_acarreo: string = "";
  v_registro_sanitario: string = "";
  v_motivo: string = "";
  v_tipo_documento: string = "";
  v_numero_serie: string = "";
  v_observacion: string = "";
  v_contenedor: string = "";

  storesSelected: Array<any> = [];
  dateCalendar: Array<any> = [];
  dataAlbaran: Array<any> = [];
  bodyRegisterCpl: any = {};
  albSelectionated: any = {};
  activeLink: string | null = null;
  dialog = inject(MatDialog);
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  isNotification: boolean = false;
  cboMotivoList: Array<any> = [
    { key: '02-COMPRA', value: '02-COMPRA' },
    { key: '06-DEVOLUCIÓN', value: '06-DEVOLUCIÓN' },
    { key: '09-DONACIÓN', value: '09-DONACIÓN' },
    { key: '11-SALIDA TRASP', value: '11-SALIDA TRASP' },
    { key: '12-RETIRO', value: '12-RETIRO' },
    { key: '13-MERMAS', value: '13-MERMAS' },
    { key: '15-DESTRUCCIÓN', value: '15-DESTRUCCIÓN' },
    { key: '18-IMPORTACIÓN', value: '18-IMPORTACIÓN' },
    { key: '21-ENTRADA TRASP', value: '21-ENTRADA TRASP' },
    { key: '99-OTROS', value: '99-OTROS' }
  ];
  cboTipoDocList: Array<any> = [
    { key: '11 Registro civil', value: '11 Registro civil' },
    { key: '12 Tarjeta de identidad', value: '12 Tarjeta de identidad' },
    { key: '13 Cédula de ciudadanía', value: '13 Cédula de ciudadanía' },
    { key: '21 Tarjeta de extranjería', value: '21 Tarjeta de extranjería' },
    { key: '22 Cédula de extrajería', value: '22 Cédula de extrajería' },
    { key: '31 NIT', value: '31 NIT' },
    { key: '41 Pasaporte', value: '41 Pasaporte' },
    { key: '42 Documento de identificación extranjero', value: '42 Documento de identificación extranjero' },
    { key: '00-OTROS', value: '00-OTROS' },
    { key: '01-FACTURA', value: '01-FACTURA' },
    { key: '07-NOTA DE CREDITO', value: '07-NOTA DE CREDITO' },
    { key: '09-GUIA DE REMISION-REMITENTE', value: '09-GUIA DE REMISION-REMITENTE' },
    { key: '31-GUIA DE RENISION-TRANSPORTISTA', value: '31-GUIA DE RENISION-TRANSPORTISTA' },
    { key: '50-DECLARACIÓN UNICA DE ADUANA DUA/DAM', value: '50-DECLARACIÓN UNICA DE ADUANA DUA/DAM' }
  ];

  constructor(private accService: SocketAccountingService, private storeService: StoreService) {

  }

  ngOnInit() {
    this.accService.onUpdateKardex((data: any) => {
      this.bodyRegisterCpl = {};
      this.dataAlbaran = data;

      if (!data.length) {
        this.messageNotification = 'No hay ningun registro.';
        this.abrirNotificacion('danger');
      }
    });

    this.accService.onReponseCamposLibres((data: any) => {
      const indexAlb = this.dataAlbaran.findIndex((alb) => alb.cmpNumero == this.albSelectionated.cmpNumero);

      this.dataAlbaran[indexAlb]['clMotivo'] = this.bodyRegisterCpl.body.motivo;
      this.dataAlbaran[indexAlb]['clContenedor'] = this.bodyRegisterCpl.body.contenedor;
      this.dataAlbaran[indexAlb]['clDespacho'] = this.bodyRegisterCpl.body.numero_despacho;
      this.dataAlbaran[indexAlb]['clFleteAcarreo'] = this.bodyRegisterCpl.body.flete_acarreo;
      this.dataAlbaran[indexAlb]['clNSerieDocuento'] = this.bodyRegisterCpl.body.numero_serie;
      this.dataAlbaran[indexAlb]['clObservacion'] = this.bodyRegisterCpl.body.observacion;
      this.dataAlbaran[indexAlb]['clRegistroSanitario'] = this.bodyRegisterCpl.body.registro_sanitario;
      this.dataAlbaran[indexAlb]['clTasaCambio'] = this.bodyRegisterCpl.body.tasa_cambio;
      this.dataAlbaran[indexAlb]['clTipoDocumento'] = this.bodyRegisterCpl.body.tipo_documento;
      this.dataAlbaran[indexAlb]['clTotalGasto'] = this.bodyRegisterCpl.body.total_gastos;

      this.messageNotification = data.message;
      this.abrirNotificacion('success');
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cboStore'] && changes['cboStore'].currentValue) {
      this.cboStore = changes['cboStore'].currentValue;
    }
  }

  onChangeSelect(item: any, property?: string) {
    if (property != 'v_motivo' && property != 'v_tipo_documento') {
      this.storesSelected = [];
      this.storesSelected = [{ serie: item.key, nombre: item.value }];
    }

    if (property == 'v_motivo') {
      this.v_motivo = item.value;
    }

    if (property == 'v_tipo_documento') {
      this.v_tipo_documento = item.value;
    }

  }

  onCalendar(event: any): void {

    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.dateCalendar = value;
  }

  onSearchKardex() {
    if (this.storesSelected.length == 0) {
      this.messageNotification = 'Seleccione una tienda.';
      this.abrirNotificacion('danger');
    } else if (this.dateCalendar.length == 0) {
      this.messageNotification = 'Seleccione un rango de fechas.';
      this.abrirNotificacion('danger');
    } else {
      const body = {
        serieStore: this.storesSelected[0].serie,
        socket: this.accService.socketID,
        init: this.dateCalendar[0],
        end: this.dateCalendar[1]
      };
      this.storeService.postKardex(body).subscribe((data: any) => {
        //console.log(data);
      });
    }
  }

  onSelectAlbaran(item: any) {
    let startDayLetter = moment((item || {}).cmpFechaAlbaran).format('YYYY-MM-DD');
    const fecha = startDayLetter;
    const hora = moment((item || {}).cmpFechaAlbaran).format('hh:mm:ss');

    this.albSelectionated = item;
    this.albSelectionated['cmpFecha'] = fecha;
    this.albSelectionated['cmpHora'] = hora;

    this.v_numero_despacho = item.clDespacho;
    this.v_tasa_cambio = item.clTasaCambio;
    this.v_total_gastos = item.clTotalGastos;
    this.v_flete_acarreo = item.clFleteAcarreo;
    this.v_registro_sanitario = item.clRegistroSanitario;
    this.v_numero_serie = item.cmpSerie;
    this.v_observacion = item.clObservacion;
    this.v_contenedor = item.clContenedor;

    this.v_motivo = item.clMotivo;
    this.v_tipo_documento = item.clTipoDocumento;

  }

  onChangeInput(ev: any, property: string) {
    const value = ev.target.value;
    const key = property as keyof MtKardex;

    // Convertimos 'this' a any para permitir la asignación dinámica
    (this as any)[key] = value;
  }

  onSaveCamposLibres() {

    if (Object.keys(this.albSelectionated).length) {
      const body = {
        "serieStore": this.storesSelected[0].serie,
        "socketId": this.accService.socketID,
        "body": {
          "code": this.storesSelected[0].serie,
          "num_albaran": this.albSelectionated.cmpNumero,
          "num_serie": this.albSelectionated.cmpSerie,
          "n": this.albSelectionated.cmpN,
          "numero_despacho": this.v_numero_despacho,
          "tasa_cambio": this.v_tasa_cambio,
          "total_gastos": this.v_total_gastos,
          "flete_acarreo": this.v_flete_acarreo,
          "registro_sanitario": this.v_registro_sanitario,
          "motivo": this.v_motivo,
          "tipo_documento": this.v_tipo_documento,
          "numero_serie": this.v_numero_serie,
          "observacion": this.v_observacion,
          "contenedor": this.v_contenedor
        }
      }

      this.bodyRegisterCpl = body;
      this.storeService.postKardexCamposLibres(body).subscribe((data: any) => {
       // console.log(data);
      });
    } else {
      this.messageNotification = 'Seleccione un albaran.';
      this.abrirNotificacion('danger');
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


}
