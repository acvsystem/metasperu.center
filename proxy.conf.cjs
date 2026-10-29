const targets={s1:3002,s2:3000,s4:3003,s5:3004,s6:3006};
module.exports=Object.fromEntries(Object.entries(targets).flatMap(([prefix,port])=>[
  ['/'+prefix+'/center',{target:'http://127.0.0.1:'+port,secure:false}],
  ...(prefix==='s2'?[]:[['/'+prefix+'/socket',{target:'http://127.0.0.1:'+port,ws:true,secure:false,pathRewrite:{['^/'+prefix+'/socket']:'/socket.io'}}]])
]).concat([['/s2/auth/center',{target:'http://127.0.0.1:3000',secure:false}]]));
