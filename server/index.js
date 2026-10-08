import {saveSupplier} from './suppliers.js';
import {checkLogin} from './login-guard.js';
import {createLimiter} from './rate-limit.js';
import {events,productState,stockMovement,returnItems,saveInventorySettings} from './operations.js';
import http from 'node:http';
import {updateTracking} from './tracking.js';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {pool,query as q,transaction} from './db.js';
import {Problem,text,email,hashToken,verifyPassword,requireRole} from './security.js';
import * as service from './service.js';
const web=path.resolve(fileURLToPath(new URL('../web/',import.meta.url)));
const production=process.env.NODE_ENV==='production';
const cookie=(token,clear=false)=>`pb_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:43200}${production?'; Secure':''}`;
const limit=createLimiter();
function rateLimit(req,key,max=10){limit(req.socket.remoteAddress+':'+key,max);}
async function dispatch(db,req,res,url,d){
 const route=url.pathname,method=req.method;
 if(route==='/api/public/products'&&method==='GET'){const ledger=await events(db);const products=await q(db,'SELECT p.id,p.name,p.description,p.price,p.category,p.image_url,p.image_valid,m.name manufacturer_name FROM products p JOIN manufacturers m ON m.id=p.manufacturer_id ORDER BY p.name,p.id');return {products:products.map(p=>{const extra=productState(ledger,p.id);return {...p,discount_min:extra.discount_min,discount_percent:extra.discount_percent};})};}
 if(route==='/api/health'&&method==='GET'){await q(db,'SELECT 1');return {ok:true,mode:production?'production':'development',database:'mysql'};}
 if(route==='/api/login'&&method==='POST'){
  rateLimit(req,'login-ip',60);const mail=email(d),password=text(d,'password',1,200);rateLimit(req,mail);
  const attempt=await checkLogin(db,mail,password);if(attempt.rejected)return {loginRejected:true,lockedUntil:attempt.lockedUntil};const user=attempt.user;
  const token=randomBytes(32).toString('base64url');await q(db,'DELETE FROM sessions WHERE expires_at<?',[Date.now()]);await q(db,'INSERT INTO sessions VALUES(?,?,?)',[hashToken(token),user.id,Date.now()+43200000]);await service.audit(db,user,'acceso','Inicio de sesión correcto');res.setHeader('Set-Cookie',cookie(token));return service.bootstrap(db,user);
 }
 if(route==='/api/register'&&method==='POST'){rateLimit(req,'register');return service.register(db,d);}
 const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('pb_session='))?.slice(11)||'';
 const [u]=await q(db,'SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1',[hashToken(token),Date.now()]);
 if(!u)throw new Problem('Inicia sesión para continuar.',401);
 if(route==='/api/bootstrap'&&method==='GET')return service.bootstrap(db,u);
 if(route==='/api/logout'&&method==='POST'){await q(db,'DELETE FROM sessions WHERE token_hash=?',[hashToken(token)]);await service.audit(db,u,'acceso','Sesión cerrada');res.setHeader('Set-Cookie',cookie('',true));return {ok:true};}
 const tracking=route.match(/^\/api\/orders\/([^/]+)\/tracking$/);if(tracking&&method==='PUT')return updateTracking(db,u,decodeURIComponent(tracking[1]),d);
 if(route==='/api/inventory/settings'&&method==='POST')return saveInventorySettings(db,u,d);
 if(route==='/api/inventory/products'&&method==='POST')return service.saveProduct(db,u,d,undefined,true);
 if(route==='/api/inventory'&&method==='POST')return stockMovement(db,u,d);
 if(route==='/api/returns'&&method==='POST')return returnItems(db,u,d);
 if(route==='/api/orders'&&method==='POST')return service.submitOrder(db,u,d);
 if(route==='/api/visits'&&method==='POST')return service.saveVisit(db,u,d);
 for(const [resource,fn] of [['suppliers',saveSupplier],['promotions',service.savePromotion],['users',service.saveUser],['products',service.saveProduct]]){
  const match=route.match(new RegExp('^/api/'+resource+'(?:/(\\d+))?$'));if(match&&((!match[1]&&method==='POST')||(match[1]&&method==='PUT')))return fn(db,u,d,match[1]?Number(match[1]):undefined);
 }
 const review=route.match(/^\/api\/registration-requests\/(\d+)$/);if(review&&method==='POST')return service.reviewRegistration(db,u,Number(review[1]),d);
 if(route==='/api/profile'&&method==='PUT'){await q(db,'UPDATE users SET name=?,phone=?,device=? WHERE id=?',[text(d,'name',2,120),text(d,'phone',0,80),text(d,'device',0,120),u.id]);await service.audit(db,u,'usuario','Perfil actualizado');return {ok:true};}
 if(route==='/api/manufacturers'&&method==='POST'){requireRole(u,'admin','ventas');const r=await q(db,'INSERT INTO manufacturers(name,contact) VALUES(?,?)',[text(d,'name',2,120),text(d,'contact',0,160)]);await service.audit(db,u,'fabricante','Fabricante registrado');return {id:r.insertId};}
 if(route==='/api/image-error'&&method==='POST'){const data=await service.bootstrap(db,u);if(!data.products.some(p=>p.id===d.product_id))throw new Problem('Producto no autorizado.',403);const r=await q(db,'UPDATE products SET image_valid=0 WHERE id=? AND image_valid=1',[d.product_id]);if(r.affectedRows)await service.audit(db,u,'imagen','Imagen no disponible del producto '+d.product_id,'aviso');return {ok:true};}
 if(['/api/import/catalog','/api/import/stores'].includes(route)&&method==='POST')return service.importRecords(db,u,route.split('/').at(-1),d);
 if(route==='/api/audit'&&method==='GET'){
  requireRole(u,'admin','tic');const parts=[],args=[];
  for(const [key,col] of [['event','a.event'],['agent','a.user_id'],['store','a.store_id'],['promotion','a.promotion_id']])if(url.searchParams.get(key)){parts.push(col+'=?');args.push(url.searchParams.get(key));}
  if(url.searchParams.get('from')){parts.push('a.created_at>=?');args.push(url.searchParams.get('from'));}
  if(url.searchParams.get('to')){parts.push('a.created_at<=?');args.push(url.searchParams.get('to')+'T23:59:59.999Z');}
  const auditRows=await q(db,"SELECT a.*,COALESCE(u.name,'Sistema') user_name FROM audit a LEFT JOIN users u ON u.id=a.user_id"+(parts.length?' WHERE '+parts.join(' AND '):'')+' ORDER BY a.id DESC LIMIT 500',args);
  if(u.role==='tic')for(const row of auditRows){if(row.event==='stock'){try{const value=JSON.parse(row.description);for(const key of ['average_cost','unit_cost','previous_cost','markup'])delete value[key];row.description=JSON.stringify(value);}catch{row.description='Movimiento de inventario';}}}
  return {events:auditRows};
 }
 throw new Problem('Recurso no encontrado.',404);
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
 if(production)res.setHeader('Strict-Transport-Security','max-age=31536000');
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
   res.setHeader('Cache-Control','no-store');let data={};
   if(!['GET','POST','PUT'].includes(req.method))throw new Problem('Método no permitido.',405);
   if(req.method!=='GET'){
    if(req.headers['x-pharmaboost']!=='1')throw new Problem('Solicitud no autorizada.',403);
    const origin=process.env.APP_ORIGIN||`http://localhost:${process.env.PORT||3080}`;
    if(req.headers.origin&&req.headers.origin!==origin)throw new Problem('Origen no autorizado.',403);
    if(!req.headers['content-type']?.startsWith('application/json'))throw new Problem('Utiliza application/json.',415);
    let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>6000000)throw new Problem('Archivo demasiado grande.',413);chunks.push(chunk);}try{data=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw new Problem('JSON inválido.');}
    if(!data||Array.isArray(data)||typeof data!=='object')throw new Problem('Se requiere un objeto JSON.');
   }
   const result=await transaction(db=>dispatch(db,req,res,url,data));
   if(result.loginRejected){if(result.lockedUntil)throw new Problem('Acceso bloqueado por cinco intentos fallidos. Intenta de nuevo en cinco minutos.',429,{locked_until:result.lockedUntil});throw new Problem('Correo o contraseña incorrectos.',401);}
   res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));return;
  }
  if(!['GET','HEAD'].includes(req.method))throw new Problem('Método no permitido.',405);
  const image=url.pathname.match(/^\/media\/products\/([a-f0-9]{48})\.png$/);
  if(image){const [r]=await q(pool,'SELECT content FROM product_images WHERE id=?',[image[1]]);if(!r)throw new Problem('Imagen no encontrada.',404);res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=86400');res.end(req.method==='HEAD'?undefined:r.content);return;}
  const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(web,'.'+name);
  if(!file.startsWith(web+path.sep))throw new Problem('No encontrado.',404);
  const body=await readFile(file).catch(()=>{throw new Problem('No encontrado.',404);});
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
  res.setHeader('Content-Type',(mime[path.extname(file)]||'application/octet-stream')+'; charset=utf-8');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?undefined:body);
 }catch(e){let status=e.status||500,message=e.message;
  if(['ER_DUP_ENTRY','ER_NO_REFERENCED_ROW_2','ER_CHECK_CONSTRAINT_VIOLATED','ER_DATA_TOO_LONG'].includes(e.code)){status=409;message='No se pudo guardar: registro duplicado, referencia o valor inválido.';}
  if(['ER_ACCESS_DENIED_ERROR','ECONNREFUSED','ER_BAD_DB_ERROR','ER_NO_SUCH_TABLE'].includes(e.code)){status=503;message='MySQL no está configurado o no está disponible. Ejecuta configurar.ps1 y revisa el servicio MySQL80.';}
  if(status===429)res.setHeader('Retry-After','300');
  if(status===500){console.error('Error de servidor:',e.code||'UNEXPECTED_ERROR');message='No se pudo completar la operación. Los pendientes se conservan.';}
  if(req.url.startsWith('/api/')){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({error:message,details:e.details}));}else{res.statusCode=status;res.end(message);}
 }
});
server.requestTimeout=30000;
server.listen(Number(process.env.PORT||3080),process.env.HOST||'127.0.0.1',()=>console.log(`PharmaBoost · http://localhost:${process.env.PORT||3080} · MySQL`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await pool.end();process.exit(0);}));
