/* Core helpers: DOM, escaping, storage, progress store, router, dialogs. No dependencies. */
(function(){
'use strict';
const App=window.App={};
const $=App.$=(s,r)=>(r||document).querySelector(s);
App.$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=App.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
App.ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
App.pct=(a,b)=>b?Math.round(a/b*100):0;
App.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- storage: automatic save on this device (localStorage + IndexedDB mirror) ----------
   - every meaningful change calls App.save() (debounced) — no Save button anywhere
   - two copies: localStorage (synchronous, read at boot) and IndexedDB (survives localStorage loss / quota errors)
   - each copy carries a version (v) and a timestamp (savedAt); at boot the newest valid copy wins, older data never overwrites newer
   - corrupted data is moved aside (…-corrupt) instead of being lost, and the last good copy (…-bak) is used to recover
   - pending changes are flushed immediately when the tab is hidden or closed                                        */
const KEY='iee-ss6-t1-v1',VER=2,IDB='iee-ss6',STORE='kv';
const fresh=()=>({v:VER,savedAt:0,lessons:{},last:null,resume:null,mcq:{ans:{},sessions:[],cur:null},assess:{},game:{},prefs:{zoom:1,shuffle:true,sfx:true,vol:.7}});
let state=fresh(),storageOK=true,loadedFrom='new';
function normalize(s){const d=fresh();if(!s||typeof s!=='object')return d;
  const o=Object.assign(d,s);o.mcq=Object.assign(fresh().mcq,s.mcq||{});o.prefs=Object.assign(fresh().prefs,s.prefs||{});
  ['lessons','assess','game'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={};});
  if(!o.mcq.ans||typeof o.mcq.ans!=='object')o.mcq.ans={};if(!Array.isArray(o.mcq.sessions))o.mcq.sessions=[];
  o.fromV=s.v||1;o.v=VER;return o;}
function readLocal(k){try{const raw=localStorage.getItem(k);if(!raw)return null;const s=JSON.parse(raw);if(!s||typeof s!=='object')throw 0;return s;}
  catch(e){try{const raw=localStorage.getItem(k);if(raw)localStorage.setItem(KEY+'-corrupt-'+Date.now(),raw);}catch(_){}return undefined;}}
let local=null;
try{local=readLocal(KEY);if(local===undefined){local=readLocal(KEY+'-bak')||null;loadedFrom=local?'backup':'new';}else if(local)loadedFrom='local';
  if(local)localStorage.setItem(KEY+'-bak',JSON.stringify(local));}catch(e){storageOK=false;}
state=normalize(local);
App.state=state;App.storageOK=()=>storageOK;
/* IndexedDB helpers (all failures are non-fatal: the app keeps working with localStorage or memory) */
let dbP=null;
function db(){if(dbP)return dbP;dbP=new Promise((res)=>{try{const r=indexedDB.open(IDB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null);setTimeout(()=>res(null),1500);}catch(e){res(null);}});return dbP;}
function idbGet(){return db().then(d=>d&&new Promise(res=>{try{const q=d.transaction(STORE,'readonly').objectStore(STORE).get('state');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);}catch(e){res(null);}}));}
function idbPut(json){return db().then(d=>d&&new Promise(res=>{try{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(json,'state');t.oncomplete=()=>res(true);t.onerror=t.onabort=()=>res(false);}catch(e){res(false);}}));}
/* save status indicator */
let saveStatus='idle',lastSaved=0;const statusFns=[];
App.onSaveStatus=fn=>statusFns.push(fn);
App.saveInfo=()=>({status:saveStatus,at:lastSaved,online:navigator.onLine!==false,ok:storageOK});
const setStatus=s=>{saveStatus=s;statusFns.forEach(f=>{try{f(App.saveInfo());}catch(e){}});};
let saveT=null,dirty=false;
function write(){clearTimeout(saveT);saveT=null;if(!dirty)return;dirty=false;state.savedAt=Date.now();let json;
  try{json=JSON.stringify(state);}catch(e){setStatus('error');return;}
  try{localStorage.setItem(KEY,json);storageOK=true;}catch(e){storageOK=false;}
  idbPut(json).then(ok=>{if(ok)storageOK=true;lastSaved=Date.now();setStatus(storageOK||ok?'saved':'error');});
  if(storageOK){lastSaved=Date.now();setStatus('saved');}}
App.save=()=>{dirty=true;if(saveStatus!=='saving')setStatus('saving');clearTimeout(saveT);saveT=setTimeout(write,250);};
App.flush=write;
addEventListener('pagehide',write);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')write();});
addEventListener('online',()=>setStatus(saveStatus));addEventListener('offline',()=>setStatus(saveStatus));
/* boot: compare the IndexedDB copy with the localStorage copy and keep the newer one */
App.ready=Promise.race([idbGet(),new Promise(r=>setTimeout(()=>r(null),1600))]).then(raw=>{
  let s=null;try{s=raw?JSON.parse(raw):null;}catch(e){s=null;}
  if(s&&typeof s==='object'&&(s.savedAt||0)>(state.savedAt||0)){const n=normalize(s);Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,n);loadedFrom='indexeddb';}
  App.loadedFrom=loadedFrom;App.bootSavedAt=state.savedAt||0;if(state.savedAt){lastSaved=state.savedAt;setStatus('saved');}
}).catch(()=>{App.loadedFrom=loadedFrom;});
App.resetAll=()=>{const keep=state.prefs;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,fresh());state.prefs=Object.assign(state.prefs,{sfx:keep.sfx,vol:keep.vol,zoom:keep.zoom,shuffle:keep.shuffle});
  try{localStorage.removeItem(KEY);localStorage.removeItem(KEY+'-bak');}catch(e){}dirty=true;write();};
