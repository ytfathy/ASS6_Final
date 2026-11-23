// Offline cache, network first: the server login gate decides on every request; the cache is only used when offline.
// Redirected responses (to /login) are never cached, so the gate page can't end up stored under a program file's name.
const C='ss6-v6';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/auth/')||u.pathname.startsWith('/api/')||u.pathname==='/login')return;e.respondWith(fetch(e.request).then(res=>{if(res.ok&&!res.redirected&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));});
