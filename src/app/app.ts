import { Component, inject, signal, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, NavController, IonPopover } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';
import { RrwebRecorderService } from '@metasperu/services/rrweb-recorder.service';
import { ThemeService } from './shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  @ViewChild('accountPopover') accountPopover?: IonPopover;
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  readonly currentRoute = signal(this.router.url);
  readonly networkAvailable = signal(navigator.onLine);
  private readonly subscriptions = new Subscription();
  private readonly onOnline = () => this.networkAvailable.set(true);
  private readonly onOffline = () => this.networkAvailable.set(false);
  // QA Fix: Inicializar menú para evitar que aparezca vacío
  menuFiltrado: Array<any> = [];
  protected readonly title = signal('metasperu.center');
  roleUser: string = "";
  name: string = "";
  authService = inject(AuthService);
  private rrwebRecorder = inject(RrwebRecorderService);

  constructor(private swUpdate: SwUpdate, private nav: NavController, private menu: MenuController) {
    if (this.swUpdate.isEnabled) {
      this.subscriptions.add(this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          // Aquí muestras un snackbar o toast al usuario:
          // "Hay una nueva versión, ¿quieres actualizar?"
          if (confirm("Nueva actualización disponible. ¿Reiniciar ahora?")) {
            window.location.reload();
          }
        }
      }));
    }
  }

  ngOnInit(): void {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
    this.subscriptions.add(this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.currentRoute.set(event.urlAfterRedirects);
    }));
    this.roleUser = localStorage.getItem('role') || "";
    this.name = localStorage.getItem('name') || "";
    if (this.menuFiltrado.length == 0 && localStorage.getItem('menu')) {
      try { this.menuFiltrado = JSON.parse(localStorage.getItem('menu') || '[]'); }
      catch { this.menuFiltrado = []; }
      this.ensureSystemApiLogsMenu();
    }

    this.rrwebRecorder.start();

    this.subscriptions.add(this.authService.onMenu.subscribe((menu: any) => {
      this.menuFiltrado = Array.isArray(menu) ? menu : [];
      this.roleUser = localStorage.getItem('role') || '';
      this.name = localStorage.getItem('name') || '';

      this.ensureSystemApiLogsMenu();
    }));
  }

  get isLogged() {
    return this.authService.isAuthenticated();
  }

  async logout() {
    await this.accountPopover?.dismiss();
    this.menuFiltrado = [];
    await this.authService.logout();
  }

  onNavigatorRoute(route: any) {

    this.nav.navigateRoot('/' + this.normalizeRoute(route));


    this.menu.close();
  }

  normalizeRoute(route: string) { return String(route || '').replace(/^\/+/, '').split('?')[0]; }
  isActive(route: string) { return this.currentRoute().split('?')[0] === '/' + this.normalizeRoute(route); }
  get pageLabel() {
    const current = this.menuFiltrado.find(item => this.isActive(item.ruta));
    return current?.nombre || 'Centro de operaciones';
  }
  get menuGroups() {
    const definitions = [
      { name: 'Operaciones', routes: ['comprobantes', 'inventario', 'traspaso_inventario'] },
      { name: 'Personas', routes: ['asistencia', 'horario', 'panel-horario', 'auth-hora-extra'] },
      { name: 'Contabilidad', routes: ['kardex', 'tipo-cambio'] },
      { name: 'Reportes', routes: ['reportes'] },
      { name: 'Administración', routes: ['configuracion', 'recoding', 'api-logs'] },
    ];
    const known = new Set(definitions.flatMap(group => group.routes));
    return definitions.map((group, index) => ({ name: group.name,
      items: this.menuFiltrado.filter(item => group.routes.includes(this.normalizeRoute(item.ruta)) ||
        (index === 0 && !known.has(this.normalizeRoute(item.ruta)))) })).filter(group => group.items.length);
  }
  menuIcon(route: string) {
    const icons: Record<string, string> = { comprobantes: 'receipt_long', inventario: 'inventory_2',
      traspaso_inventario: 'swap_horiz', asistencia: 'badge', horario: 'calendar_month',
      'panel-horario': 'event_note', 'auth-hora-extra': 'more_time', kardex: 'account_balance',
      'tipo-cambio': 'currency_exchange', reportes: 'bar_chart', configuracion: 'settings',
      recoding: 'play_circle_outline', 'api-logs': 'manage_search' };
    return icons[this.normalizeRoute(route)] || 'apps';
  }
  ngOnDestroy() {
    void this.accountPopover?.dismiss();
    this.subscriptions.unsubscribe();
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  private ensureSystemApiLogsMenu(): void {
    if (this.roleUser !== 'SISTEMAS') return;
    const exists = this.menuFiltrado.some((menu) => menu.ruta === 'api-logs' || menu.ruta === '/api-logs');
    if (!exists) {
      this.menuFiltrado = [
        ...this.menuFiltrado
      ];
    }
  }
}
