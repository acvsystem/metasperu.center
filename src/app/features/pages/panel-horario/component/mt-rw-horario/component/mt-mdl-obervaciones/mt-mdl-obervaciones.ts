import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mt-mdl-obervaciones',
  standalone: false,
  templateUrl: './mt-mdl-obervaciones.html',
  styleUrl: './mt-mdl-obervaciones.scss',
})
export class MtMdlObervaciones {
  empleadoSeleccionado: any = null;
  nuevaObservacion: string = '';
  historialNotas: any[] = [];

  // Datos recibidos del componente padre
  listaTrabajadores: any[] = [];
  diaBloqueado: boolean = false;
  puedeEditarPasado: boolean = false;
  

  constructor(
    public dialogRef: MatDialogRef<MtMdlObervaciones>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // private apiService: HorarioService // Tu servicio de backend
  ) {
    this.listaTrabajadores = data.trabajadores;
    this.diaBloqueado = data.bloqueado;
    this.puedeEditarPasado = data.puedeEditarPasado;
    this.historialNotas = data.notasDia;
  }

  onEmpleadoChange(empleado: any) {
    this.nuevaObservacion = '';
    this.empleadoSeleccionado = empleado.value;
    // Llamada al servicio para traer notas de la base de datos de Metas Perú
    /*  this.apiService.getObservacionesPorEmpleado(empleado.nro_documento).subscribe(notas => {
        this.historialNotas = notas;
      });*/
  }

  guardarNota() {
    const dataPost = {
      nombre_completo: this.empleadoSeleccionado.nombre_completo,
      nro_documento: this.empleadoSeleccionado.nro_documento,
      observacion: this.nuevaObservacion,
      fecha_registro: new Date()
    };


    this.historialNotas.push(dataPost);


    /*  this.apiService.saveObservacion(dataPost).subscribe(() => {
        this.dialogRef.close(true); // Cerramos y avisamos que se guardó
      });*/
  }

  onCancel() {
    this.dialogRef.close(this.historialNotas);
  }

}
