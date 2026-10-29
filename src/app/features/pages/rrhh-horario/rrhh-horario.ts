import { MtRwHorario } from '../panel-horario/component/mt-rw-horario/mt-rw-horario';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-rrhh-horario',
  standalone: false,
  templateUrl: './rrhh-horario.html',
  styleUrl: './rrhh-horario.scss',
})
export class RrhhHorario {
  @ViewChild(MtRwHorario) editor?: MtRwHorario;
  canDeactivate() { return this.editor?.canDeactivate() ?? true; }

}
