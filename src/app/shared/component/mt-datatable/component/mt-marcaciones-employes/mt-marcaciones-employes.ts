import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';

@Component({
  selector: 'mt-marcaciones-employes',
  standalone: false,
  templateUrl: './mt-marcaciones-employes.html',
  styleUrl: './mt-marcaciones-employes.scss',
})
export class MtMarcacionesEmployes {
  data = inject(MAT_DIALOG_DATA);

  ngOnInit() {
    console.log(this.data);
  }
}
