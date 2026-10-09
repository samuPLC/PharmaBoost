import test from 'node:test';
import assert from 'node:assert/strict';
import {saveStore,deleteStore} from '../server/stores.js';
const admin={id:1,role:'admin'};
const data={external_code:'DP-QA',name:'Tienda QA',address:'Calle 10',zone:'Centro',phone:'123',manager:'Responsable QA',coverage:true};
function mock({duplicate=false,linked='',missing=false}={}){
 const writes=[];return {writes,async execute(sql,args){
  if(sql.includes('external_code=? AND id<>?'))return [duplicate?[{id:2}]:[]];
  if(sql.includes('FROM stores WHERE id=? FOR UPDATE'))return [missing?[]:[{id:1,name:'Tienda QA',external_code:'DP-QA'}]];
  if(sql.startsWith('SELECT 1 FROM'))return [linked&&sql.includes('FROM '+linked+' ')?[{found:1}]:[]];
  writes.push({sql,args});return [{insertId:5,affectedRows:1}];
 }};
}
test('CRUD tiendas restringido al administrador',async()=>{
 for(const role of ['agente','ventas','tic']){
  await assert.rejects(saveStore(mock(),{role},data),e=>e.status===403);
  await assert.rejects(deleteStore(mock(),{role},1),e=>e.status===403);
 }
});
test('Crear y editar tienda valida campos y conserva cobertura booleana',async()=>{
 const db=mock();assert.equal((await saveStore(db,admin,data)).id,5);
 assert.equal((await saveStore(db,admin,{...data,coverage:false},1)).id,1);
 assert.equal(db.writes.find(w=>w.sql.startsWith('UPDATE stores')).args[6],false);
 await assert.rejects(saveStore(mock(),admin,{...data,manager:''}),e=>e.status===400);
 await assert.rejects(saveStore(mock(),admin,{...data,coverage:'true'}),e=>e.status===400);
 await assert.rejects(saveStore(mock({duplicate:true}),admin,data),e=>e.status===409);
 await assert.rejects(saveStore(mock({missing:true}),admin,data,9),e=>e.status===404);
});
test('Eliminar tienda sin referencias deja constancia en auditoria',async()=>{
 const db=mock();await deleteStore(db,admin,1);
 assert(db.writes.some(w=>w.sql.startsWith('DELETE FROM stores')));
 assert(db.writes.some(w=>w.sql.startsWith('INSERT INTO audit')));
});
test('Eliminar no borra tiendas con promociones o historial',async()=>{
 for(const linked of ['promotion_stores','orders','visits','audit']){
  const db=mock({linked});await assert.rejects(deleteStore(db,admin,1),e=>e.status===409);assert.equal(db.writes.length,0);
 }
 await assert.rejects(deleteStore(mock({missing:true}),admin,9),e=>e.status===404);
});
