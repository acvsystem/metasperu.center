import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
@Injectable({providedIn:'root'})
export class UiFeedbackService {
  private readonly toasts=inject(ToastController);
  async show(message:string,error=false) {
    const toast=await this.toasts.create({header:error?'No se pudo completar':'Operacion completada',
      message,duration:5000,position:'bottom',cssClass:'center-welcome-toast',buttons:[{text:'Cerrar',role:'cancel'}]});
    await toast.present();
  }
}
