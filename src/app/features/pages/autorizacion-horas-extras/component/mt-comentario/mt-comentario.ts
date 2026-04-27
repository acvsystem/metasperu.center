import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-mt-comentario',
  standalone: false,
  templateUrl: './mt-comentario.html',
  styleUrl: './mt-comentario.scss',
})
export class MtComentario {
  readonly dialogRef = inject(MatDialogRef<MtComentario>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly comentario = this.data.comentario;
  readonly isViewComentarioModal = this.data.isViewComentario;
  readonly isRechazarModal = this.data.isRechazar;
  readonly isStockModal = this.data.isStock;
  vComentario: string = "";
  isViewcomentario: any = this.isViewComentarioModal;
  isRechazar: any = this.isRechazarModal;
  isStock: any = this.isStockModal;
  cboComentarios: string = "";
  dataComentarios: Array<any> = [
    { key: "No marco su salida de turno", value: "No marco su salida de turno" },
    { key: "No marco su salida a break", value: "No marco su salida a break" },
    { key: "Error de sistema", value: "Error de sistema" }
  ];

  constructor() { }

  ngOnInit() {
  }

  onChangeTextArea(data: any) {
    let id = data.target.id;
    let inputData = data.target.value;
    this.vComentario = inputData || "";
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOk(): void {
    this.dialogRef.close(this.vComentario);
  }

  async onChangeSelect(data: any) {
    console.log(data);
    let selectData = data.value;
    let index = (selectData || {}).selectId || "";
    this.vComentario = (selectData || {}).key || "";
  }
}
