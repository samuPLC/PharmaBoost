import {Problem} from './security.js';
export const roundCost=n=>Math.round((n+Number.EPSILON)*100)/100;
export function amount(v,name,max=1000000000){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max||Math.abs(v*100-Math.round(v*100))>0.0001)throw new Problem(name+': usa un valor positivo o cero con hasta dos decimales.');return v;}
export function valuation(rows,pid){let stock=0,cost=null,markup=null;
 for(const r of rows.filter(r=>r.event==='stock'&&r.product_id===pid)){
  if(Object.hasOwn(r,'average_cost'))cost=r.average_cost;
  else if(r.delta>0&&r.kind!=='devolucion')cost=null;
  if(r.markup!==undefined)markup=r.markup;
  stock+=r.delta;
 }
 return {average_cost:cost,markup};
}
export function purchaseCost(stock,oldCost,qty,newCost){return roundCost((stock*(oldCost??0)+qty*newCost)/(stock+qty));}
