# Mejoras de Center

Orden solicitado: primero adaptar el diseño de Inventario; después continuar con funcionamiento, seguridad y rendimiento.

## Diseño

- Reutilizar el azul #173e76, tipografía DM Sans, fondos claros, bordes suaves y tema oscuro de Inventario.
- Menú lateral fijo en escritorio y desplegable en móvil, agrupado por áreas y respetando las opciones recibidas del servidor.
- Cabecera con contexto y usuario; cerrar overlays al salir de sesión.
- Login en español, accesible, con el mismo lenguaje visual; inputs y selects compactos.
- Estilos compartidos para tablas, filtros, modales y paginadores sin eliminar controles ni información de negocio.
- Verificar escritorio, móvil, tema oscuro, navegación, formularios y modales en navegador aislado.

## Funcionamiento y seguridad

- Corregir redirección de login, expiración, destino del bearer, conexión única y limpieza de listeners.
- Autorizar acciones y tiendas en el backend; proteger grabaciones y separar identidad de personas y agentes.
- Retirar secretos del código y preparar configuración privada y rotación coordinada, sin romper los otros servicios.
- Proteger cambios sin guardar y trabajos simultáneos; mejorar validación, idempotencia, límites, auditoría y cobertura.
- Ordenar dependencias y carga de módulos; medir antes de afirmar mejoras de rendimiento.

Los cambios de credenciales y protocolo de agentes requieren una migración coordinada con las instalaciones existentes. No se activarán en producción mediante una actualización parcial de Center.

## Criterios de conservación

No modificar datos reales, enviar correos de prueba ni ejecutar comandos de tiendas durante QA. Mantener el alcance por roles y todas las operaciones existentes. Usar API y agentes simulados para las pruebas de interfaz; cubrir permisos con pruebas de servidor aisladas. Conservar cambios locales preexistentes ajenos al trabajo.
