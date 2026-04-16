
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'mt-mdl-asignar-personal',
  standalone: false,
  templateUrl: './mt-mdl-asignar-personal.html',
  styleUrl: './mt-mdl-asignar-personal.scss',
})
export class MtMdlAsignarPersonal implements OnInit {
  filtro: string = '';
  trabajadoresFiltrados: any[] = [];
  seleccionados: any[] = []; // Array para guardar múltiples selecciones
  dateCalendar: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<MtMdlAsignarPersonal>,
    @Inject(MAT_DIALOG_DATA) public data: { trabajadores: any[], diaNombre: string }
  ) { }

  ngOnInit() {
    this.trabajadoresFiltrados = this.data.trabajadores;
  }

  // Alternar selección (Check/Uncheck)
  toggleSeleccion(trabajador: any) {
    const index = this.seleccionados.findIndex(t => t.nro_documento === trabajador.nro_documento);
    if (index > -1) {
      this.seleccionados.splice(index, 1); // Quitar si ya estaba
    } else {
      this.seleccionados.push(trabajador); // Agregar si no estaba
    }
  }

  estaSeleccionado(trabajador: any): boolean {
    return this.seleccionados.some(t => t.nro_documento === trabajador.nro_documento);
  }

  // Botón Final de Guardar
  confirmarSeleccion() {
    this.dialogRef.close(this.seleccionados); // Devolvemos el array completo
  }

  filtrarLista() {
    const busqueda = this.filtro.toLowerCase().trim();
    this.trabajadoresFiltrados = this.data.trabajadores.filter(t =>
      t.nombre_completo.toLowerCase().includes(busqueda)
    );
  }

}