import mysql from 'mysql2/promise';
import {randomBytes} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {config,pool} from '../server/db.js';
import {seed} from './seed.js';
let db;
try {
 const admin=Boolean(process.env.DB_SETUP_USER);
 if(!admin&&config.password==='')throw new Error('Ejecuta configurar.ps1 para introducir las credenciales de MySQL de forma local.');
 db=await mysql.createConnection({...config,database:undefined,user:process.env.DB_SETUP_USER||config.user,password:process.env.DB_SETUP_PASSWORD??config.password,multipleStatements:true});
 const sql=await readFile(new URL('../database/schema.sql',import.meta.url),'utf8');
 await db.query(sql);
 await db.beginTransaction();await seed(db);await db.commit();
 if(admin){
  const password=randomBytes(30).toString('base64url');
  // Cuenta dedicada. Un nombre aleatorio evita modificar cuentas existentes.
  const user='pb_'+randomBytes(5).toString('hex');
  await db.query('CREATE USER ?@\'localhost\' IDENTIFIED BY ?',[user,password]);
  await db.query('GRANT SELECT, INSERT, UPDATE, DELETE ON pharmaboost_js.* TO ?@\'localhost\'',[user]);
  await writeFile(new URL('../.env',import.meta.url),`DB_HOST=127.0.0.1\nDB_PORT=${config.port}\nDB_NAME=pharmaboost_js\nDB_USER=${user}\nDB_PASSWORD=${password}\nPORT=3080\nHOST=127.0.0.1\nAPP_ORIGIN=http://localhost:3080\nNODE_ENV=development\n`,{mode:0o600});
 }
 console.log('Base pharmaboost_js preparada. Datos iniciales conservados si ya existían. Ejecuta npm start.');
}catch(e){if(db)await db.rollback().catch(()=>{});console.error('No se pudo configurar MySQL:',e.code||e.message);process.exitCode=1;}finally{if(db)await db.end();await pool.end();}
