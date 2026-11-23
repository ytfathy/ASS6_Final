/* Section 5 — «ملخصات الدروس»: one simple infographic per lesson (key numbers, six icon tiles
   with short points, one takeaway; content in data/infog.js) that the student can save as a PNG image or print. */
(function(){
'use strict';
const {esc,ar,icon,$}=App;
const B=window.BOOK;
const unitOf=L=>B.units.find(u=>u.n===L.unit);
/* NotebookLM-style poster: big title, key numbers, six icon tiles with short points, one takeaway */
function poster(L){const D=window.INFOG[L.id];
  return `<article class="ig" id="ig"><header class="ig-head"><img src="assets/logo-192.png" alt="" width="56" height="56"><div><small>الوحدة ${ar(L.unit)}: ${esc(unitOf(L).title)} • الدرس ${ar(L.n)}</small><h1>${esc(L.title)}</h1><p>${esc(D.tag)}</p></div></header>
   <div class="ig-nums">${D.nums.map(([v,l])=>`<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
   <div class="ig-grid">${D.pts.map(([ic,h,b],i)=>`<section class="ig-tile c${i%6}"><div class="ig-ic">${icon(ic)}</div><h2>${esc(h)}</h2><ul>${b.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></section>`).join('')}</div>
   <div class="ig-key">${icon('bulb')}<p><b>الخلاصة:</b> ${esc(D.key)}</p></div>
   <footer class="ig-foot">International Education Egypt • الدراسات الاجتماعية • الصف السادس الابتدائي • كتاب الطالب ص ${ar(L.bookPages[0])}–${ar(L.bookPages[1])}</footer></article>`;}

function hub(v){
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>ملخصات الدروس</span></nav>
  <div class="hub-head" style="--c:var(--royal)"><div class="badge">${icon('scroll')}</div><div><h1>ملخصات الدروس (إنفوجرافيك)</h1><p>لوحة واحدة لكل درس فيها أهم المعلومات، يمكنك حفظها صورةً أو طباعتها.</p></div></div>
  ${B.units.map(u=>`<section class="unit"><h2><span class="n">الوحدة ${ar(u.n)}</span>${esc(u.title)}</h2><div class="secs">${B.lessons.filter(l=>l.unit===u.n).map(l=>`<a class="sec" href="#info-${l.id}"><i></i>الدرس ${ar(l.n)}: ${esc(l.title)}${window.INFOG[l.id].img?' <small>🖼️</small>':''}</a>`).join('')}</div></section>`).join('')}`;
}

/* PNG export: html-to-image renders the poster through the browser itself, so Arabic text keeps its shaping. Loaded only when needed. */
let lib=null;
const loadLib=()=>lib||(lib=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';s.onload=()=>res(window.htmlToImage);s.onerror=()=>{lib=null;rej(new Error('تعذّر تحميل أداة الحفظ (تحقق من الاتصال بالإنترنت)'));};document.head.appendChild(s);}));
function savePng(L,btn){btn.disabled=true;App.toast('جارٍ تجهيز الصورة…');
  loadLib().then(h=>h.toPng($('#ig'),{pixelRatio:2,backgroundColor:'#fbf8f1',style:{margin:'0'}})).then(url=>{const a=document.createElement('a');a.href=url;a.download=`ملخص-${L.title}.png`;a.click();App.toast('تم حفظ الصورة.');})
    .catch(e=>App.toast((e&&e.message)||'تعذّر حفظ الصورة، استخدم «طباعة» بدلًا منها.')).finally(()=>{btn.disabled=false;});}

function view(v,m){
  const i=B.lessons.findIndex(l=>l.id===m[1]);if(i<0)return App.go('info');const L=B.lessons[i],prev=B.lessons[i-1],next=B.lessons[i+1];
  App.markResume('info-'+L.id,'ملخص: '+L.title,'info');const D=window.INFOG[L.id];
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <a href="#info">ملخصات الدروس</a> ‹ <span>${esc(L.title)}</span></nav>
   <div class="ig-acts">${D.img?`<a class="btn sm gold" href="${D.img}" download="إنفوجرافيك-${esc(L.title)}.webp" style="text-decoration:none">${icon('full')} تحميل الإنفوجرافيك</a>`:''}<button class="btn sm${D.img?'':' gold'}" data-a="png">${icon('full')} حفظ الملخص كصورة</button><button class="btn sm" data-a="print">${icon('print')} طباعة</button><a class="btn sm ghost" href="#lesson-${L.id}" style="text-decoration:none">${icon('book')} شرح الدرس كاملًا</a></div>
   ${D.img?`<figure class="ig-pic" data-zoom tabindex="0" role="button" aria-label="تكبير الإنفوجرافيك"><img src="${D.img}" alt="إنفوجرافيك درس ${esc(L.title)}"></figure>`:''}
   ${poster(L)}
   <div class="lesson-foot" style="max-width:900px;margin:20px auto 0">${prev?`<a class="btn ghost sm" href="#info-${prev.id}">${icon('next')} ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a class="btn ghost sm" href="#info-${next.id}">${esc(next.title)} ${icon('prev')}</a>`:'<span></span>'}</div>`;
  v.onkeydown=e=>{if(e.key==='Enter'&&e.target.matches('[data-zoom]'))e.target.click();};
  v.onclick=e=>{if(e.target.closest('[data-zoom]'))return App.lightbox([{src:D.img,cap:L.title}],0);const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a==='png')savePng(L,b);
    else{let p=$('#print');if(!p){p=document.createElement('div');p.id='print';document.body.appendChild(p);}p.innerHTML=(D.img?`<img class="ig-pimg" src="${D.img}" alt="">`:'')+poster(L);window.print();}};
}
App.route(/^info$/,hub);
App.route(/^info-(u\dl\d)$/,view);
})();
