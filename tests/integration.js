import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
// Ejecutar exclusivamente en la instancia desechable de pruebas.
if(process.env.DB_PORT!=='3307')throw new Error('Las pruebas de integración requieren una instancia aislada en el puerto 3307.');
const base=process.env.TEST_URL||'http://localhost:3080';
let checks=0;
async function request(route,method='GET',body,cookie=''){const r=await fetch(base+'/api'+route,{method,headers:{'Content-Type':'application/json','X-PharmaBoost':'1',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
function ok(condition,label){assert(condition,label);checks++;console.log('OK '+label);}
async function login(role){const r=await request('/login','POST',{email:role+'@pharmaboost.local',password:'Pharma2026!'});ok(r.status===200,'Login '+role);return r;}
try{
 ok((await fetch(base)).status===200,'Página inicial servida');
 ok((await request('/bootstrap')).status===401,'Sesión obligatoria');
 const admin=await login('admin'),sales=await login('ventas'),agent=await login('agente'),agent2=await login('agente2'),tic=await login('tic');
 ok(agent.data.products.length>=6&&agent.data.products.every(p=>p.manufacturer_id===1)&&agent2.data.products.length>=2&&agent2.data.products.every(p=>p.manufacturer_id===2),'Aislamiento de fabricantes');
 ok(!agent.data.user.password_hash&&!admin.data.users.some(u=>u.password_hash),'No se exponen hashes');
 ok((await request('/users','POST',{},agent.cookie)).status===403,'Agente no crea usuarios');
 ok((await request('/audit','GET',undefined,sales.cookie)).status===403,'Ventas no accede a auditoría');
 const uid=randomUUID();
 let r=await request('/users','POST',{name:'Usuario Prueba',email:uid+'@example.com',role:'agente',active:true,manufacturer_id:1,password:'Temporal2026!'},admin.cookie);ok(r.status===200,'Crear usuario');
 r=await request('/register','POST',{name:'Solicitud Prueba',email:'r'+uid+'@example.com',password:'Temporal2026!'});ok(r.status===200,'Solicitar acceso');
 r=await request('/bootstrap','GET',undefined,admin.cookie);const reg=r.data.registration_requests.find(x=>x.email==='r'+uid+'@example.com');
 ok((await request('/registration-requests/'+reg.id,'POST',{decision:'aprobar',role:'agente',manufacturer_id:1},admin.cookie)).status===200,'Aprobar solicitud');
 const p=agent.data.promotions.find(p=>p.id===1),product=agent.data.products.find(p=>p.id===1);
 const order={id:randomUUID(),promotion_id:p.id,store_id:p.store_ids[0],confirmed:true,confirmed_by:'Responsable prueba',notes:'Prueba de integración',captured_at:new Date().toISOString(),captured_offline:false,items:[{product_id:product.id,quantity:2,unit_price:product.price}]};
 ok((await request('/orders','POST',{...order,confirmed:false},agent.cookie)).status===400,'Confirmación requerida');
 ok((await request('/orders','POST',{...order,items:[{product_id:7,quantity:1,unit_price:28900}]},agent.cookie)).status===403,'Subgama validada');
 ok((await request('/orders','POST',order,agent2.cookie)).status===403,'Asignación validada');
 const results=await Promise.all([request('/orders','POST',order,agent.cookie),request('/orders','POST',order,agent.cookie)]);
 ok(results.every(r=>r.status===200)&&results.some(r=>r.data.duplicate),'Reintentos concurrentes sin duplicar');
 ok((await request('/orders','POST',{...order,notes:'alterado'},agent.cookie)).status===409,'Colisión de identificadores rechazada');
 const offline={...order,id:randomUUID(),captured_offline:true,items:[{product_id:product.id,quantity:1,unit_price:product.price+100}]};
 r=await request('/orders','POST',offline,agent.cookie);ok(r.data.status==='revision','Cambio de precio offline pasa a revisión');
 const visit={id:randomUUID(),store_id:p.store_ids[1],promotion_id:p.id,notes:'Sin pedido',created_at:new Date().toISOString()};
 ok((await request('/visits','POST',visit,agent.cookie)).status===200,'Visita sin pedido');ok((await request('/visits','POST',visit,agent.cookie)).data.duplicate,'Visita idempotente');
 const productData={external_code:'TEST-'+uid,name:'Producto de prueba',description:'Descripción de prueba',price:20000,category:'Pruebas',manufacturer_id:1,promotion_id:1,photo:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='};
 r=await request('/products','POST',productData,admin.cookie);ok(r.status===200,'Crear producto con foto y asignación');const pid=r.data.id;
 r=await request('/products/'+pid,'PUT',{...productData,price:22000},admin.cookie);ok(r.status===200,'Editar producto');
 r=await request('/bootstrap','GET',undefined,admin.cookie);const photo=r.data.products.find(x=>x.id===pid).image_url;ok((await fetch(base+photo)).status===200,'Foto servida desde MySQL');
 const promotion={name:'Promoción prueba',manufacturer_id:1,start_date:p.start_date,end_date:p.end_date,status:'activa',product_ids:[product.id],agent_ids:[agent.data.user.id],store_ids:[p.store_ids[0]]};
 ok((await request('/promotions','POST',promotion,sales.cookie)).status===409,'Advertencia de solapamiento');
 ok((await request('/promotions','POST',{...promotion,accept_overlap:true},sales.cookie)).status===200,'Promoción y asignaciones');
 r=await request('/import/stores','POST',{records:[{external_code:'TEST-'+uid,name:'Tienda prueba',address:'Calle 1',coverage:false},{external_code:'err'}]},tic.cookie);ok(r.status===200&&r.data.accepted===1&&r.data.rejected.length===1,'Importación parcial validada');
 r=await request('/audit?event=pedido','GET',undefined,admin.cookie);ok(r.data.events.length>=2&&r.data.events.every(e=>e.event==='pedido'),'Auditoría filtrada');
 r=await request('/bootstrap','GET',undefined,agent.cookie);ok(r.data.orders.filter(o=>o.id===order.id).length===1&&r.data.orders.find(o=>o.id===order.id).total===product.price*2,'Total persistente y sin duplicados');
 ok((await request('/logout','POST',{},agent.cookie)).status===200,'Cerrar sesión');ok((await request('/bootstrap','GET',undefined,agent.cookie)).status===401,'Sesión invalidada');
 const csrf=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});ok(csrf.status===403,'Protección de peticiones');
 console.log(`${checks} comprobaciones de integración superadas.`);
}catch(e){console.error(e);process.exitCode=1;}

