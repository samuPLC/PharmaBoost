import {pool,query,transaction} from '../server/db.js';
try {
 const changed=await transaction(async db=>{
  const result=await query(db,'UPDATE products SET description=name WHERE TRIM(description)=?',['Producto ficticio para demostración académica']);
  if(result.affectedRows)await query(db,"INSERT INTO audit(event,description,result,created_at) VALUES('producto',?,'exito',?)",[`Actualizadas ${result.affectedRows} descripciones iniciales del catálogo.`,new Date().toISOString()]);
  return result.affectedRows;
 });
 console.log(`Descripciones actualizadas: ${changed}. Se conservaron las descripciones personalizadas.`);
 console.log('Descripciones antiguas restantes:',(await query(pool,'SELECT COUNT(*) n FROM products WHERE TRIM(description)=?',['Producto ficticio para demostración académica']))[0].n);
}finally{await pool.end();}
