import { Component, inject, signal } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  // QA Fix: Inicializar menú para evitar que aparezca vacío
  menuFiltrado: Array<any> = [];
  protected readonly title = signal('metasperu.center');
  roleUser: string = "";
  name: string = "";
  authService = inject(AuthService);

  constructor(private swUpdate: SwUpdate, private nav: NavController, private menu: MenuController) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          // Aquí muestras un snackbar o toast al usuario:
          // "Hay una nueva versión, ¿quieres actualizar?"
          if (confirm("Nueva actualización disponible. ¿Reiniciar ahora?")) {
            window.location.reload();
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.roleUser = localStorage.getItem('role') || "";
    this.name = localStorage.getItem('name') || "";
    if (this.menuFiltrado.length == 0 && localStorage.getItem('menu')) {
      this.menuFiltrado = JSON.parse(localStorage.getItem('menu') || '[]');
    }

    this.authService.onMenu.subscribe((menu: any) => {
      if (this.menuFiltrado.length == 0) {
        this.menuFiltrado = menu;
      }

    });
  }

  get isLogged() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.menuFiltrado = [];
    this.authService.logout();
  }

  onNavigatorRoute(route: any) {

    this.nav.navigateRoot(route);


    this.menu.close();
  }
}
