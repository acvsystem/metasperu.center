export function loginErrorMessage(status: number): string {
  if (status === 0) return 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';
  if (status === 401) return 'Usuario o contraseña incorrectos.';
  if (status === 400 || status === 422) return 'Revisa el usuario y la contraseña antes de ingresar.';
  if (status === 403) return 'El acceso no está autorizado. Consulta con tu administrador.';
  if (status === 404) return 'No se encontró la ruta de acceso. Revisa la configuración del servidor.';
  if (status === 429) return 'Demasiados intentos. Espera unos minutos antes de ingresar.';
  return 'El servicio de acceso no está disponible. Intenta de nuevo en unos momentos.';
}
