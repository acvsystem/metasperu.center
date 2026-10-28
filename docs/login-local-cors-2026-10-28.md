# Corrección del acceso local al servidor real

El navegador mostraba un error de conexión al ingresar desde `http://localhost:4170`. La API respondía 403 al preflight de autenticación y no enviaba `Access-Control-Allow-Origin`: el origen local no estaba en la lista permitida de `auth-service`.

Se agregaron únicamente `http://localhost:4170` y `http://127.0.0.1:4170` a `CORS_ORIGINS` del servicio desplegado, conservando los valores anteriores. Se respaldó el archivo privado y el estado de PM2, se reinició solo `auth-service` y se guardó su configuración en PM2. No se modificaron contraseñas ni bases de datos. La verificación del cambio confirmó que los demás procesos conservaron sus PID.

Verificación pública posterior:

| Origen | OPTIONS login | Resultado |
| --- | --- | --- |
| `http://localhost:4170` | 204 | Origen exacto permitido |
| `http://127.0.0.1:4170` | 204 | Origen exacto permitido |
| `https://inventory.metasperu.net.pe` | 204 | Acceso anterior conservado |
| `https://untrusted.example` | 403 | Continúa bloqueado |

Además se abrió Center local en un navegador aislado y se envió un intento con una cuenta ficticia inexistente a la API real. La API devolvió 401 con el origen permitido y el formulario mostró «Usuario o contraseña incorrectos» en lugar del error de conexión. Esto confirma el transporte de autenticación; no valida el ingreso con una cuenta real.

La evidencia y el procedimiento con respaldo/restauración están en `C:/Users/W10/Documents/Codex/2026-10-23/qu/outputs/center-login-20261028/`. Los secretos permanecen en archivos protegidos del servidor. Los despliegues futuros deben conservar estos dos orígenes si se mantiene la necesidad de probar contra la API de producción desde el puerto 4170. Otros puertos no quedaron habilitados.
