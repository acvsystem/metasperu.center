import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '@metasperu/services/socket.service';
import { StoreService } from '@metasperu/services/store.service';

interface DepartamentoVenta {
  Fecha: string | null;
  CodDepartamento: number | null;
  NombreDepartamento: string;
  CantidadVendida: number;
  VentaSoles: number;
  VentaDolares: number;
  TipoCambio: number;
  Stock: number;
}

interface RespuestaTienda {
  serie: string;
  enviar_a: string;
  data: DepartamentoVenta[];
  error?: string;
}

@Component({
  selector: 'mt-informe-rendimiento',
  standalone: false,
  templateUrl: './mt-informe-rendimiento.html',
  styleUrl: './mt-informe-rendimiento.scss',
})
export class MtInformeRendimiento implements OnInit, OnDestroy {
  // Reportes por tienda (clave = serie)
  reportes: { [serie: string]: DepartamentoVenta[] } = {};
  seriesRecibidas: string[] = [];

  loading = false;
  fechaDesde: string = new Date().toISOString().substring(0, 10);
  fechaHasta: string = new Date().toISOString().substring(0, 10);

  constructor(private socketService: SocketService, private storeService: StoreService) { } // Cambia por tu SocketService real

  ngOnInit(): void {
    this.escucharRespuestas();
  }

  ngOnDestroy(): void {
    // Si tu socketService tiene método para desuscribirse, úsalo aquí
  }

  // ===================== SOCKET =====================
  escucharRespuestas(): void {
    this.socketService.onInformeRendimiento((data: RespuestaTienda) => {
      console.log('Datos recibidos del informe de rendimiento:', data);

      if (data.error) {
        console.error(`Error en tienda ${data.serie}:`, data.error);
        return;
      }

      // Guardamos el reporte de esa tienda
      this.reportes[data.serie] = data.data || [];

      // Agregamos la serie si aún no está
      if (!this.seriesRecibidas.includes(data.serie)) {
        this.seriesRecibidas.push(data.serie);
        this.seriesRecibidas.sort();
      }

      // Cuando lleguen las 21 tiendas, quitar loading
      if (this.seriesRecibidas.length >= 21) {
        this.loading = false;
      }
    });
  }

  // ===================== HELPERS =====================
  esTotal(item: DepartamentoVenta): boolean {
    return item.NombreDepartamento === 'TOTAL GENERAL';
  }

  formatNumber(value: number, decimals: number = 2): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  trackBySerie(index: number, serie: string): string {
    return serie;
  }

  solicitarReporte(): void {
    // this.loading = true;
    this.reportes = {};
    this.seriesRecibidas = [];

    // Estos parámetros se enviarán como query params:
    // /api/reports/informe-rendimiento?fecha_desde=2026-08-20&fecha_hasta=2026-08-20&cod_moneda_dolar=1
    const queryParams = {
      socket_id: this.socketService.socketID,
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta
    };

    this.storeService.getInformeRendimiento(queryParams).subscribe({
      next: (res) => {
        console.log('Solicitud enviada correctamente:', res);
        // Las respuestas de las 21 tiendas llegan por socket
      },
      error: (err) => {
        console.error('Error al solicitar el informe:', err);
        this.loading = false;
      }
    });

  }

}
