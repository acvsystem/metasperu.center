import {resolveApiOrigin} from './runtime-config';
describe('API environment isolation',()=>{
  it('keeps local and staging calls on their own origin, without using production',()=>{
    expect(resolveApiOrigin('auto','http://localhost:4900')).toBe('http://localhost:4900');
    expect(resolveApiOrigin('auto','https://dev.metasperu.net.pe')).toBe('https://dev.metasperu.net.pe');
    expect(resolveApiOrigin('auto','https://metasperu.net.pe')).toBe('https://api.metasperu.net.pe');
  });
  it('rejects arbitrary token destinations and cleartext non-local origins',()=>{
    expect(()=>resolveApiOrigin('https://external.invalid','https://dev.metasperu.net.pe')).toThrow();
    expect(()=>resolveApiOrigin('same-origin','http://dev.metasperu.net.pe')).toThrow();
  });
});
