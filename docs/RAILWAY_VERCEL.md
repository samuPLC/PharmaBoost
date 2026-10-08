# Despliegue de PharmaBoost 2.29

Esta guía corresponde a **Pharmaboost1**, con Node.js y MySQL. Sustituye las instrucciones de Python y SQLite de la otra carpeta.

## 1. Subir cambios

En PowerShell, desde `C:\Users\SAMUEL PALACIO\Desktop\Pharmaboost1`:

```powershell
git add .dockerignore .gitignore Dockerfile railway.json vercel.json package.json scripts/build-vercel.mjs scripts/setup-production.js README.md docs/RAILWAY_VERCEL.md docs/USUARIOS.md docs/PharmaBoost_Cambios_v2_29.docx
git commit -m "Preparar Node y MySQL para Railway y Vercel"
git push origin main
```

## 2. Crear Railway y MySQL

1. En Railway pulsa New Project → Deploy from GitHub repo y selecciona `samuelMZN/PharmaBoost`.
2. Conserva la raíz del repositorio. Railway utiliza el Dockerfile de Node.js.
3. Dentro del mismo proyecto selecciona New → Database → MySQL. Espera a que MySQL esté activo. Mantén su volumen para conservar los datos y configura sus copias de seguridad.
4. Abre el servicio de la aplicación → Variables. Añade lo siguiente. Las referencias suponen que el servicio de base de datos se llama `MySQL`; ajusta el nombre si lo cambiaste.

| Nombre | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `3080` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `ADMIN_EMAIL` | El correo que elegirás para el administrador |
| `ADMIN_PASSWORD` | Tu contraseña propia de entre 12 y 200 caracteres |

5. Aplica los cambios y vuelve a desplegar. No ejecutes `npm run setup` en producción: ese comando carga las cuentas locales de ejemplo. El Dockerfile ejecuta el instalador de producción automáticamente.
6. En Settings → Networking → Public Networking pulsa Generate Domain, puerto **3080**.
7. Abre `https://TU-DOMINIO-RAILWAY/api/health`. Debe mostrar `ok: true`, `mode: production` y `database: mysql`.

La aplicación crea las tablas en la base suministrada por Railway y un solo administrador cuando no hay usuarios. Conserva los datos en los arranques siguientes. Las fotos subidas se guardan en MySQL; no necesitas un volumen `/app/data` en el servicio Node.

## 3. Crear Vercel

1. En Vercel abre Add New → Project e importa el mismo repositorio.
2. Framework Preset: **Other**. Root Directory: raíz del repositorio, no `web`.
3. El archivo vercel.json configura Build Command `node scripts/build-vercel.mjs` y Output Directory `.vercel/output`.
4. Añade en Environment Variables para Production: `RAILWAY_BACKEND_URL` con el origen HTTPS real de Railway, sin `/api` ni otras rutas.
5. Pulsa Deploy y copia el dominio estable de producción de Vercel.

## 4. Conectar y entrar

1. En Variables de la aplicación Railway añade `APP_ORIGIN=https://TU-DOMINIO-VERCEL`, sin barra final. Aplica los cambios y vuelve a desplegar.
2. Abre el dominio de Vercel e inicia sesión con el administrador elegido en Railway.
3. Crea los fabricantes y productos necesarios, sube una foto y comprueba la recarga y la persistencia tras un redeploy.
4. Comprueba registro y aprobación administrativa de roles.

La base nueva comienza sin datos locales. GitHub no copia el MySQL de tu PC. Cambiar ADMIN_PASSWORD no cambia una cuenta ya creada. Usa Equipo y usuarios para gestionar sus datos.

## MySQL Workbench

Para conectar desde tu PC usa el host y puerto del **TCP Proxy público** que muestra Railway para MySQL, y las credenciales y nombre de base del servicio. El host privado `mysql.railway.internal` solo funciona entre servicios Railway. Introduce los secretos en el almacén local de Workbench, sin guardarlos en documentos o Git. No ejecutes el script local completo `database/schema.sql` en Railway: contiene CREATE DATABASE y USE para la instalación local. El instalador de producción omite esas dos instrucciones. Una importación de datos existentes requiere un respaldo y un procedimiento aparte.

## Diagnóstico

- Origen no autorizado: APP_ORIGIN debe ser el origen exacto de Vercel. Usa su URL de producción, no previews temporales.
- Error de conexión MySQL: comprueba referencias DB_*, estado de MySQL y que ambos servicios estén en el mismo entorno.
- Compilación de Vercel sin RAILWAY_BACKEND_URL: añade la variable y vuelve a desplegar.
- Railway no responde: revisa puerto 3080, HOST=0.0.0.0 y logs de instalación.

Validado localmente: pruebas unitarias y construcción del frontend. Pendiente: construcción Docker, inicialización en MySQL de Railway y prueba completa en dominios publicados.

Referencias oficiales: https://docs.railway.com/databases/mysql, https://docs.railway.com/variables, https://vercel.com/docs/build-output-api.
