import { Subscription as ViewSubscriptions, finalize } from 'rxjs';
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
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  form: FormGroup;
  hidePassword = true;
  saving = false;
  saveError = '';

  // Lista de páginas iniciales comunes en Metas Perú
  pages: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MdlCreateUsuario>,
    private storeService: StoreService
  ) {

    this.viewSubscriptions.add(this.storeService.getMenu().subscribe((tiendas: any) => {
      // Aquí podrías mapear las tiendas a un formato adecuado para un select, por ejemplo:
      this.pages = tiendas.map((tienda: any) => ({
        label: tienda.menu,
        value: tienda.ruta
      }));
    }));

    this.form = this.fb.group({
      USUARIO: ['', [Validators.required, Validators.minLength(4)]],
      PASSWORD: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(72)]],
      EMAIL: ['', [Validators.required, Validators.email]],
      NIVEL: ['', [Validators.required]],
      DEFAULT_PAGE: ['dashboard', [Validators.required]],
      CODE_STORE: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {

  }

  crear() {
    this.form.markAllAsTouched();
    if(this.form.invalid || this.saving)return;
    this.saving=true;this.saveError='';this.dialogRef.disableClose=true;
    this.viewSubscriptions.add(this.storeService.createUsuario(this.form.getRawValue()).pipe(
      finalize(()=>{this.saving=false;this.dialogRef.disableClose=false;})
    ).subscribe({
      next:response=>this.dialogRef.close(response),
      error:error=>this.saveError=error.status===422||error.status===409?error.error?.message:'No se pudo guardar. Intenta de nuevo; tus datos siguen aqui.'
    }));
  }

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
