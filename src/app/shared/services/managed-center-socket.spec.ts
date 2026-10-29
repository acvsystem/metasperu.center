import { TestBed } from '@angular/core/testing';
import { SessionState } from '../../core/auth/session-state';
import { CENTER_SOCKET_FACTORY, ManagedCenterSocket } from './managed-center-socket';

describe('Managed Center connections', () => {
  it('creates one socket, connects only with a session, and disconnects after expiry', () => {
    const socket: any = { active:false, on:()=>{}, disconnect:jasmine.createSpy(), connect:jasmine.createSpy().and.callFake(()=>socket.active=true) };
    const factory=jasmine.createSpy().and.returnValue(socket);
    TestBed.configureTestingModule({providers:[{provide:CENTER_SOCKET_FACTORY,useValue:factory}]});
    const state=TestBed.inject(SessionState);
    const client=TestBed.runInInjectionContext(()=>new ManagedCenterSocket('/s1/socket/'));
    TestBed.tick();expect(socket.connect).not.toHaveBeenCalled();
    state.open('TEST');TestBed.tick();client.conectar();client.conectar();
    expect(factory).toHaveBeenCalledTimes(1);expect(socket.connect).toHaveBeenCalledTimes(1);
    state.expire();TestBed.tick();expect(client.connection()).toBe('disconnected');expect(socket.disconnect).toHaveBeenCalled();
  });
});
