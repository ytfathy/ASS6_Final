/* Section 4 — «منشئ الامتحان»: the student picks lessons, question types and counts; the app draws the questions from
   the MCQ bank and the Assessment Book, corrects them automatically (same grader as the Assessment Book), prints the
   exam (blank paper or answer key), and keeps every exam in the student's account (/api/exams) plus on this device. */
(function(){
'use strict';
const {esc,ar,icon,state,$}=App;
const B=window.BOOK;
const key=s=>String(s).replace(/[^ء-ي]/g,'');
/* topics = the 12 lessons of the Student Book + one comprehensive review per unit */
const TOPICS=[];B.units.forEach(u=>{B.lessons.filter(l=>l.unit===u.n).forEach(l=>TOPICS.push({id:l.id,unit:u.n,lesson:l.n,title:l.title}));TOPICS.push({id:'u'+u.n+'r',unit:u.n,lesson:0,title:'مراجعة شاملة على الوحدة'});});
const TYPES=[['m','اختر الإجابة الصحيحة'],['tf','ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة الخطأ مع تصويب الخطأ'],['c','أكمل العبارات التالية'],['w','أجب عن الأسئلة التالية']];
const TNAME={m:'اختيار من متعدد',tf:'صواب أم خطأ',c:'أكمل',w:'أسئلة مقالية'};
/* question pool: every item is shaped like an Assessment-Book item ({k,text,opts,a}) so App.assessGrade can correct it */
const POOL={},BYID={};TOPICS.forEach(t=>POOL[t.id]=[]);
const add=(tid,q)=>{if(!tid||BYID[q.id])return;BYID[q.id]=q;POOL[tid].push(q);};
window.MCQ.forEach(u=>u.groups.forEach(g=>{const t=TOPICS.find(t=>t.unit===u.n&&t.lesson===g.lesson);g.q.forEach(q=>add(t&&t.id,{id:q.id,k:'m',text:q.t,opts:q.o,a:q.a}));}));
const VISUAL=/صور|الشكل|خريط|الجدول|أمامك|السابق/; // items that only make sense next to a picture/map/table are left out
window.ASSESS.forEach(u=>u.lessons.forEach(l=>{
  const tid=/تدريب شامل/.test(l.title)?'u'+u.n+'r':(TOPICS.find(t=>t.unit===u.n&&t.lesson&&key(t.title)===key(l.title))||{}).id;
  l.periods.forEach(p=>p.sections.forEach(s=>{let head=null;s.items.forEach(it=>{
    if(it.k==='h'){head=it.text;return;}
    const pre=head&&/^(-|[أبجده]|\(.\))$/.test(it.n)?head:null;if(!pre)head=null;
    if(!TNAME[it.k]||it.a===undefined||VISUAL.test(it.text)||VISUAL.test(pre||''))return;
    add(tid,Object.assign({},it,{pre}));});}));}));
App.examPool=POOL;

/* ---------- account sync: /api/exams (Supabase, per student); the device copy keeps working offline ---------- */
let online=null;
const api=(method,body,q)=>fetch('/api/exams'+(q||''),{method,credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body&&JSON.stringify(body)})
  .then(r=>r.ok?r.json():r.json().catch(()=>({})).then(e=>Promise.reject(e.error||r.status)));
const pushT={};
function push(e,now){e.upd=Date.now();App.save();clearTimeout(pushT[e.id]);pushT[e.id]=setTimeout(()=>api('POST',{id:e.id,data:e}).then(()=>{e.synced=e.upd;online=true;App.save();paintSync();},()=>{online=false;paintSync();}),now?0:1500);}
function pull(){return api('GET').then(list=>{online=true;list.forEach(d=>{const i=state.exams.findIndex(x=>x.id===d.id);if(i<0)state.exams.push(d);else if((d.upd||0)>(state.exams[i].upd||0))state.exams[i]=d;});
  state.exams.forEach(e=>{if((e.synced||0)<(e.upd||0))push(e,1);});App.save();},()=>{online=false;});}
function paintSync(){const el=$('#exsync');if(el)el.innerHTML=online?`<span class="pill g">✓ محفوظة في حسابك</span>`:online===false?`<span class="pill y">محفوظة على هذا الجهاز فقط (تعذّر الاتصال بالحساب)</span>`:'';}

/* ---------- building an exam: questions are spread evenly over the chosen lessons ---------- */
function make(title,tids,counts){const items=[];
  TYPES.forEach(([k])=>{const n=counts[k]||0;if(!n)return;const lists=tids.map(t=>App.shuffle(POOL[t].filter(q=>q.k===k)));const got=[];
    for(let r=0;got.length<n&&lists.some(l=>l.length);r++)lists.forEach(l=>{if(got.length<n&&l.length)got.push(l.shift().id);});items.push(...got);});
  return{id:'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title,at:Date.now(),topics:tids,items,ans:{},submitted:null,ord:{}};}
const ordOf=(e,q)=>{e.ord=e.ord||{};return e.ord[q.id]||(e.ord[q.id]=App.order(q.opts.length));};
const avail=(tids,k)=>tids.reduce((s,t)=>s+POOL[t].filter(q=>q.k===k).length,0);
const PTS={ok:1,part:.5,no:0};
function result(e){let pts=0;const per={};e.items.forEach(id=>{const q=BYID[id];if(!q)return;const marks={};const g=App.assessGrade(q,e.ans[id],marks)||'no';per[id]={g,marks};pts+=PTS[g];});return{pts,n:e.items.length,per};}

function hub(v){
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>منشئ الامتحان</span></nav>
  <div class="hub-head" style="--c:var(--teal)"><div class="badge">${icon('scroll')}</div><div><h1>منشئ الامتحان الذكي</h1><p>اختر الدروس ونوع الأسئلة وعددها، وحُلّ الامتحان بتصحيح آلي، أو اطبعه.</p></div></div>
  <form class="paper exb" id="exf"><header><h1>امتحان جديد</h1></header>
   <label class="exl">عنوان الامتحان<input type="text" name="title" value="امتحان الدراسات الاجتماعية" maxlength="80" required></label>
   <h3>١- اختر الدروس</h3>
   ${B.units.map(u=>`<fieldset class="exu"><legend><label><input type="checkbox" data-unit="${u.n}"> الوحدة ${ar(u.n)}: ${esc(u.title)}</label></legend>
     ${TOPICS.filter(t=>t.unit===u.n).map(t=>`<label class="exc"><input type="checkbox" name="t" value="${t.id}" data-u="${u.n}"> ${t.lesson?'الدرس '+ar(t.lesson)+': ':''}${esc(t.title)}</label>`).join('')}</fieldset>`).join('')}
   <h3>٢- اختر نوع الأسئلة وعددها</h3>
   <div class="ext">${TYPES.map(([k])=>`<label class="exn"><span>${TNAME[k]}</span><input type="number" name="${k}" min="0" max="50" value="0" inputmode="numeric"><small data-av="${k}"></small></label>`).join('')}</div>
   <div class="paper-foot"><span class="cnt" id="extot"></span><button class="btn sm purple" type="submit">${icon('check')} إنشاء الامتحان</button></div></form>
  <section class="unit" style="margin-top:28px"><h2>امتحاناتي <span id="exsync"></span></h2><div id="exlist"></div></section>`;
  const f=$('#exf',v),tids=()=>App.$$('input[name=t]:checked',f).map(x=>x.value);
  const upd=()=>{const t=tids();let tot=0;TYPES.forEach(([k])=>{const a=avail(t,k),inp=f.elements[k];inp.max=Math.min(50,a);if(+inp.value>a)inp.value=a;tot+=+inp.value||0;
      $(`[data-av="${k}"]`,f).textContent=t.length?`المتاح: ${ar(a)}`:'';});
    $('#extot',f).textContent=t.length?`${ar(t.length)} درس/مراجعة • ${ar(tot)} سؤالًا`:'اختر درسًا واحدًا على الأقل';};
  f.onchange=e=>{const u=e.target.dataset.unit;if(u)App.$$(`input[data-u="${u}"]`,f).forEach(x=>x.checked=e.target.checked);upd();};f.oninput=upd;
  f.onsubmit=e=>{e.preventDefault();const t=tids();const c={};TYPES.forEach(([k])=>c[k]=Math.max(0,Math.min(+f.elements[k].value||0,avail(t,k))));
    if(!t.length)return App.toast('اختر درسًا واحدًا على الأقل.');if(!Object.values(c).some(Boolean))return App.toast('حدّد عدد الأسئلة لنوع واحد على الأقل.');
    const ex=make(f.elements.title.value.trim()||'امتحان',t,c);state.exams.unshift(ex);push(ex,1);App.go('exam-'+ex.id);};
  const list=()=>{const L=$('#exlist',v);if(!L)return;L.innerHTML=state.exams.length?`<div class="exs">${state.exams.map(e=>{const R=e.submitted&&result(e);
      return `<div class="exi"><a href="#exam-${e.id}"><b>${esc(e.title)}</b><small>${new Date(e.at).toLocaleDateString('ar-EG')} • ${ar(e.items.length)} سؤالًا</small></a>
       <span class="pill ${R?(App.pct(R.pts,R.n)>=50?'g':'r'):'y'}">${R?ar(App.pct(R.pts,R.n))+'٪':'لم يُحل بعد'}</span><button class="icon-btn" data-del="${e.id}" aria-label="حذف ${esc(e.title)}">${icon('trash')}</button></div>`;}).join('')}</div>`
     :'<p style="color:#c9d6f5;margin:0">لا توجد امتحانات بعد. أنشئ أول امتحان من النموذج أعلاه.</p>';paintSync();};
  v.onclick=e=>{const b=e.target.closest('[data-del]');if(!b)return;const id=b.dataset.del;
    App.confirm('حذف الامتحان؟','سيُحذف الامتحان وإجاباته من حسابك ومن هذا الجهاز.','حذف',()=>{state.exams=state.exams.filter(x=>x.id!==id);App.save();api('DELETE',null,'?id='+encodeURIComponent(id)).catch(()=>{});list();});};
  upd();list();pull().then(list);
}

/* ---------- one question: on screen (answering / corrected) ---------- */
function field(q,a,r,locked,e){const id=q.id,mk=(r&&r.marks)||{},cl=k=>k in mk?(mk[k]?' ok':' bad'):'',dis=locked?' disabled':'';
  switch(q.k){
   case'm':return `<div class="mopts" role="radiogroup">${ordOf(e,q).map(k=>`<button type="button" role="radio" aria-checked="${a===k}" class="${a===k?'on':''}${locked?(k===q.a?' right':a===k?' wrong':''):''}" data-id="${id}" data-m="${k}"${dis}>${esc(q.opts[k])}</button>`).join('')}</div>`;
   case'tf':{const x=a||{};return `<div class="tf"><button type="button" class="${x.v==='t'?'on':''}" data-id="${id}" data-tf="t"${dis}>صواب ✓</button><button type="button" class="${x.v==='f'?'on':''}" data-id="${id}" data-tf="f"${dis}>خطأ ✗</button></div><input type="text" data-id="${id}" data-fix placeholder="التصويب (إن كانت العبارة خطأ)…" value="${esc(x.fix||'')}" aria-label="التصويب"${dis}>`;}
   case'w':return `<textarea data-id="${id}" aria-label="إجابتك" placeholder="اكتب إجابتك هنا…"${dis}>${esc(a||'')}</textarea>`;
  }return '';}
const cText=(q,a,r,locked)=>{a=a||[];const mk=(r&&r.marks)||{};let k=0;return esc(q.text).replace(/___/g,()=>{const i=k++;return `<input type="text" class="inl${i in mk?(mk[i]?' ok':' bad'):''}" data-id="${q.id}" data-blank="${i}" value="${esc(a[i]||'')}" aria-label="أكمل"${locked?' disabled':''}>`;});};
const filled=(q,a)=>a!=null&&(q.k==='m'?a>=0:q.k==='tf'?!!a.v:q.k==='c'?a.some(x=>x&&x.trim()):!!String(a).trim());
const groups=e=>TYPES.map(([k,t])=>({k,t,qs:e.items.map(id=>BYID[id]).filter(q=>q&&q.k===k)})).filter(g=>g.qs.length);
const ORD=['الأول','الثاني','الثالث','الرابع'];

/* ---------- printing: blank exam paper or answer key, built into #print and shown only by @media print ---------- */
function print(e,withKey){let p=$('#print');if(!p){p=document.createElement('div');p.id='print';document.body.appendChild(p);}
  const line='<span class="pl"></span>';let n=0;
  p.innerHTML=`<div class="ph"><h1>${esc(e.title)}${withKey?' — نموذج الإجابة':''}</h1><p>الدراسات الاجتماعية • الصف السادس الابتدائي • International Education Egypt</p>
   ${withKey?'':`<div class="pn"><span>الاسم: ${line}</span><span>الفصل: ${line}</span><span>التاريخ: ${line}</span><span>الدرجة: …… / ${ar(e.items.length)}</span></div>`}</div>
   ${groups(e).map((g,gi)=>`<section><h2>السؤال ${ORD[gi]}: ${esc(g.t)}</h2><ol>${g.qs.map(q=>{n++;
     const body=q.k==='c'?esc(q.text).replace(/___/g,' ………………………… '):esc(q.text);
     return `<li>${q.pre?`<div class="pre">${esc(q.pre)}</div>`:''}<div>${q.k==='tf'?'( &nbsp;&nbsp; ) ':''}${body}</div>
      ${withKey?`<div class="pk">${App.assessModel(q)}</div>`:q.k==='m'?`<div class="po">${ordOf(e,q).map((k,i)=>`<span>${'أبجده'[i]}) ${esc(q.opts[k])}</span>`).join('')}</div>`:q.k==='w'?line+line+line:q.k==='tf'?'<div>التصويب: '+line+'</div>':''}</li>`;}).join('')}</ol></section>`).join('')}`;
  window.print();}

function take(v,m){
  const e=state.exams.find(x=>x.id===m[1]);if(!e)return App.go('exam');e.ans=e.ans||{};
  App.markResume('exam-'+e.id,e.title,'exam');
  const nAns=()=>e.items.filter(id=>BYID[id]&&filled(BYID[id],e.ans[id])).length;
  function draw(){const locked=!!e.submitted,R=locked?result(e):null;let n=0;
    if(R){e.sc={p:R.pts,n:R.n};}
    const LAB={ok:'✓ إجابة صحيحة',part:'◐ صحيحة جزئيًّا',no:'✗ تحتاج مراجعة'};
    v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <a href="#exam">منشئ الامتحان</a> ‹ <span>${esc(e.title)}</span></nav>
    <div class="paper${locked?' locked':''}"><header><h1>${esc(e.title)}</h1><button class="btn sm ghost exp" data-a="print">${icon('print')} طباعة الامتحان</button><button class="btn sm ghost exp" data-a="key">${icon('print')} طباعة نموذج الإجابة</button>
      <small>${e.topics.map(t=>(TOPICS.find(x=>x.id===t)||{}).title).filter(Boolean).map(esc).join(' • ')}</small></header>
     ${R?`<div class="summary"><div class="ring" style="--p:${App.pct(R.pts,R.n)};--c:var(--teal)"><b>${ar(App.pct(R.pts,R.n))}٪</b></div><div><p><b>الدرجة:</b> ${ar(R.pts)} من ${ar(R.n)}</p><p><small>تصحيح آلي؛ تصحيح الأسئلة المقالية تقريبي بالكلمات المفتاحية.</small></p></div></div>`:''}
     <div class="items">${groups(e).map((g,gi)=>`<div class="it-g">السؤال ${ORD[gi]}: ${esc(g.t)}</div>${g.qs.map(q=>{n++;const a=e.ans[q.id],r=R&&R.per[q.id];
       return `<div class="q" id="q-${q.id}">${q.pre?`<div class="it-i">${esc(q.pre)}</div>`:''}<div class="qt"><span class="n">${ar(n)}</span><span class="tx">${q.k==='c'?cText(q,a,r,locked):esc(q.text)}</span></div>${field(q,a,r,locked,e)}
        ${r?`<div class="res"><span class="pill ${r.g==='ok'?'g':r.g==='part'?'y':'r'}">${filled(q,a)?LAB[r.g]:'لم تُجب عن هذا السؤال'}</span></div><div class="model"><h5>${icon('check')} الإجابة النموذجية</h5><div>${App.assessModel(q)}</div></div>`:''}</div>`;}).join('')}`).join('')}</div>
     <div class="paper-foot"><span class="cnt" id="cnt">${ar(nAns())} / ${ar(e.items.length)} سؤالًا مُجابًا</span>
      ${locked?`<button class="btn sm orange" data-a="retry">${icon('redo')} إعادة الامتحان</button>`:`<button class="btn sm purple" data-a="submit">${icon('check')} تسليم وتصحيح</button>`}</div></div>`;}
  const tick=()=>{const c=$('#cnt',v);if(c)c.textContent=`${ar(nAns())} / ${ar(e.items.length)} سؤالًا مُجابًا`;push(e);};
  v.oninput=ev=>{const t=ev.target,id=t.dataset.id;if(!id||e.submitted)return;const q=BYID[id];
    if(q.k==='w')e.ans[id]=t.value;else if(q.k==='c'){const a=e.ans[id]||[];a[+t.dataset.blank]=t.value;e.ans[id]=a;}else if(q.k==='tf'){const a=e.ans[id]||{};a.fix=t.value;e.ans[id]=a;}tick();};
  v.onclick=ev=>{const t=ev.target;let b;
    if((b=t.closest('[data-a]'))){const a=b.dataset.a;
      if(a==='print'||a==='key')return print(e,a==='key');
      if(a==='submit'){const n=nAns();if(!n)return App.toast('أجب عن سؤال واحد على الأقل قبل التسليم.');
        App.confirm('تسليم الامتحان؟',n<e.items.length?`أجبت عن ${ar(n)} من ${ar(e.items.length)} سؤالًا. بعد التسليم يُصحَّح الامتحان آليًّا.`:'بعد التسليم يُصحَّح الامتحان آليًّا وتظهر الإجابات النموذجية.','تسليم',()=>{e.submitted=Date.now();draw();push(e,1);window.scrollTo(0,0);App.toast('تم تصحيح الامتحان.');});}
      else if(a==='retry')App.confirm('إعادة الامتحان؟','سيتم مسح إجاباتك في هذا الامتحان لتبدأ من جديد بنفس الأسئلة.','مسح والبدء من جديد',()=>{e.ans={};e.ord={};e.submitted=null;delete e.sc;push(e,1);draw();window.scrollTo(0,0);});
      return;}
    if(e.submitted)return;
    if((b=t.closest('[data-m]'))){const id=b.dataset.id,k=+b.dataset.m;e.ans[id]=e.ans[id]===k?-1:k;App.$$(`[data-id="${id}"][data-m]`,v).forEach(x=>{const on=+x.dataset.m===e.ans[id];x.classList.toggle('on',on);x.setAttribute('aria-checked',on);});tick();}
    else if((b=t.closest('[data-tf]'))){const id=b.dataset.id,a=e.ans[id]||{};a.v=a.v===b.dataset.tf?'':b.dataset.tf;e.ans[id]=a;App.$$(`[data-id="${id}"][data-tf]`,v).forEach(x=>x.classList.toggle('on',x.dataset.tf===a.v));tick();}};
  draw();
}
App.route(/^exam$/,hub);
App.route(/^exam-([\w]+)$/,take);
})();
