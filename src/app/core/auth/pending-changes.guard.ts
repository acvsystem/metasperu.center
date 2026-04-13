import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface CanComponentDeactivate {
    canDeactivate: () => boolean;
}

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate): boolean {
        if (component.canDeactivate()) {
            return true;
        } else {
            return confirm('¡Atención! Tienes cambios pendientes. Si sales ahora, se perderá lo que no hayas guardado en la base de datos. ¿Deseas salir de todas formas?');
        }
    }
}