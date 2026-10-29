importScripts('__EXCELJS_VENDOR__','__XLSX_VALIDATOR__');
function visible(message){return Object.assign(new Error(message),{publicMessage:true});}
function primitive(value){
  if(value===null||value===undefined)return '';
  if(value instanceof Date||typeof value==='boolean')return value;
  if(typeof value==='number')return Number.isFinite(value)?value:'';
  const text=typeof value==='object'?JSON.stringify(value):String(value);
  if(text.length>32767)throw visible('Una celda supera el tamaño permitido.');return text;
}
function readCell(value){
  if(!value||typeof value!=='object'||value instanceof Date)return value??'';
  if('result' in value)return readCell(value.result);
  if('text' in value)return String(value.text);
  if(Array.isArray(value.richText))return value.richText.map(item=>item.text||'').join('');
  return '';
}
self.onmessage=async({data})=>{
  try {
    const workbook=new ExcelJS.Workbook();
    if(data.operation==='read'){
      self.postMessage({progress:10});await validateXlsxArchive(data.buffer);
      self.postMessage({progress:40});await workbook.xlsx.load(data.buffer);
      const sheet=workbook.worksheets[0];if(!sheet||sheet.rowCount>5001||sheet.columnCount>100)throw visible('El archivo permite hasta 5000 filas y 100 columnas.');
      const rows=[];sheet.eachRow({includeEmpty:true},row=>{
        const values=[];for(let column=1;column<=sheet.columnCount;column++)values.push(readCell(row.getCell(column).value));rows.push(values);
      });self.postMessage({ok:true,rows});
    }else if(data.operation==='export'){
      if(!Array.isArray(data.rows)||data.rows.length>100000)throw visible('Usa filtros o una exportacion de servidor para mas de 100000 filas.');
      const headers=data.headers||[...new Set(data.rows.flatMap(row=>Object.keys(row)))];
      if(!headers.length||headers.length>200)throw visible('El reporte no tiene columnas validas.');
      const sheet=workbook.addWorksheet(String(data.sheetName||'Reporte').replace(/[\/*?:\[\]]/g,' ').slice(0,31));
      sheet.addRow(headers);sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF193F72'}};
      sheet.views=[{state:'frozen',ySplit:1}];
      data.rows.forEach((source,index)=>{
        const row=sheet.addRow(headers.map(key=>primitive(Object.prototype.hasOwnProperty.call(source,key)?source[key]:'')));
        if(data.highlightColumn!==undefined&&row.getCell(data.highlightColumn+1).value==='NO ESCANEADO'){
          row.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFF0000'}};cell.font={bold:true,color:{argb:'FFFFFFFF'}};});
        }
        if(index%1000===0)self.postMessage({progress:Math.floor(index/Math.max(data.rows.length,1)*70)});
      });
      (data.widths||[]).forEach((width,index)=>{sheet.getColumn(index+1).width=Math.min(80,Math.max(5,width));});
      self.postMessage({progress:85});
      const result=await workbook.xlsx.writeBuffer(),buffer=new Uint8Array(result).buffer;
      self.postMessage({ok:true,buffer},[buffer]);
    }else throw visible('Operacion de archivo no valida.');
  }catch(error){self.postMessage({ok:false,error:error?.publicMessage===true?error.message:'No se pudo procesar el archivo XLSX. Revisa su formato.'});}
};
