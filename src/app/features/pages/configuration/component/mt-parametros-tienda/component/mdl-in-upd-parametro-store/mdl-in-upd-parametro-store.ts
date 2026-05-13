import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StoreService } from '@metasperu/services/store.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mdl-in-upd-parametro-store',
  standalone: false,
  templateUrl: './mdl-in-upd-parametro-store.html',
  styleUrl: './mdl-in-upd-parametro-store.scss',
})
export class MdlInUpdParametroStore {
  form: FormGroup;
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MdlInUpdParametroStore>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      NUM_CAJA: [data?.NUM_CAJA || '', Validators.required],
      MAC: [data?.MAC || '', Validators.required],
      SERIE_TIENDA: [data?.SERIE_TIENDA || '', [Validators.required, Validators.maxLength(3)]],
      DATABASE_INSTANCE: [data?.DATABASE_INSTANCE || '', Validators.required],
      DATABASE_NAME: [data?.DATABASE_NAME || '', Validators.required],
      COD_TIPO_FAC: [data?.COD_TIPO_FAC || '01', Validators.required],
      COD_TIPO_BOL: [data?.COD_TIPO_BOL || '03', Validators.required],
      PROPERTY_STOCK: [data?.PROPERTY_STOCK || ''],
      ASUNTO_EMAIL_REPORT_STOCK: [data?.ASUNTO_EMAIL_REPORT_STOCK || ''],
      NAME_EXCEL_REPORT_STOCK: [data?.NAME_EXCEL_REPORT_STOCK || ''],
      RUTA_DOWNLOAD_PY: [data?.RUTA_DOWNLOAD_PY || ''],
      RUTA_DOWNLOAD_SUNAT: [data?.RUTA_DOWNLOAD_SUNAT || ''],
      RUTA_DOWNLOAD_VALIDACION: [data?.RUTA_DOWNLOAD_VALIDACION || ''],
      IS_PRINCIPAL_SERVER: [data?.IS_PRINCIPAL_SERVER || 0],
      IP: [data?.IP || '', Validators.required],
      ONLINE: [data?.ONLINE || '1'],
      UNID_SERVICIO: [data?.UNID_SERVICIO || ''],
      RED: [data?.RED || ''],
      TIME_CLEAR: [data?.TIME_CLEAR || '']
    });
  }

  ngOnInit(): void { }

  close() {
    this.dialogRef.close(true);
  }

  guardar() {
    if (this.form.invalid) return;

    const observable = this.isEdit
      ? this.storeService.putUpdateParametrosTienda(this.data.ID_PARAMETROS, this.form.value)
      : this.storeService.postInsertParametrosTienda(this.form.value);

    observable.subscribe({
      next: () => {
        this.snackBar.open('Guardado correctamente', 'OK', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => console.error(err)
    });
  }
}
