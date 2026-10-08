# PharmaBoost 2.28

## Actualización de despliegue 2.29

Configuración Node.js y MySQL para Railway y frontend para Vercel. Sigue [la guía actualizada](docs/RAILWAY_VERCEL.md). La instalación de producción crea un administrador propio sin cargar cuentas de ejemplo. Informe: docs/PharmaBoost_Cambios_v2_29.docx.

## Versión 2.28 — 3 de octubre de 2026

Centro de reportes con cinco apartados, filtros específicos, buscador de productos en reportes y movimientos, filtros legibles en exportaciones e impresión tabular. 21 pruebas unitarias aprobadas; tarjetas y búsqueda verificadas en navegador. Informe: docs/PharmaBoost_Cambios_v2_28.docx. Recarga con Ctrl+F5; sin migración MySQL.


## Versión 2.27 — 3 de octubre de 2026

Catálogo edita únicamente datos descriptivos, asignación e imagen. Inventario permite crear productos y modificar precio, descuentos, unidad y máximo mediante Precio y configuración. Las existencias se registran mediante movimientos. El servidor rechaza cambios financieros desde la edición de Catálogo. 21 pruebas unitarias, suite MySQL y 50 comprobaciones HTTP aprobadas; formularios verificados en navegador. Informe: docs/PharmaBoost_Cambios_v2_27.docx.


## Versión 2.26 — 3 de octubre de 2026

Reportes generales y específicos de pedidos, inventario, kardex y compras por proveedor, filtros, detalle y exportación XLSX, PDF, CSV e impresión. Unidad de presentación y máximo sugerido por producto. 21 pruebas unitarias, suite MySQL transaccional y 50 comprobaciones HTTP aprobadas. Confirmación de descarga en navegador e impresión pendiente. Alcance: pedidos comerciales; no incluye cobros, impuestos ni factura electrónica. Informe: docs/PharmaBoost_Cambios_v2_26.docx. Recarga con Ctrl+F5.


## Versión 2.25 — 1 de octubre de 2026

Proveedores: crear, buscar, editar y desactivar. Inventario selecciona proveedores activos por identificador y conserva el nombre histórico. Acceso para Administración y Ventas; persistencia en audit sin migración. 15 pruebas unitarias y suite MySQL de operaciones aprobadas. Informe: PharmaBoost_Cambios_v2_25.docx. Recarga con Ctrl+F5.


## Versión 2.24 — 1 de octubre de 2026

Formulario de inventario: motivos compatibles según entrada/salida, campos de compra solo para entradas y requisitos dinámicos. 15 pruebas unitarias aprobadas. Recarga con Ctrl+F5. Informe: PharmaBoost_Cambios_v2_24.docx.


## Versión 2.23 — 1 de octubre de 2026

Rúbrica de seguridad: bloqueo persistente de cinco minutos tras cinco fallos, contador visible y 15 pruebas unitarias + 50 comprobaciones HTTP aprobadas. Suites MySQL de bloqueo y operaciones aprobadas con rollback. Consultas de evidencia en database/consultas_workbench.sql. Informe: PharmaBoost_Cambios_v2_23.docx. Recargar con Ctrl+F5 y reiniciar servidores antiguos.


## Versión 2.22 — 26 de septiembre de 2026

Retirados Olvidé mi contraseña y el flujo de solicitudes de recuperación de v2.21 por solicitud del usuario. La edición administrativa de contraseñas se conserva. Reiniciar servidor y recargar con Ctrl+F5. Informe: PharmaBoost_Cambios_v2_22.docx. 13 pruebas unitarias aprobadas.


## Versión 2.21 — 26 de septiembre de 2026

Login con Olvidé mi contraseña y solicitudes atendidas por Administración en Equipo y usuarios. No envía correo automático. Reiniciar servidor y recargar con Ctrl+F5. Informe nuevo: PharmaBoost_Cambios_v2_21.docx. Pruebas unitarias y recuperación transaccional aprobadas; formulario revisado en navegador.


## Versión 2.20 — 25 de septiembre de 2026

Inventario con motivos, proveedor, referencia, costo promedio ponderado y ganancia estimada por unidad. Precio opcional por porcentaje sobre costo; costos restringidos a Administración y Ventas. Validaciones reforzadas y límite de acceso por IP. 13 pruebas unitarias y pruebas MySQL transaccionales aprobadas; HTTP completo y revisión visual pendientes. Reiniciar servidor y recargar con Ctrl+F5. Informe: docs/PharmaBoost_Cambios_v2_20.docx.