/* where the student was: section, exact route and scroll position (restored by «متابعة التعلّم») */
App.markResume=(h,label,section,extra)=>{const r=state.resume&&state.resume.h===h?state.resume:{};state.resume=Object.assign({},r,{h,label,section,at:Date.now(),y:r.y||0},extra||{});App.save();};
let scT;addEventListener('scroll',()=>{clearTimeout(scT);scT=setTimeout(()=>{const h=(location.hash||'').slice(1);if(state.resume&&state.resume.h===h&&Math.abs((state.resume.y||0)-scrollY)>40){state.resume.y=Math.round(scrollY);App.save();}},400);},{passive:true});

/* ---------- progress numbers (all computed from real stored activity) ---------- */
App.progress={
  book(){const L=window.BOOK.lessons;const done=L.filter(l=>(state.lessons[l.id]||{}).done).length;const visited=L.filter(l=>(state.lessons[l.id]||{}).visited).length;return{total:L.length,done,visited,pct:App.pct(done,L.length)};},
  mcq(){let total=0;window.MCQ.forEach(u=>u.groups.forEach(g=>total+=g.q.length));const a=Object.values(state.mcq.ans);const answered=a.length,correct=a.filter(x=>x.ok).length;return{total,answered,correct,wrong:answered-correct,pct:App.pct(answered,total),acc:App.pct(correct,answered)};},
  assess(){let total=0,done=0,prog=0;window.ASSESS.forEach(u=>u.lessons.forEach(l=>l.periods.forEach(p=>p.sections.forEach(s=>{total++;const st=state.assess[s.id];if(st&&st.submitted)done++;else if(st&&Object.keys(st.ans||{}).length)prog++;}))));return{total,done,prog,pct:App.pct(done,total)};}
};

/* ---------- toast + dialog (alert/confirm are unavailable in sandboxed viewers) ---------- */
let toastT;
App.toast=msg=>{const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600);};
App.closeModal=()=>{const m=$('#modal');m.hidden=true;m.innerHTML='';document.removeEventListener('keydown',escClose);};
function escClose(e){if(e.key==='Escape')App.closeModal();}
App.modal=html=>{const m=$('#modal');m.innerHTML=html;m.hidden=false;document.addEventListener('keydown',escClose);const f=m.querySelector('button,a');if(f)f.focus();return m;};
App.confirm=(title,text,yes,cb)=>{const m=App.modal(`<div class="dialog" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="acts"><button class="btn orange" data-y>${esc(yes)}</button><button class="btn ghost" data-n>رجوع</button></div></div>`);
  m.querySelector('[data-y]').onclick=()=>{App.closeModal();cb();};m.querySelector('[data-n]').onclick=App.closeModal;m.onclick=e=>{if(e.target===m)App.closeModal();};};

/* ---------- image lightbox with zoom + page navigation ---------- */
App.lightbox=(list,idx)=>{let i=idx||0,z=1;
  const m=App.modal(`<div class="light"><div class="lt"><button class="btn sm" data-a="in">${App.icon('plus')} تكبير</button><button class="btn sm" data-a="out">${App.icon('minus')} تصغير</button><button class="btn sm gold" data-a="x">${App.icon('close')} إغلاق</button></div><div class="stage"><img alt=""></div><div class="nav"><button class="btn sm ghost" data-a="prev">${App.icon('next')} السابق</button><span></span><button class="btn sm ghost" data-a="next">التالي ${App.icon('prev')}</button></div></div>`);
  const img=m.querySelector('img'),lab=m.querySelector('.nav span'),nav=m.querySelector('.nav');
  const draw=()=>{img.src=list[i].src;img.alt=list[i].cap||'';img.style.width=(z*100)+'%';lab.textContent=(list[i].cap||'')+(list.length>1?`  (${App.ar(i+1)} / ${App.ar(list.length)})`:'');nav.querySelector('[data-a=prev]').disabled=i===0;nav.querySelector('[data-a=next]').disabled=i===list.length-1;if(list.length<2){nav.querySelectorAll('button').forEach(b=>b.hidden=true);}};
  m.onclick=e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===m)App.closeModal();return;}const a=b.dataset.a;
    if(a==='in')z=Math.min(3,z+.25);if(a==='out')z=Math.max(.5,z-.25);if(a==='x')return App.closeModal();if(a==='prev'&&i>0){i--;z=1;}if(a==='next'&&i<list.length-1){i++;z=1;}draw();};
  draw();};

/* ---------- router: plain #name hashes only ---------- */
const routes=[];
App.route=(re,fn)=>routes.push([re,fn]);
App.go=(h,y)=>{App._y=y||0;if(location.hash==='#'+h)render();else location.hash=h;};
function render(){const h=(location.hash||'#home').slice(1)||'home';App.tts&&App.tts.stop();App.closeModal();
  for(const[re,fn]of routes){const m=h.match(re);if(m){const v=$('#view');v.innerHTML='<div class="view wrap"></div>';fn(v.firstChild,m);App.nav(h);const y=App._y||0;App._y=0;window.scrollTo(0,0);if(y)setTimeout(()=>window.scrollTo(0,y),60);return;}}
  location.hash='home';}
App.render=render;
window.addEventListener('hashchange',render);
})();
