import {passwordHash} from '../server/security.js';
import {query} from '../server/db.js';
import {expandCatalog} from './catalog-expansion.js';
export async function seed(db){
 if((await query(db,'SELECT COUNT(*) n FROM users'))[0].n)return false;
 await query(db,"INSERT INTO manufacturers(id,name,contact) VALUES(1,'Laboratorios Nova','comercial@nova.example'),(2,'Vitalis Pharma','ventas@vitalis.example')");
 for(const [name,email,role,mid] of [['Samuel Palacio','admin','admin',null],['Laura Restrepo','ventas','ventas',null],['Daniel Muñoz','agente','agente',1],['Valentina Ruiz','agente2','agente',2],['Operaciones TIC','tic','tic',null]])await query(db,'INSERT INTO users(name,email,password_hash,role,manufacturer_id) VALUES(?,?,?,?,?)',[name,email+'@pharmaboost.local',await passwordHash('Pharma2026!'),role,mid]);
 const products=[['Vitamina C 500 mg',24900,'Bienestar',1],['Protector solar SPF 50',58900,'Dermocosmética',1],['Solución salina nasal',18700,'Cuidado diario',1],['Gel antibacterial',12900,'Cuidado diario',1],['Crema hidratante',32500,'Dermocosmética',1],['Kit de primeros auxilios',45900,'Cuidado diario',1],['Complejo B',28900,'Bienestar',2],['Jabón líquido neutro',21900,'Cuidado diario',2]];
 for(const [i,p] of products.entries())await query(db,'INSERT INTO products(external_code,name,description,price,category,manufacturer_id) VALUES(?,?,?,?,?,?)',['ABA-'+String(i+1).padStart(3,'0'),p[0],p[0],p[1],p[2],p[3]]);
 const stores=[['El Poblado','Carrera 43A # 10-25','Mariana Vélez',1],['Laureles','Circular 73 # 39-18','Andrés García',1],['Envigado','Carrera 43 # 38 Sur-12','Camila Torres',1],['Santa Elena','Vía Santa Elena km 15','Julián Ríos',0],['Belén','Calle 30A # 80-21','Paula López',1],['San Cristóbal','Carrera 130 # 60-12','Sofía Ramírez',0]];
 for(const [i,s] of stores.entries())await query(db,'INSERT INTO stores(external_code,name,address,zone,manager,coverage,phone) VALUES(?,?,?,?,?,?,?)',['DP-00'+(i+1),'DP · '+s[0],s[1],s[0],s[2],s[3],'604 555 010'+(i+1)]);
 const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),1,12).toISOString().slice(0,10),end=new Date(now.getFullYear(),now.getMonth()+2,0,12).toISOString().slice(0,10);
 for(const [id,name] of [[1,'Bienestar que llega más lejos'],[2,'Cuidado esencial Vitalis']])await query(db,"INSERT INTO promotions(id,name,manufacturer_id,start_date,end_date,status,created_at) VALUES(?,?,?,?,?,'activa',?)",[id,name,id,start,end,now.toISOString()]);
 for(let i=1;i<=8;i++)await query(db,'INSERT INTO promotion_products VALUES(?,?)',[i<=6?1:2,i]);
 await query(db,'INSERT INTO promotion_agents VALUES(1,3),(2,4)');
 for(let i=1;i<=6;i++)await query(db,'INSERT INTO promotion_stores VALUES(1,?)',[i]);
 await query(db,'INSERT INTO promotion_stores VALUES(2,1),(2,2)');
 await query(db,"INSERT INTO audit(event,description,result,created_at) VALUES('sistema','Instalación de demostración MySQL. Datos ficticios.','exito',?)",[now.toISOString()]);
 await expandCatalog(db);
 return true;
}

