const productionApi='https://api.metasperu.net.pe';
let apiOrigin=productionApi;

export function resolveApiOrigin(value:unknown,pageOrigin:string):string {
  const page=new URL(pageOrigin);
  const local=['localhost','127.0.0.1','[::1]'].includes(page.hostname);
  if(page.protocol!=='https:'&&!(page.protocol==='http:'&&local))throw new Error('El entorno requiere HTTPS.');
  if(value===undefined||value==='auto')return local||page.hostname==='dev.metasperu.net.pe'?page.origin:productionApi;
  if(value==='same-origin'||value===page.origin)return page.origin;
  if(value===productionApi)return productionApi;
  throw new Error('El destino de la API no esta autorizado.');
}
export const centerApiOrigin=()=>apiOrigin;

export async function initializeCenterRuntime():Promise<void> {
  let config:any={};
  try {
    const response=await fetch('/center-config.json',{cache:'no-store',headers:{'ngsw-bypass':'true'},signal:AbortSignal.timeout(5000)});
    if(response.ok&&response.headers.get('content-type')?.includes('application/json'))config=await response.json();
  }catch{ /* The built-in mapping keeps local and DEV traffic on their own origin. */ }
  apiOrigin=resolveApiOrigin(config.apiOrigin,location.origin);
}
