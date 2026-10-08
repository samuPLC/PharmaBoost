import test from 'node:test';
import assert from 'node:assert/strict';
import {createLimiter} from '../server/rate-limit.js';
test('Límite por IP compartido entre correos y renovación después de cinco minutos',()=>{
 const limit=createLimiter();for(let i=0;i<60;i++){limit('ip:1',60,0);limit('ip:1:correo'+i,10,0);}
 assert.throws(()=>limit('ip:1',60,1),e=>e.status===429);
 assert.doesNotThrow(()=>limit('ip:2',60,1));
 assert.doesNotThrow(()=>limit('ip:1',60,300000));
});
