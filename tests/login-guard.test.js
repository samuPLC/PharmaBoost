import test from 'node:test';
import assert from 'node:assert/strict';
import {loginState,LOCK_MS} from '../server/login-guard.js';
const now=Date.parse('2026-10-01T12:00:00Z');
const row=(event,age=0)=>({event,created_at:new Date(now-age).toISOString()});
test('Bloqueo dura cinco minutos completos desde el quinto fallo',()=>{
 assert.equal(loginState([row('auth_locked'),row('auth_failure',LOCK_MS-1)],now+LOCK_MS-1).lockedUntil,now+LOCK_MS);
 assert.equal(loginState([row('auth_locked')],now+LOCK_MS).lockedUntil,0);
});
test('Éxito reinicia fallos y fallos antiguos caducan',()=>{
 assert.equal(loginState([row('auth_failure'),row('auth_success'),row('auth_failure')],now).failures,1);
 assert.equal(loginState([row('auth_failure',LOCK_MS+1)],now).failures,0);
 assert.equal(loginState([row('auth_failure'),row('auth_locked',LOCK_MS+1),row('auth_failure')],now).failures,1);
});
