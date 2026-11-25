/* Section 3 — «كتاب التقييمات»: the Assessment Book reproduced with its original sequence and question types.
   The book has no answer key. Model answers (item.a) were written from the Student Book, and are used here for
   automatic grading. Exact types (m, tf, o, c, t, map) are compared directly; written answers (w) are graded by
   key-word overlap, which is approximate — so the teacher/parent can always override the grade. */
(function(){
'use strict';
const {esc,ar,icon,state}=App;
const A=window.ASSESS;
const flat=[];A.forEach(u=>u.lessons.forEach(l=>l.periods.forEach((p,pi)=>p.sections.forEach(s=>flat.push({u,l,p,s})))));
const find=id=>flat.find(x=>x.s.id===id);
const ANSW={w:1,c:1,m:1,tf:1,t:1,o:1,map:1};
const TYPE={w:'سؤال مقالي',c:'أكمل',m:'اختيار من متعدد',tf:'صواب أم خطأ مع التصويب',t:'جدول',o:'ترتيب',map:'خريطة'};
function filled(it,val){if(val==null)return false;
  if(it.k==='w')return !!String(val).trim();if(it.k==='c')return val.some(x=>x&&x.trim());if(it.k==='m')return val>=0;
  if(it.k==='tf')return !!val.v;if(it.k==='t'||it.k==='map')return Object.values(val).some(x=>x&&x.trim());if(it.k==='o')return !!val.touched;return false;}
/* ---------- auto-grader ---------- */
const STOP=new Set('في من على الي عن ان هو هي او ثم مع التي الذي هذا هذه كان كانت ما لا بين كل حيث به بها له لها ذلك تلك قد مثل منها فيها عليه هم هما'.split(' '));
const GEN=new Set('بحر محيط قناه مضيق جبال جبل نهر دوله دول مدينه خليج هضبه سهل سهول صحراء اقليم مناخ معركه غزوه عام سنه خليفه عصر حضاره مسجد جامع جزيره شبه بلاد محصول معدن مشروع سياحه قاره منطقه مناطق عربي عربيه وطن'.split(' '));
const norm=s=>String(s==null?'':s).replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/(\d)(?=[^\d\s])/g,'$1 ').replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g,' ').toLowerCase();
let stem=w=>{if(/^\d+$/.test(w))return w;w=w.replace(/^(وال|بال|كال|فال|لل|ال)(?=..)/,'');if(w.length>3)w=w.replace(/^و(ال)?/,'');return w;};
[STOP,GEN].forEach(S=>{const v=[...S];S.clear();v.forEach(w=>S.add(stem(norm(w).trim())));});
const toks=s=>[...new Set(norm(s).split(/\s+/).filter(Boolean).map(stem).filter(w=>w.length>1&&!STOP.has(w)||/^\d+$/.test(w)))];
const same=(a,b)=>{if(a===b)return true;if(/^\d+$/.test(a)||/^\d+$/.test(b))return false;const[x,y]=a.length<b.length?[a,b]:[b,a];return x.length>=3&&y.length-x.length<=3&&(y.startsWith(x)||y.endsWith(x));};
function score(key,st){const kt=toks(key);if(!kt.length)return 0;let tot=0,got=0;kt.forEach(k=>{const w=GEN.has(k)?.3:1;tot+=w;if(st.some(x=>same(k,x)))got+=w;});return{s:got/tot,n:kt.length};}
const hit=(alts,st,tight)=>alts.some(k=>{const r=score(k,st);return r&&r.s>=(r.n<=3?.6:.5)&&(!tight||st.length<=r.n+3);});
/* returns 'ok' | 'part' | 'no' , or null when the item has no model answer. `marks` collects per-field results. */
function grade(it,val,marks){
  if(it.a===undefined)return null;if(!filled(it,val))return'no';const K=it.a;marks=marks||{};
  const tri=(g,n)=>g>=n?'ok':g>0?'part':'no';
  switch(it.k){
   case'm':return val===K?'ok':'no';
   case'o':{const g=K.filter((x,i)=>val.order[i]===x).length;return g===K.length?'ok':g>=K.length/2?'part':'no';}
   case'tf':{if(val.v!==K.v)return'no';if(K.v==='t'||!K.fix.length)return'ok';return hit(K.fix,toks(val.fix))?'ok':'part';}
   case'w':{const st=toks(val);const g=K.p.filter(p=>hit(p,st)).length;return tri(g,K.n);}
   case'c':case'map':{const B=it.k==='c'?K.b:K,free=it.k==='c'&&K.f,used=[];let g=0;
     B.forEach((alts,i)=>{const v=it.k==='c'?(val[i]||''):(val[i]||'');const st=toks(v);let ok=false;
       if(free){const j=B.findIndex((al,j)=>!used.includes(j)&&hit(al,st,true));if(j>=0){used.push(j);ok=true;}}else ok=hit(alts,st,true);
       marks[i]=ok;if(ok)g++;});return tri(g,B.length);}
   case't':{let g=0,n=0;
     if(K.r)K.r.forEach((row,ri)=>row.forEach((alts,ci)=>{if(!alts.length)return;n++;const ok=hit(alts,toks(val[ri+'-'+ci]),true);marks[ri+'-'+ci]=ok;if(ok)g++;}));
     else K.c.forEach((items,ci)=>{const cells=Array.from({length:it.nrows},(_,ri)=>toks(val[ri+'-'+ci]));const need=Math.min(items.length,it.nrows);n+=need;
       let m=0;cells.forEach((st,ri)=>{if(!st.length)return;const ok=items.some(x=>hit([x],st,true));marks[ri+'-'+ci]=ok;if(ok)m++;});g+=Math.min(m,need);});
     return tri(g,n);}
  }return null;}
