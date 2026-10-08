import {selectedSupplier} from './suppliers.js';
import {amount,valuation,purchaseCost} from './inventory-cost.js';
import {query as q} from './db.js';
import {Problem,requireRole,text,integer,canonical,hashToken} from './security.js';

// Append-only operational ledger in MySQL. Product/order row locks serialize writes.
export async function events(db){
 const rows=await q(db,"SELECT a.id,a.user_id,a.event,a.description,a.created_at,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE a.event IN ('stock','descuento','devolucion','producto_config') ORDER BY a.id");
 return rows.flatMap(r=>{try{return [{...JSON.parse(r.description),event:r.event,event_id:r.id,user_id:r.user_id,created_at:r.created_at,actor:r.actor}];}catch{return [];}});
}
export function productState(rows,pid){const stock=rows.filter(r=>r.event==='stock'&&r.product_id===pid),discount=rows.filter(r=>r.event==='descuento'&&r.product_id===pid).at(-1);const config=rows.filter(r=>r.event==='producto_config'&&r.product_id===pid).at(-1);return {unit:config?.unit||'unidad',stock_max:config?.stock_max||0,...valuation(rows,pid),stock:stock.reduce((s,r)=>s+r.delta,0),stock_enabled:stock.length>0,stock_min:stock.filter(r=>r.minimum!==undefined).at(-1)?.minimum||0,discount_min:discount?.minimum||0,discount_percent:discount?.percent||0};}
async function record(db,u,event,data,store=null,promotion=null){await q(db,'INSERT INTO audit(user_id,event,description,result,created_at,store_id,promotion_id) VALUES(?,?,?,?,?,?,?)',[u.id,event,JSON.stringify(data),'exito',new Date().toISOString(),store,promotion]);}
export async function lockProducts(db,ids){for(const id of [...new Set(ids)].sort((a,b)=>a-b)){if(!(await q(db,'SELECT id FROM products WHERE id=? FOR UPDATE',[id])).length)throw new Problem('Producto no encontrado.',404);}}
function duplicate(rows,id,payload){const old=rows.find(r=>r.request_id===id);if(old){if(old.digest!==hashToken(canonical(payload)))throw new Problem('Identificador utilizado con otros datos.',409);return true;}return false;}
export async function stockMovement(db,u,d){
 requireRole(u,'admin','ventas');const pid=integer(d.product_id,'producto'),id=text(d,'request_id',10,80),quantity=integer(d.quantity,'cantidad',1,1000000),minimum=integer(d.minimum,'stock mínimo',0,1000000),note=text(d,'note',3,500);
 if(!['entrada','salida'].includes(d.kind))throw new Problem('Tipo de movimiento inválido.');await lockProducts(db,[pid]);const rows=await events(db);if(duplicate(rows,id,d))return {ok:true,duplicate:true};
 const current=productState(rows,pid);if(current.stock_max&&minimum>current.stock_max)throw new Problem('El mínimo no puede superar el máximo configurado.');const delta=d.kind==='entrada'?quantity:-quantity,balance=current.stock+delta;
 if(balance<0||balance>1000000000)throw new Problem('El movimiento deja existencias fuera del rango permitido.',409);
 const reason=d.reason??'ajuste_manual';if(!['compra_proveedor','inventario_inicial','ajuste_manual','merma'].includes(reason)||d.kind==='salida'&&['compra_proveedor','inventario_inicial'].includes(reason)||d.kind==='entrada'&&reason==='merma')throw new Problem('Motivo incompatible con el movimiento.');
 let supplier='',supplier_id=null;if(d.supplier_id!=null){const selected=await selectedSupplier(db,d.supplier_id);supplier=selected.name;supplier_id=selected.id;}else if(reason==='compra_proveedor')throw new Problem('Selecciona un proveedor registrado para la compra.');const invoice=text(d,'invoice',0,100);
 let average_cost=current.average_cost,markup=current.markup;
 if(d.kind==='entrada'){
  if(d.unit_cost!==undefined){const cost=amount(d.unit_cost,'Costo unitario');let previous=current.average_cost;if(current.stock>0&&previous===null){if(d.previous_cost===undefined)throw new Problem('Registra el costo unitario de las existencias anteriores.');previous=amount(d.previous_cost,'Costo anterior');}average_cost=purchaseCost(current.stock,previous,quantity,cost);}
  else {if(reason==='compra_proveedor')throw new Problem('La compra requiere costo unitario.');average_cost=null;}
 }else if(d.unit_cost!==undefined)throw new Problem('El costo de compra solo aplica a entradas.');
 if(d.markup!==undefined)markup=amount(d.markup,'Porcentaje sobre costo',1000);
 if(d.update_price!==undefined&&typeof d.update_price!=='boolean')throw new Problem('Actualizar precio debe ser verdadero o falso.');
 if(d.update_price){if(average_cost===null||markup===null)throw new Problem('Registra costo y porcentaje antes de calcular el precio.');const price=Math.round(average_cost*(1+markup/100));if(price<1||price>1000000000)throw new Problem('Precio calculado fuera de rango.');await q(db,'UPDATE products SET price=? WHERE id=?',[price,pid]);}

 await record(db,u,'stock',{product_id:pid,unit:current.unit,delta,minimum,note,kind:d.kind,reason,supplier,supplier_id,invoice,average_cost,markup,unit_cost:d.unit_cost,previous_cost:d.previous_cost,request_id:id,digest:hashToken(canonical(d))});return {ok:true,stock:balance};
}
export async function saveDiscount(db,u,pid,d){
 if(d.discount_min===undefined&&d.discount_percent===undefined)return;
 requireRole(u,'admin');const minimum=integer(d.discount_min,'cantidad mínima',0,10000),percent=integer(d.discount_percent,'descuento',0,90);
 if((minimum===0)!==(percent===0))throw new Problem('Usa cantidad y porcentaje mayores a cero, o ambos cero para desactivar.');
 await lockProducts(db,[pid]);await record(db,u,'descuento',{product_id:pid,minimum,percent});
}
export async function dispatchStock(db,u,order){
 const items=await q(db,'SELECT * FROM order_items WHERE order_id=?',[order.id]);await lockProducts(db,items.map(i=>i.product_id));const rows=await events(db);
 for(const i of items){const p=productState(rows,i.product_id);if(!p.stock_enabled||p.stock<i.quantity)throw new Problem('Existencias insuficientes o sin registrar para el producto '+i.product_id+'. Registra la entrada en Inventario antes de despachar.',409);}
 for(const i of items)await record(db,u,'stock',{product_id:i.product_id,unit:productState(rows,i.product_id).unit,delta:-i.quantity,kind:'despacho',order_id:order.id,note:'Salida por despacho '+order.id},order.store_id,order.promotion_id);
}
export async function returnItems(db,u,d){
 requireRole(u,'admin','ventas');const id=text(d,'request_id',10,80),oid=text(d,'order_id',10,80),note=text(d,'note',3,500);
 if(!['cuarentena','reintegrar'].includes(d.destination))throw new Problem('Destino inválido.');
 const [order]=await q(db,'SELECT * FROM orders WHERE id=? FOR UPDATE',[oid]);if(!order)throw new Problem('Pedido no encontrado.',404);
 if(!Array.isArray(d.items)||!d.items.length||d.items.length>500)throw new Problem('Selecciona al menos una cantidad para devolver.');
 const original=await q(db,'SELECT * FROM order_items WHERE order_id=?',[oid]),seen=new Set();
 for(const i of d.items){if(!i||typeof i!=='object'||Array.isArray(i))throw new Problem('Detalle de producto inválido.');integer(i.product_id,'producto');integer(i.quantity,'cantidad',1,10000);if(seen.has(i.product_id)||!original.some(o=>o.product_id===i.product_id))throw new Problem('Producto repetido o ajeno al pedido.');seen.add(i.product_id);}
 await lockProducts(db,[...seen]);const rows=await events(db);if(duplicate(rows,id,d))return {ok:true,duplicate:true};
 const tracking=await q(db,"SELECT description FROM audit WHERE event='seguimiento' AND JSON_UNQUOTE(JSON_EXTRACT(IF(JSON_VALID(description),description,'{}'),'$.order_id'))=? ORDER BY id DESC LIMIT 1",[oid]);
 if(!tracking.length||JSON.parse(tracking[0].description).state!=='entregado')throw new Problem('Solo se aceptan devoluciones de pedidos entregados.',409);
 const prior=rows.filter(r=>r.event==='devolucion'&&r.order_id===oid);let total=0;
 for(const i of d.items){const o=original.find(o=>o.product_id===i.product_id),returned=prior.reduce((s,r)=>s+r.items.filter(x=>x.product_id===i.product_id).reduce((a,x)=>a+x.quantity,0),0);if(returned+i.quantity>o.quantity)throw new Problem('La devolución supera la cantidad pendiente del producto '+i.product_id+'.',409);total+=i.quantity*o.unit_price;
  if(d.destination==='reintegrar'&&!rows.some(r=>r.event==='stock'&&r.kind==='despacho'&&r.order_id===oid&&r.product_id===i.product_id))throw new Problem('Este pedido histórico no descontó inventario. Registra la devolución en cuarentena.',409);
  if(d.destination==='reintegrar'&&productState(rows,i.product_id).stock+i.quantity>1000000000)throw new Problem('El reintegro excede el saldo máximo permitido.',409);
 }
 const data={request_id:id,digest:hashToken(canonical(d)),order_id:oid,items:d.items.map(i=>({product_id:i.product_id,quantity:i.quantity})),destination:d.destination,note,total};
 await record(db,u,'devolucion',data,order.store_id,order.promotion_id);
 if(d.destination==='reintegrar')for(const i of d.items)await record(db,u,'stock',{product_id:i.product_id,unit:productState(rows,i.product_id).unit,delta:i.quantity,kind:'devolucion',return_id:id,order_id:oid,note},order.store_id,order.promotion_id);
 return {ok:true,total};
}

