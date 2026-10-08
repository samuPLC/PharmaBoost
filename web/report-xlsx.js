// Minimal OpenXML workbook, with numeric cells and literal strings (never formulas).
const encode=s=>new TextEncoder().encode(s);
const xml=s=>String(s??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function header(size,fields){const a=new Uint8Array(size),v=new DataView(a.buffer);for(const [offset,n,len]of fields)len===2?v.setUint16(offset,n,true):v.setUint32(offset,n,true);return a;}
function zip(files){const parts=[],central=[];let offset=0,centralSize=0;for(const [name,value]of Object.entries(files)){const n=encode(name),b=encode(value),crc=crc32(b);const h=header(30,[[0,0x04034b50,4],[4,20,2],[14,crc,4],[18,b.length,4],[22,b.length,4],[26,n.length,2]]);parts.push(h,n,b);const c=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[16,crc,4],[20,b.length,4],[24,b.length,4],[28,n.length,2],[42,offset,4]]);central.push(c,n);centralSize+=46+n.length;offset+=30+n.length+b.length;}
 const count=Object.keys(files).length;return new Blob([...parts,...central,header(22,[[0,0x06054b50,4],[8,count,2],[10,count,2],[12,centralSize,4],[16,offset,4]])],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});}
export function workbook(rows){
 const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 const letters=i=>{let out='';for(i++;i;i=Math.floor((i-1)/26))out=String.fromCharCode(65+(i-1)%26)+out;return out;};
 const sheet=rows.map((row,r)=>`<row r="${r+1}">${row.map((v,c)=>typeof v==='number'&&Number.isFinite(v)?`<c r="${letters(c)}${r+1}"><v>${v}</v></c>`:`<c r="${letters(c)}${r+1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join('')}</row>`).join('');
 return zip({'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
 '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':`<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Reporte" sheetId="1" r:id="rId1"/></sheets></workbook>`,
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':`<worksheet xmlns="${ns}"><sheetData>${sheet}</sheetData></worksheet>`});
}