const alt=a=>esc(a.join(' / '));
function model(it){const K=it.a;
  switch(it.k){
   case'm':return esc(it.opts[K]);
   case'o':return '<ol>'+K.map(i=>'<li>'+esc(it.opts[i])+'</li>').join('')+'</ol>';
   case'tf':return K.v==='t'?'العبارة <b>صواب</b>.':'العبارة <b>خطأ</b>'+(K.fix.length?' — التصويب: '+alt(K.fix):'')+'.';
   case'w':return (K.n<K.p.length?`<small>يكفي ذكر ${ar(K.n)} مما يأتي:</small>`:'')+(K.p.length>1?'<ul>'+K.p.map(p=>'<li>'+alt(p)+'</li>').join('')+'</ul>':alt(K.p[0]));
   case'c':{let k=0;return esc(it.text).replace(/___/g,()=>'<b class="fill">'+alt(K.b[k++]||[])+'</b>')+(K.f?' <small>(الترتيب غير مهم)</small>':'');}
   case'map':return '<ol>'+K.map((a,i)=>'<li>'+esc(it.opts[i].replace(/[.:،\s]+$/,''))+': <b>'+alt(a)+'</b></li>').join('')+'</ol>';
   case't':return '<div class="tblwrap"><table class="given"><thead><tr>'+(K.r?'<th>وجه المقارنة</th>':'')+it.cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+
     (K.r?K.r.map((row,ri)=>'<tr><td class="rh">'+esc(it.rows[ri])+'</td>'+row.map(a=>'<td>'+alt(a)+'</td>').join('')+'</tr>').join('')
         :Array.from({length:Math.max(...K.c.map(c=>c.length))},(_,ri)=>'<tr>'+K.c.map(c=>'<td>'+esc(c[ri]||'')+'</td>').join('')+'</tr>').join(''))+'</tbody></table></div>';
  }return'';}
const PTS={ok:1,part:.5,no:0};
/* final result of one section: manual grade (teacher) overrides the automatic one */
function result(S,st){let pts=0,n=0,wait=0,auto=0;const per={};
  S.items.forEach(it=>{if(!ANSW[it.k])return;const marks={};const a=grade(it,(st.ans||{})[it.id],marks);const m=(st.grade||{})[it.id];const f=m||a;
    per[it.id]={auto:a,man:m,fin:f,marks};if(f){pts+=PTS[f];n++;if(!m)auto++;}else wait++;});
  return{pts,n,wait,auto,per};}
const secStat=s=>{const st=state.assess[s.id];if(st&&st.submitted)return'done';if(st&&s.items.some(it=>it.id&&filled(it,(st.ans||{})[it.id])))return'prog';return'';};

