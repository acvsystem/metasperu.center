import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mt-mdl-papeletas',
  standalone: false,
  templateUrl: './mt-mdl-papeletas.html',
  styleUrl: './mt-mdl-papeletas.scss',
})
export class MtMdlPapeletas {
// Definición de las columnas para mat-table
  displayedColumns: string[] = ['codigo', 'nombre_completo', 'documento', 'fecha_compensacion','ver_papeleta'];
  dataSource = new MatTableDataSource<any>([]);
  isViewPapeleta: boolean = false;
  codeBallot: string = '';
  constructor(
    public dialogRef: MatDialogRef<MtMdlPapeletas>,
    @Inject(MAT_DIALOG_DATA) public data: any[]
  ) {}

  ngOnInit() {
    // Cargamos los datos recibidos en el dataSource de Material
    if (this.data) {
      this.dataSource.data = this.data;
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  verPapeleta(row: any) {
    this.isViewPapeleta = true;
    this.codeBallot = row.codigo;
  }

  toBack(){
    this.isViewPapeleta = false;
     this.codeBallot = "";
  }
}
