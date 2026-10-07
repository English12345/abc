// Daftar precache dibangun otomatis dari data/index.json -> level -> emoji. Tambah level cukup edit index.json (naikkan "v").
const CORE=['./','index.html','style.css','app.js','manifest.json','icons/icon-192.png','icons/icon-512.png','emoji/1f4d6.svg','emoji/1f50a.svg','emoji/1f512.svg','emoji/2b50.svg','emoji/1f389.svg','emoji/1f4aa.svg'];
const J=async u=>(await fetch(u,{cache:'no-store'})).json();
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const x=await J('data/index.json'),u=[...CORE,'data/index.json'];
 for(const l of x.levels){u.push('data/'+l.file);(await J('data/'+l.file)).forEach(a=>u.push('emoji/'+a.e+'.svg'))}
 await(await caches.open('bm-'+x.v)).addAll([...new Set(u)]);self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 try{const x=await J('data/index.json');for(const k of await caches.keys())if(k!='bm-'+x.v)await caches.delete(k)}catch{}
 clients.claim();
})()));
self.addEventListener('fetch',e=>{if(e.request.method=='GET')e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
