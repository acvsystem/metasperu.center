export class RecordingBuffer {
  private events: Array<{value:unknown;bytes:number}>=[];
  private pending?: {sequenceNumber:number;events:unknown[]};
  private pendingBytes=0;
  private totalBytes=0;
  private sequence=0;
  constructor(private readonly maxEvents=1000,private readonly batchSize=25,
    private readonly maxBytes=4*1024*1024,private readonly batchBytes=750*1024) {}
  push(event:unknown) {
    let bytes:number;
    try {const json=JSON.stringify(event);if(json===undefined)return false;bytes=new TextEncoder().encode(json).length+1;}
    catch{return false;}
    if(this.events.length+(this.pending?.events.length || 0)>=this.maxEvents||bytes>this.batchBytes||this.totalBytes+bytes>this.maxBytes)return false;
    this.events.push({value:event,bytes});this.totalBytes+=bytes;return true;
  }
  take() {
    if(!this.pending&&this.events.length){
      const batch:unknown[]=[];this.pendingBytes=0;
      while(this.events.length&&batch.length<this.batchSize&&this.pendingBytes+this.events[0].bytes<=this.batchBytes){
        const event=this.events.shift()!;batch.push(event.value);this.pendingBytes+=event.bytes;
      }
      this.pending={sequenceNumber:++this.sequence,events:batch};
    }
    return this.pending;
  }
  acknowledge(sequence:number) {
    if(this.pending?.sequenceNumber===sequence){this.totalBytes-=this.pendingBytes;this.pendingBytes=0;this.pending=undefined;}
  }
}
