import { Component } from '@angular/core';


@Component({
  selector: 'configuration',
  standalone: false,
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss',
})
export class Configuration {
  tabIndex = 0;
  
  onTabChange(index: number) {
    this.tabIndex = index;
  }

}

