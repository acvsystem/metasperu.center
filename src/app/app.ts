import { Component, inject, signal } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
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
  authService = inject(AuthService);

  constructor(private router: Router, private nav: NavController, private menu: MenuController) { }
  ngOnInit(): void {
    this.roleUser = localStorage.getItem('role') || "";

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
    this.authService.logout();
  }

  onNavigatorRoute(route: any) {
    if (route == 'traspaso_inventario') {
      this.router.navigate(['/traspaso_inventario', { timestamp: new Date().getTime() }]);
    } else {
      this.nav.navigateRoot(route);
    }

    this.menu.close();
  }
}
