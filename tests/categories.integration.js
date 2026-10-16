import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,query as q} from '../server/db.js';
import {saveCategory,deleteCategory,listCategories,selectCategory} from '../server/categories.js';
if(process.env.DB_PORT!=='3307')throw new Error('Solo base aislada en puerto 3307.');
const db=await pool.getConnection();
try {
 await db.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await db.beginTransaction();
 const [admin]=await q(db,"SELECT * FROM users WHERE role='admin' LIMIT 1");
 const name='QA '+randomUUID();
 for(const role of ['agente','ventas','tic']){
  await assert.rejects(saveCategory(db,{...admin,role},{name}),e=>e.status===403);
  await assert.rejects(deleteCategory(db,{...admin,role},1),e=>e.status===403);
 }
 await assert.rejects(saveCategory(db,admin,{name:' '}),e=>e.status===400);
 const {id}=await saveCategory(db,admin,{name,description:'Prueba transaccional'});
 assert((await listCategories(db)).some(c=>c.id===id));
 await assert.rejects(saveCategory(db,admin,{name:name.toLowerCase()}),e=>e.status===409);
 assert.equal(await selectCategory(db,name),name);
 await assert.rejects(selectCategory(db,'No existe '+randomUUID()),e=>e.status===400);
 const [product]=await q(db,'SELECT id,category FROM products LIMIT 1');
 await q(db,'UPDATE products SET category=? WHERE id=?',[name,product.id]);
 await assert.rejects(deleteCategory(db,admin,id),e=>e.status===409);
 await saveCategory(db,admin,{name:name+' nuevo',description:''},id);
 assert.equal((await q(db,'SELECT category FROM products WHERE id=?',[product.id]))[0].category,name+' nuevo');
 await q(db,'UPDATE products SET category=? WHERE id=?',[product.category,product.id]);
 await deleteCategory(db,admin,id);
 await assert.rejects(deleteCategory(db,admin,id),e=>e.status===404);
 assert(!(await listCategories(db)).some(c=>c.id===id));
 console.log('Categorías: CRUD, permisos, duplicados, validación, renombrado de productos y borrado protegido correctos. Rollback de datos de prueba.');
}finally{await db.rollback();db.release();await pool.end();}
