import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { Inventario } from './inventario';

describe('Inventario: respuestas de tiendas', () => {
  let component: Inventario;
  let receive: (data: any) => void;
  let service: any;
  let removeListener: jasmine.Spy;
  const inventory = [{ cCodigoBarra: '123', cTalla: 'M', cStock: { A: 5, B: 9 } }];

  beforeEach(() => {
    removeListener = jasmine.createSpy('removeListener');
    const socket: any = {
      socketID: 'test',
      onUpdateInventory: (callback: (data: any) => void) => {
        receive = callback;
        return removeListener;
      }
    };
    service = {
      getStores: () => of([
        { serie: 'A', nombre: 'Tienda A', marca: 'BBW' },
        { serie: 'B', nombre: 'Tienda B', marca: 'BBW' },
        { serie: 'C', nombre: 'Tienda C', marca: 'BBW' },
        { serie: 'D', nombre: 'Otra marca', marca: 'VS' }
      ]),
      callInventory: jasmine.createSpy().and.returnValue(of({ online: [{ tiendaId: 'A' }, { tiendaId: 'B' }] })),
      callUpdateInventory: jasmine.createSpy().and.returnValue(of({ inventory }))
    };
    component = new Inventario(socket, service, {exportFile:()=>Promise.resolve(true)} as any);
    component.ngOnInit();
    component.selectedStore = { key: 'BBW' };
  });

  afterEach(() => component.ngOnDestroy());

  it('muestra el inventario parcial y excluye el stock anterior de tiendas pendientes', fakeAsync(() => {
    component.onSendInventory();
    receive({ serieStore: 'A' });
    tick(89999);
    expect(component.isLoading).toBeTrue();
    tick(1);
    expect(component.isLoading).toBeFalse();
    expect(component.inventoryTimedOut).toBeTrue();
    expect(component.dataInventory[0].cStock).toEqual({ A: 5 });
    expect(component.datosExportar[0]['Tienda A']).toBe(5);
    expect(component.datosExportar[0]['Tienda B']).toBeUndefined();
    expect(component.expDisplayedColumnsInventory).toContain('A');
    expect(component.expDisplayedColumnsInventory).not.toContain('B');
    expect(component.pendingInventoryStores).toEqual([
      { serie: 'B', nombre: 'Tienda B', online: true },
      { serie: 'C', nombre: 'Tienda C', online: false }
    ]);
  }));

  it('reinicia el plazo de 1 minuto y medio cuando llega una nueva respuesta', fakeAsync(() => {
    component.onSendInventory();
    tick(60000);
    receive({ serieStore: 'A' });
    tick(89999);
    expect(component.isLoading).toBeTrue();
    tick(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('termina inmediatamente al recibir todas las tiendas y no cuenta duplicados', fakeAsync(() => {
    component.onSendInventory();
    receive({ serieStore: 'A' });
    receive({ serieStore: 'A' });
    receive({ serieStore: 'D' });
    expect(component.countOnlienStore).toBe(1);
    expect(service.callUpdateInventory).toHaveBeenCalledTimes(1);
    receive({ serieStore: 'B' });
    expect(component.isLoading).toBeFalse();
    tick(90000);
    expect(component.inventoryTimedOut).toBeFalse();
    expect(component.dataInventory[0].cStock).toEqual({ A: 5, B: 9 });
  }));

  it('libera la pantalla aunque ninguna tienda responda', fakeAsync(() => {
    component.onSendInventory();
    tick(90000);
    expect(component.isLoading).toBeFalse();
    expect(component.dataInventory).toEqual([]);
    expect(component.pendingInventoryStores.length).toBe(3);
  }));

  it('incorpora las respuestas tardías de la misma consulta', fakeAsync(() => {
    component.onSendInventory();
    receive({ serieStore: 'A' });
    tick(90000);
    receive({ serieStore: 'B' });
    expect(component.isLoading).toBeFalse();
    expect(component.countOnlienStore).toBe(2);
    expect(component.dataInventory[0].cStock).toEqual({ A: 5, B: 9 });
    expect(component.pendingInventoryStores.map(store => store.serie)).toEqual(['C']);
  }));

  it('conserva los eventos recibidos antes de la lista de tiendas online', fakeAsync(() => {
    const roster = new Subject<any>();
    service.callInventory.and.returnValue(roster);
    component.onSendInventory();
    receive({ serieStore: 'A' });
    expect(service.callUpdateInventory).not.toHaveBeenCalled();
    roster.next({ online: [{ tiendaId: 'A' }] });
    expect(component.countOnlienStore).toBe(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('cancela respuestas HTTP de consultas anteriores al consultar de nuevo', fakeAsync(() => {
    const oldResponse = new Subject<any>();
    service.callUpdateInventory.and.returnValue(oldResponse);
    component.onSendInventory();
    receive({ serieStore: 'A' });
    tick(90000);
    component.onSendInventory();
    oldResponse.next({ inventory });
    expect(component.countOnlienStore).toBe(0);
    expect(component.dataInventory).toEqual([]);
    tick(90000);
  }));

  it('mantiene pendiente una tienda cuyo consolidado falla y libera la carga', fakeAsync(() => {
    service.callUpdateInventory.and.returnValue(throwError(() => new Error('Sin respuesta')));
    spyOn(console, 'error');
    component.onSendInventory();
    receive({ serieStore: 'A' });
    tick(90000);
    expect(component.countOnlienStore).toBe(0);
    expect(component.isLoading).toBeFalse();
    expect(component.pendingInventoryStores.length).toBe(3);
  }));

  it('limpia el temporizador y el listener al salir de la pantalla', fakeAsync(() => {
    component.onSendInventory();
    component.ngOnDestroy();
    tick(90000);
    expect(component.inventoryTimedOut).toBeFalse();
    expect(removeListener).toHaveBeenCalled();
  }));
});
