import { Subscription as ViewSubscriptions } from 'rxjs';
import { Component } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'app-kardex',
  standalone: false,
  templateUrl: './kardex.html',
  styleUrl: './kardex.scss',
})
export class Kardex {
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  storeList: Array<any> = [];
  cboStoreList: Array<any> = [];
  onlineStores: Array<any> = [];
  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.onOnlineStores();
    this.viewSubscriptions.add(this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
        this.cboStoreList = this.storeList.map(store => ({ key: store.serie, value: store.nombre }));
      }
    ));
  }

  onOnlineStores() {
    this.viewSubscriptions.add(this.storeService.getAccoutingSokectOnline().subscribe(
      (response: any) => {
        this.onlineStores = response?.tiendasOnline || [];
        ;
      }
    ));
  }


  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
