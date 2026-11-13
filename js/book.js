/* Section 1 — «ذاكر من كتاب المدرسة»: lesson infographics rendered from structured content (data/lessons.js). */
(function(){
'use strict';
const {esc,ar,icon,state}=App;
const B=window.BOOK;
const byId=id=>B.lessons.find(l=>l.id===id);
const scan=p=>({src:'pages/book/p'+String(p+B.pageOffset).padStart(3,'0')+'.jpg',cap:'كتاب الطالب – صفحة '+ar(p)});
const range=(a,b)=>{const r=[];for(let i=a;i<=b;i++)r.push(i);return r;};
const li=a=>a.map(x=>'<li>'+esc(x)+'</li>').join('');
const sayBtn='<button class="say" data-say aria-label="اقرأ هذه الفقرة">'+icon('speaker')+'</button>';

/* ---------- block renderers: one per content type ---------- */
const R={
 intro:b=>`<div class="blk b-intro">${sayBtn}<p>${esc(b.text)}</p></div>`,
 note:b=>`<div class="blk b-note">${sayBtn}${icon('bulb')}<p>${esc(b.text)}</p></div>`,
 fact:b=>`<div class="blk b-fact ${/قيم/.test(b.kind)?'v':/تاريخية|جغرافية/.test(b.kind)?'h':''}">${sayBtn}<b>${esc(b.kind)}</b><p>${esc(b.text)}</p></div>`,
 stats:b=>`<div class="blk b-stats">${b.items.map(s=>`<div class="s"><div class="v">${esc(s.v)}${s.u?`<small>${esc(s.u)}</small>`:''}</div><div class="l">${esc(s.l)}</div><div class="d">${esc(s.d||'')}</div></div>`).join('')}</div>`,
 terms:b=>`<div class="blk b-terms">${sayBtn}${b.items.map(t=>`<div class="term"><b>${esc(t.term)}</b><div>${esc(t.def)}</div></div>`).join('')}</div>`,
 map:b=>`<div class="blk b-map"><figure data-zoom="${esc(b.img)}" data-cap="${esc(b.cap)}" tabindex="0" role="button" aria-label="تكبير: ${esc(b.cap)}"><img loading="lazy" src="${esc(b.img)}" alt="${esc(b.cap)}"><figcaption>${esc(b.cap)} — اضغط للتكبير</figcaption></figure></div>`,
 duo:b=>`<div class="blk b-duo">${sayBtn}<div class="col a"><h4>${esc(b.a.h)}</h4><ul>${li(b.a.items)}</ul></div><div class="col b"><h4>${esc(b.b.h)}</h4><ul>${li(b.b.items)}</ul></div></div>`,
 split:b=>`<div class="blk b-split">${sayBtn}${['a','b'].map(k=>{const c=b[k];return `<div class="col ${k}"><h4>${esc(c.h)}</h4><div class="big">${esc(c.big)}</div><div class="sub">${esc(c.sub)}</div><span class="cnt">${esc(c.count)}</span><div class="tags">${c.items.map(x=>'<span>'+esc(x)+'</span>').join('')}</div></div>`;}).join('')}</div>`,
 chips:b=>`<div class="blk b-chips">${sayBtn}${b.h?`<h4>${esc(b.h)}</h4>`:''}<ol>${li(b.items)}</ol></div>`,
 cards:b=>`<div class="blk b-cards">${b.h?`<h4>${esc(b.h)}</h4>`:''}<div class="cards">${b.items.map(c=>c.more?`<button class="card more" data-card aria-expanded="false"><span class="ic">${icon(c.icon)}</span><h5>${esc(c.h)}</h5><span>${esc(c.body)}</span><span class="x">${esc(c.more)}</span><span class="hint">اضغط للمزيد ▾</span></button>`:`<div class="card"><span class="ic">${icon(c.icon)}</span><h5>${esc(c.h)}</h5><span>${esc(c.body)}</span></div>`).join('')}</div></div>`,
 compare:b=>`<div class="blk b-compare">${sayBtn}<table><thead><tr>${b.head.map(h=>'<th>'+esc(h)+'</th>').join('')}</tr></thead><tbody>${b.rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`,
 compass:b=>`<div class="blk b-compass">${sayBtn}<div style="grid-area:n"><b>شمالًا</b>${esc(b.n.join('، '))}</div><div style="grid-area:e"><b>شرقًا</b>${esc(b.e.join('، '))}</div><div class="c">الوطن<br>العربي</div><div style="grid-area:w"><b>غربًا</b>${esc(b.w.join('، '))}</div><div style="grid-area:s"><b>جنوبًا</b>${esc(b.s.join('، '))}</div></div>`,
 flow:b=>`<div class="blk b-flow">${sayBtn}${b.h?`<h4>${esc(b.h)}</h4>`:''}<ol>${b.steps.map(s=>`<li><b>${esc(s.h)}</b>${esc(s.body)}</li>`).join('')}</ol></div>`,
 timeline:b=>`<div class="blk b-time">${sayBtn}<figure><figcaption>${esc(b.cap||'')}</figcaption><ol>${b.items.map(t=>`<li><span class="when">${esc(t.n)}</span>${t.h?`<b>${esc(t.h)}: </b>`:''}${esc(t.text)}</li>`).join('')}</ol></figure></div>`,
 people:b=>`<div class="blk b-people">${b.h?`<h4>${esc(b.h)}</h4>`:''}<div class="people">${b.items.map((p,i)=>`<div class="person${i===0?' open':''}"><button data-person aria-expanded="${i===0}"><span class="av">${ar(i+1)}</span><h5>${esc(p.name)}</h5><span class="when">${esc(p.when)}</span><span class="chev">${icon('chev')}</span></button><div class="body">${p.tag?`<p class="tag">${esc(p.tag)}</p>`:''}<ol>${li(p.works)}</ol></div></div>`).join('')}</div></div>`,
 ask:b=>`<div class="blk b-ask${b.q.length===1?' one':''}">${sayBtn}<b>${icon('quiz')}${esc(b.kind)}</b><ol>${li(b.q)}</ol></div>`,
 read:b=>`<div class="blk b-read">${sayBtn}<h4>${esc(b.h)}</h4><p>${esc(b.text)}</p></div>`,
 pages:b=>`<div class="blk b-pages"><p>${esc(b.note||'')}</p><div class="scans">${b.pages.map((p,i)=>{const s=scan(p);return `<figure data-scan="${i}" tabindex="0" role="button"><img loading="lazy" src="${s.src}" alt="${esc(s.cap)}"><figcaption>${esc(s.cap)} — اضغط للتكبير</figcaption></figure>`;}).join('')}</div></div>`
};
const block=b=>(R[b.t]||(()=>''))(b);
/* plain readable text version of a panel (also used for read-aloud) */
function blockText(b){switch(b.t){
 case'intro':case'note':return b.text;case'fact':return b.kind+': '+b.text;case'read':return b.h+'\n'+b.text;
 case'stats':return b.items.map(s=>s.d||(s.l+' '+s.v)).join('\n');case'terms':return b.items.map(t=>t.term+': '+t.def).join('\n');
 case'map':return '['+b.cap+']';case'duo':return [b.a,b.b].map(c=>c.h+':\n'+c.items.map(x=>'• '+x).join('\n')).join('\n');
 case'split':return [b.a,b.b].map(c=>`${c.h}: ${c.big} ${c.sub} (${c.count}): ${c.items.join('، ')}.`).join('\n');
 case'chips':return (b.h?b.h+':\n':'')+b.items.map(x=>'• '+x).join('\n');case'cards':return (b.h?b.h+':\n':'')+b.items.map(c=>c.h+': '+c.body+(c.more?' '+c.more:'')).join('\n');
 case'compare':return b.rows.map(r=>r.map((c,i)=>(b.head[i]?b.head[i]+': ':'')+c).join(' — ')).join('\n');
 case'compass':return `شمالًا: ${b.n.join('، ')}.\nشرقًا: ${b.e.join('، ')}.\nجنوبًا: ${b.s.join('، ')}.\nغربًا: ${b.w.join('، ')}.`;
 case'flow':return (b.h?b.h+':\n':'')+b.steps.map(s=>s.h+': '+s.body).join('\n');case'timeline':return (b.cap?b.cap+':\n':'')+b.items.map(t=>`(${t.n}) ${t.h?t.h+': ':''}${t.text}`).join('\n');
 case'people':return (b.h?b.h+':\n':'')+b.items.map(p=>`${p.name} (${p.when}): ${p.tag||''} ${p.works.join(' ')}`).join('\n');
 case'ask':return b.kind+':\n'+b.q.map(x=>'؟ '+x).join('\n');default:return '';}}

/* ---------- hub ---------- */
function hub(v){
  const pr=App.progress.book();
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>ذاكر من كتاب المدرسة</span></nav>
  <div class="hub-head" style="--c:var(--teal)"><div class="badge">${icon('book')}</div><div><h1>ذاكر من كتاب المدرسة</h1><p>إنفوجرافيك تفاعلي لكل درس من كتاب الطالب — ٣ وحدات، ${ar(B.lessons.length)} درسًا.</p></div>
   <div class="stat"><div class="box"><b>${ar(pr.done)} / ${ar(pr.total)}</b><small>دروس مكتملة</small></div><div class="box"><b>${ar(pr.visited)}</b><small>دروس تمت زيارتها</small></div><div class="box"><b>${ar(pr.pct)}٪</b><small>نسبة الإنجاز</small></div></div></div>
  ${B.units.map(u=>`<section class="unit"><h2><span class="n">الوحدة ${ar(u.n)}</span>${esc(u.title)}</h2><div class="grid" style="--c:var(--teal)">
   ${B.lessons.filter(l=>l.unit===u.n).map(l=>{const st=state.lessons[l.id]||{};return `<a class="tile" href="#lesson-${l.id}">${st.done?`<span class="tick" title="مكتمل">${icon('check')}</span>`:''}<span class="ic">${icon(l.icon)}</span><h3>${esc(l.title)}</h3><small>الدرس ${ar(l.n)} • صفحات الكتاب ${ar(l.bookPages[0])}–${ar(l.bookPages[1])} • ${ar(l.panels.length)} لوحات</small><span class="row">${st.done?'<span class="pill g">مكتمل</span>':st.visited?'<span class="pill y">بدأت المذاكرة</span>':'<span class="pill">لم يبدأ</span>'}</span></a>`;}).join('')}
   <a class="tile" href="#bookpages-u${u.n}" style="--c:var(--royal)"><span class="ic">${icon('pages')}</span><h3>${esc(u.extra.title)}</h3><small>صفحات الكتاب الأصلية ${ar(u.extra.pages[0])}–${ar(u.extra.pages[1])}</small><span class="row"><span class="pill">من الكتاب</span></span></a></div></section>`).join('')}
  <section class="unit"><div class="grid"><a class="tile wide" href="#bookpages-review" style="--c:var(--royal)"><span class="ic">${icon('pages')}</span><h3>${esc(B.review.title)}</h3><small>صفحات الكتاب الأصلية ${ar(B.review.pages[0])}–${ar(B.review.pages[1])}</small></a></div></section>`;
}

/* ---------- original book pages viewer (unit assessments + general review) ---------- */
function pagesView(v,m){
  const key=m[1];const ex=key==='review'?B.review:(B.units.find(u=>'u'+u.n===key)||{}).extra;if(!ex)return App.go('book');
  const list=range(ex.pages[0],ex.pages[1]).map(scan);
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <a href="#book">ذاكر من كتاب المدرسة</a> ‹ <span>${esc(ex.title)}</span></nav>
  <div class="lesson-bar"><h1>${esc(ex.title)}</h1><a class="btn sm ghost" href="#book">${icon('next')} رجوع للدروس</a></div>
  <div class="sheet"><div class="blk b-pages"><p>هذه الصفحات معروضة كما هي من كتاب الطالب (صفحات ${ar(ex.pages[0])}–${ar(ex.pages[1])}). اضغط على أي صفحة للتكبير والتنقل بين الصفحات.</p><div class="scans">${list.map((s,i)=>`<figure data-i="${i}" tabindex="0" role="button"><img loading="lazy" src="${s.src}" alt="${esc(s.cap)}"><figcaption>${esc(s.cap)}</figcaption></figure>`).join('')}</div></div></div>`;
  v.onclick=e=>{const f=e.target.closest('figure[data-i]');if(f)App.lightbox(list,+f.dataset.i);};
  v.onkeydown=e=>{if(e.key==='Enter'){const f=e.target.closest('figure[data-i]');if(f)App.lightbox(list,+f.dataset.i);}};
}

/* ---------- lesson view ---------- */
function lesson(v,m){
  const L=byId(m[1]);if(!L)return App.go('book');
  const st=state.lessons[L.id]=state.lessons[L.id]||{};st.visited=true;st.seen=st.seen||{};
  let pi=Math.min(st.panel||0,L.panels.length-1),mode='info',full=false;
  state.last={id:L.id,title:L.title};App.save();App.game.lessonOpen();
  const idx=B.lessons.indexOf(L),prev=B.lessons[idx-1],next=B.lessons[idx+1];
  const zooms=[.85,1,1.15,1.3,1.5];
  function draw(){
    const P=L.panels[pi];st.panel=pi;st.seen[pi]=true;App.save();App.markResume('lesson-'+L.id,L.title+' — '+P.title,'book');App.game.lessonPanels(L,st);
    const z=state.prefs.zoom||1;
    v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <a href="#book">ذاكر من كتاب المدرسة</a> ‹ <span>الوحدة ${ar(L.unit)} – الدرس ${ar(L.n)}</span></nav>
    <div class="lesson-bar"><h1>${esc(L.title)}</h1>
      <button class="icon-btn" data-a="zout" aria-label="تصغير الخط" title="تصغير">${icon('minus')}</button><button class="icon-btn" data-a="zin" aria-label="تكبير الخط" title="تكبير">${icon('plus')}</button>
      <button class="icon-btn${mode==='text'?' on':''}" data-a="text" aria-label="النسخة النصية" title="النسخة النصية">${icon('text')}</button>
      <button class="icon-btn${mode==='scan'?' on':''}" data-a="scan" aria-label="صفحات الكتاب الأصلية" title="صفحات الكتاب الأصلية">${icon('pages')}</button>
      <button class="icon-btn" data-a="read" aria-label="اقرأ اللوحة بصوت مسموع" title="اقرأ بصوت مسموع">${icon('speaker')}</button>
      <button class="icon-btn" data-a="full" aria-label="ملء الشاشة" title="ملء الشاشة">${icon('full')}</button></div>
    <details class="objectives"><summary>أهداف الدرس</summary><ul>${li(L.objectives)}</ul></details>
    <div class="steps" role="tablist">${L.panels.map((p,i)=>`<button role="tab" aria-selected="${i===pi}" class="${i===pi?'on':st.seen[i]?'seen':''}" data-p="${i}"><i>${st.seen[i]&&i!==pi?'✓':ar(i+1)}</i>${esc(p.title)}</button>`).join('')}</div>
    <article class="sheet${full?' full':''}" style="--z:${z}" id="sheet">
      <div class="phead"><h2>${esc(P.title)}</h2><span class="src">المصدر: كتاب الطالب – ${P.src.length>1?'الصفحات':'صفحة'} ${P.src.map(ar).join('، ')}</span>${full?`<button class="btn sm gold" data-a="full">${icon('close')} خروج من ملء الشاشة</button>`:''}</div>
      ${mode==='text'?`<div class="textver blk" id="tv">${esc(P.blocks.map(blockText).filter(Boolean).join('\n\n'))}</div>`
       :mode==='scan'?`<div class="blk b-pages"><p>الصفحات الأصلية لهذه اللوحة من كتاب الطالب.</p><div class="scans">${P.src.map((p,i)=>{const s=scan(p);return `<figure data-src="${i}" tabindex="0" role="button"><img loading="lazy" src="${s.src}" alt="${esc(s.cap)}"><figcaption>${esc(s.cap)} — اضغط للتكبير</figcaption></figure>`;}).join('')}</div></div>`
       :`<div class="blocks">${P.blocks.map(block).join('')}</div>`}
      <div class="lesson-foot" style="color:var(--ink)">
        <button class="btn sm" data-a="pprev" ${pi===0?'disabled':''} style="box-shadow:0 5px 0 var(--line)">${icon('next')} اللوحة السابقة</button>
        <span class="pill t">${ar(pi+1)} / ${ar(L.panels.length)}</span>
        ${pi<L.panels.length-1?`<button class="btn sm teal" data-a="pnext">اللوحة التالية ${icon('prev')}</button>`:`<button class="btn sm ${st.done?'':'gold'}" data-a="done" style="${st.done?'box-shadow:0 5px 0 var(--line)':''}">${icon('check')} ${st.done?'تم إكمال الدرس – إلغاء':'أكملتُ هذا الدرس'}</button>`}
      </div>
    </article>
    <div class="lesson-foot">${prev?`<a class="btn ghost" href="#lesson-${prev.id}">${icon('next')} الدرس السابق</a>`:'<span></span>'}<a class="btn ghost" href="#mcq">${icon('quiz')} تدرّب على أسئلة الدرس</a>${next?`<a class="btn ghost" href="#lesson-${next.id}">الدرس التالي ${icon('prev')}</a>`:'<span></span>'}</div>`;
  }
  function readPanel(){const P=L.panels[pi];
    if(mode!=='info'){const el=v.querySelector('#tv')||v.querySelector('.sheet');App.tts.speak([{el,text:P.title+'. '+P.blocks.map(blockText).join('. ')}],P.title);return;}
    const els=App.$$('.blocks>.blk',v);const parts=[{el:v.querySelector('.phead'),text:P.title}];
    P.blocks.forEach((b,i)=>{const t=blockText(b);if(t&&b.t!=='map'&&b.t!=='pages')parts.push({el:els[i],text:t});});App.tts.speak(parts,P.title);}
  function setFull(on){full=on;const el=document.documentElement;
    try{if(on&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}
    draw();}
  v.onclick=e=>{
    const t=e.target;
    const step=t.closest('[data-p]');if(step){pi=+step.dataset.p;App.tts.stop();draw();return;}
    const card=t.closest('[data-card]');if(card){const o=card.classList.toggle('open');card.setAttribute('aria-expanded',o);return;}
    const per=t.closest('[data-person]');if(per){const o=per.parentNode.classList.toggle('open');per.setAttribute('aria-expanded',o);return;}
    const say=t.closest('[data-say]');if(say){const blk=say.closest('.blk');const i=App.$$('.blocks>.blk',v).indexOf(blk);App.tts.speak([{el:blk,text:blockText(L.panels[pi].blocks[i])}],L.panels[pi].title);return;}
    const zf=t.closest('[data-zoom]');if(zf){App.lightbox([{src:zf.dataset.zoom,cap:zf.dataset.cap}],0);return;}
    const sc=t.closest('[data-scan]');if(sc){const b=L.panels[pi].blocks.find(x=>x.t==='pages');App.lightbox(b.pages.map(scan),+sc.dataset.scan);return;}
    const ss=t.closest('[data-src]');if(ss){App.lightbox(L.panels[pi].src.map(scan),+ss.dataset.src);return;}
    const a=t.closest('[data-a]');if(!a)return;const act=a.dataset.a;
    if(act==='zin'||act==='zout'){let k=zooms.indexOf(state.prefs.zoom||1);if(k<0)k=1;k=Math.max(0,Math.min(zooms.length-1,k+(act==='zin'?1:-1)));state.prefs.zoom=zooms[k];App.save();v.querySelector('#sheet').style.setProperty('--z',zooms[k]);App.toast('حجم العرض: '+ar(Math.round(zooms[k]*100))+'٪');}
    else if(act==='text'){mode=mode==='text'?'info':'text';draw();}
    else if(act==='scan'){mode=mode==='scan'?'info':'scan';draw();}
    else if(act==='read')readPanel();
    else if(act==='full')setFull(!full);
    else if(act==='pprev'&&pi>0){pi--;App.tts.stop();draw();v.querySelector('.steps').scrollIntoView({block:'start'});}
    else if(act==='pnext'&&pi<L.panels.length-1){pi++;App.tts.stop();draw();v.querySelector('.steps').scrollIntoView({block:'start'});}
    else if(act==='done'){const rr=t.closest('[data-a]').getBoundingClientRect();st.done=!st.done;App.save();draw();if(st.done)App.game.lessonDone(L,rr);App.toast(st.done?'أحسنت! تم تسجيل الدرس كمكتمل.':'تم إلغاء علامة الإكمال.');}
  };
  v.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){const f=e.target.closest('figure[role=button]');if(f){e.preventDefault();f.click();}}};
  draw();
}
App.route(/^book$/,hub);
App.route(/^lesson-([a-z0-9]+)$/,lesson);
App.route(/^bookpages-(u[123]|review)$/,pagesView);
})();
