import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MtDatatable } from './mt-datatable';

describe('Shared table pagination and filters', () => {
  let fixture: ComponentFixture<MtDatatable>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MtDatatable], imports: [CommonModule, MatTableModule, MatPaginatorModule],
      providers: [{ provide: MatDialog, useValue: {} }],
    }).overrideComponent(MtDatatable, { set: { template: `
      <table mat-table [dataSource]="dataSource">
        <ng-container matColumnDef="name"><td mat-cell *matCellDef="let row">{{row.name}}</td></ng-container>
        <tr mat-row *matRowDef="let row; columns: ['name']"></tr>
      </table><mat-paginator [pageSize]="10"></mat-paginator>` } }).compileComponents();
    fixture = TestBed.createComponent(MtDatatable);
    fixture.componentRef.setInput('dataColumnsIn', [{ matColumnDef: 'name', propertyValue: 'name', cboFilter: [] }]);
    fixture.componentRef.setInput('dataIn', Array.from({ length: 25 }, (_, i) => ({ name: 'Store ' + (i + 1) })));
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
  });
  it('renders the next page instead of leaving records unreachable', async () => {
    const table = fixture.componentInstance;
    table.paginator.nextPage(); fixture.detectChanges(); await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tr');
    expect(rows.length).toBe(10);
    expect(rows[0].textContent).toContain('Store 11');
  });
  it('returns to page one when a filter is applied', () => {
    const table = fixture.componentInstance;
    table.paginator.nextPage();
    table.applyFilterTable({ target: { value: 'Store' } }, 'name');
    expect(table.paginator.pageIndex).toBe(0);
  });
  it('keeps the filter when fresh data arrives', async () => {
    const table = fixture.componentInstance;
    table.applyFilterTable({ target: { value: 'Store 2' } }, 'name');
    fixture.componentRef.setInput('dataIn', [{ name: 'Store 2' }, { name: 'Other' }]);
    fixture.detectChanges(); await fixture.whenStable();
    expect(table.dataSource.filteredData).toEqual([{ name: 'Store 2' }]);
  });
});
