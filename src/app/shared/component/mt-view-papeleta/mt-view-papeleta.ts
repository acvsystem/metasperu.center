import { Component, inject } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';

@Component({
  selector: 'mt-view-papeleta',
  standalone: false,
  templateUrl: './mt-view-papeleta.html',
  styleUrl: './mt-view-papeleta.scss',
})
export class MtViewPapeleta {
  data = inject(MAT_DIALOG_DATA);
  dataBallot: any = {};
  titleLoader:string = "Cargando..."
  isLoading: boolean = false;

  constructor(private service: StoreService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.service.getOneBallot(this.data?.codeBallot).subscribe((ballot) => {
      this.dataBallot = {
        head_ballot: ballot.head_ballot,
        detail_ballot: ballot.detail_ballot
      };
      this.isLoading = false;
      console.log(this.dataBallot);
    })
  }

  imprimir() {
    const originalTitle = document.title;
    document.title = `Papeleta_${this.dataBallot.head_ballot.CODIGO_PAPELETA}`;
    window.print();
    document.title = originalTitle;
  }

}
