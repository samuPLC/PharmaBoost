import {randomBytes} from 'node:crypto';
import {query} from './db.js';

// The UNIQUE index is the final authority, including concurrent requests.
export async function insertAutoCodeProduct(db,fields){
 for(let attempt=0;attempt<5;attempt++){
  const code='PB-'+randomBytes(6).toString('hex').toUpperCase();
  try{
   const result=await query(db,'INSERT INTO products(external_code,name,description,price,category,manufacturer_id) VALUES(?,?,?,?,?,?)',[code,...fields]);
   return {id:result.insertId,code};
  }catch(error){if(error.code!=='ER_DUP_ENTRY'||attempt===4)throw error;}
 }
}
