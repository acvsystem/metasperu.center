import { Subscription, finalize } from 'rxjs';
import { StoreService } from '@metasperu/services/store.service';
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
  saving = false;
  saveError = '';
  private readonly subscriptions=new Subscription();

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
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
      PASSWORD: ['', [Validators.minLength(12), Validators.maxLength(72)]] // Opcional en edición
    });
  }

  ngOnInit(): void { }

  guardar() {
    this.form.markAllAsTouched();
    if(this.form.invalid || this.saving)return;
    const body=this.form.getRawValue();if(!body.PASSWORD)delete body.PASSWORD;
    this.saving=true;this.saveError='';this.dialogRef.disableClose=true;
    this.subscriptions.add(this.storeService.updateUsuario(body).pipe(
      finalize(()=>{this.saving=false;this.dialogRef.disableClose=false;})
    ).subscribe({
      next:response=>this.dialogRef.close(response),
      error:error=>this.saveError=error.status===422||error.status===409?error.error?.message:'No se pudo guardar. Intenta de nuevo; tus datos siguen aqui.'
    }));
  }
  ngOnDestroy(){this.subscriptions.unsubscribe();}
}
