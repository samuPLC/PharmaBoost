import mysql from 'mysql2/promise';
export const config = {host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'pharmaboost_app',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'pharmaboost_js',dateStrings:true,decimalNumbers:true,charset:'utf8mb4',connectionLimit:8};
export const pool=mysql.createPool(config);
export async function query(db,sql,args=[]){const [rows]=await db.execute(sql,args);return rows;}
export async function transaction(work){const db=await pool.getConnection();try{await db.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await db.beginTransaction();const result=await work(db);await db.commit();return result;}catch(e){await db.rollback();throw e;}finally{db.release();}}
