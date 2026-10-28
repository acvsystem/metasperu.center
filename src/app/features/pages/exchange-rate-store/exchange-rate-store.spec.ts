import { of, throwError } from 'rxjs';
import { ExchangeRateStore } from './exchange-rate-store';

describe('Exchange rate unavailable data', () => {
  it('handles an empty SUNAT response without an unhandled exception', async () => {
    const page = new ExchangeRateStore({ postTipoCambioSunat: () => of({}) } as any, {} as any);
    await page.cargarTipoCambio('2026-10-27');
    expect(page.tcSunat).toBe('');
    expect(page.isNotification).toBeTrue();
  });
  it('shows a message when the rate request fails', async () => {
    const page = new ExchangeRateStore({ postTipoCambioSunat: () => throwError(() => new Error('offline')) } as any, {} as any);
    await page.cargarTipoCambio('2026-10-27');
    expect(page.isNotification).toBeTrue();
    expect(page.typeNotification).toBe('warning');
  });
  it('accepts an empty store response without reading row zero', () => {
    let respond!: (rows: any[]) => void;
    const page = new ExchangeRateStore({ postTipoCambioSunat: () => of({ data: { venta: '3.80' } }), getStores: () => of([]) } as any,
      { onResponseExchangeRate: (callback: (rows: any[]) => void) => respond = callback } as any);
    page.ngOnInit();
    expect(() => respond([])).not.toThrow();
    expect(page.tcActual).toBe('');
  });
});
