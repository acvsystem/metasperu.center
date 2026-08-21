import { Component, OnInit, inject } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';

interface ApiLogRow {
  id: number;
  created_at: string;
  service_name: string;
  method: string;
  original_url: string;
  route_path?: string;
  status_code?: number;
  success: number | boolean;
  duration_ms?: number;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  ip?: string;
  user_agent?: string;
  error_message?: string;
}

@Component({
  selector: 'app-api-logs',
  standalone: false,
  templateUrl: './api-logs.html',
  styleUrl: './api-logs.scss'
})
export class ApiLogs implements OnInit {
  private storeService = inject(StoreService);

  readonly services = [
    'auth-service',
    'center-service',
    'inventory-service',
    'center-inventory-service',
    'center-resources-human-service',
    'center-accounting-service'
  ];
  readonly methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  readonly displayedColumns = [
    'created_at',
    'service_name',
    'method',
    'original_url',
    'status_code',
    'duration_ms',
    'user_name',
    'actions'
  ];

  filters: any = {
    page: 1,
    limit: 50,
    service: '',
    method: '',
    status: '',
    success: '',
    usuario: '',
    q: '',
    desde: '',
    hasta: ''
  };

  logs: ApiLogRow[] = [];
  selectedLog: any = null;
  total = 0;
  isLoading = false;
  isLoadingDetail = false;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page = this.filters.page): void {
    this.filters.page = page;
    this.isLoading = true;

    this.storeService.getApiLogs(this.filters).subscribe({
      next: (response) => {
        this.logs = response?.rows || [];
        this.total = response?.total || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notifyError(err?.message || 'No se pudieron cargar los logs de API');
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 50,
      service: '',
      method: '',
      status: '',
      success: '',
      usuario: '',
      q: '',
      desde: '',
      hasta: ''
    };
    this.selectedLog = null;
    this.loadLogs(1);
  }

  viewDetail(row: ApiLogRow): void {
    this.isLoadingDetail = true;
    this.storeService.getApiLog(row.id).subscribe({
      next: (log) => {
        this.selectedLog = log;
        this.isLoadingDetail = false;
      },
      error: (err) => {
        this.isLoadingDetail = false;
        this.notifyError(err?.message || 'No se pudo cargar el detalle del log');
      }
    });
  }

  previousPage(): void {
    if (this.filters.page <= 1 || this.isLoading) return;
    this.loadLogs(this.filters.page - 1);
  }

  nextPage(): void {
    if (!this.hasNextPage || this.isLoading) return;
    this.loadLogs(this.filters.page + 1);
  }

  get hasNextPage(): boolean {
    return this.filters.page * this.filters.limit < this.total;
  }

  get pageSummary(): string {
    if (!this.total) return '0 registros';
    const start = ((this.filters.page - 1) * this.filters.limit) + 1;
    const end = Math.min(this.filters.page * this.filters.limit, this.total);
    return `${start}-${end} de ${this.total}`;
  }

  formatJson(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'string') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (error) {
        return value;
      }
    }

    return JSON.stringify(value, null, 2);
  }

  private notifyError(message: string): void {
    this.storeService.onNotification.emit([{
      isSuccess: false,
      isError: true,
      bodyNotification: message
    }]);
  }
}
