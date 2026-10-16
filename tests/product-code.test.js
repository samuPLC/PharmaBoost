import test from 'node:test';
import assert from 'node:assert/strict';
import {insertAutoCodeProduct} from '../server/product-code.js';
test('Código automático y reintento si el índice detecta duplicado',async()=>{
 const codes=[];const db={async execute(sql,args){codes.push(args[0]);assert.equal(args[1],'Producto');if(codes.length===1)throw Object.assign(new Error('duplicate'),{code:'ER_DUP_ENTRY'});return [{insertId:17}];}};
 const result=await insertAutoCodeProduct(db,['Producto','Descripción',100,'Salud',1]);
 assert.equal(result.id,17);assert.match(result.code,/^PB-[A-F0-9]{12}$/);assert.equal(codes.length,2);assert.notEqual(codes[0],codes[1]);
});
test('Errores de base distintos a duplicado no se ocultan',async()=>{
 const error=Object.assign(new Error('offline'),{code:'ECONNREFUSED'});
 await assert.rejects(insertAutoCodeProduct({execute:async()=>{throw error;}},[]),e=>e===error);
});
