import { Injectable,inject,signal } from '@angular/core';
import { UiFeedbackService } from '../../shared/services/ui-feedback.service';
import { SPREADSHEET_WORKER_URL } from './spreadsheet-worker-info';
export interface SpreadsheetExport {rows:Record<string,unknown>[];sheetName:string;headers?:string[];widths?:number[];highlightColumn?:number;}
@Injectable({providedIn:'root'})
export class SpreadsheetService {
  private readonly feedback=inject(UiFeedbackService);
  readonly active=signal(false);readonly progress=signal(0);
  private async run(payload:object,transfer:Transferable[]=[]):Promise<any>{
    if(this.active())throw new Error('Ya hay un archivo en proceso. Espera a que termine.');
    this.active.set(true);this.progress.set(0);let worker:Worker|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
    try {
      return await new Promise((resolve,reject)=>{
        worker=new Worker(new URL(SPREADSHEET_WORKER_URL,document.baseURI));
        deadline=setTimeout(()=>reject(new Error('El archivo tardo demasiado. Usa un archivo mas pequeño.')),20000);
        worker.onmessage=({data})=>{
          if(typeof data.progress==='number'){this.progress.set(data.progress);return;}
          data.ok?resolve(data):reject(new Error(data.error||'No se pudo procesar el archivo.'));
        };
        worker.onerror=()=>reject(new Error('No se pudo abrir el procesador de archivos. Revisa la conexion.'));
        worker.postMessage(payload,transfer);
      });
    }finally{clearTimeout(deadline);worker?.terminate();this.active.set(false);}
  }
  async readFirstSheet(file:File):Promise<any[][]|null>{
    try {
      if(!/\.xlsx$/i.test(file.name))throw new Error('Guarda tu archivo como .xlsx antes de importarlo.');
      if(file.size>5*1024*1024)throw new Error('El archivo permite hasta 5 MB.');
      const buffer=await file.arrayBuffer();return (await this.run({operation:'read',buffer},[buffer])).rows;
    }catch(error){void this.feedback.show(error instanceof Error?error.message:'No se pudo importar el archivo.',true);return null;}
  }
  async exportFile(options:SpreadsheetExport,filename:string):Promise<boolean>{
    try {
      if(options.rows.length>100000)throw new Error('Usa filtros o una exportacion de servidor para mas de 100000 filas.');
      const result=await this.run({operation:'export',...options});
      const blob=new Blob([result.buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename.replace(/[\\/]/g,'_')+'.xlsx';
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
    }catch(error){void this.feedback.show(error instanceof Error?error.message:'No se pudo generar el archivo.',true);return false;}
  }
}
