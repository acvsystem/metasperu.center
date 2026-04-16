import { Component, Inject, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mt-mdl-rango-hora',
  standalone: false,
  templateUrl: './mt-mdl-rango-hora.html',
  styleUrl: './mt-mdl-rango-hora.scss',
})
export class MtMdlRangoHora {
  horaInicio: string = '';
  horaFin: string = '';
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<MtMdlRangoHora>,
    @Inject(MAT_DIALOG_DATA) public data: { rangosExistentes: any[], edicion?: any, cargo: any }
  ) { }

  onNgOnInit() {
    if (this.data.edicion) {
      // El rango viene como "08:00 - 17:00", lo separamos para los inputs
      const [inicio, fin] = this.data.edicion.rango.split(' - ');
      this.horaInicio = inicio;
      this.horaFin = fin;
    }
  }


  esMayorADocePM(hora: string) {
    const [hh, mm] = hora.split(":").map(Number);
    return hh > 12 || (hh === 12 && mm >= 0);
  }

  validarYGuardar() {
    this.error = null;

    // 1. Validación: Selección obligatoria
    if (!this.horaInicio || !this.horaFin) {
      this.error = 'Seleccione rango horario completo.';
      return;
    }

    if (!this.esMayorADocePM(this.horaFin) && this.data.cargo != 'Asesores PartTime') {
      this.error = 'Rango horario tiene que ser en formato de 24 horas.';
      return;
    }

    // Convertir a minutos para cálculos
    const [h1, m1] = this.horaInicio.split(':').map(Number);
    const [h2, m2] = this.horaFin.split(':').map(Number);

    let minInicio = h1 * 60 + m1;
    let minFin = h2 * 60 + m2;

    // Manejo de cruce de medianoche
    if (minFin < minInicio) minFin += 1440;

    const duracionHoras = (minFin - minInicio) / 60;

    // 2. Validación: Máximo 9 horas
    if (duracionHoras < 9 && this.data.cargo != 'Asesores PartTime') {
      this.error = 'Rango de hora no debe ser menor a 9 horas.';
      return;
    }

    // 3. Validación: Rango ya existe
    const nuevoRangoStr = `${this.horaInicio} - ${this.horaFin}`;
    const duplicado = this.data.rangosExistentes.some(r =>
      r.rango === nuevoRangoStr && r.rango !== this.data.edicion?.rango
    );

    if (duplicado) {
      this.error = 'Rango de hora ya existe.';
      return;
    }

    // Si pasa todo, devolvemos el objeto al componente principal
    this.dialogRef.close({ rango: nuevoRangoStr });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
