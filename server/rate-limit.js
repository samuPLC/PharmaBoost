import {Problem} from './security.js';
export function createLimiter(){
 const attempts=new Map();
 return (key,limit=10,now=Date.now())=>{
  for(const [id,value] of attempts)if(value.expires<=now)attempts.delete(id);
  const value=attempts.get(key)||{count:0,expires:now+300000};
  if(value.count>=limit)throw new Problem('Demasiados intentos. Espera cinco minutos.',429);
  value.count++;attempts.set(key,value);
 };
}
