# Historial de cambios

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

Inventario con motivos, proveedor, referencia, costo promedio ponderado y ganancia estimada por unidad. Precio opcional por porcentaje sobre costo; costos restringidos a Administración y Ventas. Validaciones reforzadas y límite de acceso por IP. 13 pruebas unitarias y pruebas MySQL transaccionales aprobadas; HTTP completo y revisión visual pendientes. Reiniciar servidor y recargar con Ctrl+F5. Informe: PharmaBoost_Cambios_v2_20.docx.


## Versión 2.19 — 20 de septiembre de 2026

- Margen proporcional para evitar que la diagonal recorte contenido en login y registro; separación entre botones.
- Verificado a 1920x900 y 390x844, sin desbordamiento horizontal. Conserva animación, partículas y modo sin conexión.
- Nuevo Word PharmaBoost_Cambios_v2_19.docx; sin cambios MySQL.

## Versión 2.18 — 20 de septiembre de 2026

- Transición diagonal login/registro, formularios conservados al alternar, registro sujeto a aprobación; diseño móvil y movimiento reducido. Trabajo visual preparado en 2.17 incluido en esta entrega.
- Restaurados instantáneas, acceso local durante 12 horas desde login, shell en caché y cola de pedidos/visitas con envío al reconectar.
- Pruebas aisladas de funcionamiento sin red y ocho unitarias aprobadas; navegación del nuevo login revisada.
- Nuevo Word PharmaBoost_Cambios_v2_18.docx; usuarios y esquema MySQL conservados.

## Versión 2.16 — 20 de septiembre de 2026

- Radio de repulsión reducido de 190 a 90 px y desplazamiento máximo de 78 a 28 px. Se mantienen 600 partículas.
- Verificado en Edge: desplazamiento reducido, retorno, texto fijo, movimiento reducido, temas, acceso y móvil.
- Nuevo Word PharmaBoost_Cambios_v2_16.docx. Sin cambios de MySQL.

## Versión 2.15 — 20 de septiembre de 2026

- Aumentadas las partículas del login de 216 a 600, conservando tamaño de 2 a 4 píxeles y repulsión.
- Verificado en Edge: cantidad, repulsión, retorno, texto fijo, movimiento reducido, temas, acceso y móvil.
- Nuevo Word PharmaBoost_Cambios_v2_15.docx. Sin cambios de MySQL.

## Versión 2.14 — 20 de septiembre de 2026

- 216 partículas circulares de 2 a 4 píxeles sustituyen las 12 figuras grandes del login; conserva repulsión, retorno y texto fijo.
- Verificado en Edge: cantidad, repulsión, retorno, posiciones fijas, movimiento reducido, temas, acceso y móvil.
- Nuevo Word PharmaBoost_Cambios_v2_14.docx; sin cambios de MySQL.

## Versión 2.13 — 20 de septiembre de 2026

- Repel Effect sustituye al parallax: partículas decorativas se alejan del cursor y vuelven a su posición.
- Texto y formulario fijos; soporte de movimiento reducido y dispositivos táctiles.
- Verificado en Edge: repulsión, retorno, posiciones estables, temas, acceso y móvil.
- Nuevo Word PharmaBoost_Cambios_v2_13.docx. Sin cambios de MySQL.

## Versión 2.12 — 20 de septiembre de 2026

- Conexión obligatoria: bloqueo de interacción, acceso solo con servidor, sin restauración de instantáneas.
- Retirada de caché offline y desregistro del service worker anterior.
- Envíos nuevos con comprobación previa y confirmación del servidor; recuperación de transmisiones interrumpidas y pendientes históricos.
- Probados desconexión, reconexión, fallo de servidor, catálogo público y semántica de envío. Sin cambios de esquema MySQL.
- Nuevo documento PharmaBoost_Cambios_v2_12.docx.

## Versión 2.11 — 20 de septiembre de 2026

