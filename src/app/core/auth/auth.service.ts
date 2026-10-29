import { SessionState } from './session-state';
import { firstValueFrom,timeout } from 'rxjs';
import { Injectable, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { tap, catchError, of, Observable, map } from 'rxjs';
import { SocketService } from '@metasperu/services/socket.service';
import { StoreService } from '@metasperu/services/store.service';
import { RrwebRecorderService } from '@metasperu/services/rrweb-recorder.service';

// Definimos la interfaz del usuario para tipado fuerte
export interface User {
    id?: number;
    username: string;
    role: string;
    email: string;
}

export interface MenuOption {
    nombre: string;
    ruta: string;
    icon?: string; // Opcional, por si decides agregarlo luego
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    @Output() onMenu: EventEmitter<any> = new EventEmitter();
    private http = inject(HttpClient);
    private session = inject(SessionState);
    private router = inject(Router);
    private navCtrl = inject(NavController);
    private socketService = inject(SocketService);
    private storeService = inject(StoreService);
    private rrwebRecorder = inject(RrwebRecorderService);
    private readonly API_URL = 'https://api.metasperu.net.pe/s2/auth/center'; // Ajusta a tu URL


    // 1. Estado reactivo con Signals
    #user = signal<User | null>(null);
    #menu = signal<MenuOption[]>([]);

    // 2. Selectores públicos (solo lectura)
    user = this.#user.asReadonly();
    menu = this.#menu.asReadonly();
    isAuthenticated = computed(() => !!this.#user());
    currentUser = signal<any | null>(null);

    /**
     * Intenta recuperar la sesión al cargar la PWA (evita logout al refrescar)
     */
    constructor() {
        this.session.expired.subscribe(() => {
            this.rrwebRecorder.stop();
            this.clearAccount();
            this.navCtrl.navigateRoot('/login?reason=expired');
        });
    }

    private normalizeUser(value: any): User {
        const user = { id:value?.id, username: value?.username ?? value?.USUARIO, role: value?.role ?? value?.NIVEL, email: value?.email ?? value?.EMAIL ?? '' };
        if (!user.username || !user.role) throw new Error('Invalid session response');
        return user;
    }

    checkSession(): Observable<boolean> {
        return this.http.get<User & {menu:MenuOption[]}>(`${this.API_URL}/check-session`).pipe(timeout(15000),
            tap(value => {
                this.applyContext(value,value.menu);
                this.session.open(this.session.token() || undefined);
            }),
            map(() => true),
            catchError(() => { this.#user.set(null); this.session.clear(); return of(false); })
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(timeout(15000),
            tap(response => {
                this.applyContext(response.user,response.menu);
                this.session.open(response.token);
                // Navegación dinámica: Ir a la primera ruta permitida del menú
                const initialRoute = response.menu && response.menu.length > 0
                    ? '/' + response.menu[0].ruta
                    : '/login';
                this.navCtrl.navigateRoot(initialRoute).then(() => this.rrwebRecorder.start());
            })
        );
    }


    private applyContext(value:any,menu:any) {
        const user=this.normalizeUser(value),options=Array.isArray(menu)?menu:[];
        this.#user.set(user);this.#menu.set(options);
        localStorage.setItem('role',user.role);localStorage.setItem('name',user.username);
        localStorage.setItem('marca',value.unid_servicio || 'OF');
        localStorage.setItem('keyStore',this.storeService.encrypt(value.code_store || ''));
        localStorage.setItem('keyStore_2',this.storeService.encrypt(value.old_code_store || ''));
        localStorage.setItem('menu',JSON.stringify(options));
        this.onMenu.emit(options);
    }

    private clearAccount() {
        this.session.clear();
        for (const key of ['auth_token','menu','name','role','marca','keyStore','keyStore_2']) localStorage.removeItem(key);
        this.socketService.desconectar();
        this.#user.set(null);
        this.#menu.set([]);
        this.onMenu.emit([]);
    }

    async logout(): Promise<boolean> {
        try {
            await this.rrwebRecorder.stop();
            await firstValueFrom(this.http.post(`${this.API_URL}/logout`, {}).pipe(timeout(15000)));
            this.clearAccount();
            await this.navCtrl.navigateRoot('/login');
            return true;
        } catch {
            this.storeService.onNotification.emit([{ isError: true, bodyNotification: 'No se pudo confirmar el cierre de sesion. Revisa tu conexion y vuelve a intentarlo.' }]);
            return false;
        }
    }
}
