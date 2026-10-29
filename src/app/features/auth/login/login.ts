import { Subscription as ViewSubscriptions } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ThemeService } from '../../../shared/services/theme.service';
import { loginErrorMessage } from './login-error';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  readonly theme = inject(ThemeService);
  readonly loginError = signal('');
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  isLoading = signal(false);

  showPassword = false;
  userName: string = "";
  password: string = "";

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor() {
    // 3. REGISTRAR LOS ICONOS QUE USASTE
    addIcons({ eyeOutline, eyeOffOutline });

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loginError.set('');
    this.isLoading.set(true);
    this.viewSubscriptions.add(this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.presentToast('Ya puedes consultar tus tiendas y operaciones.', 'success');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loginError.set(loginErrorMessage(err.status));
        this.isLoading.set(false);
      }
    }));
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      header: color === 'success' ? 'Sesión iniciada' : 'Revisa tus datos',
      duration: 3200,
      cssClass: 'center-welcome-toast',
      buttons: [{ text: 'Cerrar', role: 'cancel' }],
      position: 'bottom'
    });
    toast.present();
  }


  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
