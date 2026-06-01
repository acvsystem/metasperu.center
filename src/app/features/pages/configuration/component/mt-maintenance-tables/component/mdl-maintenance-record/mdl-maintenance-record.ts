import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreService } from '@metasperu/services/store.service';
import { MaintenanceField, MaintenanceResource } from '../../mt-maintenance-tables';

export interface MaintenanceDialogData {
  resource: MaintenanceResource;
  record: any | null;
}

@Component({
  selector: 'mdl-maintenance-record',
  standalone: false,
  templateUrl: './mdl-maintenance-record.html',
  styleUrl: './mdl-maintenance-record.scss',
})
export class MdlMaintenanceRecord {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MdlMaintenanceRecord>,
    @Inject(MAT_DIALOG_DATA) public data: MaintenanceDialogData
  ) {
    this.isEdit = !!data.record;
    this.form = this.fb.group(this.buildFormControls(data.resource.fields, data.record));
  }

  buildFormControls(fields: MaintenanceField[], record: any | null): Record<string, any> {
    return fields.reduce((controls: Record<string, any>, field) => {
      const initialValue = field.type === 'checkbox'
        ? Number(record?.[field.key] || 0) === 1
        : (record?.[field.key] ?? '');

      controls[field.key] = field.required
        ? [initialValue, Validators.required]
        : [initialValue];

      return controls;
    }, {});
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.toApiBody();
    const request = this.isEdit
      ? this.storeService.updateMaintenanceRecord(
        this.data.resource.key,
        this.data.record[this.data.resource.primaryKey],
        body
      )
      : this.storeService.createMaintenanceRecord(this.data.resource.key, body);

    request.subscribe({
      next: () => {
        this.snackBar.open('Registro guardado correctamente', 'OK', { duration: 2200 });
        this.dialogRef.close(true);
      },
      error: (error: Error) => this.snackBar.open(error.message || 'Error al guardar registro', 'Cerrar', { duration: 3000 })
    });
  }

  private toApiBody(): Record<string, any> {
    const raw = this.form.getRawValue();
    const body: Record<string, any> = {};

    this.data.resource.fields.forEach((field) => {
      body[field.key] = field.type === 'checkbox'
        ? (raw[field.key] ? 1 : 0)
        : raw[field.key];
    });

    return body;
  }
}
