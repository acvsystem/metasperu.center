import { Component, EventEmitter, Input, Output } from '@angular/core';
export type NotificationType = 'success' | 'warning' | 'danger';

@Component({
  selector: 'mt-notification',
  standalone: false,
  templateUrl: './mt-notification.html',
  styleUrl: './mt-notification.scss'
})
export class MtNotification {
  @Input() message: string = '';
  @Input() type: NotificationType = 'success';
  @Output() onClose = new EventEmitter<void>(); // Canal de comunicación
  isHiding = false;

  // Mapa de iconos para cada tipo
  get icon(): string {
    const icons = {
      success: '✓',
      warning: '!',
      danger: '✕'
    };
    return icons[this.type];
  }

  close() {
    this.isHiding = true; // Inicia la animación de CSS

    // Esperamos 300ms a que la animación de CSS termine
    setTimeout(() => {
      this.onClose.emit(); // Le dice al padre: "Ya puedes hacerme el ngIf = false"
    }, 300);
  }
}
