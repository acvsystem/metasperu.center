// Standalone helper: the browser worker and Node security tests use the same code.
async function validateXlsxArchive(input,options={}) {
  const maxInflated=options.maxInflatedBytes||30*1024*1024;
  const bytes=new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const invalid=()=>Object.assign(new Error('El archivo XLSX no es valido o supera los limites de importacion.'),{publicMessage:true});
  if(bytes.length<22||bytes.length>5*1024*1024||view.getUint32(0,true)!==0x04034b50)throw invalid();
  let end=-1;
  for(let at=bytes.length-22;at>=Math.max(0,bytes.length-65557);at--){
    if(view.getUint32(at,true)===0x06054b50&&at+22+view.getUint16(at+20,true)===bytes.length){end=at;break;}
  }
  if(end<0||view.getUint16(end+4,true)||view.getUint16(end+6,true))throw invalid();
  const count=view.getUint16(end+10,true),directorySize=view.getUint32(end+12,true),directory=view.getUint32(end+16,true);
  if(!count||count>2000||count!==view.getUint16(end+8,true)||directory+directorySize>end)throw invalid();
  const names=new Set(),entries=[];let at=directory,declared=0;
  const decoder=new TextDecoder('utf-8',{fatal:true});
  for(let index=0;index<count;index++){
    if(at+46>bytes.length||view.getUint32(at,true)!==0x02014b50)throw invalid();
    const flags=view.getUint16(at+8,true),method=view.getUint16(at+10,true),compressed=view.getUint32(at+20,true),size=view.getUint32(at+24,true);
    const nameLength=view.getUint16(at+28,true),extraLength=view.getUint16(at+30,true),commentLength=view.getUint16(at+32,true),offset=view.getUint32(at+42,true);
    const next=at+46+nameLength+extraLength+commentLength;
    if(next>directory+directorySize||offset+30>directory||[compressed,size,offset].includes(0xffffffff)||flags&1||![0,8].includes(method))throw invalid();
    const name=decoder.decode(bytes.subarray(at+46,at+46+nameLength));
    if(!name||name.startsWith('/')||name.includes('\\')||name.split('/').includes('..')||names.has(name))throw invalid();
    names.add(name);declared+=size;if(declared>maxInflated)throw invalid();
    if(view.getUint32(offset,true)!==0x04034b50||view.getUint16(offset+8,true)!==method||view.getUint16(offset+6,true)&1)throw invalid();
    const localNameLength=view.getUint16(offset+26,true),start=offset+30+localNameLength+view.getUint16(offset+28,true);
    if(start+compressed>directory||decoder.decode(bytes.subarray(offset+30,offset+30+localNameLength))!==name)throw invalid();
    entries.push({name,method,size,start,compressed});at=next;
  }
  if(at!==directory+directorySize||!names.has('xl/workbook.xml')||!names.has('[Content_Types].xml'))throw invalid();
  let actualTotal=0;
  for(const entry of entries){
    if(entry.name.endsWith('/'))continue;
    let stream=new Blob([bytes.slice(entry.start,entry.start+entry.compressed)]).stream();
    if(entry.method===8)stream=stream.pipeThrough(new DecompressionStream('deflate-raw'));
    const reader=stream.getReader(),parts=[];let size=0;
    try {
      while(true){
        const {value,done}=await reader.read();if(done)break;
        size+=value.byteLength;actualTotal+=value.byteLength;
        if(actualTotal>maxInflated||size>entry.size||(/\.xml$/i.test(entry.name)&&size>8*1024*1024))throw invalid();
        if(/\.xml$/i.test(entry.name))parts.push(value);
      }
      if(size!==entry.size)throw invalid();
      if(parts.length){
        const xml=await new Blob(parts).text();
        if(/<!DOCTYPE|<!ENTITY|<\/?[^\s>/]{65}/i.test(xml)||(xml.match(/<[^!?/]/g)||[]).length>250000)throw invalid();
        if(/^xl\/worksheets\//.test(entry.name)){
          if((xml.match(/<(?:[\w.-]+:)?row[\s/>]/g)||[]).length>5001)throw Object.assign(new Error('El archivo permite hasta 5000 filas de datos.'),{publicMessage:true});
          const columns=xml.matchAll(/<(?:[\w.-]+:)?col\b[^>]*\bmax\s*=\s*["'](\d+)/g);
          for(const column of columns)if(Number(column[1])>100)throw Object.assign(new Error('El archivo permite hasta 100 columnas.'),{publicMessage:true});
        }
      }
    }finally{await reader.cancel().catch(()=>{});}
  }
}
if(typeof module!=='undefined')module.exports={validateXlsxArchive};
else globalThis.validateXlsxArchive=validateXlsxArchive;
