import { Component } from '@angular/core';
import { SocketResourcesHumanService } from '@metasperu/services/socketResourcesHuman';

@Component({
  selector: 'panel-horario',
  standalone: false,
  templateUrl: './panel-horario.html',
  styleUrl: './panel-horario.scss',
})
export class PanelHorario {

  tabIndex = 0;
  constructor(private socketService: SocketResourcesHumanService) { }

  ngOnInit() {

  }

  onTabChange(index: number) {
    this.tabIndex = index;
  }

}
