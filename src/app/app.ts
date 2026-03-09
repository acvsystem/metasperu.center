import { Component, inject, signal } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  // QA Fix: Inicializar menú para evitar que aparezca vacío
  menuFiltrado: Array<any> = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Configuración', url: '/settings', icon: 'settings' }
  ];
  protected readonly title = signal('metasperu.center');
  roleUser: string = "";
  authService = inject(AuthService);
  ngOnInit(): void {
    this.roleUser = localStorage.getItem('role') || "";
  }

  get isLogged() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
  }
}
