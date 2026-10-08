import {query as q} from './db.js';
import {Problem,requireRole,text,email,integer} from './security.js';
// Versioned registry in the existing MySQL ledger, like inventory movements.
export async function listSuppliers(db){
 const rows=await q(db,"SELECT id,description,created_at FROM audit WHERE event='proveedor' ORDER BY id");const suppliers=new Map();
 for(const row of rows){const data=JSON.parse(row.description);suppliers.set(data.id||row.id,{...data,id:data.id||row.id,updated_at:row.created_at});}
 return [...suppliers.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export async function saveSupplier(db,user,d,id){
 requireRole(user,'admin','ventas');
 const data={name:text(d,'name',2,160),tax_id:text(d,'tax_id',0,40),contact:text(d,'contact',0,120),phone:text(d,'phone',0,80),email:text(d,'email',0,160),address:text(d,'address',0,300),active:d.active};
 if(data.email)data.email=email(data);if(typeof data.active!=='boolean')throw new Problem('Estado de proveedor inválido.');
 if(id){integer(id,'proveedor');const [row]=await q(db,"SELECT id FROM audit WHERE id=? AND event='proveedor' FOR UPDATE",[id]);if(!row||!(await listSuppliers(db)).some(p=>p.id===id))throw new Problem('Proveedor no encontrado.',404);data.id=id;}
 const result=await q(db,"INSERT INTO audit(user_id,event,description,result,created_at) VALUES(?,'proveedor',?,'exito',?)",[user.id,JSON.stringify(data),new Date().toISOString()]);return {id:id||result.insertId};
}
export async function selectedSupplier(db,id){
 integer(id,'proveedor');await q(db,"SELECT id FROM audit WHERE id=? AND event='proveedor' FOR UPDATE",[id]);
 const supplier=(await listSuppliers(db)).find(p=>p.id===id);if(!supplier||!supplier.active)throw new Problem('Selecciona un proveedor activo registrado.');return supplier;
}
