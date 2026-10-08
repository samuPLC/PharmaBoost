import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarize,transitions} from '../web/commercial.js';
test('Reportes excluyen cancelados y revisión y agregan cantidades por producto y agente',()=>{
 const base={agent_id:1,agent_name:'Agente',status:'enviado',commercial_status:'pendiente',total:60,items:[{product_id:1,product_name:'Producto',quantity:3,unit_price:20}]};
 const r=summarize([base,{...base,commercial_status:'entregado'},{...base,commercial_status:'cancelado'},{...base,status:'revision'}]);
 assert.equal(r.total,120);assert.equal(r.count,2);assert.equal(r.received,4);assert.equal(r.delivered,1);assert.equal(r.cancelled,1);assert.equal(r.review,1);assert.equal(r.products[0].count,6);assert.equal(r.agents[0].total,120);
});
test('Entregado y cancelado son finales y despacho no permite cancelar',()=>{assert.deepEqual(transitions.entregado,[]);assert.deepEqual(transitions.cancelado,[]);assert.deepEqual(transitions.despachado,['entregado']);});
test('El neto descuenta devoluciones sin alterar cantidades originales ni incluir cancelados',()=>{const o={status:'enviado',commercial_status:'entregado',agent_id:1,agent_name:'Agente',total:300,items:[{product_id:1,product_name:'Producto',quantity:3,unit_price:100}],returns:[{total:100}]};const r=summarize([o,{...o,commercial_status:'cancelado'}]);assert.equal(r.total,300);assert.equal(r.returned,100);assert.equal(r.net,200);assert.equal(r.products[0].count,3);});
