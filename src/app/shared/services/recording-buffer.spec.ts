import { RecordingBuffer } from './recording-buffer';
describe('Recording delivery buffer',()=>{
  it('retries the same batch identifier until confirmed',()=>{
    const queue=new RecordingBuffer();queue.push({type:1});const first=queue.take();
    queue.push({type:2});expect(queue.take()).toBe(first);
    queue.acknowledge(first!.sequenceNumber);expect(queue.take()!.sequenceNumber).toBe(2);
  });
  it('bounds memory while the server is unavailable',()=>{
    const queue=new RecordingBuffer(2,1);expect(queue.push(1)).toBeTrue();queue.take();expect(queue.push(2)).toBeTrue();expect(queue.push(3)).toBeFalse();
  });
  it('bounds bytes as well as event count and splits large batches',()=>{
    const queue=new RecordingBuffer(100,25,100,60);
    expect(queue.push('a'.repeat(40))).toBeTrue();expect(queue.push('b'.repeat(40))).toBeTrue();
    expect(queue.push('c'.repeat(40))).toBeFalse();
    const first=queue.take()!;expect(first.events.length).toBe(1);queue.acknowledge(first.sequenceNumber);
    expect(queue.push('c'.repeat(40))).toBeTrue();expect(queue.take()!.events.length).toBe(1);
    expect(queue.push('d'.repeat(70))).toBeFalse();
  });
});
