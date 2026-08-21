import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '@metasperu/services/socket.service';

@Component({
  selector: 'panel-reportes',
  standalone: false,
  templateUrl: './panel-reportes.html',
  styleUrl: './panel-reportes.scss',
})
export class PanelReportes {
  // Lista de reportes disponibles
  reportes = [
    {
      id: 'informe-rendimiento',
      nombre: 'Informe de Rendimiento',
      descripcion: 'Venta por departamento',
      icono: '📊'
    }
    // Aquí puedes agregar más reportes en el futuro
  ];

  reporteSeleccionado: string | null = null;

  seleccionarReporte(id: string): void {
    this.reporteSeleccionado = id;
  }

  volver(): void {
    this.reporteSeleccionado = null;
  }
}
