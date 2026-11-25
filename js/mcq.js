/* Section 2 — «بنك أسئلة الاختيار من متعدد»: questions and answer keys come only from the three uploaded MCQ files. */
(function(){
'use strict';
const {esc,ar,icon,state}=App;
const M=window.MCQ, LET=['أ','ب','ج','د'];
const all=[];M.forEach(u=>u.groups.forEach(g=>g.q.forEach(q=>all.push(Object.assign({u:u.n,g:g.title,file:u.file},q)))));
const byId={};all.forEach(q=>byId[q.id]=q);
/* the current quiz lives in state.mcq.cur, so it is auto-saved after every answer and restored after a refresh/restart */
const wrongIds=()=>Object.keys(state.mcq.ans).filter(id=>!state.mcq.ans[id].ok&&byId[id]);

function start(label,ids,o){o=o||{};let list=ids.map(id=>byId[id]).filter(Boolean);if(o.shuffle)list=App.shuffle(list);if(o.limit)list=list.slice(0,o.limit);
  if(!list.length){App.toast('لا توجد أسئلة في هذه المجموعة.');return;}
  state.mcq.cur={label,ids:list.map(q=>q.id),i:0,picks:{},src:{label,ids,o},started:Date.now(),act:0,xp:0,gx:{}};App.save();App.go('quiz');}

function hub(v){
  const pr=App.progress.mcq(),wr=wrongIds().length,sh=state.prefs.shuffle!==false;
  const gstat=g=>{const a=g.q.filter(q=>state.mcq.ans[q.id]);const c=a.filter(q=>state.mcq.ans[q.id].ok).length;return{a:a.length,c};};
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>بنك أسئلة الاختيار من متعدد</span></nav>
  <div class="hub-head" style="--c:var(--orange)"><div class="badge">${icon('quiz')}</div><div><h1>بنك أسئلة الاختيار من متعدد <small style="font-size:.5em;opacity:.7">MCQ</small></h1><p>${ar(all.length)} سؤالًا من ملفات بنك الأسئلة الثلاثة (الوحدات الأولى والثانية والثالثة) بمفاتيح إجابتها الأصلية.</p></div>
   <div class="stat"><div class="box"><b>${ar(pr.answered)} / ${ar(pr.total)}</b><small>أسئلة أُجيبت</small></div><div class="box"><b>${ar(pr.correct)}</b><small>إجابات صحيحة</small></div><div class="box"><b>${ar(pr.wrong)}</b><small>إجابات خاطئة</small></div><div class="box"><b>${pr.answered?ar(pr.acc)+'٪':'—'}</b><small>الدقة</small></div></div></div>
  ${(c=>c&&c.i<c.ids.length?`<div class="resume-quiz"><span class="ic">${icon('play')}</span><div><b>لديك اختبار لم يكتمل</b><small>${esc(c.label)} — وصلت إلى السؤال ${ar(c.i+1)} من ${ar(c.ids.length)} (${ar(Object.keys(c.picks).length)} إجابات محفوظة)</small></div><button class="btn sm gold" data-cont>${icon('play')} متابعة الاختبار</button><button class="btn sm ghost" data-drop>بدء جديد</button></div>`:'')(state.mcq.cur)}
  <div class="setup"><h3>تدريب سريع</h3>
   <span class="seg" role="group" aria-label="ترتيب الأسئلة"><button data-sh="1" class="${sh?'on':''}">${icon('shuffle')} ترتيب عشوائي</button><button data-sh="0" class="${sh?'':'on'}">ترتيب الملف</button></span>
   <button class="btn sm orange" data-rand="10">${ar(10)} أسئلة عشوائية</button><button class="btn sm orange" data-rand="20">${ar(20)} سؤالًا عشوائيًّا</button>
   <button class="btn sm" data-all>${icon('play')} البنك كاملًا (${ar(all.length)})</button>
   <button class="btn sm gold" data-wrong ${wr?'':'disabled'}>${icon('redo')} مراجعة أخطائي (${ar(wr)})</button></div>
  ${M.map(u=>`<section class="unit"><h2><span class="n">الوحدة ${ar(u.n)}</span>${esc(u.title)} <button class="btn sm ghost" data-unit="${u.n}">${icon('play')} تدريب على الوحدة كاملة</button></h2>
   <div class="grid" style="--c:var(--orange)">${u.groups.map(g=>{const s=gstat(g);return `<button class="tile" data-g="${g.id}"><span class="ic">${icon(g.lesson?'quiz':'star')}</span><h3>${esc(g.title)}</h3><small>${ar(g.q.length)} سؤالًا • ${esc(u.file)} ص ${ar(g.page)}</small><span class="row"><span class="bar" style="--c:var(--orange)"><i style="width:${App.pct(s.a,g.q.length)}%"></i></span><span class="pill ${s.a?'o':''}">${s.a?ar(s.c)+' صحيحة من '+ar(s.a):'لم يبدأ'}</span></span></button>`;}).join('')}</div></section>`).join('')}
  ${state.mcq.sessions.length?`<section class="unit"><h2>آخر محاولاتي</h2><div class="grid">${state.mcq.sessions.slice(-6).reverse().map(s=>`<div class="tile" style="min-height:0;--c:var(--orange)"><h3>${esc(s.label)}</h3><small>${esc(s.date)}</small><span class="row"><span class="pill o">${ar(s.score)} / ${ar(s.total)}</span><span class="pill">${ar(App.pct(s.score,s.total))}٪</span></span></div>`).join('')}</div></section>`:''}`;
  v.onclick=e=>{const t=e.target;let b;
    if((b=t.closest('[data-sh]'))){state.prefs.shuffle=b.dataset.sh==='1';App.save();hub(v);}
    else if((b=t.closest('[data-g]'))){const g=M.flatMap(u=>u.groups).find(x=>x.id===b.dataset.g);start(g.title,g.q.map(q=>q.id),{shuffle:state.prefs.shuffle!==false,key:'g:'+g.id});}
    else if((b=t.closest('[data-unit]'))){const u=M.find(x=>x.n==b.dataset.unit);start('الوحدة '+ar(u.n)+' كاملة',u.groups.flatMap(g=>g.q.map(q=>q.id)),{shuffle:state.prefs.shuffle!==false,key:'u:'+u.n});}
    else if((b=t.closest('[data-rand]'))){start('تدريب عشوائي ('+ar(b.dataset.rand)+')',all.map(q=>q.id),{shuffle:true,limit:+b.dataset.rand});}
    else if(t.closest('[data-all]')){start('بنك الأسئلة كاملًا',all.map(q=>q.id),{shuffle:state.prefs.shuffle!==false,key:'all'});}
    else if(t.closest('[data-wrong]')){start('مراجعة أخطائي',wrongIds(),{shuffle:true});}
    else if(t.closest('[data-cont]')){App.go('quiz');}
    else if(t.closest('[data-drop]')){App.confirm('تجاهل الاختبار غير المكتمل؟','إجاباتك السابقة تبقى محفوظة في تقدّمك ونقاطك، لكن هذه الجلسة ستُغلق.','تجاهل',()=>{state.mcq.cur=null;App.save();hub(v);});}
  };
}

function quiz(v){
  const S=state.mcq.cur;if(!S)return App.go('mcq');
  S.gx=S.gx||{};S.xp=S.xp||0;S.act=S.act||0;S.ord=S.ord||{};
  const ordOf=q=>S.ord[q.id]||(S.ord[q.id]=App.order(q.o.length)),lt=(q,k)=>LET[ordOf(q).indexOf(k)];
  function drawQ(){
    const q=byId[S.ids[S.i]],pick=S.picks[q.id];const done=pick!=null;const ord=ordOf(q);if(!done)S.qAt=Date.now();
    App.markResume('quiz',S.label+' — السؤال '+ar(S.i+1)+' من '+ar(S.ids.length),'mcq');
    v.innerHTML=`<div class="quiz"><nav class="crumbs"><a href="#mcq" data-leave>بنك الأسئلة</a> ‹ <span>${esc(S.label)}</span></nav>
    <div class="qtop"><b>السؤال ${ar(S.i+1)} من ${ar(S.ids.length)}</b><span class="bar"><i style="width:${App.pct(S.i+(done?1:0),S.ids.length)}%"></i></span><b>${ar(Object.keys(S.picks).filter(id=>S.picks[id]===byId[id].a).length)} ✓</b></div>
    <div class="qcard" id="qc"><div class="meta"><span class="pill o">الوحدة ${ar(q.u)}</span><span class="pill">${esc(q.g)}</span><button class="icon-btn" data-read style="margin-inline-start:auto;background:var(--navy);color:#fff;width:40px;height:40px" aria-label="اقرأ السؤال">${icon('speaker')}</button></div>
     <h2 id="qt">${esc(q.t)}</h2>
     <div class="opts${done?' done':''}">${ord.map((k,pos)=>`<button class="opt${done&&k===q.a?' right':''}${done&&k===pick&&k!==q.a?' wrong':''}" data-k="${k}"><span class="k">${LET[pos]}</span><span>${esc(q.o[k])}</span></button>`).join('')}</div>
     ${done?`<div class="fb ${pick===q.a?'ok':'no'}" role="status"><span>${pick===q.a?'<b class="msg">'+esc(App.game.msg(true,q.id+S.i))+'</b> إجابة صحيحة.':'<b class="msg">'+esc(App.game.msg(false,q.id+S.i))+'</b> الإجابة الصحيحة: ('+lt(q,q.a)+') '+esc(q.o[q.a])}${S.gx[q.id]?` <span class="xpchip">+${ar(S.gx[q.id])} XP</span>`:''}</span><button class="btn sm orange" data-next>${S.i<S.ids.length-1?'السؤال التالي':'عرض النتيجة'} ${icon('prev')}</button></div>
      <p style="margin:10px 0 0;font-size:.78rem;color:var(--muted)">المصدر: ${esc(q.file)} – صفحة ${ar(q.p)} – سؤال ${ar(q.n)} (الإجابة من نموذج الإجابة بالملف نفسه)</p>`:''}
    </div></div>`;
    if(done){const n=v.querySelector('[data-next]');n&&n.focus();}
  }
  function finish(){
    const total=S.ids.length,score=S.ids.filter(id=>S.picks[id]===byId[id].a).length,p=App.pct(score,total);
    if(!S.saved){S.saved=true;S.xp+=App.game.mcqQuizDone(S,score,total);const d=new Date();state.mcq.sessions.push({label:S.label,score,total,date:d.toLocaleDateString('ar-EG')+' '+d.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'})});if(state.mcq.sessions.length>30)state.mcq.sessions.shift();App.save();}
    const wrong=S.ids.filter(id=>S.picks[id]!==byId[id].a);
    v.innerHTML=`<div class="result"><img src="assets/logo-192.png" alt="International Education Egypt"><div class="ring" style="--p:${p}"><b>${ar(p)}٪</b></div>
     <h2>${p>=85?'ممتاز! أداء رائع':p>=65?'جيد جدًّا، واصل التدريب':p>=50?'جيد، راجع أخطاءك':'تحتاج إلى مراجعة الدرس ثم المحاولة مرة أخرى'}</h2>
     <p style="margin:4px 0;color:var(--muted)">${esc(S.label)} — أجبت إجابة صحيحة عن ${ar(score)} من ${ar(total)} سؤالًا.</p>
     <p class="xpgain">${S.xp?`${icon('bolt')} كسبت <b>+${ar(S.xp)} XP</b> في هذا الاختبار`:`${icon('info')} لا نقاط جديدة هنا: النقاط تُمنح مرة واحدة لكل سؤال واختبار (اختبارات «عشوائي» و«مراجعة الأخطاء» لا تمنح نقاط إكمال).`}</p>
     <div class="acts"><button class="btn orange" data-again>${icon('redo')} إعادة الاختبار</button>${wrong.length?`<button class="btn gold" data-rw>${icon('quiz')} تدرّب على أخطائي (${ar(wrong.length)})</button>`:''}<a class="btn" href="#mcq" style="box-shadow:0 7px 0 var(--line)">العودة لبنك الأسئلة</a></div>
     ${wrong.length?`<h3 style="margin-top:22px;color:var(--navy);text-align:start">مراجعة الإجابات الخاطئة</h3><div class="review">${wrong.map(id=>{const q=byId[id];return `<div class="it"><p><b>${esc(q.t)}</b></p><p class="w">إجابتك: (${lt(q,S.picks[id])}) ${esc(q.o[S.picks[id]])}</p><p class="a">الصحيحة: (${lt(q,q.a)}) ${esc(q.o[q.a])}</p></div>`;}).join('')}</div>`:''}</div>`;
  }
  v.onclick=e=>{const t=e.target;let b;
    if((b=t.closest('.opt'))){const q=byId[S.ids[S.i]];if(S.picks[q.id]!=null)return;const k=+b.dataset.k,ok=k===q.a,first=!state.mcq.ans[q.id],rr=b.getBoundingClientRect();
      S.picks[q.id]=k;state.mcq.ans[q.id]={ok,pick:k};S.act+=Math.min(120000,Math.max(0,Date.now()-(S.qAt||Date.now())));
      const x=App.game.mcqAnswer(q,ok,first,rr);if(x){S.gx[q.id]=x;S.xp+=x;}App.save();App.tts.stop();drawQ();}
    else if(t.closest('[data-next]')){if(S.i<S.ids.length-1){S.i++;App.save();drawQ();window.scrollTo(0,0);}else{S.i=S.ids.length;App.save();finish();window.scrollTo(0,0);}}
    else if(t.closest('[data-read]')){const q=byId[S.ids[S.i]];App.tts.speak([{el:v.querySelector('#qc'),text:q.t+'. '+ordOf(q).map((k,pos)=>LET[pos]+'. '+q.o[k]).join('. ')}],'قراءة السؤال');}
    else if(t.closest('[data-again]')){start(S.src.label,S.src.ids,S.src.o);}
    else if(t.closest('[data-rw]')){start('مراجعة أخطاء: '+S.label,S.ids.filter(id=>S.picks[id]!==byId[id].a),{shuffle:true});}
    else if((b=t.closest('[data-leave]'))){const answered=Object.keys(S.picks).length;if(answered&&S.i<S.ids.length){e.preventDefault();App.confirm('إنهاء التدريب؟','إجاباتك ونقاطك حتى الآن محفوظة، لكن هذه الجلسة ستُغلق. (يمكنك الخروج بدون إنهاء من القائمة وسنحفظ مكانك.)','إنهاء',()=>{state.mcq.cur=null;App.save();App.go('mcq');});}}
  };
  if(S.i>=S.ids.length)finish();else drawQ();
}
App.route(/^mcq$/,hub);
App.route(/^quiz$/,quiz);
})();
