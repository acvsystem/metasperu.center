import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'app-kardex',
  standalone: false,
  templateUrl: './kardex.html',
  styleUrl: './kardex.scss',
})
export class Kardex {
  storeList: Array<any> = [];
  cboStoreList: Array<any> = [];

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
        this.cboStoreList = this.storeList.map(store => ({ key: store.serie, value: store.nombre }));
      }
    );
  }

}
