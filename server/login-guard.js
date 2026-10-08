import {query as q} from './db.js';
import {hashToken,verifyPassword} from './security.js';
export const LOCK_MS=5*60*1000;
export function loginState(rows,now=Date.now()){
 let failures=0;
 for(const row of rows){
  if(row.event==='auth_success')break;
  if(row.event==='auth_locked'){const until=Date.parse(row.created_at)+LOCK_MS;return {failures,lockedUntil:until>now?until:0};}
  if(Date.parse(row.created_at)>now-LOCK_MS)failures++;
 }
 return {failures,lockedUntil:0};
}
// Call inside the request transaction. User row locks serialize concurrent attempts.
export async function checkLogin(db,mail,password,now=Date.now()){
 const key=hashToken(mail),[user]=await q(db,'SELECT * FROM users WHERE email=? FOR UPDATE',[mail]);
 const rows=await q(db,"SELECT event,created_at FROM audit WHERE description=? AND event IN ('auth_failure','auth_success','auth_locked') ORDER BY id DESC LIMIT 6",[key]);
 const state=loginState(rows,now);
 if(state.lockedUntil)return {rejected:true,lockedUntil:state.lockedUntil};
 const valid=Boolean(user?.active)&&await verifyPassword(password,user.password_hash);
 await q(db,'INSERT INTO audit(user_id,event,description,result,created_at) VALUES(?,?,?,?,?)',[user?.id??null,valid?'auth_success':state.failures+1>=5?'auth_locked':'auth_failure',key,valid?'exito':'error',new Date(now).toISOString()]);
 return valid?{user}:{rejected:true,lockedUntil:state.failures+1>=5?now+LOCK_MS:0};
}
