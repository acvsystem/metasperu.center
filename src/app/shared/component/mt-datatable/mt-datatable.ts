import { Component, inject, EventEmitter, Input, Output, SimpleChanges, ViewChild, ChangeDetectorRef, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MtMarcacionesEmployes } from './component/mt-marcaciones-employes/mt-marcaciones-employes';

@Component({
  selector: 'mt-datatable',
  standalone: false,
  templateUrl: './mt-datatable.html',
  styleUrl: './mt-datatable.scss',
})
export class MtDatatable implements OnInit, OnChanges, AfterViewInit {
  @Input() dataIn: any[] = [];
  @Input() dataColumnsIn: columnsTable[] = [];
  @Input() extraColumns: string[] = [];
  @Output() currentDataFilter = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  dataColumns: columnsTable[] = [];
  displayedColumns: string[] = [];
  filterValues: Record<string, any> = {};
  dialog = inject(MatDialog);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    // 1. Cambio en los datos de las filas
    if (changes['dataIn'] && this.dataIn) {
      this.dataSource = new MatTableDataSource(this.dataIn);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.onParserFilterCbo();
      this.setupFilterPredicate();
    }

    // 2. Cambio en las definiciones de columnas (Aquí entra isOnline)
    if (changes['dataColumnsIn'] && this.dataColumnsIn) {
      // Usamos map para asegurar nuevas referencias y que detectChanges funcione
      this.dataColumns = [...this.dataColumnsIn];
      this.onParserFilterCbo();
    }

    // 3. Cambio en las columnas a mostrar
    if (changes['extraColumns'] && this.extraColumns) {
      this.displayedColumns = this.extraColumns;
    }

    this.cdr.detectChanges();
  }


  openDialog(data: any) {
    this.dialog.open(MtMarcacionesEmployes, {
      panelClass: 'modal-mediano',
      data: data,
    });
  }


  /**
   * Configura el predicado de filtro una sola vez para mejorar el rendimiento
   */
  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {

      // El filter ya viene como string, pero evitamos parsear si es posible
      const searchTerms = JSON.parse(filter);

      return Object.keys(searchTerms).every(columnKey => {
        const searchTerm = searchTerms[columnKey];
        if (!searchTerm || (Array.isArray(searchTerm) && searchTerm.length === 0)) return true;

        const cellValue = data[columnKey]?.toString().toLowerCase() || '';

        if (Array.isArray(searchTerm)) {
          return searchTerm.some(v => v.toString().toLowerCase() === cellValue);
        }
        return cellValue.includes(searchTerm.toString().toLowerCase());
      });
    };
  }

  /**
   * Actualización dinámica de filtros desde selects
   */
  onChangeSelect(data: any[], columnDef: string) {
    const keys = data?.map(item => item.key) || [];
    this.applyFilterTable(null, columnDef, keys);
  }

  /**
   * Aplica el filtro consolidado. 
   * Maneja tanto inputs de texto como combos multiselect.
   */
  applyFilterTable(event: any, columnDef: string, cboValue?: any[]) {

    const colIndex = this.dataColumns.findIndex(t => t.matColumnDef === columnDef);
    if (colIndex === -1) return;

    const column = this.dataColumns[colIndex];
    const rawValue = cboValue !== undefined ? cboValue : (event.target as HTMLInputElement).value;

    // Actualizamos estado visual del filtro
    column.filterActive = !!(Array.isArray(rawValue) ? rawValue.length : rawValue);

    // Guardamos el valor para el predicado
    this.filterValues[column.propertyValue] = Array.isArray(rawValue)
      ? rawValue
      : rawValue.toString().trim().toLowerCase();
    this.dataSource.filter = '';
    // Trigger de filtrado
    this.dataSource.filter = JSON.stringify(this.filterValues);
    // Notificamos al padre
    this.currentDataFilter.emit(this.dataSource.filteredData);
    this.cdr.detectChanges();
  }

  /**
   * Construye las opciones de los combos basados en la data actual
   */
  onParserFilterCbo() {
    if (!this.dataColumns || !this.dataIn) return;

    this.dataColumns.forEach((dc) => {
      if (dc.isCboFilter) {
        const uniqueValues = [...new Set(this.dataIn.map(item => item[dc.propertyValue]))];
        dc.cboFilter = uniqueValues
          .filter(v => v != null)
          .sort()
          .map(v => ({
            key: v.toString().toLowerCase(),
            value: v.toString().toLowerCase()
          }));
      }
    });
  }
}

// Interfaces mejoradas
export interface columnsTable {
  isSticky: boolean;
  matColumnDef: string;
  titleColumn: string;
  propertyValue: string;
  extraProperty?: string;
  filterActive: boolean;
  isCboFilter: boolean;
  cboFilter: cbo[];
  isOnline?: boolean;
}

export interface cbo {
  key: any;
  value: any;
}