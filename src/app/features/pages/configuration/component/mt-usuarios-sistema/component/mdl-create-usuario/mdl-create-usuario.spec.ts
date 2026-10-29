import { FormBuilder } from '@angular/forms';
import { Subject,of } from 'rxjs';
import { MdlCreateUsuario } from './mdl-create-usuario';

describe('User creation',()=>{
  it('prevents double submission and preserves the form when saving fails',()=>{
    const request=new Subject<any>();
    const dialog:any={close:jasmine.createSpy(),disableClose:false};
    const service:any={getMenu:()=>of([]),createUsuario:jasmine.createSpy().and.returnValue(request)};
    const modal=new MdlCreateUsuario(new FormBuilder(),dialog,service);
    const data={USUARIO:'qa-user',PASSWORD:'a-long-passphrase',EMAIL:'qa@example.invalid',NIVEL:'TIENDA',CODE_STORE:'QA01',DEFAULT_PAGE:'dashboard'};
    modal.form.setValue(data);modal.crear();modal.crear();
    expect(service.createUsuario).toHaveBeenCalledTimes(1);expect(modal.saving).toBeTrue();expect(dialog.disableClose).toBeTrue();
    request.error({status:409,error:{message:'El nombre de usuario ya existe.'}});
    expect(dialog.close).not.toHaveBeenCalled();expect(modal.form.getRawValue()).toEqual(data);
    expect(modal.saveError).toContain('ya existe');expect(modal.saving).toBeFalse();expect(dialog.disableClose).toBeFalse();
    modal.ngOnDestroy();
  });
});
