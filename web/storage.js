// IndexedDB: instantáneas y cola separadas por usuario. Sin contraseñas ni cookies en almacenamiento JS.
let connection;
function db(){return connection??=new Promise((resolve,reject)=>{const req=indexedDB.open('pharmaboost-js',1);req.onupgradeneeded=()=>req.result.createObjectStore('kv');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function read(key){const conn=await db();return new Promise((resolve,reject)=>{const request=conn.transaction('kv').objectStore('kv').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function write(key,value){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export async function remove(key){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction('kv','readwrite');tx.objectStore('kv').delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}

