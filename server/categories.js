import {query as q} from './db.js';
import {Problem,requireRole,text,integer} from './security.js';

export async function listCategories(db){
 return q(db,'SELECT c.id,c.name,c.description,COUNT(p.id) product_count FROM categories c LEFT JOIN products p ON p.category=c.name GROUP BY c.id,c.name,c.description ORDER BY c.name');
}
export async function selectCategory(db,name,imported=false){
 name=text({name},'name',1,80);
 if(imported)await q(db,'INSERT INTO categories(name) VALUES(?) ON DUPLICATE KEY UPDATE name=name',[name]);
 const [row]=await q(db,'SELECT name FROM categories WHERE name=? FOR SHARE',[name]);
 if(!row)throw new Problem('Selecciona una categoría registrada.');
 return row.name;
}
async function audit(db,user,message){await q(db,"INSERT INTO audit(user_id,event,description,result,created_at) VALUES(?,'categoria',?,'exito',?)",[user.id,message,new Date().toISOString()]);}
export async function saveCategory(db,user,data,id){
 requireRole(user,'admin');
 const name=text(data,'name',1,80),description=text(data,'description',0,500);
 let previous;
 if(id){integer(id,'categoría');[previous]=await q(db,'SELECT * FROM categories WHERE id=? FOR UPDATE',[id]);if(!previous)throw new Problem('Categoría no encontrada.',404);}
 try {
  if(id){await q(db,'UPDATE categories SET name=?,description=? WHERE id=?',[name,description,id]);await q(db,'UPDATE products SET category=? WHERE category=?',[name,previous.name]);}
  else {const row=await q(db,'INSERT INTO categories(name,description) VALUES(?,?)',[name,description]);id=row.insertId;}
 }catch(e){if(e.code==='ER_DUP_ENTRY')throw new Problem('Ya existe una categoría con ese nombre.',409);throw e;}
 await audit(db,user,'Categoría guardada: '+name);return {id};
}
export async function deleteCategory(db,user,id){
 requireRole(user,'admin');integer(id,'categoría');
 const [row]=await q(db,'SELECT * FROM categories WHERE id=? FOR UPDATE',[id]);
 if(!row)throw new Problem('Categoría no encontrada.',404);
 if((await q(db,'SELECT id FROM products WHERE category=? LIMIT 1',[row.name])).length)throw new Problem('La categoría tiene productos. Reasígnalos antes de eliminarla.',409);
 await q(db,'DELETE FROM categories WHERE id=?',[id]);await audit(db,user,'Categoría eliminada: '+row.name);return {ok:true};
}
