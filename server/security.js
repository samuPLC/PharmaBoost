import {randomBytes,pbkdf2,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(pbkdf2);
export class Problem extends Error {constructor(message,status=400,details){super(message);this.status=status;this.details=details;}}
export const hashToken=t=>createHash('sha256').update(t).digest('hex');
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');return salt+':'+(await derive(password,Buffer.from(salt,'hex'),310000,32,'sha256')).toString('hex');}
export async function verifyPassword(password,encoded){if(typeof encoded!=='string'||!/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(encoded))return false;const [salt,hex]=encoded.split(':');const actual=await derive(password,Buffer.from(salt,'hex'),310000,32,'sha256');const expected=Buffer.from(hex,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}
export function text(d,key,min=1,max=200){const v=d[key]??'';if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw new Problem(`El campo ${key} debe tener entre ${min} y ${max} caracteres.`);return v.trim();}
export function integer(v,field,min=1,max=1000000000){if(!Number.isSafeInteger(v)||v<min||v>max)throw new Problem(`${field}: ingresa un entero entre ${min} y ${max}.`);return v;}
export function ids(d,key){if(!Array.isArray(d[key])||!d[key].length||d[key].length>10000)throw new Problem(`Selecciona elementos en ${key}.`);return [...new Set(d[key].map(v=>integer(v,key)))];}
export function requireRole(user,...roles){if(!roles.includes(user.role))throw new Problem('No tienes permiso para realizar esta operación.',403);}
export function email(d){const value=text(d,'email',5,160).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Problem('El correo no es válido.');return value;}
export function dateOnly(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Problem('La fecha no es válida.');return value;}
export function captureTime(value){const n=Date.parse(value);if(typeof value!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(n)||n>Date.now()+300000)throw new Problem('Fecha de captura inválida.');return new Date(n).toISOString();}
export function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
export const publicUser=({password_hash,...user})=>user;
