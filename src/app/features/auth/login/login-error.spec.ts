import { loginErrorMessage } from './login-error';

describe('Login error diagnosis', () => {
  it('does not blame the password when the API route is missing', () => {
    expect(loginErrorMessage(404)).toContain('ruta de acceso');
    expect(loginErrorMessage(404)).not.toContain('contraseña incorrectos');
  });

  it('reserves invalid-credential feedback for rejected authentication', () => {
    expect(loginErrorMessage(401)).toBe('Usuario o contraseña incorrectos.');
    expect(loginErrorMessage(503)).toContain('servicio de acceso');
    expect(loginErrorMessage(500)).toContain('servicio de acceso');
    expect(loginErrorMessage(504)).toContain('servicio de acceso');
  });

  it('distinguishes network, permissions and rate limits', () => {
    expect(loginErrorMessage(0)).toContain('conectar');
    expect(loginErrorMessage(403)).toContain('autorizado');
    expect(loginErrorMessage(429)).toContain('Demasiados intentos');
    expect(loginErrorMessage(422)).toContain('Revisa');
  });
});
