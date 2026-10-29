import { TestBed } from '@angular/core/testing';
import { DraftStore } from './draft-store';
import { AuthService } from '../auth/auth.service';

describe('Draft ownership',()=>{
  let account:any={id:1};
  beforeEach(()=>{account={id:1};TestBed.configureTestingModule({providers:[{provide:AuthService,useValue:{user:()=>account}}]});});
  afterEach(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('center-draft-v1:'))localStorage.removeItem(key);localStorage.removeItem('horario_metas_peru');});
  it('restores only the same account and store without adopting legacy drafts',()=>{
    const drafts=TestBed.inject(DraftStore);localStorage.setItem('horario_metas_peru','["legacy"]');
    drafts.save('QA01','schedule',{rows:['own']});
    expect(drafts.read('QA02','schedule')).toBeNull();
    account={id:2};expect(drafts.read('QA01','schedule')).toBeNull();
    account={id:1};expect(drafts.read('QA01','schedule')).toEqual({rows:['own']});
    expect(localStorage.getItem('horario_metas_peru')).toBe('["legacy"]');
  });
  it('cannot access drafts using an unverified username',()=>{
    const drafts=TestBed.inject(DraftStore);account={username:'old-user'};
    expect(()=>drafts.save('QA01','schedule',[])).toThrow();expect(()=>drafts.read('QA01','schedule')).toThrow();
  });
});
