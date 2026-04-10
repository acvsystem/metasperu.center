import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'traspasos',
  standalone: false,
  templateUrl: './traspasos.html',
  styleUrl: './traspasos.scss',
})
export class Traspasos {
  storeList: Array<any> = [];
  cboStoreList: Array<any> = [];

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
      }
    );
  }
}
