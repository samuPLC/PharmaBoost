import {query as q} from './db.js';
import {Problem,requireRole,text,integer} from './security.js';
import {audit} from './service.js';

export async function saveStore(db,user,data,id){
 requireRole(user,'admin');
 const fields=[text(data,'external_code',1,80),text(data,'name',2,160),text(data,'address',2,300),text(data,'zone',0,120),text(data,'phone',0,80),text(data,'manager',2,120)];
 if(typeof data.coverage!=='boolean')throw new Problem('Selecciona la cobertura de la tienda.');
 if(id){
  integer(id,'tienda');
  if(!(await q(db,'SELECT id FROM stores WHERE id=? FOR UPDATE',[id])).length)throw new Problem('Tienda no encontrada.',404);
 }
 if((await q(db,'SELECT id FROM stores WHERE external_code=? AND id<>?',[fields[0],id||0])).length)throw new Problem('Ya existe una tienda con ese código.',409);
 if(id)await q(db,'UPDATE stores SET external_code=?,name=?,address=?,zone=?,phone=?,manager=?,coverage=? WHERE id=?',[...fields,data.coverage,id]);
 else id=(await q(db,'INSERT INTO stores(external_code,name,address,zone,phone,manager,coverage) VALUES(?,?,?,?,?,?,?)',[...fields,data.coverage])).insertId;
 await audit(db,user,'tienda',`Tienda guardada: ${id} · ${fields[0]} · ${fields[1]}`);
 return {id};
}

export async function deleteStore(db,user,id){
 requireRole(user,'admin');integer(id,'tienda');
 const [store]=await q(db,'SELECT id,name,external_code FROM stores WHERE id=? FOR UPDATE',[id]);
 if(!store)throw new Problem('Tienda no encontrada.',404);
 for(const table of ['promotion_stores','orders','visits','audit']){
  if((await q(db,`SELECT 1 FROM ${table} WHERE store_id=? LIMIT 1`,[id])).length)
   throw new Problem('No se puede eliminar una tienda con promociones asignadas, pedidos, visitas o historial. Se conserva para mantener la trazabilidad.',409);
 }
 await q(db,'DELETE FROM stores WHERE id=?',[id]);
 await audit(db,user,'tienda',`Tienda eliminada: ${id} · ${store.external_code} · ${store.name}`);
 return {ok:true};
}