Novedad 2.19: corregido el recorte del contenido por la diagonal de login/registro y separados los botones. [Informe](docs/PharmaBoost_Cambios_v2_19.docx). Recarga con Ctrl+F5.

**Versión 2.18: modo sin conexión restaurado.** Inicia sesión con conexión para guardar los datos y habilitar reapertura local durante 12 horas. Pedidos y visitas quedan pendientes hasta sincronizar; la administración requiere conexión. Se añade transición diagonal entre login y registro. [Guía actualizada](docs/PharmaBoost_Cambios_v2_18.docx). Sustituye la restricción descrita en 2.12.

Novedad 2.16: repulsión más pequeña, radio de 90 px y desplazamiento máximo de 28 px; se conservan 600 partículas. [Informe](docs/PharmaBoost_Cambios_v2_16.docx).

Novedad 2.15: 600 partículas pequeñas en el login, con el mismo efecto de repulsión. [Informe de cambios](docs/PharmaBoost_Cambios_v2_15.docx). Recarga con Ctrl+F5.

Novedad 2.14: 216 partículas pequeñas de 2 a 4 píxeles en el login, con repulsión al cursor. [Informe de cambios](docs/PharmaBoost_Cambios_v2_14.docx). Recarga con Ctrl+F5.

Novedad 2.13: Repel Effect sustituye al parallax del login. Las figuras se apartan del cursor; texto y formulario permanecen fijos. Respeta movimiento reducido y dispositivos táctiles. [Informe de cambios](docs/PharmaBoost_Cambios_v2_13.docx).

**Versión 2.12: conexión al servidor obligatoria.** Retirado el acceso por instantáneas y el respaldo de navegación del service worker. Pedidos y visitas requieren respuesta del servidor. Se conservan borradores y transmisiones interrumpidas para recuperación. Las instrucciones históricas sobre trabajo sin conexión quedan sustituidas por [esta guía](docs/PharmaBoost_Cambios_v2_12.docx). Recarga con Ctrl+F5 y cierra pestañas de versiones anteriores.

Novedad 2.11: parallax con ratón en el panel visual del login, compatible con movimiento reducido y formulario fijo. Retirados los mensajes promocionales sobre uso sin conexión; se conserva la recuperación de pendientes. [Informe de cambios](docs/PharmaBoost_Cambios_v2_11.docx). Recarga con Ctrl+F5.

Novedad 2.10: marco oscuro para fotografías, recuadro blanco redondeado y categorías adaptadas al tema. [Informe de cambios](docs/PharmaBoost_Cambios_v2_10.docx). Recarga con Ctrl+F5.

Novedad 2.9: cabecera con fecha completa, selector de tema sol/luna, Mi cuenta y avatar; diseño adaptable a móviles. El selector sustituye al botón flotante. [Cambios y guía de uso](docs/PharmaBoost_Cambios_v2_9.docx). Recarga con Ctrl+F5.

Novedades 2.8: **Inventario**, **Devoluciones**, descuentos por cantidad desde editar producto, favoritos por cuenta/navegador y avisos de nuevos pedidos para Administración y Ventas. Los reportes incluyen valor devuelto y neto. [Manual completo actualizado](docs/PharmaBoost_Manual_Completo_v2_8.docx).

Registra entradas con cantidades reales antes de despachar: el stock se descuenta al pasar a Despachado, no al capturar pedidos. Las devoluciones solo se registran sobre pedidos Entregados; cuarentena no aumenta disponibilidad. No se inventan saldos iniciales. Reinicia Node.js y recarga con Ctrl+F5, sin reinstalar ni recrear MySQL. Los eventos operativos se almacenan en `audit`, preservando la base existente. `npm run test:operations` verifica el flujo en una transacción y revierte sus datos de prueba.

Reportes 2.7: botón **Descargar PDF** con descarga directa, **Aplicar período**, **Limpiar filtros** y seis indicadores. PDF y CSV utilizan los filtros aplicados. Guía de cambios: [PharmaBoost_Cambios_v2_7.docx](docs/PharmaBoost_Cambios_v2_7.docx). Esta guía sustituye las instrucciones de filtros automáticos del manual 2.6. La biblioteca PDF-Lib 1.17.1 se distribuye localmente en `web/vendor` con su licencia MIT; no usa CDN.

