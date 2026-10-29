import { SpreadsheetService } from './core/spreadsheets/spreadsheet.service';
import { Component, inject, signal, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, NavController, IonPopover, IonRouterOutlet } from '@ionic/angular';
import { UiFeedbackService } from './shared/services/ui-feedback.service';
import { UpdateService } from './core/updates/update.service';
import { MatDialog } from '@angular/material/dialog';
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
  @ViewChild(IonRouterOutlet) outlet?:IonRouterOutlet;
  readonly updates=inject(UpdateService);
  readonly spreadsheets=inject(SpreadsheetService);
  private readonly feedback=inject(UiFeedbackService);
  private readonly dialogs=inject(MatDialog);
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

  constructor(private nav:NavController,private menu:MenuController){
    this.updates.protectReload(()=>{
      if(this.dialogs.openDialogs.length)return false;
      const page=this.outlet?.isActivated?this.outlet.component as {canDeactivate?:()=>boolean}:undefined;
      return page?.canDeactivate?.()!==false;
    });
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
    if (await this.authService.logout()) this.menuFiltrado = [];
  }

  onNavigatorRoute(route: any) {

    if(this.normalizeRoute(route)==='actualizaciones'&&!this.updates.canLeaveForUpdate()){void this.feedback.show(this.updates.message(),true);return;}
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
      { name: 'Administración', routes: ['configuracion', 'recoding', 'api-logs','actualizaciones','exportaciones'] },
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
      recoding: 'play_circle_outline', 'api-logs': 'manage_search',actualizaciones:'system_update',exportaciones:'file_download' };
    return icons[this.normalizeRoute(route)] || 'apps';
  }
  ngOnDestroy() {
    void this.accountPopover?.dismiss();
    this.subscriptions.unsubscribe();
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  private ensureSystemApiLogsMenu():void {
    if(this.roleUser==='SISTEMAS'&&!this.menuFiltrado.some(option=>this.normalizeRoute(option.ruta)==='exportaciones'))
      this.menuFiltrado=[...this.menuFiltrado,{nombre:'Exportaciones',ruta:'exportaciones'}];
    if(!this.menuFiltrado.some(option=>this.normalizeRoute(option.ruta)==='actualizaciones'))
      this.menuFiltrado=[...this.menuFiltrado,{nombre:'Actualizaciones',ruta:'actualizaciones'}];
  }
}
