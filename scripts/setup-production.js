import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
import {config,pool} from '../server/db.js';
import {passwordHash,email} from '../server/security.js';

let db;
try {
  if(process.env.NODE_ENV!=='production')throw new Error('Este comando requiere NODE_ENV=production.');
  if(!config.password)throw new Error('Falta DB_PASSWORD.');
  db=await mysql.createConnection({...config,multipleStatements:true});
  const [[lock]]=await db.query("SELECT GET_LOCK('pharmaboost_setup',60) acquired");
  if(lock.acquired!==1)throw new Error('No fue posible obtener el bloqueo de instalación.');
  // Railway suministra una base existente. No crear ni seleccionar la base local.
  const sql=(await readFile(new URL('../database/schema.sql',import.meta.url),'utf8'))
    .replace(/^CREATE DATABASE[^;]*;\s*/mi,'').replace(/^USE[^;]*;\s*/mi,'');
  await db.query(sql);
  const [[row]]=await db.query('SELECT COUNT(*) n FROM users');
  if(!row.n){
    const mail=email({email:process.env.ADMIN_EMAIL||''});
    const password=process.env.ADMIN_PASSWORD||'';
    if(password.length<12||password.length>200)throw new Error('ADMIN_PASSWORD debe tener entre 12 y 200 caracteres.');
    await db.execute("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin')",
      ['Administrador',mail,await passwordHash(password)]);
  }
  console.log('Base de producción preparada; datos existentes conservados.');
}catch(error){console.error('Instalación de producción:',error.code||error.message);process.exitCode=1;}
finally{if(db)await db.end();await pool.end();}
