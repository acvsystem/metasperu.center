import { Injectable, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { tap, catchError, of, Observable, map } from 'rxjs';
import { SocketService } from '@metasperu/services/socket.service';

// Definimos la interfaz del usuario para tipado fuerte
export interface User {
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
    private router = inject(Router);
    private navCtrl = inject(NavController);
    private socketService = inject(SocketService);
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
    checkSession(): Observable<boolean> {
        return this.http.get<User>(`${this.API_URL}/check-session`).pipe(
            tap(user => {
                this.#user.set(user);
                const savedMenu = localStorage.getItem('menu');
                if (savedMenu) {
                    this.#menu.set(JSON.parse(savedMenu));
                }
            }),
            map(() => true),                   // <--- Transformamos el flujo a boolean (ÉXITO)
            catchError((err) => {
                this.#user.set(null);
                return of(false);                // <--- En caso de error, devolvemos false
            })
        );
    }

    login(credentials: any): Observable<any> {
        // 1. Eliminamos withCredentials porque ya no usaremos cookies para la sesión
        return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => {
                // 2. Guardamos el token en localStorage para que el Interceptor lo use
                if (response.token) {
                    localStorage.setItem('auth_token', response.token);
                    localStorage.setItem('role', response.user.role);
                    localStorage.setItem('name', response.user.username);
                    this.socketService.conectar();
                    localStorage.setItem('menu', JSON.stringify(response.menu));
                    this.#menu.set(response.menu);
                    this.onMenu.emit(response.menu);
                }

                // 3. Actualizamos el estado del usuario y navegamos
                this.#user.set(response.user || response);
                
                // Navegación dinámica: Ir a la primera ruta permitida del menú
                const initialRoute = response.menu && response.menu.length > 0 
                    ? '/' + response.menu[0].ruta 
                    : '/login';
                this.navCtrl.navigateRoot(initialRoute);
            })
        );
    }


    async logout() {
        localStorage.clear();
        this.socketService.desconectar();
        localStorage.removeItem('auth_token'); // Limpiar el token
        localStorage.removeItem('menu');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        this.#user.set(null);                  // Limpiar el estado
        this.#menu.set([]);                    // Limpiar el menú
        this.navCtrl.navigateRoot('/login');      // Redirigir
    }
}