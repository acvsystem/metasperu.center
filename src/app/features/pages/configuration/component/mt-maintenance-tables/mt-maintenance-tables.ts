import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { StoreService } from '@metasperu/services/store.service';
import { MdlMaintenanceRecord } from './component/mdl-maintenance-record/mdl-maintenance-record';

export type MaintenanceFieldType = 'text' | 'number' | 'textarea' | 'checkbox';

export interface MaintenanceField {
  key: string;
  label: string;
  type: MaintenanceFieldType;
  required?: boolean;
}

export interface MaintenanceResource {
  key: string;
  title: string;
  description: string;
  primaryKey: string;
  displayColumns: string[];
  filters: string[];
  fields: MaintenanceField[];
}

@Component({
  selector: 'mt-maintenance-tables',
  standalone: false,
  templateUrl: './mt-maintenance-tables.html',
  styleUrl: './mt-maintenance-tables.scss',
})
export class MtMaintenanceTables implements OnInit {
  resources: MaintenanceResource[] = [
    {
      key: 'head-papeleta',
      title: 'Cabecera papeleta',
      description: 'Registros principales de papeletas',
      primaryKey: 'ID_HEAD_PAPELETA',
      displayColumns: ['ID_HEAD_PAPELETA', 'CODIGO_PAPELETA', 'NOMBRE_COMPLETO', 'NRO_DOCUMENTO_EMPLEADO', 'CODIGO_TIENDA', 'FECHA_DESDE', 'HORA_SOLICITADA', 'ESTADO_PAPELETA'],
      filters: ['CODIGO_PAPELETA', 'NOMBRE_COMPLETO', 'NRO_DOCUMENTO_EMPLEADO', 'CODIGO_TIENDA', 'ESTADO_PAPELETA'],
      fields: [
        { key: 'CODIGO_PAPELETA', label: 'Codigo papeleta', type: 'text', required: true },
        { key: 'NOMBRE_COMPLETO', label: 'Nombre completo', type: 'text', required: true },
        { key: 'NRO_DOCUMENTO_EMPLEADO', label: 'Documento empleado', type: 'text', required: true },
        { key: 'ID_PAP_TIPO_PAPELETA', label: 'Tipo papeleta', type: 'number', required: true },
        { key: 'CARGO_EMPLEADO', label: 'Cargo empleado', type: 'text' },
        { key: 'FECHA_DESDE', label: 'Fecha desde', type: 'text' },
        { key: 'FECHA_HASTA', label: 'Fecha hasta', type: 'text' },
        { key: 'HORA_SALIDA', label: 'Hora salida', type: 'text' },
        { key: 'HORA_LLEGADA', label: 'Hora llegada', type: 'text' },
        { key: 'HORA_ACUMULADA', label: 'Hora acumulada', type: 'text' },
        { key: 'HORA_SOLICITADA', label: 'Hora solicitada', type: 'text' },
        { key: 'CODIGO_TIENDA', label: 'Codigo tienda', type: 'text' },
        { key: 'FECHA_CREACION', label: 'Fecha creacion', type: 'text' },
        { key: 'DESCRIPCION', label: 'Descripcion', type: 'textarea' },
        { key: 'ESTADO_PAPELETA', label: 'Estado papeleta', type: 'text' },
        { key: 'ISUPDATE', label: 'Actualizado', type: 'checkbox' },
        { key: 'ISBLOCKED', label: 'Bloqueado', type: 'checkbox' }
      ]
    },
    {
      key: 'detalle-papeleta',
      title: 'Detalle papeleta',
      description: 'Detalle de horas asociadas a papeletas',
      primaryKey: 'ID_DETALLE_PAPELETA',
      displayColumns: ['ID_DETALLE_PAPELETA', 'DET_ID_HEAD_PAPELETA', 'DET_ID_HR_EXTRA', 'HR_EXTRA_ACUMULADO', 'HR_EXTRA_SOLICITADO', 'HR_EXTRA_SOBRANTE', 'ESTADO', 'FECHA'],
      filters: ['DET_ID_HEAD_PAPELETA', 'DET_ID_HR_EXTRA', 'ESTADO', 'FECHA'],
      fields: [
        { key: 'DET_ID_HEAD_PAPELETA', label: 'ID cabecera papeleta', type: 'number', required: true },
        { key: 'DET_ID_HR_EXTRA', label: 'ID hora extra', type: 'number' },
        { key: 'HR_EXTRA_ACUMULADO', label: 'HR acumulado', type: 'text' },
        { key: 'HR_EXTRA_SOLICITADO', label: 'HR solicitado', type: 'text' },
        { key: 'HR_EXTRA_SOBRANTE', label: 'HR sobrante', type: 'text' },
        { key: 'ESTADO', label: 'Estado', type: 'text' },
        { key: 'APROBADO', label: 'Aprobado', type: 'checkbox' },
        { key: 'SELECCIONADO', label: 'Seleccionado', type: 'checkbox' },
        { key: 'FECHA', label: 'Fecha', type: 'text' },
        { key: 'FECHA_MODIFICACION', label: 'Fecha modificacion', type: 'text' }
      ]
    },
    {
      key: 'hora-extra-empleado',
      title: 'Hora extra empleado',
      description: 'Bolsa y estado de horas extra por empleado',
      primaryKey: 'ID_HR_EXTRA',
      displayColumns: ['ID_HR_EXTRA', 'NRO_DOCUMENTO_EMPLEADO', 'HR_EXTRA_ACUMULADO', 'HR_EXTRA_SOLICITADO', 'HR_EXTRA_SOBRANTE', 'ESTADO', 'APROBADO', 'FECHA'],
      filters: ['NRO_DOCUMENTO_EMPLEADO', 'ESTADO', 'FECHA'],
      fields: [
        { key: 'NRO_DOCUMENTO_EMPLEADO', label: 'Documento empleado', type: 'text', required: true },
        { key: 'HR_EXTRA_ACUMULADO', label: 'HR acumulado', type: 'text' },
        { key: 'HR_EXTRA_SOLICITADO', label: 'HR solicitado', type: 'text' },
        { key: 'HR_EXTRA_SOBRANTE', label: 'HR sobrante', type: 'text' },
        { key: 'ESTADO', label: 'Estado', type: 'text' },
        { key: 'APROBADO', label: 'Aprobado', type: 'checkbox' },
        { key: 'SELECCIONADO', label: 'Seleccionado', type: 'checkbox' },
        { key: 'FECHA', label: 'Fecha', type: 'text' },
        { key: 'FECHA_MODIFICACION', label: 'Fecha modificacion', type: 'text' },
        { key: 'ISUPDATE', label: 'Actualizado', type: 'checkbox' },
        { key: 'OBSERVACION', label: 'Observacion', type: 'textarea' },
        { key: 'ISAPROBACION', label: 'Es aprobacion', type: 'checkbox' }
      ]
    },
    {
      key: 'horario-property',
      title: 'Horario tienda',
      description: 'Cabecera de horarios configurados por tienda, cargo y rango de dias',
      primaryKey: 'ID_HORARIO',
      displayColumns: ['ID_HORARIO', 'FECHA', 'RANGO_DIAS', 'CARGO', 'CODIGO_TIENDA', 'DATETIME', 'ESTADO'],
      filters: ['FECHA', 'RANGO_DIAS', 'CARGO', 'CODIGO_TIENDA', 'ESTADO'],
      fields: [
        { key: 'FECHA', label: 'Fecha', type: 'text', required: true },
        { key: 'RANGO_DIAS', label: 'Rango dias', type: 'text', required: true },
        { key: 'CARGO', label: 'Cargo', type: 'text', required: true },
        { key: 'CODIGO_TIENDA', label: 'Codigo tienda', type: 'text', required: true },
        { key: 'DATETIME', label: 'Datetime', type: 'text' },
        { key: 'ESTADO', label: 'Estado', type: 'text' }
      ]
    },
    {
      key: 'dias-trabajo',
      title: 'Dias trabajo',
      description: 'Dias laborales asignados a empleados dentro de un horario',
      primaryKey: 'ID_DIA_TRB',
      displayColumns: ['ID_DIA_TRB', 'CODIGO_TIENDA', 'NUMERO_DOCUMENTO', 'NOMBRE_COMPLETO', 'ID_TRB_RANGO_HORA', 'ID_TRB_DIAS', 'ID_TRB_HORARIO'],
      filters: ['CODIGO_TIENDA', 'NUMERO_DOCUMENTO', 'NOMBRE_COMPLETO', 'ID_TRB_HORARIO'],
      fields: [
        { key: 'CODIGO_TIENDA', label: 'Codigo tienda', type: 'text', required: true },
        { key: 'NUMERO_DOCUMENTO', label: 'Numero documento', type: 'text', required: true },
        { key: 'NOMBRE_COMPLETO', label: 'Nombre completo', type: 'text', required: true },
        { key: 'ID_TRB_RANGO_HORA', label: 'ID rango hora', type: 'number', required: true },
        { key: 'ID_TRB_DIAS', label: 'ID dias', type: 'number', required: true },
        { key: 'ID_TRB_HORARIO', label: 'ID horario', type: 'number', required: true }
      ]
    },
    {
      key: 'dias-libre',
      title: 'Dias libre',
      description: 'Dias libres asignados a empleados dentro de un horario',
      primaryKey: 'ID_DIA_LBR',
      displayColumns: ['ID_DIA_LBR', 'CODIGO_TIENDA', 'NUMERO_DOCUMENTO', 'NOMBRE_COMPLETO', 'ID_TRB_RANGO_HORA', 'ID_TRB_DIAS', 'ID_TRB_HORARIO'],
      filters: ['CODIGO_TIENDA', 'NUMERO_DOCUMENTO', 'NOMBRE_COMPLETO', 'ID_TRB_HORARIO'],
      fields: [
        { key: 'CODIGO_TIENDA', label: 'Codigo tienda', type: 'text', required: true },
        { key: 'NUMERO_DOCUMENTO', label: 'Numero documento', type: 'text', required: true },
        { key: 'NOMBRE_COMPLETO', label: 'Nombre completo', type: 'text', required: true },
        { key: 'ID_TRB_RANGO_HORA', label: 'ID rango hora', type: 'number', required: true },
        { key: 'ID_TRB_DIAS', label: 'ID dias', type: 'number', required: true },
        { key: 'ID_TRB_HORARIO', label: 'ID horario', type: 'number', required: true }
      ]
    },
    {
      key: 'dias-horario',
      title: 'Dias horario',
      description: 'Dias calendario relacionados a un horario de tienda',
      primaryKey: 'ID_DIAS',
      displayColumns: ['ID_DIAS', 'DIA', 'FECHA', 'ID_DIA_HORARIO', 'POSITION', 'FECHA_NUMBER'],
      filters: ['DIA', 'FECHA', 'ID_DIA_HORARIO', 'FECHA_NUMBER'],
      fields: [
        { key: 'DIA', label: 'Dia', type: 'text', required: true },
        { key: 'FECHA', label: 'Fecha', type: 'text', required: true },
        { key: 'ID_DIA_HORARIO', label: 'ID horario', type: 'number', required: true },
        { key: 'POSITION', label: 'Posicion', type: 'number' },
        { key: 'FECHA_NUMBER', label: 'Fecha number', type: 'text' }
      ]
    }
  ];

