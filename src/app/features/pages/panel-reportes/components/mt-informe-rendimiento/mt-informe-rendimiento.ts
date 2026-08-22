import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SocketService } from '@metasperu/services/socket.service';
import { StoreService } from '@metasperu/services/store.service';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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

interface Tienda {
  id: number;
  serie: string;
  nombre: string;
  marca: string;
  tipo_tienda: string;
  estado: string;
}

@Component({
  selector: 'mt-informe-rendimiento',
  standalone: false,
  templateUrl: './mt-informe-rendimiento.html',
  styleUrl: './mt-informe-rendimiento.scss',
})
export class MtInformeRendimiento implements OnInit, OnDestroy {

  @Input() tiendas: Tienda[] = [];

  reportes: { [serie: string]: DepartamentoVenta[] } = {};
  seriesRecibidas: string[] = [];
  seriesFiltradas: string[] = [];

  mostrarBotonArriba = false;
  loading = false;

  fechaDesde: string = new Date().toISOString().substring(0, 10);
  fechaHasta: string = new Date().toISOString().substring(0, 10);

  // Filtros
  filtroTexto = '';
  filtroMarca = '';
  filtroSerie = '';
  marcasDisponibles: string[] = [];

  // Charts
  private chartVentas: Chart | null = null;
  private chartStock: Chart | null = null;

  constructor(
    private socketService: SocketService,
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    this.escucharRespuestas();
    this.iniciarScrollListener();
    this.extraerMarcas();
  }

  ngOnDestroy(): void {
    const container = document.querySelector('.reporte-container');
    if (container) {
      container.removeEventListener('scroll', this.onScroll);
    }
    if (this.chartVentas) this.chartVentas.destroy();
    if (this.chartStock) this.chartStock.destroy();
  }

  // ===================== TIENDAS =====================
  extraerMarcas(): void {
    const marcas = this.tiendas.map(t => t.marca).filter(Boolean);
    this.marcasDisponibles = [...new Set(marcas)].sort();
  }

  getNombreTienda(serie: string): string {
    const tienda = this.tiendas.find(t => t.serie === serie);
    return tienda ? tienda.nombre : serie;
  }

  getMarcaTienda(serie: string): string {
    const tienda = this.tiendas.find(t => t.serie === serie);
    return tienda ? tienda.marca : '';
  }

  // ===================== FILTROS =====================
  aplicarFiltros(): void {
    const texto = (this.filtroTexto || '').toLowerCase().trim();
    const marcaFiltro = (this.filtroMarca || '').toLowerCase().trim();
    const serieFiltro = (this.filtroSerie || '').trim();

    this.seriesFiltradas = this.seriesRecibidas.filter(serie => {
      const nombre = this.getNombreTienda(serie).toLowerCase();
      const marca = this.getMarcaTienda(serie).toLowerCase();

      if (texto && !nombre.includes(texto) && !serie.toLowerCase().includes(texto)) {
        return false;
      }
      if (marcaFiltro && marca !== marcaFiltro) {
        return false;
      }
      if (serieFiltro && serie !== serieFiltro) {
        return false;
      }
      return true;
    });

    if (this.seriesFiltradas.length > 0) {
      this.generarGraficos();
    }
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroMarca = '';
    this.filtroSerie = '';
    this.aplicarFiltros();
  }

  // ===================== GRÁFICOS =====================
  generarGraficos(): void {
    setTimeout(() => {
      this.crearGraficoVentas();
      this.crearGraficoStock();
    }, 150);
  }

  crearGraficoVentas(): void {
    const canvas = document.getElementById('chartVentas') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartVentas) {
      this.chartVentas.destroy();
    }

    const labels: string[] = [];
    const dataSoles: number[] = [];
    const dataDolares: number[] = [];

    this.seriesFiltradas.forEach(serie => {
      const total = this.reportes[serie]?.find(r => r.NombreDepartamento === 'TOTAL GENERAL');
      if (total) {
        labels.push(this.getNombreTienda(serie));
        dataSoles.push(total.VentaSoles || 0);
        dataDolares.push(total.VentaDolares || 0);
      }
    });

