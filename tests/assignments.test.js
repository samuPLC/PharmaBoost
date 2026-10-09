import test from 'node:test';
import assert from 'node:assert/strict';
import {workPromotions} from '../web/assignments.js';
test('Agente solo obtiene promociones propias vigentes, incluso con datos antiguos en cache',()=>{
 const user={id:3,role:'agente',manufacturer_id:1};
 const base={id:1,manufacturer_id:1,agent_ids:[3],status:'activa',start_date:'2026-10-01',end_date:'2026-10-09'};
 const list=[base,{...base,id:2,agent_ids:[4]},{...base,id:3,status:'borrador'},{...base,id:4,end_date:'2026-10-08'},{...base,id:5,start_date:'2026-10-10'},{...base,id:6,manufacturer_id:2}];
 assert.deepEqual(workPromotions(list,user,'2026-10-09').map(p=>p.id),[1]);
 assert.deepEqual(workPromotions(list,user,'2026-11-01'),[]);
 assert.equal(workPromotions(list,{role:'admin'}).length,6);
});
