import { cp, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const raw = process.env.RAILWAY_BACKEND_URL?.trim();
let backend;
try {
  backend = new URL(raw);
  if (backend.protocol !== 'https:' || backend.username || backend.password ||
      backend.pathname !== '/' || backend.search || backend.hash) throw new Error();
} catch {
  throw new Error('Configura RAILWAY_BACKEND_URL con el origen HTTPS de Railway, sin rutas. Ejemplo: https://pharmaboost.up.railway.app');
}
const output = path.join(root, '.vercel', 'output');
await mkdir(path.join(output, 'static'), { recursive: true });
await cp(path.join(root, 'web'), path.join(output, 'static'), { recursive: true });
const config = {
  version: 3,
  routes: [
    {
      src: '/(.*)', continue: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'same-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
      }
    },
    {
      src: '/api/(.*)', dest: `${backend.origin}/api/$1`,
      headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store' }
    },
    { src: '/media/(.*)', dest: `${backend.origin}/media/$1` },
    { src: '/(.*)', headers: { 'Cache-Control': 'no-cache' }, continue: true },
    { src: '/', dest: '/index.html' },
    { handle: 'filesystem' }
  ]
};
await writeFile(path.join(output, 'config.json'), JSON.stringify(config, null, 2) + '\n');
console.log('Frontend generado; API y fotografías conectadas a ' + backend.origin);