    this.chartVentas = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Venta Soles (S/)',
            data: dataSoles,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Venta Dólares ($)',
            data: dataDolares,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Ventas por Tienda',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => Number(value).toLocaleString('es-PE')
            }
          }
        }
      }
    });
  }

  crearGraficoStock(): void {
    const canvas = document.getElementById('chartStock') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartStock) {
      this.chartStock.destroy();
    }

    const labels: string[] = [];
    const dataStock: number[] = [];
    const colores: string[] = [];

    const palette = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
      '#14b8a6', '#e11d48', '#a855f7', '#0ea5e9', '#22c55e',
      '#eab308', '#d946ef', '#64748b', '#0d9488', '#dc2626',
      '#7c3aed'
    ];

    this.seriesFiltradas.forEach((serie, i) => {
      const total = this.reportes[serie]?.find(r => r.NombreDepartamento === 'TOTAL GENERAL');
      if (total) {
        labels.push(this.getNombreTienda(serie));
        dataStock.push(total.Stock || 0);
        colores.push(palette[i % palette.length]);
      }
    });

    this.chartStock = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Stock',
          data: dataStock,
          backgroundColor: colores,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { size: 11 }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Stock por Tienda',
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    });
  }

  // ===================== EXPORTAR EXCEL =====================
  exportarExcel(): void {
    if (this.tiendas.length === 0) {
      alert('No hay tiendas para exportar');
      return;
    }

    const wb = XLSX.utils.book_new();

    // ===== Determinar TYPE según nombre/tipo =====
    const getType = (tienda: Tienda): string => {
      const nombre = (tienda.nombre || '').toUpperCase();
      if (nombre.includes('ECOMMERCE') || nombre.includes('E-COMMERCE')) {
        return 'ECOMMERCE';
      }
      if (nombre.includes('MINKA')) {
        return 'OUTLET';
      }
      return 'RETAIL';
    };

    // ===== Datos en el orden de la lista de tiendas =====
    const rows: any[] = [];

    this.tiendas.forEach((tienda, index) => {
      const data = this.reportes[tienda.serie] || [];
      const total = data.find(r => r.NombreDepartamento === 'TOTAL GENERAL');

      rows.push({
        'ORDEN DE TIENDA': index + 1,
        'BRAND': tienda.marca || '',
        'NAME': tienda.nombre || '',
        'TYPE': getType(tienda),
        'DAILY SALES S/': total ? total.VentaSoles : '',
        'DAILY SALES $': total ? total.VentaDolares : '',
        'DAILY UNITS': total ? total.CantidadVendida : '',
        'STOCK': total ? total.Stock : ''
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Anchos de columna
    ws['!cols'] = [
      { wch: 16 },  // ORDEN DE TIENDA
      { wch: 12 },  // BRAND
      { wch: 28 },  // NAME
      { wch: 12 },  // TYPE
      { wch: 16 },  // DAILY SALES S/
      { wch: 16 },  // DAILY SALES $
      { wch: 14 },  // DAILY UNITS
      { wch: 12 }   // STOCK
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = `Informe_Rendimiento_${this.fechaDesde}_${this.fechaHasta}`;
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ===================== SOCKET =====================
  escucharRespuestas(): void {
    this.socketService.onInformeRendimiento((data: RespuestaTienda) => {
      if (data.error) {
        console.error(`Error en tienda ${data.serie}:`, data.error);
        return;
      }

      this.reportes[data.serie] = data.data || [];

      if (!this.seriesRecibidas.includes(data.serie)) {
        this.seriesRecibidas = [...this.seriesRecibidas, data.serie].sort();
      }

      this.aplicarFiltros();

      if (this.seriesRecibidas.length >= this.tiendas.length) {
        this.loading = false;
        this.generarGraficos();
      }
    });
  }

  // ===================== HTTP =====================
  solicitarReporte(): void {
    this.loading = true;
    this.reportes = {};
    this.seriesRecibidas = [];
    this.seriesFiltradas = [];
    this.limpiarFiltros();

    if (this.chartVentas) {
      this.chartVentas.destroy();
      this.chartVentas = null;
    }
    if (this.chartStock) {
      this.chartStock.destroy();
      this.chartStock = null;
    }

    const queryParams = {
      socket_id: this.socketService.socketID,
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta
    };

    this.storeService.getInformeRendimiento(queryParams).subscribe({
      next: (res) => {
        console.log('Solicitud enviada correctamente:', res);
      },
      error: (err) => {
        console.error('Error al solicitar el informe:', err);
        this.loading = false;
      }
    });

    setTimeout(() => {
      this.loading = false;
    }, 25000);
  }

  // ===================== SCROLL =====================
  iniciarScrollListener(): void {
    setTimeout(() => {
      const container = document.querySelector('.reporte-container');
      if (container) {
        container.addEventListener('scroll', this.onScroll);
      }
    }, 300);
  }

  onScroll = (): void => {
    const container = document.querySelector('.reporte-container') as HTMLElement;
    if (container) {
      this.mostrarBotonArriba = container.scrollTop > 300;
    }
  };

  irArriba(): void {
    const container = document.querySelector('.reporte-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // ===== PENDIENTES =====
  mostrarPopupPendientes = false;

  get tiendasPendientes(): Tienda[] {
    return this.tiendas.filter(t => !this.seriesRecibidas.includes(t.serie));
  }

  abrirPendientes(): void {
    if (this.tiendasPendientes.length > 0) {
      this.mostrarPopupPendientes = true;
    }
  }

  cerrarPendientes(): void {
    this.mostrarPopupPendientes = false;
  }
}