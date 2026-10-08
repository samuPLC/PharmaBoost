import {query} from '../server/db.js';
import {submitOrder,saveVisit} from '../server/service.js';
export async function addInitialActivity(db){
 let orders=0,visits=0;
 for(const [email,promoName,count] of [['agente@pharmaboost.local','Bienestar que llega más lejos',4],['agente2@pharmaboost.local','Cuidado esencial Vitalis',2]]){
  const [u]=await query(db,"SELECT * FROM users WHERE email=? AND active=1 AND role='agente'",[email]);
  if(!u)throw Error('No se encontró el agente inicial activo: '+email);
  const [p]=await query(db,"SELECT p.* FROM promotions p JOIN promotion_agents a ON a.promotion_id=p.id WHERE p.name=? AND a.agent_id=? AND p.status='activa' ORDER BY p.id LIMIT 1",[promoName,u.id]);
  if(!p)throw Error('No existe la promoción inicial activa y asignada.');
  const stores=await query(db,'SELECT s.* FROM stores s JOIN promotion_stores ps ON ps.store_id=s.id WHERE ps.promotion_id=? ORDER BY s.id',[p.id]);
  const products=await query(db,'SELECT pr.* FROM products pr JOIN promotion_products pp ON pp.product_id=pr.id WHERE pp.promotion_id=? ORDER BY pr.id',[p.id]);
  if(stores.length<(count===4?4:2)||products.length<2)throw Error('Faltan tiendas o productos asignados para la carga inicial.');
  const timestamp=offset=>{const earliest=Date.parse(p.start_date+'T12:00:00Z'),latest=Math.min(Date.now(),Date.parse(p.end_date+'T18:00:00Z'));if(earliest>latest)throw Error('La promoción aún no comienza.');return new Date(Math.max(earliest,latest-offset*86400000)).toISOString();};
  for(let n=0;n<count;n++){
   const id=`inicial-v25-p${p.id}-pedido-${n+1}`;
   if((await query(db,'SELECT id FROM orders WHERE id=?',[id])).length)continue;
   const store=stores[n%(count===4?3:2)];const picks=[products[n%products.length],products[(n+1)%products.length]];
   await submitOrder(db,u,{id,promotion_id:p.id,store_id:store.id,confirmed:true,confirmed_by:'Carga inicial',notes:'Registro de ejemplo cargado a solicitud del usuario para visualizar el resumen. No corresponde a una venta real.',captured_at:timestamp(count-n),captured_offline:false,items:picks.map((pr,i)=>({product_id:pr.id,quantity:(n+1)*2+i+1,unit_price:pr.price}))});orders++;
  }
  if(count===4){const id=`inicial-v25-p${p.id}-visita-1`;if(!(await query(db,'SELECT id FROM visits WHERE id=?',[id])).length){await saveVisit(db,u,{id,store_id:stores[3].id,promotion_id:p.id,created_at:timestamp(1),notes:'Visita de ejemplo sin pedido, cargada a solicitud del usuario.'});visits++;}}
 }
 return {orders,visits};
}