  activeResource = this.resources[0];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  filterValues: Record<string, string> = {};
  page = 1;
  limit = 50;
  total = 0;
  loading = false;

  constructor(
    private storeService: StoreService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.configureColumns();
    this.loadData();
  }

  changeResource(resourceKey: string): void {
    const resource = this.resources.find((item) => item.key === resourceKey);
    if (!resource) return;

    //const hadActiveFilters = this.hasActiveFilters();
    this.activeResource = resource;
    this.filterValues = {};
    this.page = 1;
    this.configureColumns();

    this.loadData();
  }

  configureColumns(): void {
    this.displayedColumns = [...this.activeResource.displayColumns, 'acciones'];
  }

  loadData(): void {
    this.loading = true;
    this.storeService.getMaintenanceRecords(this.activeResource.key, {
      page: this.page,
      limit: this.limit,
      ...this.filterValues
    }).subscribe({
      next: (response: any) => {
        this.dataSource.data = response?.data || [];
        this.total = response?.pagination?.total || 0;
        this.loading = false;
      },
      error: (error: Error) => {
        this.loading = false;
        this.showMessage(error.message || 'Error al cargar registros');
      }
    });
  }

  search(): void {
    this.page = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.filterValues = {};
    this.page = 1;
    this.loadData();
  }

