import './vendor/pdf-lib.min.js';

// PDF-Lib is bundled locally: exports work without a CDN or external service.
export async function createReportPdf(rows,generatedAt){
 const {PDFDocument,StandardFonts,rgb}=globalThis.PDFLib;
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 doc.setTitle('Reporte comercial PharmaBoost');doc.setAuthor('PharmaBoost');
 const ink=rgb(.12,.2,.18),green=rgb(.05,.38,.34);let page,y;
 const clean=v=>[...String(v??'').normalize('NFC')].map(c=>{try{font.encodeText(c);return c;}catch{return '?';}}).join('');
 function addPage(){page=doc.addPage([595.28,841.89]);y=780;page.drawText('PharmaBoost',{x:44,y,font:bold,size:21,color:green});y-=25;page.drawText('Reporte comercial',{x:44,y,font:bold,size:14,color:ink});y-=22;}
 function wrap(value,width,size=10){const lines=[''];for(const word of clean(value).split(/\s+/)){let last=lines.length-1;const candidate=lines[last]+(lines[last]?' ':'')+word;if(bold.widthOfTextAtSize(candidate,size)<=width){lines[last]=candidate;continue;}if(lines[last])lines.push('');for(const char of word){last=lines.length-1;if(bold.widthOfTextAtSize(lines[last]+char,size)>width)lines.push(char);else lines[last]+=char;}}return lines;}
 addPage();
 for(const row of rows){
  if(!row.length){y-=16;continue;}
  const table=row.length===3,widths=table?[295,72,96]:row.length===2?[180,303]:[483];
  const cells=row.map((v,i)=>wrap(v,widths[i]-12));const lineCount=Math.max(...cells.map(c=>c.length));
  const heading=(row.length===1&&String(row[0]).length<65)||['Productos','Agentes'].includes(row[0]);
  if(y-lineCount*15-8<65&&lineCount*15+8<600){addPage();if(table&&!heading){page.drawText('Continuación de tabla',{x:44,y,font,size:9,color:ink});y-=20;}}
  for(let line=0;line<lineCount;line++){
   if(y<65){addPage();if(table&&!heading){page.drawText('Continuación de tabla',{x:44,y,font,size:9,color:ink});y-=20;}}
   let x=44;cells.forEach((cell,i)=>{if(cell[line])page.drawText(cell[line],{x,y,font:heading?bold:font,size:10,color:ink});x+=widths[i];});y-=15;
  }
  y-=8;if(table)page.drawLine({start:{x:44,y:y+15},end:{x:551,y:y+15},thickness:.4,color:rgb(.8,.85,.82)});
 }
 const pages=doc.getPages();pages.forEach((p,i)=>{p.drawText(clean('Generado: '+generatedAt),{x:44,y:30,font,size:8,color:ink});p.drawText(`${i+1} / ${pages.length}`,{x:510,y:30,font,size:8,color:ink});});
 return doc.save();
}
