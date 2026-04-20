import { Component, OnInit } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'mt-rw-papeleta',
  standalone: false,
  templateUrl: './mt-rw-papeleta.html',
  styleUrl: './mt-rw-papeleta.scss',
  providers: [provideMomentDateAdapter()],
})
export class MtRwPapeleta implements OnInit {

  // Listas de configuración para los selectores
  listaEmpleados: any[] = [];
  listaReportes: any[] = [
    { key: 'compensacion', value: 'Compensación de horas trabajadas' },
    { key: 'permiso', value: 'Permiso particular' },
    { key: 'comision', value: 'Comisión de servicio' }
  ];
  listaCargos: string[] = ['Gerentes', 'Cajeros', 'Asesores', 'Almaceneros', 'Asesores PartTime'];

  // Variables vinculadas al formulario (ngModel)
  empleadoSeleccionado: any = null;
  tipoReporte: string = '';
  cargoSeleccionado: string = '';
  fechaSalida: string = '';
  fechaIngreso: string = '';
  horaSalida: string = '';
  horaRetorno: string = '';
  horasSolicitadas: string = '00:00';

  // Datos de la tabla de horas extras
  horasExtras: any[] = [];
  acumuladoTotalCorrecto: string = '00:00';

  constructor(
    private storeService: StoreService,
    private socketService: SocketResourcesHumanService
  ) { }

  ngOnInit() {
    this.cargarEmpleados();
  }

  /**
   * Obtiene la lista de empleados a través del socket
   */
  cargarEmpleados() {
    this.socketService.onRefreshEmployesEJB((data: any[]) => {
      if (data) {
        this.listaEmpleados = data;
      }
    });
    // Dispara la carga si el servicio lo requiere
    this.storeService.callRegisterEmployes().subscribe();
  }

  /**
   * Se ejecuta al cambiar el tipo de reporte. 
   * Carga el array de horas extras si es compensación.
   */
  onTipoReporteChange() {
    if (this.tipoReporte === 'compensacion') {
      this.horasExtras = [
        { "documento": "48904033", "codigo_papeleta": "P7A343", "hr_trabajadas": "8:31", "fecha": "2026-02-11", "hrx_acumulado": "00:31", "extra": "00:31", "estado": "utilizado", "aprobado": true, "seleccionado": false },
        { "documento": "48904033", "codigo_papeleta": "P7A343", "hr_trabajadas": "10:32", "fecha": "2026-02-20", "hrx_acumulado": "02:32", "extra": "02:32", "estado": "utilizado", "aprobado": true, "seleccionado": false },
        { "documento": "48904033", "codigo_papeleta": "P7A343", "hr_trabajadas": "9:34", "fecha": "2026-02-22", "hrx_acumulado": "01:34", "extra": "01:34", "estado": "utilizado", "aprobado": true, "seleccionado": false },
        { "documento": "48904033", "codigo_papeleta": "P7A343", "hr_trabajadas": "8:50", "fecha": "2026-03-15", "hrx_acumulado": "00:50", "extra": "00:50", "estado": "utilizado", "aprobado": true, "seleccionado": false },
        { "documento": "48904033", "codigo_papeleta": "P7A343", "hr_trabajadas": "8:31", "fecha": "2026-03-27", "hrx_acumulado": "00:31", "extra": "00:31", "estado": "correcto", "aprobado": true, "seleccionado": false }
      ];
      this.calcularSumaAcumulada();
    } else {
      this.horasExtras = [];
      this.acumuladoTotalCorrecto = '00:00';
    }
  }

  /**
   * Calcula la diferencia entre hora de salida y retorno
   */
  calcularDiferencia() {
    if (!this.horaSalida || !this.horaRetorno) {
      this.horasSolicitadas = '00:00';
      return;
    }

    const [hS, mS] = this.horaSalida.split(':').map(Number);
    const [hR, mR] = this.horaRetorno.split(':').map(Number);

    let totalMinSalida = hS * 60 + mS;
    let totalMinRetorno = hR * 60 + mR;

    // Si la hora de retorno es menor a la de salida, asumimos que regresó al día siguiente
    if (totalMinRetorno < totalMinSalida) {
      totalMinRetorno += 1440; // 24 horas en minutos
    }

    const diferencia = totalMinRetorno - totalMinSalida;
    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;

    this.horasSolicitadas = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  /**
   * Suma hrx_acumulado solo para los items con estado "correcto"
   */
  calcularSumaAcumulada() {
    let totalMins = 0;
    this.horasExtras.forEach(item => {
      if (item.estado === 'correcto') {
        const [h, m] = item.hrx_acumulado.split(':').map(Number);
        totalMins += (h * 60) + m;
      }
    });

    const hours = Math.floor(totalMins / 60);
    const minutes = totalMins % 60;
    this.acumuladoTotalCorrecto = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  solicitarAprobacion(item: any) {
    console.log('Enviando solicitud de aprobación para:', item.codigo_papeleta);
    // Aquí implementarías la llamada al servicio de API correspondiente
  }

}