  openDialog(record?: any): void {
    const dialogRef = this.dialog.open(MdlMaintenanceRecord, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        resource: this.activeResource,
        record: record || null
      }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadData();
    });
  }

  delete(record: any): void {
    const id = record[this.activeResource.primaryKey];
    if (!id || !confirm('Seguro que desea eliminar este registro?')) return;

    this.storeService.deleteMaintenanceRecord(this.activeResource.key, id).subscribe({
      next: () => {
        this.showMessage('Registro eliminado correctamente');
        this.loadData();
      },
      error: (error: Error) => this.showMessage(error.message || 'Error al eliminar registro')
    });
  }

  nextPage(): void {
    if (this.page * this.limit >= this.total) return;
    this.page += 1;
    this.loadData();
  }

  previousPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.loadData();
  }

  getColumnLabel(column: string): string {
    const field = this.activeResource.fields.find((item) => item.key === column);
    return field?.label || column.replace(/_/g, ' ');
  }

  getCellValue(row: any, column: string): string {
    const value = row[column];
    if (value === null || value === undefined) return '';
    return String(value);
  }

  get fromRecord(): number {
    if (!this.total) return 0;
    return ((this.page - 1) * this.limit) + 1;
  }

  get toRecord(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  private hasActiveFilters(): boolean {
    return Object.values(this.filterValues).some((value) => String(value || '').trim() !== '');
  }
}
