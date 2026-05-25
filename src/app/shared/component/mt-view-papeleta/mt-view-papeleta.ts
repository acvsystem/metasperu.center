import { Component, inject, Input, input } from '@angular/core';
import { StoreService } from '@metasperu/services/store.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
export type NotificationType = 'success' | 'warning' | 'danger';

@Component({
  selector: 'mt-view-papeleta',
  standalone: false,
  templateUrl: './mt-view-papeleta.html',
  styleUrl: './mt-view-papeleta.scss',
})
export class MtViewPapeleta {
  @Input() codeBallot: string = '';
  data = inject(MAT_DIALOG_DATA);
  dataBallot: any = {};
  titleLoader: string = "Cargando..."
  isLoading: boolean = false;
  idTipoPap: number = 0;
  isPermisionEdit: boolean = false;
  selectedDate: Date | null = null;
  isNotification: boolean = false;
  messageNotification: string = '';
  typeNotification: NotificationType = 'success';
  constructor(private service: StoreService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.service.getOneBallot(this.data?.codeBallot || this.codeBallot).subscribe((ballot) => {
      this.idTipoPap = ballot.head_ballot.ID_PAP_TIPO_PAPELETA;
      this.dataBallot = {
        head_ballot: ballot.head_ballot,
        detail_ballot: ballot.detail_ballot
      };
      this.isLoading = false;
      console.log(this.dataBallot);
    });

    const codeStoreEncrypted = localStorage.getItem('keyStore');
    if (!codeStoreEncrypted) return;

    const serieDecrypted = this.service.decrypt(codeStoreEncrypted);
    this.isPermisionEdit = serieDecrypted === 'OF' ? true : false;
  }

  imprimir() {
    const originalTitle = document.title;
    document.title = `Papeleta_${this.dataBallot.head_ballot.CODIGO_PAPELETA}`;
    window.print();
    document.title = originalTitle;
  }

  updateDateBallot() {
    this.service.updateDateBallot({ codeBallot: this.dataBallot.head_ballot.CODIGO_PAPELETA, id_papeleta: this.dataBallot.head_ballot.ID_HEAD_PAPELETA, nueva_fecha: this.selectedDate }).subscribe((response) => {
      this.dataBallot = {
        head_ballot: response.head_ballot,
        detail_ballot: response.detail_ballot
      };

      this.messageNotification = response.message || 'Fecha de papeleta actualizada';
      this.abrirNotificacion(response.success ? 'success' : 'danger');
    });
  }

  abrirNotificacion(type: NotificationType) {
    this.typeNotification = type;
    this.isNotification = true;
  }

  cerrarNotificacion() {
    // Aquí es donde realmente desaparece del DOM
    this.isNotification = false;
  }

  onCalendarDesde(event: any): void {
    const { isPeriodo, isMultiSelect, isDefault, isRange, value } = event;
    this.selectedDate = value;
  }

}
