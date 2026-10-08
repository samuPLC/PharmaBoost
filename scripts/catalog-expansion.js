import {query} from '../server/db.js';
export const additions=[
 ['PB-009','Algodón en discos','Discos de algodón para cuidado personal.',8900,'Cuidado diario',1,'box'],
 ['PB-010','Copitos de algodón','Aplicadores de algodón para cuidado personal.',6500,'Cuidado diario',1,'box'],
 ['PB-011','Toallitas húmedas','Toallitas para limpieza de uso externo.',9900,'Cuidado diario',1,'pack'],
 ['PB-012','Crema de manos','Crema para la rutina de cuidado de las manos.',17900,'Dermocosmética',1,'tube'],
 ['PB-013','Bálsamo labial','Bálsamo para el cuidado de los labios.',12500,'Dermocosmética',1,'tube'],
 ['PB-014','Agua micelar','Agua micelar para la rutina de limpieza facial.',26900,'Dermocosmética',1,'bottle'],
 ['PB-015','Gasas','Gasas para el botiquín de primeros auxilios.',7900,'Primeros auxilios',2,'pack'],
 ['PB-016','Venda elástica','Venda elástica para el botiquín.',11900,'Primeros auxilios',2,'roll'],
 ['PB-017','Cinta microporosa','Cinta para fijación de apósitos.',8500,'Primeros auxilios',2,'roll'],
 ['PB-018','Apósitos adhesivos','Apósitos para el botiquín de primeros auxilios.',6900,'Primeros auxilios',2,'box'],
 ['PB-019','Mascarillas desechables','Mascarillas de un solo uso.',15900,'Cuidado diario',2,'mask'],
 ['PB-020','Jabón de manos','Jabón líquido para la limpieza de las manos.',14900,'Cuidado diario',2,'bottle']
];
export async function expandCatalog(db){let added=0;
 for(const [code,name,description,price,category,mid,shape] of additions){
  const existing=await query(db,'SELECT id FROM products WHERE external_code=?',[code]);if(existing.length)continue;
  const manufacturer=await query(db,'SELECT id FROM manufacturers WHERE id=? AND name=?',[mid,mid===1?'Laboratorios Nova':'Vitalis Pharma']);if(!manufacturer.length)throw Error('No se encontró el fabricante inicial esperado.');
  const result=await query(db,'INSERT INTO products(external_code,name,description,price,category,manufacturer_id,image_url,image_valid) VALUES(?,?,?,?,?,?,?,1)',[code,name,description,price,category,mid,`/products/${code.toLowerCase()}.svg`]);
  const promo=await query(db,'SELECT id FROM promotions WHERE manufacturer_id=? AND name=?',[mid,mid===1?'Bienestar que llega más lejos':'Cuidado esencial Vitalis']);
  for(const p of promo)await query(db,'INSERT IGNORE INTO promotion_products VALUES(?,?)',[p.id,result.insertId]);added++;
 }
 if(added)await query(db,"INSERT INTO audit(event,description,result,created_at) VALUES('producto',?,'exito',?)",[`Ampliación del catálogo: ${added} productos agregados.`,new Date().toISOString()]);return added;
}
