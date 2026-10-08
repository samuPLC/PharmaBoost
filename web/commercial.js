export const stages={pendiente:'Pendiente',preparacion:'En preparación',despachado:'Despachado',entregado:'Entregado',cancelado:'Cancelado'};
export const transitions={pendiente:['preparacion','cancelado'],preparacion:['despachado','cancelado'],despachado:['entregado'],entregado:[],cancelado:[]};
export function summarize(orders){
 const included=orders.filter(o=>o.commercial_status!=='cancelado'&&o.status!=='revision');
 const products=new Map(),agents=new Map();
 for(const o of included){
  const a=agents.get(o.agent_id)||{name:o.agent_name,count:0,total:0};a.count++;a.total+=Number(o.total);agents.set(o.agent_id,a);
  for(const i of o.items){const p=products.get(i.product_id)||{name:i.product_name,count:0,total:0};p.count+=Number(i.quantity);p.total+=Number(i.quantity)*Number(i.unit_price);products.set(i.product_id,p);}
 }
 const returned=included.reduce((sum,o)=>sum+(o.returns||[]).reduce((s,r)=>s+Number(r.total),0),0);
 return {returned,net:included.reduce((s,o)=>s+Number(o.total),0)-returned,received:orders.length,delivered:included.filter(o=>o.commercial_status==='entregado').length,count:included.length,total:included.reduce((s,o)=>s+Number(o.total),0),cancelled:orders.filter(o=>o.commercial_status==='cancelado').length,review:orders.filter(o=>o.status==='revision').length,products:[...products.values()].sort((a,b)=>b.count-a.count),agents:[...agents.values()].sort((a,b)=>b.total-a.total)};
}
