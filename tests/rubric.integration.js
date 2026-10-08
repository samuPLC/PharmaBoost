import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,query as q} from '../server/db.js';
import {checkLogin,LOCK_MS} from '../server/login-guard.js';
import {passwordHash,verifyPassword} from '../server/security.js';
if(process.env.DB_PORT!=='3307')throw new Error('Solo base aislada en 3307.');
const db=await pool.getConnection();
try{
 await db.beginTransaction();const mail=randomUUID()+'@example.test',password='Prueba-'+randomUUID(),hash=await passwordHash(password);
 const uid=(await q(db,"INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'ventas')",['Rúbrica QA',mail,hash])).insertId;
 assert.notEqual(hash,password);assert(await verifyPassword(password,hash));
 const time=Date.now();
 for(let i=0;i<4;i++){const r=await checkLogin(db,mail,'incorrecta',time+i);assert(r.rejected&&!r.lockedUntil);}
 const fifth=await checkLogin(db,mail,'incorrecta',time+4);assert.equal(fifth.lockedUntil,time+4+LOCK_MS);
 assert((await checkLogin(db,mail,password,time+5)).rejected);
 assert((await checkLogin(db,mail,password,time+LOCK_MS+3)).rejected);
 assert.equal((await checkLogin(db,mail,password,time+LOCK_MS+4)).user.id,uid);
 assert.equal((await checkLogin(db,mail,'incorrecta',time+LOCK_MS+5)).lockedUntil,0);
 assert((await checkLogin(db,"' OR 1=1 --@example.test",password,time)).rejected);
 const [stored]=await q(db,"SELECT COUNT(*) total FROM audit WHERE user_id=? AND event='auth_locked'",[uid]);assert.equal(stored.total,1);
 console.log('OK: hash, cuatro rechazos, quinto bloqueo persistente, contraseña válida bloqueada, vencimiento completo, reinicio tras éxito e inyección sin autenticación. Rollback.');
}finally{await db.rollback();db.release();await pool.end();}
