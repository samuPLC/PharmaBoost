import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:3080';let checks=0;
function ok(v,name){assert(v,name);checks++;console.log('OK '+name);}
async function call(path,method='GET',body,cookie='',headers={}){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json','X-PharmaBoost':'1',Cookie:cookie,...headers},body:body===undefined?undefined:JSON.stringify(body)});let data;try{data=await r.json();}catch{data=null;}return {r,data};}
const protectedPaths=['/api/bootstrap','/api/audit','/api/users','/api/orders'];
for(const p of protectedPaths)ok((await call(p)).r.status===401,'Sin sesión '+p);
ok((await call('/api/bootstrap','GET',undefined,'pb_session=invalid')).r.status===401,'Token inválido');
for(const p of ['/.env','/server/db.js','/database/schema.sql','/docs/PharmaBoost_Cambios_v2_22.docx'])ok((await fetch(base+p)).status===404,'Archivo privado protegido '+p);
const publicData=await call('/api/public/products');ok(publicData.r.status===200,'Catálogo público');
ok(publicData.data.products.every(p=>!('average_cost' in p)&&!('password_hash' in p)),'Catálogo sin costos ni hashes');
ok((await call('/api/login','POST',{},'',{'X-PharmaBoost':''})).r.status===403,'Cabecera CSRF requerida');
ok((await call('/api/login','POST',{},'',{Origin:'https://otro.example'})).r.status===403,'Origen ajeno rechazado');
ok((await call('/api/login','POST',{},'',{'Content-Type':'text/plain'})).r.status===415,'Tipo de contenido validado');
ok((await call('/api/login','POST',[])).r.status===400,'Objeto JSON requerido');
ok((await call('/api/login','POST',{email:'incorrecto',password:'x'})).r.status===400,'Correo validado por servidor');
const injection=await call('/api/login','POST',{email:"'OR'1'='1@example.test",password:'incorrecta'});ok(injection.r.status===401,'Inyección no autentica');
ok(!JSON.stringify(injection.data).match(/SELECT|password_hash|stack|ER_/),'Error sin información interna');
const cookies=[];
try{
 for(const role of ['admin','ventas','agente','tic']){
  const {r,data}=await call('/api/login','POST',{email:role+'@pharmaboost.local',password:'Pharma2026!'});
  ok(r.status===200,'Login '+role);const raw=r.headers.get('set-cookie'),cookie=raw.split(';')[0];cookies.push(cookie);
  ok(raw.includes('HttpOnly')&&raw.includes('SameSite=Strict'),'Cookie protegida '+role);
  ok(!JSON.stringify(data).includes('password_hash'),'Sin hashes '+role);
  ok(r.headers.get('cache-control')==='no-store'&&r.headers.get('x-content-type-options')==='nosniff','Cabeceras '+role);
  if(role!=='admin')ok((await call('/api/users','POST',{},cookie)).r.status===403,'Permiso de usuarios '+role);
  if(['agente','tic'].includes(role))ok((await call('/api/inventory','POST',{},cookie)).r.status===403,'Permiso de inventario '+role);
  if(['ventas','agente'].includes(role))ok((await call('/api/audit','GET',undefined,cookie)).r.status===403,'Permiso auditoría '+role);
  if(role==='admin')ok((await call('/api/products','POST',{price:-1},cookie)).r.status===400,'Producto inválido rechazado');
  ok((await call('/api/logout','POST',{},cookie)).r.status===200,'Logout '+role);
  ok((await call('/api/bootstrap','GET',undefined,cookie)).r.status===401,'Sesión revocada '+role);
 }
}finally{for(const cookie of cookies)await call('/api/logout','POST',{},cookie);}
console.log(checks+' comprobaciones HTTP aprobadas. Sin modificaciones de datos comerciales.');

