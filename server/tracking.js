import {dispatchStock} from './operations.js';
import {query as q} from './db.js';
import {Problem,requireRole,text} from './security.js';
import {transitions} from '../web/commercial.js';

// Append-only history in the existing MySQL audit table; no destructive migration.
export async function histories(db,orderId){
 const rows=await q(db,"SELECT a.id,a.description,a.created_at,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE a.event='seguimiento'"+(orderId?" AND JSON_UNQUOTE(JSON_EXTRACT(IF(JSON_VALID(a.description),a.description,'{}'),'$.order_id'))=?":"")+" ORDER BY a.id",orderId?[orderId]:[]);
 const result=new Map();for(const r of rows){try{const e=JSON.parse(r.description);if(e.order_id&&transitions[e.state]){const h=result.get(e.order_id)||[];h.push({...e,id:r.id,created_at:r.created_at,actor:r.actor});result.set(e.order_id,h);}}catch{}}
 return result;
}
export async function updateTracking(db,u,id,d){
 requireRole(u,'admin','ventas');
 const [order]=await q(db,'SELECT * FROM orders WHERE id=? FOR UPDATE',[id]);
 if(!order)throw new Problem('Pedido no encontrado.',404);
 const history=(await histories(db,id)).get(id)||[],current=history.at(-1)?.state||'pendiente';
 if(d.expected!==current)throw new Problem('El pedido cambió. Actualiza los datos antes de continuar.',409);
 const next=text(d,'state',1,30),note=text(d,'note',3,500);
 if(!transitions[current]?.includes(next))throw new Problem('Cambio de estado no permitido.',409);
 if(order.status==='revision'&&next!=='cancelado')throw new Problem('El pedido requiere revisión de precios; no puede despacharse desde esta versión.',409);
 if(next==='despachado')await dispatchStock(db,u,order);
 await q(db,'INSERT INTO audit(user_id,event,description,result,created_at,store_id,promotion_id) VALUES(?,?,?,?,?,?,?)',[u.id,'seguimiento',JSON.stringify({order_id:id,previous:current,state:next,note}),'exito',new Date().toISOString(),order.store_id,order.promotion_id]);
 return {ok:true,state:next};
}
