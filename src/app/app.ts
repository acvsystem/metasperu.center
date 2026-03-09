import { Component, inject, signal } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  menuFiltrado: Array<any> = [];
  protected readonly title = signal('metasperu.center');
  roleUser: string = "";
  authService = inject(AuthService);
  ngOnInit(): void {
    this.roleUser = localStorage.getItem('role') || "";
  }

  get isLogged() {
    return this.authService.isAuthenticated();
  }

  onLogout() {
    this.authService.logout();
  }
}
