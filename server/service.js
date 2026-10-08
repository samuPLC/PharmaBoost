import {listSuppliers} from './suppliers.js';
import {events,productState,saveDiscount,saveProductConfig} from './operations.js';
import {unitPrice} from '../web/pricing.js';
import {histories} from './tracking.js';
import {randomBytes} from 'node:crypto';
import {query as q} from './db.js';
import {Problem,text,integer,ids,requireRole,email,dateOnly,captureTime,canonical,hashToken,passwordHash,publicUser} from './security.js';
const now=()=>new Date().toISOString();
export async function audit(db,user,event,description,result='exito',store=null,promotion=null){await q(db,'INSERT INTO audit(user_id,event,description,result,created_at,store_id,promotion_id) VALUES(?,?,?,?,?,?,?)',[user?.id??null,event,description,result,now(),store,promotion]);}
async function exists(db,table,id){if(!(await q(db,`SELECT id FROM ${table} WHERE id=?`,[integer(id,table)])).length)throw new Problem('No existe el registro relacionado.');}
export async function bootstrap(db,user){
 const agent=user.role==='agente';
 const promotions=await q(db,'SELECT p.*,m.name manufacturer_name FROM promotions p JOIN manufacturers m ON m.id=p.manufacturer_id'+(agent?' WHERE p.id IN(SELECT promotion_id FROM promotion_agents WHERE agent_id=?)':''),agent?[user.id]:[]);
 for(const p of promotions)for(const [key,table,col] of [['product_ids','promotion_products','product_id'],['agent_ids','promotion_agents','agent_id'],['store_ids','promotion_stores','store_id']])p[key]=(await q(db,`SELECT ${col} id FROM ${table} WHERE promotion_id=?`,[p.id])).map(r=>r.id);
 const products=await q(db,'SELECT p.*,m.name manufacturer_name FROM products p JOIN manufacturers m ON m.id=p.manufacturer_id');
 const ledger=await events(db);for(const p of products){const extra=productState(ledger,p.id);if(!['admin','ventas'].includes(user.role)){delete extra.average_cost;delete extra.markup;}Object.assign(p,extra);}
 const stores=await q(db,'SELECT * FROM stores');
 const orders=await q(db,'SELECT o.*,u.name agent_name,s.name store_name,p.name promotion_name FROM orders o JOIN users u ON u.id=o.agent_id JOIN stores s ON s.id=o.store_id JOIN promotions p ON p.id=o.promotion_id'+(agent?' WHERE o.agent_id=?':'')+' ORDER BY o.sent_at DESC',agent?[user.id]:[]);
 const tracking=await histories(db);for(const o of orders){o.history=tracking.get(o.id)||[];o.commercial_status=o.history.at(-1)?.state||'pendiente';o.returns=ledger.filter(r=>r.event==='devolucion'&&r.order_id===o.id).map(({digest,...r})=>r);}
 for(const o of orders)o.items=await q(db,'SELECT i.*,p.name product_name FROM order_items i JOIN products p ON p.id=i.product_id WHERE order_id=?',[o.id]);
 return {report_movements:['admin','ventas'].includes(user.role)?ledger.filter(r=>r.event==='stock').map(({digest,...r})=>r):[],suppliers:['admin','ventas'].includes(user.role)?await listSuppliers(db):[],inventory_events:['admin','ventas'].includes(user.role)?ledger.filter(r=>r.event==='stock').slice(-200).reverse().map(({digest,...r})=>r):[],user:publicUser(user),manufacturers:await q(db,'SELECT * FROM manufacturers'),promotions,products:products.filter(p=>!agent||promotions.some(pr=>pr.product_ids.includes(p.id))),stores:stores.filter(s=>!agent||promotions.some(p=>p.store_ids.includes(s.id))),orders,users:['admin','ventas'].includes(user.role)?(await q(db,'SELECT * FROM users')).map(publicUser):[],registration_requests:user.role==='admin'?await q(db,"SELECT id,name,email,requested_at,status FROM registration_requests WHERE status='pendiente' ORDER BY requested_at"):[],visits:await q(db,'SELECT * FROM visits'+(agent?' WHERE agent_id=?':''),agent?[user.id]:[]),synced_at:now()};
}
async function promotionAccess(db,u,pid,sid,time){
 requireRole(u,'agente');integer(pid,'promoción');integer(sid,'tienda');
 const [p]=await q(db,'SELECT p.* FROM promotions p JOIN promotion_agents a ON a.promotion_id=p.id JOIN promotion_stores s ON s.promotion_id=p.id WHERE p.id=? AND a.agent_id=? AND s.store_id=? FOR UPDATE',[pid,u.id,sid]);
 if(!p||p.manufacturer_id!==u.manufacturer_id)throw new Problem('Promoción o tienda no asignada a tu cuenta.',403);
 const day=time.slice(0,10);if(p.status!=='activa'||day<p.start_date||day>p.end_date)throw new Problem('La promoción no estaba vigente en la fecha de captura.',409);
 return p;
}
export async function submitOrder(db,u,d){
 requireRole(u,'agente');if(d.captured_offline!==undefined&&typeof d.captured_offline!=='boolean')throw new Problem('Indicador sin conexión inválido.');const id=text(d,'id',10,80),digest=hashToken(canonical(d));
 // Bloqueo por agente: serializa reintentos concurrentes antes de consultar el ID.
 await q(db,'SELECT id FROM users WHERE id=? FOR UPDATE',[u.id]);
 const [old]=await q(db,'SELECT * FROM orders WHERE id=? FOR UPDATE',[id]);
 if(old){if(old.agent_id!==u.id||old.payload_hash!==digest)throw new Problem('El identificador ya corresponde a otro pedido.',409);return {id,status:old.status,duplicate:true};}
 const captured=captureTime(d.captured_at);await promotionAccess(db,u,d.promotion_id,d.store_id,captured);
 if(d.confirmed!==true)throw new Problem('El responsable debe confirmar el pedido.');
 if(!Array.isArray(d.items)||!d.items.length||d.items.length>500)throw new Problem('Agrega entre 1 y 500 productos.');
 const pricingEvents=await events(db);const items=[],seen=new Set();let total=0,changed=false;
 for(const i of d.items){if(!i||typeof i!=='object'||Array.isArray(i))throw new Problem('Detalle de producto inválido.');integer(i.product_id,'producto');integer(i.quantity,'cantidad',1,10000);integer(i.unit_price,'precio');if(seen.has(i.product_id))throw new Problem('Producto repetido.');seen.add(i.product_id);
  const [p]=await q(db,'SELECT p.* FROM products p JOIN promotion_products pp ON pp.product_id=p.id WHERE pp.promotion_id=? AND p.id=?',[d.promotion_id,i.product_id]);
  if(!p||p.manufacturer_id!==u.manufacturer_id)throw new Problem('Producto fuera de la subgama.',403);
  if(unitPrice({...p,...productState(pricingEvents,p.id)},i.quantity)!==i.unit_price){if(!d.captured_offline)throw new Problem('El precio cambió. Actualiza el catálogo y el pedido.',409);changed=true;}
  total+=i.quantity*i.unit_price;if(!Number.isSafeInteger(total)||total>9999999999999999)throw new Problem('El total excede el límite.');items.push(i);
 }
 const status=changed?'revision':'enviado';
 await q(db,'INSERT INTO orders(id,agent_id,store_id,promotion_id,status,captured_offline,captured_at,sent_at,confirmed_by,notes,payload_hash,total,review_reason) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,u.id,d.store_id,d.promotion_id,status,Boolean(d.captured_offline),captured,now(),text(d,'confirmed_by',2,120),text(d,'notes',0,1000),digest,total,changed?'Precio capturado sin conexión diferente al catálogo actual.':'']);
 for(const i of items)await q(db,'INSERT INTO order_items VALUES(?,?,?,?)',[id,i.product_id,i.quantity,i.unit_price]);
 await audit(db,u,'pedido','Pedido recibido '+id,status==='revision'?'aviso':'exito',d.store_id,d.promotion_id);return {id,status};
}
export async function saveVisit(db,u,d){
 const id=text(d,'id',10,80),time=captureTime(d.created_at),notes=text(d,'notes',0,1000);requireRole(u,'agente');await q(db,'SELECT id FROM users WHERE id=? FOR UPDATE',[u.id]);
 const [old]=await q(db,'SELECT * FROM visits WHERE id=? FOR UPDATE',[id]);if(old){if(old.agent_id!==u.id||old.store_id!==d.store_id||old.promotion_id!==d.promotion_id||old.notes!==notes||old.created_at!==time)throw new Problem('Identificador de visita en uso.',409);return {id,duplicate:true};}
 await promotionAccess(db,u,d.promotion_id,d.store_id,time);await q(db,'INSERT INTO visits VALUES(?,?,?,?,?,?)',[id,u.id,d.store_id,d.promotion_id,time,notes]);await audit(db,u,'visita','Visita registrada sin pedido','exito',d.store_id,d.promotion_id);return {id};
}
export async function savePromotion(db,u,d,id){
 requireRole(u,'admin','ventas');const name=text(d,'name',3,120),mid=integer(d.manufacturer_id,'fabricante'),start=dateOnly(d.start_date),end=dateOnly(d.end_date),status=text(d,'status');
 if(end<start||!['borrador','activa','finalizada'].includes(status))throw new Problem('Periodo o estado de promoción inválido.');await exists(db,'manufacturers',mid);if(id)await exists(db,'promotions',id);
 const products=ids(d,'product_ids'),agents=ids(d,'agent_ids'),stores=ids(d,'store_ids');
 for(const pid of products)if(!(await q(db,'SELECT id FROM products WHERE id=? AND manufacturer_id=?',[pid,mid])).length)throw new Problem('Todos los productos deben pertenecer al fabricante.');
 for(const aid of agents)if(!(await q(db,"SELECT id FROM users WHERE id=? AND manufacturer_id=? AND role='agente' AND active=1",[aid,mid])).length)throw new Problem('Agente inactivo o de otro fabricante.');
 for(const sid of stores)await exists(db,'stores',sid);
 const overlaps=await q(db,"SELECT DISTINCT p.id,p.name FROM promotions p LEFT JOIN promotion_agents a ON a.promotion_id=p.id WHERE p.id<>? AND p.status<>'finalizada' AND p.start_date<=? AND p.end_date>=? AND (p.manufacturer_id=? OR a.agent_id IN ("+agents.map(()=>'?').join(',')+'))',[id||0,end,start,mid,...agents]);
 if(overlaps.length&&!d.accept_overlap)throw new Problem('Hay promociones que coinciden en el periodo. Revisa antes de continuar.',409,overlaps);
 if(id)await q(db,'UPDATE promotions SET name=?,manufacturer_id=?,start_date=?,end_date=?,status=? WHERE id=?',[name,mid,start,end,status,id]);
 else id=(await q(db,'INSERT INTO promotions(name,manufacturer_id,start_date,end_date,status,created_at) VALUES(?,?,?,?,?,?)',[name,mid,start,end,status,now()])).insertId;
 for(const [table,list] of [['promotion_products',products],['promotion_agents',agents],['promotion_stores',stores]]){await q(db,`DELETE FROM ${table} WHERE promotion_id=?`,[id]);for(const x of list)await q(db,`INSERT INTO ${table} VALUES(?,?)`,[id,x]);}
 await audit(db,u,'promocion','Promoción y asignaciones guardadas: '+name);return {id};
}
export async function saveUser(db,u,d,id){
 requireRole(u,'admin');const name=text(d,'name',2,120),mail=email(d),role=text(d,'role'),active=d.active;if(typeof active!=='boolean')throw new Problem('Estado de usuario inválido.');if(!['admin','ventas','agente','tic'].includes(role))throw new Problem('Rol inválido.');
 if(id===u.id&&(role!=='admin'||!active))throw new Problem('No puedes retirar tu propio acceso administrativo.');
 const mid=role==='agente'?integer(d.manufacturer_id,'fabricante'):null;if(mid)await exists(db,'manufacturers',mid);
 if(id){await exists(db,'users',id);const links=await q(db,'SELECT p.manufacturer_id FROM promotions p JOIN promotion_agents a ON a.promotion_id=p.id WHERE a.agent_id=?',[id]);if(links.length&&(role!=='agente'||links.some(p=>p.manufacturer_id!==mid)))throw new Problem('Retira las asignaciones del agente antes de cambiar su rol o fabricante.');
  await q(db,'UPDATE users SET name=?,email=?,role=?,active=?,manufacturer_id=? WHERE id=?',[name,mail,role,active,mid,id]);
  if(d.password){await q(db,'UPDATE users SET password_hash=? WHERE id=?',[await passwordHash(text(d,'password',10,200)),id]);}
  if(d.password||!active)await q(db,'DELETE FROM sessions WHERE user_id=?',[id]);
 }else id=(await q(db,'INSERT INTO users(name,email,password_hash,role,active,manufacturer_id) VALUES(?,?,?,?,?,?)',[name,mail,await passwordHash(text(d,'password',10,200)),role,active,mid])).insertId;
 await audit(db,u,'usuario','Cuenta guardada: '+mail);return {id};
}
export async function register(db,d){
 const mail=email(d);if((await q(db,'SELECT id FROM users WHERE email=?',[mail])).length)throw new Problem('El correo ya está registrado.',409);
 const [old]=await q(db,'SELECT * FROM registration_requests WHERE email=? FOR UPDATE',[mail]);if(old?.status==='pendiente')throw new Problem('Ya hay una solicitud pendiente.',409);
 const data=[text(d,'name',2,120),await passwordHash(text(d,'password',10,200)),now()];
 if(old)await q(db,"UPDATE registration_requests SET name=?,password_hash=?,requested_at=?,status='pendiente',reviewed_at=NULL,reviewed_by=NULL,rejection_reason='' WHERE id=?",[...data,old.id]);
 else await q(db,'INSERT INTO registration_requests(name,password_hash,requested_at,email) VALUES(?,?,?,?)',[...data,mail]);return {ok:true};
}
export async function reviewRegistration(db,u,id,d){
 requireRole(u,'admin');const [r]=await q(db,"SELECT * FROM registration_requests WHERE id=? AND status='pendiente' FOR UPDATE",[id]);if(!r)throw new Problem('Solicitud no disponible.',404);
 if(!['aprobar','rechazar'].includes(d.decision))throw new Problem('Decisión inválida.');
 if(d.decision==='aprobar'){const role=text(d,'role');if(!['admin','ventas','agente','tic'].includes(role))throw new Problem('Rol inválido.');const mid=role==='agente'?integer(d.manufacturer_id,'fabricante'):null;if(mid)await exists(db,'manufacturers',mid);await q(db,'INSERT INTO users(name,email,password_hash,role,manufacturer_id) VALUES(?,?,?,?,?)',[r.name,r.email,r.password_hash,role,mid]);}
 await q(db,'UPDATE registration_requests SET status=?,reviewed_at=?,reviewed_by=?,rejection_reason=? WHERE id=?',[d.decision==='aprobar'?'aprobada':'rechazada',now(),u.id,text(d,'reason',0,300),id]);await audit(db,u,'usuario','Solicitud '+d.decision+': '+r.email);return {ok:true};
}
export async function saveProduct(db,u,d,id,inventory=false){
 requireRole(u,'admin');if(!inventory&&(!id||['price','stock','quantity','minimum','unit','stock_max','discount_min','discount_percent'].some(k=>Object.hasOwn(d,k))))throw new Problem('Los precios y el inventario se gestionan desde Inventario.',400);const mid=integer(d.manufacturer_id,'fabricante');await exists(db,'manufacturers',mid);if(id){await exists(db,'products',id);if((await q(db,'SELECT p.id FROM promotions p JOIN promotion_products pp ON pp.promotion_id=p.id WHERE pp.product_id=? AND p.manufacturer_id<>?',[id,mid])).length)throw new Problem('Retira el producto de promociones de otro fabricante.');}
 const fields=[text(d,'external_code',1,80),text(d,'name',2,160),text(d,'description',1,2000),inventory?integer(d.price,'precio'):Number((await q(db,'SELECT price FROM products WHERE id=? FOR UPDATE',[id]))[0].price),text(d,'category',1,80),mid];
 if(id)await q(db,'UPDATE products SET external_code=?,name=?,description=?,price=?,category=?,manufacturer_id=? WHERE id=?',[...fields,id]);else id=(await q(db,'INSERT INTO products(external_code,name,description,price,category,manufacturer_id) VALUES(?,?,?,?,?,?)',fields)).insertId;
 if(d.photo){if(typeof d.photo!=='string'||d.photo.length>5600000||!/^[A-Za-z0-9+/]+={0,2}$/.test(d.photo))throw new Problem('Imagen inválida o demasiado grande.');const bytes=Buffer.from(d.photo,'base64');if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Problem('La foto debe ser PNG.');const imageId=randomBytes(24).toString('hex');await q(db,'DELETE FROM product_images WHERE product_id=?',[id]);await q(db,'INSERT INTO product_images VALUES(?,?,?,?)',[imageId,id,bytes,now()]);await q(db,'UPDATE products SET image_url=?,image_valid=1 WHERE id=?',['/media/products/'+imageId+'.png',id]);}
 if(d.promotion_id){if(!(await q(db,'SELECT id FROM promotions WHERE id=? AND manufacturer_id=?',[integer(d.promotion_id,'promoción'),mid])).length)throw new Problem('La promoción pertenece a otro fabricante.');await q(db,'INSERT IGNORE INTO promotion_products VALUES(?,?)',[d.promotion_id,id]);}
 if(inventory){await saveDiscount(db,u,id,d);await saveProductConfig(db,u,id,d);}
 await audit(db,u,'producto','Producto guardado: '+d.name);return {id};
}
export async function importRecords(db,u,kind,d){
 requireRole(u,'admin','tic');if(!Array.isArray(d.records)||d.records.length>10000)throw new Problem('Se requiere una lista records de máximo 10000 filas.');let accepted=0;const rejected=[];
 for(const [index,r] of d.records.entries()){await db.query('SAVEPOINT import_row');try{
  if(!r||typeof r!=='object')throw new Problem('Registro inválido.');
  const code=text(r,'external_code',1,80),name=text(r,'name',2,160);
  if(kind==='stores'){await q(db,'INSERT INTO stores(external_code,name,address,zone,phone,manager,coverage) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),address=VALUES(address),zone=VALUES(zone),phone=VALUES(phone),manager=VALUES(manager),coverage=VALUES(coverage)',[code,name,text(r,'address',1,300),text(r,'zone',0,120),text(r,'phone',0,80),text(r,'manager',0,120),r.coverage!==false]);}
  else {const mid=integer(r.manufacturer_id,'fabricante');await exists(db,'manufacturers',mid);const [old]=await q(db,'SELECT id FROM products WHERE external_code=?',[code]);if(old&&(await q(db,'SELECT p.id FROM promotions p JOIN promotion_products pp ON pp.promotion_id=p.id WHERE pp.product_id=? AND p.manufacturer_id<>?',[old.id,mid])).length)throw new Problem('Fabricante incompatible con promoción asignada.');const url=text(r,'image_url',0,2048);if(url&&!url.startsWith('https://'))throw new Problem('La imagen externa debe usar HTTPS.');if(url){try{new URL(url);}catch{throw new Problem('URL de imagen inválida.');}}
   await q(db,'INSERT INTO products(external_code,name,description,price,category,manufacturer_id,image_url,image_valid) VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),price=VALUES(price),category=VALUES(category),manufacturer_id=VALUES(manufacturer_id),image_url=VALUES(image_url),image_valid=VALUES(image_valid)',[code,name,text(r,'description',0,2000),integer(r.price,'precio'),text(r,'category',0,80)||'General',mid,url,Boolean(url)]);
  }accepted++;
 }catch(e){await db.query('ROLLBACK TO SAVEPOINT import_row');if(!e.status&&!e.code?.startsWith('ER_'))throw e;rejected.push({row:index+1,error:e.status?e.message:'Referencia o valor duplicado inválido.'});}finally{await db.query('RELEASE SAVEPOINT import_row');}}
 await audit(db,u,'sincronizacion',`Importación ${kind}: ${accepted} aceptados, ${rejected.length} rechazados.`,rejected.length?'aviso':'exito');return {accepted,rejected};
}
