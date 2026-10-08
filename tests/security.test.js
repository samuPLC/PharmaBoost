import test from 'node:test';
import assert from 'node:assert/strict';
import {passwordHash,verifyPassword,text,integer,ids,dateOnly,captureTime,canonical,requireRole,email} from '../server/security.js';
test('Contraseñas saladas y verificación',async()=>{const a=await passwordHash('Pharma2026!'),b=await passwordHash('Pharma2026!');assert.notEqual(a,b);assert(await verifyPassword('Pharma2026!',a));assert(!await verifyPassword('incorrecta',a));});
test('Validaciones rechazan cantidades y fechas inválidas',()=>{for(const n of [0,-1,1.2,true,NaN,'1'])assert.throws(()=>integer(n,'cantidad'));assert.equal(integer(2,'cantidad'),2);assert.throws(()=>dateOnly('2026-02-30'));assert.equal(dateOnly('2026-02-28'),'2026-02-28');assert.throws(()=>captureTime('2099-01-01T00:00:00Z'));assert.throws(()=>captureTime('2026-01-01'));});
test('Permisos, correo y listas',()=>{assert.throws(()=>requireRole({role:'agente'},'admin'));assert.throws(()=>email({email:'malo'}));assert.equal(email({email:'AGENTE@EXAMPLE.COM'}),'agente@example.com');assert.deepEqual(ids({a:[1,2,1]},'a'),[1,2]);assert.throws(()=>ids({a:[]},'a'));assert.throws(()=>text({name:3},'name'));});
test('Huella canónica independiente del orden de propiedades',()=>{assert.equal(canonical({b:2,a:[{z:3,c:1}]}),canonical({a:[{c:1,z:3}],b:2}));assert.notEqual(canonical({a:1}),canonical({a:2}));});
