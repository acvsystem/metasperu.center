import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'mdl-extra-parametros',
  standalone: false,
  templateUrl: './mdl-extra-parametros.html',
  styleUrl: './mdl-extra-parametros.scss',
})
export class MdlExtraParametros {
  clientesTexto: string = '';
  nuevaObservacion: string = '';
  vReferencia: string = '';
  vTimeTolerance: string = '';
  vIdTolerancia: number = 0;
  arTolerancia: any[] = [];
  constructor(private storeService: StoreService, private snackBar: MatSnackBar, public dialogRef: MatDialogRef<MdlExtraParametros>,) { }

  ngOnInit(): void {
    this.onListaClientesDelete();
    this.onTolerancia();
  }

  onListaClientesDelete() {
    this.storeService.getClientesDelete().subscribe((res: any) => {
      this.clientesTexto = res.LIST_CLIENTE;
    });
  }

  guardarClientes() {
    this.storeService.postClientesDelete({ LIST_CLIENTE: this.clientesTexto }).subscribe((response: any) => {
      this.snackBar.open((response || {})['message'], 'OK', { duration: 2000 });
    });
  }

  onTolerancia() {
    this.storeService.getTolerancia().subscribe((res: any) => {
      this.arTolerancia = res;
    });
  }

  onSelectTolerancia(data: any) {
    console.log('Tolerancia seleccionada:', data);
    this.vReferencia = (data || {}).REFERENCIA;
    this.vTimeTolerance = (data || {}).TIEMPO_TOLERANCIA;
    this.vIdTolerancia = (data || {}).ID_TOLERANCIA;
  }

  close() {
    this.dialogRef.close(true);
  }

  guardarTolerancia() {
    this.storeService.putTolerancia({ id: this.vIdTolerancia, REFERENCIA: this.vReferencia, TIEMPO_TOLERANCIA: this.vTimeTolerance }).subscribe((response: any) => {
      this.snackBar.open((response || {})['message'], 'OK', { duration: 2000 });
      this.onTolerancia();
    });
  }
}
