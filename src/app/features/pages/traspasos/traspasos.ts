import { MtCreationTraspasos } from './component/mt-creation-traspasos/mt-creation-traspasos';
import { Subscription as ViewSubscriptions } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';

@Component({
  selector: 'traspasos',
  standalone: false,
  templateUrl: './traspasos.html',
  styleUrl: './traspasos.scss',
})
export class Traspasos {
  @ViewChild(MtCreationTraspasos) editor?: MtCreationTraspasos;
  canDeactivate() { return !(this.editor?.dataExcelImport.length || this.editor?.dataInventory.some(row=>Number(row.cCantidadSolicitada)>0)); }
  private readonly viewSubscriptions = new ViewSubscriptions();
  private readonly socketCleanup: Array<() => void> = [];

  storeList: Array<any> = [];
  cboStoreList: Array<any> = [];

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.viewSubscriptions.add(this.storeService.getStores().subscribe(
      response => {
        this.storeList = response;
      }
    ));
  }

  ngOnDestroy() {
    this.viewSubscriptions.unsubscribe();
    this.socketCleanup.forEach(remove => remove());
  }
}
