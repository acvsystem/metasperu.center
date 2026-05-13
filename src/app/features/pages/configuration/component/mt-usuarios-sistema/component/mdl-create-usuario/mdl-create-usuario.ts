import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'mdl-create-usuario',
  standalone: false,
  templateUrl: './mdl-create-usuario.html',
  styleUrl: './mdl-create-usuario.scss',
})
export class MdlCreateUsuario {
  form: FormGroup;
  hidePassword = true;

  // Lista de páginas iniciales comunes en Metas Perú
  pages: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MdlCreateUsuario>,
    private storeService: StoreService
  ) {

    this.storeService.getMenu().subscribe((tiendas: any) => {
      // Aquí podrías mapear las tiendas a un formato adecuado para un select, por ejemplo:
      this.pages = tiendas.map((tienda: any) => ({
        label: tienda.menu,
        value: tienda.ruta
      }));
    });

    this.form = this.fb.group({
      USUARIO: ['', [Validators.required, Validators.minLength(4)]],
      PASSWORD: ['', [Validators.required, Validators.minLength(6)]],
      EMAIL: ['', [Validators.required, Validators.email]],
      NIVEL: ['', [Validators.required]],
      DEFAULT_PAGE: ['dashboard', [Validators.required]],
      CODE_STORE: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {

  }

  crear() {
    if (this.form.valid) {
      // Enviamos el objeto completo al componente padre
      this.dialogRef.close(this.form.value);
    }
  }
}