- Parallax con ratón en el panel del login, formas decorativas y formulario fijo; sin movimiento en dispositivos táctiles ni con movimiento reducido.
- Retiradas promesas de funcionamiento sin conexión y tarjeta lateral; se conservan recuperación local y avisos operativos.
- Verificado en Edge: movimiento, formulario, reducción de movimiento, acceso, sincronización y móvil.
- Nuevo Word PharmaBoost_Cambios_v2_11.docx; sin cambios en MySQL.

## Versión 2.10 — 18 de septiembre de 2026

- Marco oscuro en imágenes del catálogo interno, público y vista previa; fotografías centradas con recuadro claro redondeado y proporciones conservadas.
- Categorías adaptadas al tema. Sin cambios en fotos originales ni MySQL.
- Revisado en Edge y catálogo público móvil de 390 píxeles; capturas inspeccionadas.
- Nuevo Word PharmaBoost_Cambios_v2_10.docx.

## Versión 2.9 — 18 de septiembre de 2026

- Cabecera con fecha completa, selector sol/luna, Mi cuenta y avatar; fecha y texto se adaptan al espacio disponible.
- Selector integrado en acceso y catálogo público; preferencia persistente y sin botón flotante.
- Verificado en Edge: temas, recarga, perfil, navegación, catálogo y móvil de 320/390 píxeles sin desbordamiento ni errores JavaScript.
- Nuevo documento PharmaBoost_Cambios_v2_9.docx; conserva manuales anteriores, cuentas y datos MySQL.

## Versión 2.8 — 17 de septiembre de 2026

- Inventario con entradas, salidas, mínimos, alertas y 200 movimientos recientes; stock descontado transaccionalmente al despachar. Sin saldos iniciales inventados.
- Devoluciones parciales/totales sobre pedidos entregados, límite acumulado por producto, cuarentena predeterminada y reintegro explícito. No genera reembolsos. Idempotencia por operación.
- Descuento porcentual por cantidad configurable por Administración; cálculo automático en borrador, validación en servidor y precios históricos conservados.
- Favoritos separados por cuenta y visitante, persistentes en el navegador.
- Avisos de pedidos nuevos para Administración/Ventas cada 30 segundos con la aplicación abierta, contador y lectura persistentes, avisos del navegador opcionales.
- Valor devuelto y neto en reportes, PDF y CSV; filtros por fecha de captura del pedido, tablas con cantidades originales.
- Ocho pruebas unitarias, integración transaccional con reversión y pruebas en Edge de vistas, formularios, favoritos, avisos, permisos, descuento y móvil.
- Manual completo nuevo: PharmaBoost_Manual_Completo_v2_8.docx. Conserva cuentas y documentos previos. No añade tablas ni frameworks; eventos guardados en MySQL audit.
- Límites: sin lotes, vencimientos, reservas, compras a proveedores, liberación de cuarentena, pagos ni notificaciones con navegador cerrado. Favoritos y lectura de avisos son locales.

## Versión 2.7 — 17 de septiembre de 2026

- Descarga directa de PDF con filtros aplicados, indicadores, tablas, criterios y numeración de páginas.
- Panel de filtros con Aplicar período y Limpiar filtros; rechazo de fechas invertidas conservando la consulta anterior.
- Seis indicadores de pedidos, incluyendo total del período y entregados. Sin indicadores de cobro: la aplicación no registra pagos.
- PDF-Lib 1.17.1 local, licencia MIT conservada; nueva versión de caché, sin cambios de tablas ni datos.
- Seis pruebas unitarias y verificación en Edge de PDF/CSV, filtros, fechas inválidas, temas, móvil y paginación con 95 filas.
- Documento nuevo: PharmaBoost_Cambios_v2_7.docx. Conserva el manual completo 2.6 y sustituye su instrucción de aplicar filtros automáticamente.

## Versión 2.6 — 17 de septiembre de 2026

