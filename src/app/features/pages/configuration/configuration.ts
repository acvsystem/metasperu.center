import { Component } from '@angular/core';


@Component({
  selector: 'configuration',
  standalone: false,
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss',
})
export class Configuration {
  tabIndex = 0;
  roleUser = "";

  ngOnInit() {
    this.roleUser = localStorage.getItem('name') || "";
  }

  onTabChange(index: number) {
    this.tabIndex = index;
  }

}

