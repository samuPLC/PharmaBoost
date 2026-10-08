import {pool,transaction,query} from '../server/db.js';
import {expandCatalog} from './catalog-expansion.js';
try{console.log('Productos agregados:',await transaction(expandCatalog));console.log('Total:',(await query(pool,'SELECT COUNT(*) n FROM products'))[0].n);}finally{await pool.end();}