Actualización 2.6: seguimiento comercial con historial en MySQL, comprobantes imprimibles, reportes filtrados y modo claro/oscuro persistente. Manual completo: [PharmaBoost_Manual_Completo_v2_6.docx](docs/PharmaBoost_Manual_Completo_v2_6.docx).

Para una instalación ya configurada, reinicia el servidor y recarga con Ctrl+F5. No recrees la base. El seguimiento utiliza eventos estructurados de la tabla `audit`; conserva pedidos y fotografías. Solo Administración y Ventas pueden cambiar etapas. Los pedidos en revisión de precios solo admiten cancelación; no se integran automáticamente con DP.

Versión con HTML, CSS, JavaScript, servidor Node.js y base MySQL 8. Conserva el diseño del proyecto anterior. No necesita Python, React, PHP ni un proceso de compilación. La única dependencia del servidor es el controlador `mysql2`.

## Inicio en Windows

1. Verifica que MySQL80 esté iniciado y que tengas Node.js 22 o superior.
2. Abre PowerShell en esta carpeta y ejecuta `powershell -ExecutionPolicy Bypass -File .\configurar.ps1`.
3. Introduce tu usuario administrador de MySQL y su contraseña en el diálogo local. El instalador crea `pharmaboost_js`, 15 tablas, datos de ejemplo y una cuenta dedicada con permisos limitados. No guarda la contraseña del administrador. La configuración de la aplicación queda en `.env`.
4. Ejecuta `npm start` o abre `iniciar.bat`.
5. Abre http://localhost:3080. No abras `web/index.html` con doble clic: el servidor conecta la interfaz con MySQL.

Si ya existe `.env`, el instalador lo conserva. Para una configuración manual copia `.env.example` a `.env`, completa las credenciales locales y ejecuta `npm ci`, `npm run setup` y `npm start`. `npm run setup` requiere permisos de creación de tablas para la primera instalación. El esquema usa el nombre fijo `pharmaboost_js`.

## MySQL Workbench

Abre tu conexión local habitual (127.0.0.1, puerto 3306), ejecuta `database/schema.sql` si no usaste el instalador y actualiza el panel Schemas. La aplicación necesita además los datos iniciales que inserta `npm run setup`. Ejecuta `database/consultas_workbench.sql` para consultar usuarios, promociones, pedidos y auditoría. Workbench administra MySQL; no reemplaza al servicio MySQL80.

Para ver el modelo: Database → Reverse Engineer → conexión local → esquema `pharmaboost_js` → Finish. Las claves foráneas permiten generar el diagrama EER. Para una copia de seguridad usa Server → Data Export → `pharmaboost_js` → Export to Self-Contained File, incluyendo estructura y datos. El archivo contiene hashes de acceso y datos de negocio; guárdalo localmente.

## Usuarios iniciales

Todos utilizan la contraseña inicial `Pharma2026!`.

| Correo | Rol | Fabricante |
|---|---|---|
| admin@pharmaboost.local | Administrador | Deutsche Pharma |
| ventas@pharmaboost.local | Ventas y Marketing | Deutsche Pharma |
| agente@pharmaboost.local | Agente comercial | Laboratorios Nova |
| agente2@pharmaboost.local | Agente comercial | Vitalis Pharma |
| tic@pharmaboost.local | Operaciones TIC | Deutsche Pharma |

Estas son cuentas de la aplicación, no usuarios de MySQL Workbench. El responsable de tienda no tiene cuenta propia: confirma el pedido en el dispositivo del agente. El administrador puede crear cuentas, editarlas, desactivarlas y cambiar contraseñas. Para uso real, cambia las contraseñas iniciales.

## Funciones implementadas

