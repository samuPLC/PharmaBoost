import {pool,transaction,query} from '../server/db.js';
import {addInitialActivity} from './activity-data.js';
try{console.log('Agregados:',await transaction(addInitialActivity));console.log('Resumen:',(await query(pool,'SELECT COUNT(*) pedidos,COALESCE(SUM(total),0) total FROM orders'))[0]);}finally{await pool.end();}