- Modo claro y oscuro en acceso, aplicación y catálogo público, con preferencia local persistente.
- Seguimiento comercial independiente de la sincronización: pendiente, preparación, despachado, entregado y cancelado. Historial en MySQL con actor, fecha y observación; control de roles, transiciones y cambios concurrentes.
- Comprobante imprimible del pedido y opción Guardar como PDF del navegador.
- Reportes para Administración y Ventas por fecha de captura, promoción y agente; rankings de productos y agentes, CSV con los mismos filtros. Excluyen cancelados y revisión.
- Manual completo nuevo de 12 páginas, con cuentas iniciales, procedimientos, cambios, pruebas y límites.
- Verificación: seis pruebas unitarias, pruebas transaccionales con reversión y comprobación en Edge de temas, filtros, CSV, impresión, catálogo y móvil.
- No se alteraron productos, fotografías, contraseñas ni pedidos existentes. No requiere migración de tablas. No incluye inventario, facturación, despacho automático, edición de líneas confirmadas ni resolución de diferencias de precio.

## Versión 2.1

- Retirados el panel demo, los accesos rápidos por rol y las contraseñas visibles del inicio de sesión.
- Retirados la etiqueta demo, sus estilos y el simulador de desconexión. Se conserva el funcionamiento offline real.
- Nueva versión de caché de la interfaz sin borrar IndexedDB ni datos MySQL.
- Word nuevo con correo y contraseña inicial por cuenta. No se cambian contraseñas existentes.


## Versión 2.0 — 16 de septiembre de 2026

- Conservación de la interfaz del proyecto anterior.
- Reemplazo del servidor Python y SQLite por JavaScript en Node.js y MySQL.
- Esquema relacional con 15 tablas InnoDB, claves foráneas e índices.
- Autorización en servidor, sesiones, contraseñas saladas y solicitudes aprobadas por administrador.
- Traslado de promociones, asignaciones, catálogo con fotos, pedidos y visitas.
- Persistencia de pedidos idempotente y revisión por cambios de precio offline.
- Importación manual de fuentes JSON y auditoría filtrable.
- Instalador Windows con cuenta MySQL dedicada e instrucciones Workbench.
- Lista de cinco usuarios iniciales y política de informe Word en cada actualización.
- Validación: 4 pruebas unitarias, 33 comprobaciones de integración en MySQL 8.0.42 aislado, y flujo de navegador escritorio/móvil/offline.
- Pendiente externo: instalar con las credenciales del MySQL habitual y conectar APIs reales de Abaco y DP.

## Versión 2.2

- Catálogo público en /catalogo.html con acceso desde el login, búsqueda, filtros, orden y detalles.
- API GET /api/public/products de solo lectura, con campos de productos explícitos.
- Cuentas, pedidos, auditoría y operaciones administrativas siguen protegidos.
- Verificado en navegador sin sesión, escritorio y móvil, incluyendo fallos de carga y reintento.
- Word con cambios y tabla de credenciales conservada.


## Versión 2.3

- Corregidas ocho descripciones iniciales en MySQL; se conservan las personalizadas.
- Instalaciones nuevas sin la frase de producto ficticio.
- Script repetible scripts/update-descriptions.js para otras instalaciones.
- Corrección del estado de error del catálogo: no permite convertir un fallo de carga en cero resultados mediante filtros.
- API local verificada con ocho productos; pruebas de navegador aprobadas.


## Versión 2.4

- Doce productos nuevos, veinte en total, con ilustraciones locales y precios iniciales editables.
- Fotos existentes conservadas; marcos blancos uniformes en ambos catálogos y vista previa.
- Asignación de productos nuevos a sus fabricantes y promociones iniciales.
- Script expand-catalog.js repetible sin duplicados; datos incluidos en instalaciones nuevas.
- Comprobados paginación, imágenes, filtros y diseño móvil.


## Versión 2.5

- Carga solicitada de seis pedidos de ejemplo y una visita sin pedido en MySQL.
- Total registrado: 1.723.400 COP; promoción principal con cuatro de seis tiendas visitadas.
- Cargador scripts/load-activity.js repetible sin duplicar y con validaciones del servidor.
- Resumen y detalle verificados en navegador. Datos existentes conservados.