export async function saveProductConfig(db,u,pid,d){
 if(d.unit===undefined&&d.stock_max===undefined)return;
 requireRole(u,'admin');const unit=text(d,'unit',1,40),stock_max=integer(d.stock_max,'stock máximo',0,1000000);
 if(!['unidad','caja','frasco','tubo','paquete','blíster','kit'].includes(unit))throw new Problem('Unidad de venta inválida.');
 await lockProducts(db,[pid]);const current=productState(await events(db),pid);
 if(current.stock_enabled&&unit!==current.unit)throw new Problem('No cambies la unidad de un producto con movimientos; crea una presentación distinta.');
 if(stock_max&&stock_max<current.stock_min)throw new Problem('El máximo no puede ser menor al mínimo.');
 await record(db,u,'producto_config',{product_id:pid,unit,stock_max});
}

export async function saveInventorySettings(db,u,d){
 requireRole(u,'admin');const pid=integer(d.product_id,'producto'),price=integer(d.price,'precio',1,1000000000);
 await lockProducts(db,[pid]);await saveProductConfig(db,u,pid,d);await saveDiscount(db,u,pid,d);
 const [old]=await q(db,'SELECT price FROM products WHERE id=?',[pid]);
 await q(db,'UPDATE products SET price=? WHERE id=?',[price,pid]);
 await record(db,u,'precio_inventario',{product_id:pid,previous_price:Number(old.price),price});return {ok:true};
}