- Inicio de sesión con cookies HttpOnly, contraseñas PBKDF2 con salt, sesiones de 12 horas y límites de intentos.
- Dashboard con pedidos, valores, tiendas visitadas y cola pendiente.
- Gestión de usuarios, solicitudes de registro con aprobación y fabricantes.
- Promociones con vigencia, subgama, agentes, tiendas y aviso de solapamiento.
- Catálogo, filtros, creación y edición de productos, fotos guardadas en MySQL y alternativa para imágenes faltantes.
- Consulta de tiendas y registro de visitas sin pedido.
- Pedidos con confirmación del responsable, cantidades, total, detalle, filtros y exportación CSV.
- Borradores y cola IndexedDB por usuario. Service worker para abrir la interfaz sin red tras el primer acceso. Reintentos automáticos con control de duplicados en MySQL.
- Validación en servidor de roles, fabricante, subgama, tienda y vigencia. Cambios de precio de pedidos offline quedan en revisión.
- Importaciones JSON con validación por fila y auditoría con filtros. Ejemplos en `examples/`.

## Prueba guiada

1. Entra como agente y elige una tienda.
2. Para comprobar el modo offline, interrumpe la conexión de red después de cargar la aplicación.
3. Regresa a Tiendas, toma un pedido, agrega productos y marca la confirmación del responsable.
4. Comprueba que el pedido está pendiente en Sincronización. Recupera la conexión de red: la cola se envía a MySQL.
5. Entra como Ventas y consulta el pedido, su total y detalle.
6. Entra como administrador para crear una promoción, asignar productos y revisar las solicitudes de acceso.

## Estructura

- `web/`: HTML, CSS y JavaScript de la interfaz.
- `server/`: servidor HTTP, reglas de negocio, seguridad y acceso a MySQL.
- `database/`: esquema SQL y consultas para Workbench.
- `scripts/`: instalación y datos ficticios iniciales.
- `tests/`: pruebas de validación e integración.
- `docs/`: lista de usuarios e informes Word de cambios por versión.

## Validación y alcance

`npm test` ejecuta 4 pruebas unitarias. `npm run test:integration` realiza 33 comprobaciones contra una instancia MySQL desechable en el puerto 3307 y el servidor indicado por TEST_URL (por defecto http://localhost:3080). Requiere inicializar esa instancia con los datos de demostración y ejecuta escrituras: no usar con una base de trabajo. La instancia temporal utilizada durante el desarrollo no se incluye en la entrega.

Validado también en Edge: acceso, ocho módulos, pedido offline, sincronización, recarga sin red y vista móvil de 390 px. La configuración final del MySQL del usuario requiere ejecutar el instalador con sus credenciales locales. No se migraron datos de la base anterior.

Abaco y DP no tienen conexión real: se incluyen importaciones manuales. La versión no implementa logística ni cumplimiento posterior, según el análisis. La cola offline es local al navegador: no borres los datos del sitio con pedidos pendientes. La revocación de acceso no puede comprobarse sin conexión hasta recuperar la red; el acceso local tiene una ventana de 12 horas. Para desplegar fuera de este equipo faltan HTTPS, definición de APIs reales, copias programadas y revisión operativa con TIC. En producción usa NODE_ENV=production detrás de HTTPS y configura APP_ORIGIN.

Cada nueva actualización debe entregar un Word nuevo en `docs/`, según la preferencia registrada en `AGENTS.md`.

## Catálogo público desde la versión 2.2

En el inicio pulsa **Ver productos sin cuenta**, o entra a http://localhost:3080/catalogo.html. Cualquier visitante del sitio puede ver los productos, precios, imágenes y descripciones; buscar, filtrar y ordenar. Crear pedidos y administrar datos requiere iniciar sesión. La consulta pública necesita conexión con el servidor y no publica automáticamente el proyecto en Internet. Para aplicar esta actualización reinicia el servidor y recarga con Ctrl+F5. No requiere cambios de base de datos.



## Catálogo ampliado en 2.4

Incluye 20 productos. Los 12 nuevos tienen ilustraciones locales y precios iniciales editables. Conserva las fotografías existentes. En bases previas ejecuta node --env-file=.env scripts/expand-catalog.js y recarga con Ctrl+F5. Las bases nuevas reciben los productos al instalarse.


## Actividad inicial solicitada en 2.5

Para cargar los seis pedidos de ejemplo y una visita sin pedido, ejecuta node --env-file=.env scripts/load-activity.js. Requiere las promociones iniciales activas, agentes, tiendas y productos asignados. No duplica registros y no envía pedidos a Abaco o DP. En el equipo de desarrollo esta carga ya fue aplicada.

#   P h a r m a B o o s t  
 
#   P h a r m a B o o s t  
 #   P h a r m a B o o s t  
 