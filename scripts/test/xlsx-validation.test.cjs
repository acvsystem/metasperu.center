const test=require('node:test'),assert=require('node:assert/strict');
const ExcelJS=require('exceljs'),JSZip=require('jszip');
const {validateXlsxArchive}=require('../templates/xlsx-validation.cjs');
test('accepts a normal workbook and rejects binary disguises and excessive rows',async()=>{
  const book=new ExcelJS.Workbook();book.addWorksheet('Datos').addRows([['Codigo','Cantidad'],['001',3]]);
  await validateXlsxArchive(await book.xlsx.writeBuffer());
  await assert.rejects(validateXlsxArchive(Buffer.from('not-a-workbook')));
  const zip=new JSZip();zip.file('[Content_Types].xml','<Types/>');zip.file('xl/workbook.xml','<workbook/>');
  zip.file('xl/worksheets/sheet1.xml','<worksheet>'+('<row r="1"/>'.repeat(5002))+'</worksheet>');
  await assert.rejects(validateXlsxArchive(await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'})),/5000 filas/);
});
test('measures decompressed bytes instead of trusting forged ZIP size metadata',async()=>{
  const zip=new JSZip();zip.file('[Content_Types].xml','<Types/>');zip.file('xl/workbook.xml','<workbook/>');zip.file('large.bin','A'.repeat(8192));
  const data=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
  for(let at=0;at<data.length-46;at++)if(data.readUInt32LE(at)===0x02014b50&&data.readUInt32LE(at+24)===8192)data.writeUInt32LE(100,at+24);
  await assert.rejects(validateXlsxArchive(data,{maxInflatedBytes:1024}));
});
