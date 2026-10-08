import test from 'node:test';
import assert from 'node:assert/strict';
import {amount,purchaseCost,valuation} from '../server/inventory-cost.js';
import {verifyPassword} from '../server/security.js';
test('Promedio ponderado conserva el valor de compras a precios distintos',()=>{
 assert.equal(purchaseCost(10,10000,10,20000),15000);
 assert.equal(purchaseCost(0,null,3,123.45),123.45);
 assert.equal(purchaseCost(2,10,1,11),10.33);
});
test('No inventa costos para existencias históricas o entradas sin valorar',()=>{
 const rows=[{event:'stock',product_id:1,delta:10},{event:'stock',product_id:1,delta:5,average_cost:15,markup:30},{event:'stock',product_id:1,delta:-2,kind:'despacho'}];
 assert.equal(valuation(rows,1).average_cost,15);
 rows.push({event:'stock',product_id:1,delta:1,kind:'entrada'});
 assert.equal(valuation(rows,1).average_cost,null);
 assert.equal(valuation(rows,2).average_cost,null);
});
test('Rechaza costos negativos, cadenas, infinitos y precisión inválida',()=>{
 for(const v of [-1,'20',NaN,Infinity,0.001,1000000001])assert.throws(()=>amount(v,'Costo'));
 assert.equal(amount(0,'Costo'),0);assert.equal(amount(10.12,'Costo'),10.12);
});
test('Un hash corrupto no provoca un error interno',async()=>{
 for(const v of [null,'bad','abc:123',{},'a:b:c'])assert.equal(await verifyPassword('test',v),false);
});
