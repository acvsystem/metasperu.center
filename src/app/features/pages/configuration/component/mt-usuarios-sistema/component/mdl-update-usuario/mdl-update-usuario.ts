import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdl-update-usuario',
  standalone: false,
  templateUrl: './mdl-update-usuario.html',
  styleUrl: './mdl-update-usuario.scss',
})
export class MdlUpdateUsuario {
  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MdlUpdateUsuario>,
    @Inject(MAT_DIALOG_DATA) public data: any // Aquí recibes el objeto user
  ) {
    this.form = this.fb.group({
      ID: [data.ID_LOGIN],
      USUARIO: [data.USUARIO, [Validators.required]],
      EMAIL: [data.EMAIL, [Validators.required, Validators.email]],
      NIVEL: [data.NIVEL, [Validators.required]],
      DEFAULT_PAGE: [data.DEFAULT_PAGE || '/dashboard'],
      CODE_STORE: [data.CODE_STORE, [Validators.required]],
      PASSWORD: [''] // Opcional en edición
    });
  }

  ngOnInit(): void { }

  guardar() {
    if (this.form.valid) {
      // Si el password está vacío, podrías eliminarlo del objeto antes de enviar
      const rawValue = this.form.value;
      if (!rawValue.PASSWORD) delete rawValue.PASSWORD;

      this.dialogRef.close(rawValue);
    }
  }
}
