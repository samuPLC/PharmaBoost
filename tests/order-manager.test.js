import test from 'node:test';
import assert from 'node:assert/strict';
import {submitOrder} from '../server/service.js';

function database(manager){
 const writes=[];
 return {writes,async execute(sql,args=[]){
  if(sql.startsWith('SELECT id FROM users'))return [[{id:3}]];
  if(sql.startsWith('SELECT * FROM orders'))return [[]];
  if(sql.startsWith('SELECT p.* FROM promotions'))return [[{manufacturer_id:1,status:'activa',start_date:'2020-01-01',end_date:'2099-12-31'}]];
  if(sql.startsWith('SELECT manager'))return [[{manager}]];
  if(sql.includes('FROM audit'))return [[]];
  if(sql.startsWith('SELECT p.* FROM products'))return [[{id:2,manufacturer_id:1,price:1000}]];
  if(sql.startsWith('INSERT')){writes.push({sql,args});return [{insertId:1}];}
  throw new Error('Consulta inesperada: '+sql);
 }};
}
const user={id:3,role:'agente',manufacturer_id:1};
const payload=()=>({id:'test-order-manager-01',promotion_id:1,store_id:1,confirmed:true,confirmed_by:'Nombre manipulado',captured_at:new Date().toISOString(),notes:'',items:[{product_id:2,quantity:1,unit_price:1000}]});
test('Pedido usa el responsable de la tienda aunque el cliente envie otro nombre',async()=>{
 const db=database('Sofía Ramírez');await submitOrder(db,user,payload());
 const order=db.writes.find(w=>w.sql.startsWith('INSERT INTO orders'));
 assert.equal(order.args[8],'Sofía Ramírez');
});
test('Tienda sin responsable no permite guardar un pedido',async()=>{
 const db=database('');await assert.rejects(submitOrder(db,user,payload()),e=>e.status===409);
 assert.equal(db.writes.length,0);
});
