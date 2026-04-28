import { Component } from '@angular/core';

@Component({
  selector: 'panel-horario',
  standalone: false,
  templateUrl: './panel-horario.html',
  styleUrl: './panel-horario.scss',
})
export class PanelHorario {

  tabIndex = 0;
  
  constructor() { }

  ngOnInit() {

  }

  onTabChange(index: number) {
    this.tabIndex = index;
  }

}