function hub(v){
  const pr=App.progress.assess();
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>كتاب التقييمات</span></nav>
  <div class="hub-head" style="--c:var(--purple)"><div class="badge">${icon('clip')}</div><div><h1>كتاب التقييمات</h1><p>الأداءات الصفية والمنزلية والتقييمات الأسبوعية والتدريبات الشهرية كما وردت في كتاب «الأداءات والتقييمات» وبنفس ترتيبها.</p></div>
   <div class="stat"><div class="box"><b>${ar(pr.done)} / ${ar(pr.total)}</b><small>تقييمات سُلِّمت</small></div><div class="box"><b>${ar(pr.prog)}</b><small>قيد الحل</small></div><div class="box"><b>${ar(pr.pct)}٪</b><small>نسبة الإنجاز</small></div></div></div>
  <p class="pill y" style="white-space:normal;line-height:1.7;padding:6px 14px;margin-bottom:18px">${icon('info').replace('<svg','<svg style="width:18px;height:18px;flex:none"')} بعد التسليم تُصحَّح إجاباتك آليًّا وتظهر الإجابة النموذجية لكل بند. الإجابات النموذجية أُعدّت من كتاب الطالب (الكتاب الأصلي بلا نماذج إجابة)، وتصحيح الأسئلة المقالية تقريبي؛ يستطيع المعلم أو ولي الأمر تعديل التقييم.</p>
  ${A.map(u=>`<section class="unit"><h2><span class="n">الوحدة ${ar(u.n)}</span>${esc(u.title.replace(/^[^:]*:\s*/,''))}</h2>
   ${u.lessons.map((l,li)=>{const secs=l.periods.flatMap(p=>p.sections);const d=secs.filter(s=>secStat(s)==='done').length;
     return `<details class="acc" ${state.assessOpen===l.id?'open':''} data-l="${l.id}"><summary><span class="pill p">${esc(l.name)}</span><h3>${esc(l.title)}</h3>${l.week?`<small>${esc(l.week)}</small>`:''}<span class="pill ${d===secs.length?'g':d?'y':''}">${ar(d)} / ${ar(secs.length)}</span>${icon('chev').replace('<svg','<svg style="width:20px;height:20px"')}</summary>
      <div class="in">${l.periods.map(p=>`<h4>${esc(p.title)}</h4><div class="secs">${p.sections.map(s=>`<a class="sec ${secStat(s)}" href="#sheet-${s.id}"><i></i>${esc(s.title)}<small style="color:var(--muted);font-weight:400">ص ${ar(s.page)}</small>${(x=>x?`<b class="sc">${ar(x.p)} / ${ar(x.n)}</b>`:'')(secStat(s)==='done'&&(state.assess[s.id]||{}).sc)}</a>`).join('')}</div>`).join('')}</div></details>`;}).join('')}</section>`).join('')}`;
  v.onclick=e=>{const d=e.target.closest('summary');if(d){const det=d.parentNode;setTimeout(()=>{state.assessOpen=det.open?det.dataset.l:null;},0);}};
}

function sheet(v,m){
  const X=find(m[1]);if(!X)return App.go('assess');
  const S=X.s;state.assessOpen=X.l.id;
  const st=state.assess[S.id]=state.assess[S.id]||{ans:{},grade:{}};st.ans=st.ans||{};st.grade=st.grade||{};
  const idx=flat.indexOf(X),prev=flat[idx-1],next=flat[idx+1];
  const answerable=S.items.filter(it=>ANSW[it.k]);
  const ORD={},ordOf=it=>ORD[it.id]||(ORD[it.id]=App.order(it.opts.length));
  const val=it=>st.ans[it.id];
  const nAns=()=>answerable.filter(it=>filled(it,val(it))).length;
  App.markResume('sheet-'+S.id,S.title+' — '+X.l.name+': '+X.l.title,'assess');

  function field(it,r){const a=val(it),id=it.id,mk=(r&&r.auto&&r.marks)||{},cl=k=>k in mk?(mk[k]?' ok':' bad'):'',K=r&&it.a!==undefined?it.a:null;
    switch(it.k){
     case'w':return `<textarea data-id="${id}" aria-label="إجابتك" placeholder="اكتب إجابتك هنا…">${esc(a||'')}</textarea>`;
     case'm':return `<div class="mopts" role="radiogroup">${ordOf(it).map(k=>`<button role="radio" aria-checked="${a===k}" class="${a===k?'on':''}${K!==null?(k===K?' right':a===k?' wrong':''):''}" data-id="${id}" data-m="${k}">${esc(it.opts[k])}</button>`).join('')}</div>`;
     case'tf':{const x=a||{};return `<div class="tf"><button class="${x.v==='t'?'on':''}" data-id="${id}" data-tf="t">صواب ✓</button><button class="${x.v==='f'?'on':''}" data-id="${id}" data-tf="f">خطأ ✗</button></div><input type="text" data-id="${id}" data-fix placeholder="التصويب (إن كانت العبارة خطأ)…" value="${esc(x.fix||'')}" aria-label="التصويب">`;}
     case't':{const x=a||{};const rows=it.rows.length?it.rows:Array.from({length:it.nrows},()=>null);const lab=it.rows.length>0;
       return `<div class="tblwrap"><table><thead><tr>${lab?'<th>وجه المقارنة</th>':''}${it.cols.map(c=>'<th>'+esc(c)+'</th>').join('')}</tr></thead><tbody>${rows.map((r,ri)=>`<tr>${lab?`<td class="rh">${esc(r)}</td>`:''}${it.cols.map((c,ci)=>`<td><textarea class="${cl(ri+'-'+ci)}" data-id="${id}" data-cell="${ri}-${ci}" aria-label="${esc(c)}">${esc(x[ri+'-'+ci]||'')}</textarea></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
     case'o':{const x=a||{order:it.opts.map((_,i)=>i)};return `<ol class="ord">${x.order.map((oi,pos)=>`<li><span>${esc(it.opts[oi])}</span><button data-id="${id}" data-mv="-1" data-pos="${pos}" ${pos===0?'disabled':''} aria-label="تحريك لأعلى">${icon('up')}</button><button data-id="${id}" data-mv="1" data-pos="${pos}" ${pos===x.order.length-1?'disabled':''} aria-label="تحريك لأسفل">${icon('down')}</button></li>`).join('')}</ol><small style="color:var(--muted)">استخدم الأسهم لترتيب البطاقات من الأقدم (أعلى) إلى الأحدث (أسفل).</small>`;}
     case'map':{const x=a||{};return `<figure class="it-img" data-zoom="${esc(it.img)}"><img loading="lazy" src="${esc(it.img)}" alt="خريطة صماء"></figure>${it.opts.map((o,k)=>`<label style="display:block;margin-top:8px"><span>${ar(k+1)}- ${esc(o)}</span><input type="text" class="${cl(k)}" data-id="${id}" data-cell="${k}" value="${esc(x[k]||'')}" placeholder="اكتب الاسم الذي ستوقّعه على الخريطة…"></label>`).join('')}`;}
    }return '';}
  function cText(it,r){const a=val(it)||[],mk=(r&&r.auto&&r.marks)||{};let k=0;return esc(it.text).replace(/___/g,()=>{const i=k++;return `<input type="text" class="inl${i in mk?(mk[i]?' ok':' bad'):''}" data-id="${it.id}" data-blank="${i}" value="${esc(a[i]||'')}" aria-label="أكمل">`;});}
  function draw(){
    const locked=!!st.submitted;let sub=false;
    const R=locked?result(S,st):null;if(R){st.sc={p:R.pts,n:R.n};App.save();}
    const body=S.items.map(it=>{
      if(it.k==='g'){sub=false;return `<div class="it-g">${esc(it.text)}</div>`;}
      if(it.k==='i')return `<div class="it-i">${esc(it.text)}</div>`;
      if(it.k==='img')return `<figure class="it-img" data-zoom="${esc(it.img)}" tabindex="0" role="button"><img loading="lazy" src="${esc(it.img)}" alt="${esc(it.cap||'صورة السؤال من كتاب التقييمات')}">${it.cap?`<figcaption>${esc(it.cap)}</figcaption>`:''}</figure>`;
      if(it.k==='tbl')return `<div class="tblwrap"><table class="given"><thead><tr>${it.cols.map(c=>'<th>'+esc(c)+'</th>').join('')}</tr></thead><tbody>${it.rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
      if(it.k==='h'){sub=true;return `<div class="it-h q" style="background:#faf7ff"><div class="qt"><span class="n">${esc(it.n==='-'?'•':it.n)}</span><span class="tx">${esc(it.text)}</span></div></div>`;}
      const isSub=sub&&/^(-|[أبجده]|\(.\))$/.test(it.n);if(!isSub&&it.k!=='img')sub=sub&&isSub;
      const r=R&&R.per[it.id],g=r&&r.man,f=r&&r.fin,has=it.a!==undefined,un=locked&&!filled(it,val(it));
      const LAB={ok:'✓ إجابة صحيحة',part:'◐ صحيحة جزئيًّا',no:un?'لم تُجب عن هذا البند':'✗ تحتاج مراجعة'};
      return `<div class="q${isSub?' sub':''}" id="q-${it.id}"><div class="qt"><span class="n">${esc(it.n==='-'?'•':it.n)}</span><span class="tx">${it.k==='c'?cText(it,r):esc(it.text)}</span><button class="sp" data-sp="${it.id}" aria-label="اقرأ السؤال">${icon('speaker')}</button></div>
        ${field(it,r)}
        ${locked?`<div class="res ${f||'wait'}"><span class="pill ${f==='ok'?'g':f==='part'?'y':f==='no'?'r':'p'}">${f?LAB[f]:'بانتظار تقييم المعلم'}</span><small>${g?'بتقييم المعلم / ولي الأمر':has?'تصحيح آلي'+(it.k==='w'?' تقريبي بالكلمات المفتاحية':''):'لا توجد إجابة نموذجية لهذا البند (سؤال رأي أو نشاط حر)'}</small></div>
        ${has?`<div class="model"><h5>${icon('check')} الإجابة النموذجية <small>من كتاب الطالب</small></h5><div>${model(it)}</div></div>`:''}
        <div class="grade"><span>تعديل التقييم (المعلم / ولي الأمر):</span><button class="ok${g==='ok'?' on':''}" data-gr="ok" data-id="${it.id}">صحيحة</button><button class="part${g==='part'?' on':''}" data-gr="part" data-id="${it.id}">جزئية</button><button class="no${g==='no'?' on':''}" data-gr="no" data-id="${it.id}">تحتاج مراجعة</button></div>`:''}</div>`;
    }).join('');
    v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <a href="#assess">كتاب التقييمات</a> ‹ <span>${esc(X.l.name)}</span></nav>
    <div class="paper${locked?' locked':''}"><header><h1>${esc(S.title)}</h1>
      <small>${esc(X.u.title)} • ${esc(X.l.name)}: ${esc(X.l.title)}${X.l.week?' • '+esc(X.l.week):''}<br>${esc(X.p.title)}</small></header>
     ${locked?`<div class="summary"><div class="ring" style="--p:${R.n?App.pct(R.pts,R.n):0};--c:var(--purple)"><b>${R.n?ar(App.pct(R.pts,R.n))+'٪':'—'}</b></div><div><p><b>ملخص الأداء:</b> أجبت عن ${ar(nAns())} من ${ar(answerable.length)} بندًا.</p><p><b>الدرجة:</b> ${R.n?`${ar(R.pts)} من ${ar(R.n)} (${ar(App.pct(R.pts,R.n))}٪)`:'—'} <small>— ${ar(R.auto)} بندًا بتصحيح آلي${R.n-R.auto?'، '+ar(R.n-R.auto)+' بتقييم المعلم':''}${R.wait?'، '+ar(R.wait)+' بانتظار تقييم المعلم':''}.</small></p><p><small>الإجابات النموذجية مُعدّة من كتاب الطالب، وتصحيح الأسئلة المقالية تقريبي — استخدم «تعديل التقييم» عند الحاجة.</small></p></div></div>`:''}
     <div class="items">${body}</div>
     <div class="paper-foot"><span class="cnt" id="cnt">${ar(nAns())} / ${ar(answerable.length)} بندًا مُجابًا</span>
      ${locked?`<button class="btn sm orange" data-a="retry">${icon('redo')} إعادة المحاولة</button>`:`<button class="btn sm purple" data-a="submit">${icon('check')} تسليم الإجابات</button>`}</div>
    </div>
    <div class="lesson-foot" style="max-width:880px;margin:20px auto 0">${prev?`<a class="btn ghost sm" href="#sheet-${prev.s.id}">${icon('next')} السابق: ${esc(prev.s.title)}</a>`:'<span></span>'}${next?`<a class="btn ghost sm" href="#sheet-${next.s.id}">التالي: ${esc(next.s.title)} ${icon('prev')}</a>`:'<span></span>'}</div>`;
  }
  const itemOf=id=>S.items.find(i=>i.id===id);
  const tick=()=>{const c=v.querySelector('#cnt');if(c)c.textContent=`${ar(nAns())} / ${ar(answerable.length)} بندًا مُجابًا`;App.save();};
  v.oninput=e=>{const t=e.target,id=t.dataset.id;if(!id||st.submitted)return;const it=itemOf(id);
    if(it.k==='w')st.ans[id]=t.value;
    else if(it.k==='c'){const a=st.ans[id]||[];a[+t.dataset.blank]=t.value;st.ans[id]=a;}
    else if(it.k==='tf'&&'fix'in t.dataset){const a=st.ans[id]||{};a.fix=t.value;st.ans[id]=a;}
    else if(it.k==='t'||it.k==='map'){const a=st.ans[id]||{};a[t.dataset.cell]=t.value;st.ans[id]=a;}
    tick();};
  v.onclick=e=>{const t=e.target;let b;
    if((b=t.closest('[data-zoom]'))){App.lightbox([{src:b.dataset.zoom,cap:'من كتاب التقييمات'}],0);return;}
    if((b=t.closest('[data-sp]'))){const it=itemOf(b.dataset.sp);App.tts.speak([{el:v.querySelector('#q-'+it.id),text:it.text+(it.k==='m'?'. '+ordOf(it).map(k=>it.opts[k]).join('. '):it.opts&&it.k!=='map'?'. '+it.opts.join('. '):'')}],'قراءة السؤال');return;}
    if((b=t.closest('[data-gr]'))){const id=b.dataset.id;st.grade[id]=st.grade[id]===b.dataset.gr?null:b.dataset.gr;if(!st.grade[id])delete st.grade[id];App.save();const y=window.scrollY;draw();window.scrollTo(0,y);return;}
    if((b=t.closest('[data-a]'))){const a=b.dataset.a;
      if(a==='submit'){const n=nAns();if(!n){App.toast('أجب عن بند واحد على الأقل قبل التسليم.');return;}
        App.confirm('تسليم الإجابات؟',n<answerable.length?`أجبت عن ${ar(n)} من ${ar(answerable.length)} بندًا. بعد التسليم تُصحَّح الإجابات وتُقفل حتى تختار «إعادة المحاولة».`:'بعد التسليم تُقفل الإجابات وتُصحَّح آليًّا وتظهر الإجابات النموذجية.','تسليم',()=>{st.submitted=Date.now();st.tries=(st.tries||0)+1;App.save();draw();window.scrollTo(0,0);
          const R=result(S,st),gm=App.game.sheetDone(S,st,R,n,answerable.length,v.querySelector('.summary .ring'));
          App.toast((gm.p>=85?'ممتاز! ':gm.p>=60?'أحسنت! ':gm.p>=40?'جيد، واصل! ':'لا بأس، لنتعلّم من الأخطاء! ')+'تم تسليم إجاباتك وتصحيحها.');});}
      else if(a==='retry')App.confirm('إعادة المحاولة؟','سيتم مسح إجاباتك وتقييمها في هذا التقييم لتبدأ من جديد.','مسح والبدء من جديد',()=>{st.ans={};st.grade={};st.submitted=null;delete st.sc;App.save();draw();window.scrollTo(0,0);});
      return;}
    if(st.submitted)return;
    if((b=t.closest('[data-m]'))){const id=b.dataset.id,k=+b.dataset.m;st.ans[id]=st.ans[id]===k?-1:k;App.$$(`[data-id="${id}"][data-m]`,v).forEach(x=>{const on=+x.dataset.m===st.ans[id];x.classList.toggle('on',on);x.setAttribute('aria-checked',on);});tick();}
    else if((b=t.closest('[data-tf]'))){const id=b.dataset.id;const a=st.ans[id]||{};a.v=a.v===b.dataset.tf?'':b.dataset.tf;st.ans[id]=a;App.$$(`[data-id="${id}"][data-tf]`,v).forEach(x=>x.classList.toggle('on',x.dataset.tf===a.v));tick();}
    else if((b=t.closest('[data-mv]'))){const id=b.dataset.id,it=itemOf(id);const a=st.ans[id]||{order:it.opts.map((_,i)=>i)};const p=+b.dataset.pos,q=p+ +b.dataset.mv;if(q<0||q>=a.order.length)return;[a.order[p],a.order[q]]=[a.order[q],a.order[p]];a.touched=true;st.ans[id]=a;const box=v.querySelector('#q-'+id);const tmp=document.createElement('div');tmp.innerHTML=field(it);box.querySelector('.ord').replaceWith(tmp.querySelector('.ord'));tick();}
  };
  v.onkeydown=e=>{if(e.key==='Enter'){const f=e.target.closest('figure[role=button]');if(f)f.click();}};
  draw();
}
App.assessGrade=grade;App.assessModel=model;App.assessResult=result;
App.route(/^assess$/,hub);
App.route(/^sheet-(a\d-\d+-\d+-\d+)$/,sheet);
})();
