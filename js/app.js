/* App shell: header, footer, home (exactly three learning sections), content-validation report, boot. */
(function(){
'use strict';
const {esc,ar,icon,state,$}=App;
const NAV=[['home','الرئيسية','home'],['book','كتاب المدرسة','book'],['mcq','بنك الأسئلة','quiz'],['assess','كتاب التقييمات','clip'],['profile','إنجازاتي','trophy']];
const sectionOf=h=>/^(lesson|book)/.test(h)?'book':/^(mcq|quiz)/.test(h)?'mcq':/^(assess|sheet)/.test(h)?'assess':h==='home'?'home':h==='profile'?'profile':'';
App.nav=h=>{const s=sectionOf(h);
  $('#top').innerHTML=`<div class="wrap"><a class="brand" href="#home" aria-label="الصفحة الرئيسية"><img src="assets/logo-192.png" alt="شعار International Education Egypt" width="52" height="52"><span><b>الدراسات الاجتماعية</b><small>International Education Egypt • الصف السادس الابتدائي</small></span></a>
   ${App.game.hudHTML()}
   <nav class="nav" aria-label="التنقل الرئيسي">${NAV.map(n=>`<a href="#${n[0]}" class="${s===n[0]?'on':''}" ${s===n[0]?'aria-current="page"':''} aria-label="${n[1]}">${icon(n[2])}<span>${n[1]}</span></a>`).join('')}<a href="/auth/logout" style="text-decoration:none" aria-label="تسجيل الخروج"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg><span>خروج</span></a></nav></div>`;App.game.paintSave();};
function foot(){$('#foot').innerHTML=`<div class="wrap"><img src="assets/logo-192.png" alt="International Education Egypt" width="40" height="40"><span>International Education Egypt — الدراسات الاجتماعية، الصف السادس الابتدائي، الفصل الدراسي الأول.<br>المحتوى من كتاب الطالب وملفات بنك الأسئلة وكتاب التقييمات المرفوعة فقط.</span><a href="#report">تقرير صلاحية المحتوى والمصادر</a></div>`;}

/* three large illustrated doors (original SVG art) */
const ART={
 book:`<svg viewBox="0 0 160 160" fill="none"><ellipse cx="80" cy="140" rx="54" ry="8" fill="#000" opacity=".18"/><path d="M22 44c20-10 40-10 58 2v84c-18-12-38-12-58-2z" fill="#fff"/><path d="M138 44c-20-10-40-10-58 2v84c18-12 38-12 58-2z" fill="#fdf3d4"/><path d="M80 46v84" stroke="#0b1b3f" stroke-width="4"/><circle cx="108" cy="78" r="20" fill="#35c9f0" stroke="#0b1b3f" stroke-width="3"/><path d="M90 78h36M108 58c8 8 8 32 0 40M108 58c-8 8-8 32 0 40" stroke="#0b1b3f" stroke-width="2.5"/><path d="M34 66h32M34 80h32M34 94h22" stroke="#11b5a4" stroke-width="5" stroke-linecap="round"/><path d="M118 20l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#ffc83d" stroke="#0b1b3f" stroke-width="3" stroke-linejoin="round"/></svg>`,
 mcq:`<svg viewBox="0 0 160 160" fill="none"><ellipse cx="80" cy="142" rx="54" ry="8" fill="#000" opacity=".18"/><rect x="26" y="30" width="108" height="34" rx="12" fill="#fff" stroke="#0b1b3f" stroke-width="3"/><rect x="26" y="72" width="108" height="34" rx="12" fill="#ffc83d" stroke="#0b1b3f" stroke-width="3"/><rect x="26" y="114" width="108" height="26" rx="12" fill="#fff" stroke="#0b1b3f" stroke-width="3"/><circle cx="114" cy="47" r="9" fill="#0b1b3f"/><circle cx="114" cy="89" r="9" fill="#17a568"/><path d="M109.500 89l3.500 3.500 6-7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="114" cy="127" r="7" fill="#0b1b3f"/><path d="M40 47h52M40 89h52M40 127h44" stroke="#0b1b3f" stroke-width="5" stroke-linecap="round" opacity=".35"/><circle cx="34" cy="24" r="14" fill="#35c9f0" stroke="#0b1b3f" stroke-width="3"/><path d="M30 21a4 4 0 118 0c0 3-4 3-4 6" stroke="#0b1b3f" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="31.500" r="1.500" fill="#0b1b3f"/></svg>`,
 assess:`<svg viewBox="0 0 160 160" fill="none"><ellipse cx="80" cy="144" rx="50" ry="8" fill="#000" opacity=".18"/><rect x="34" y="24" width="92" height="116" rx="12" fill="#fff" stroke="#0b1b3f" stroke-width="3"/><rect x="58" y="14" width="44" height="20" rx="8" fill="#ffc83d" stroke="#0b1b3f" stroke-width="3"/><path d="M48 58l6 6 10-11M48 86l6 6 10-11" stroke="#17a568" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M74 60h38M74 88h38M48 116h64" stroke="#0b1b3f" stroke-width="5" stroke-linecap="round" opacity=".35"/><g transform="rotate(38 118 104)"><rect x="110" y="62" width="16" height="64" rx="3" fill="#ff8a1f" stroke="#0b1b3f" stroke-width="3"/><path d="M110 126l8 14 8-14z" fill="#fdf3d4" stroke="#0b1b3f" stroke-width="3" stroke-linejoin="round"/><rect x="110" y="62" width="16" height="12" rx="3" fill="#e84a7a" stroke="#0b1b3f" stroke-width="3"/></g></svg>`};
const fixArt=s=>s.replace(/(\d)\.500\b/g,'$1.5');

function home(v){
  const b=App.progress.book(),m=App.progress.mcq(),a=App.progress.assess();
  const door=(href,cls,num,art,title,desc,pct,meter)=>`<a class="door ${cls}" href="#${href}"><div class="art"><span class="num">${num}</span>${fixArt(art)}</div><div class="txt"><h2>${title}</h2><p>${desc}</p></div><div class="meter"><span class="bar"><i style="width:${pct}%"></i></span><span>${meter}</span></div></a>`;
  v.innerHTML=`${App.welcomeHTML()}<section class="hero"><div><div class="tags"><span class="pill y">الصف السادس الابتدائي</span><span class="pill">الفصل الدراسي الأول</span></div>
    <h1>الدراسات الاجتماعية<br><em>العالم العربي… وطن يجمعنا</em></h1><p>أهلًا بك يا بطل! اختر محطتك وابدأ رحلتك: ذاكر الدرس، ثم اختبر نفسك، ثم حُلَّ تقييماتك.</p></div>
    <div class="hero-art" aria-hidden="true"><div class="orbit"><i></i></div><div class="orbit b"><i></i></div><img src="assets/logo-512.png" alt=""></div></section>
   <section class="doors" aria-label="أقسام التطبيق">
    ${door('book','','١',ART.book,'ذاكر من كتاب المدرسة','إنفوجرافيك تفاعلي يشرح كل درس من كتاب الطالب بالخرائط والخطوط الزمنية.',b.pct,`${ar(b.done)} / ${ar(b.total)} درسًا`)}
    ${door('mcq','o','٢',ART.mcq,'بنك أسئلة الاختيار من متعدد','تدرّب على أسئلة بنك الأسئلة بالدرس أو بالوحدة مع تصحيح فوري.',m.pct,`${ar(m.answered)} / ${ar(m.total)} سؤالًا`)}
    ${door('assess','p','٣',ART.assess,'كتاب التقييمات','الأداءات والتقييمات الأسبوعية والشهرية بنفس أسئلة الكتاب وأنواعها.',a.pct,`${ar(a.done)} / ${ar(a.total)} تقييمًا`)}
   </section>
   ${App.storageOK()?'':'<p class="pill r" style="margin-top:16px;white-space:normal">تعذّر الوصول إلى التخزين المحلي في هذا المتصفح؛ سيُحفظ تقدّمك خلال هذه الجلسة فقط.</p>'}`;
}

function report(v){
  const M=window.META,c=M.counts,T={w:'مقالي/إجابة قصيرة',c:'أكمل',m:'اختيار من متعدد',tf:'صواب وخطأ مع التصويب',t:'جداول (قارن/صنّف)',o:'ترتيب',map:'خريطة صمّاء'};
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>تقرير صلاحية المحتوى</span></nav>
  <div class="report"><h1>تقرير صلاحية المحتوى والمصادر</h1><p style="margin:0;color:var(--muted)">آخر بناء للمحتوى: ${esc(M.built)} — كل المحتوى التعليمي مُجهَّز مسبقًا ومحفوظ داخل التطبيق؛ لا يُستخدم أي ذكاء اصطناعي أثناء التشغيل.</p>
  <h2>ملخص</h2><div class="tw"><table><tr><th>البند</th><th>العدد</th></tr><tr><td>دروس كتاب الطالب (إنفوجرافيك)</td><td>${ar(c.lessons)}</td></tr><tr><td>أسئلة MCQ (من ملفات البنك الثلاثة فقط)</td><td>${ar(c.mcq)}</td></tr><tr><td>أقسام كتاب التقييمات</td><td>${ar(c.assessSections)}</td></tr><tr><td>بنود كتاب التقييمات القابلة للإجابة</td><td>${ar(c.assessItems)} (${Object.keys(c.assessByType).map(k=>T[k]+': '+ar(c.assessByType[k])).join(' • ')})</td></tr><tr><td>بنود لها إجابة نموذجية وتصحيح آلي (مُعدّة من كتاب الطالب)</td><td>${ar(c.assessModel)}</td></tr></table></div>
  <h2>الملفات المصدر</h2><div class="tw"><table><tr><th>الملف</th><th>النوع</th><th>الصفحات</th><th>حالة المعالجة</th><th>المستخرَج</th><th>الأسئلة</th><th>ملاحظات وبنود تحتاج مراجعة يدوية</th></tr>
   ${M.sources.map(s=>`<tr><td dir="ltr" style="text-align:right">${esc(s.file)}</td><td>${esc(s.type)}</td><td>${ar(s.pages)}</td><td>${esc(s.status)}</td><td>${esc(s.extracted)}</td><td>${typeof s.questions==='number'?ar(s.questions):esc(s.questions)}</td><td><ul>${s.notes.map(n=>'<li>'+esc(n)+'</li>').join('')}</ul></td></tr>`).join('')}</table></div>
  <h2>إمكانية التتبع</h2><ul><li>كل لوحة إنفوجرافيك تعرض أرقام صفحات كتاب الطالب المأخوذة منها، مع زر لعرض الصفحات الأصلية.</li><li>كل سؤال MCQ يعرض بعد الإجابة اسم الملف ورقم الصفحة ورقم السؤال.</li><li>كل قسم في كتاب التقييمات يعرض رقم صفحته في الكتاب الأصلي.</li></ul>
  ${M.issues.length?`<h2>تنبيهات آلية</h2><ul>${M.issues.map(i=>'<li>'+esc(i)+'</li>').join('')}</ul>`:'<h2>الفحص الآلي</h2><p style="margin:0">لم يرصد الفحص الآلي أسئلة MCQ ناقصة الاختيارات أو بلا مفتاح إجابة.</p>'}
  <h2>التشغيل دون اتصال</h2><ul><li>يعمل دون إنترنت بعد أول تحميل: الدروس، بنك الأسئلة، التقييمات، حفظ التقدّم (محليًّا على هذا الجهاز).</li><li>يحتاج إنترنت: تحميل خطوط العرض لأول مرة (يوجد خط بديل)، وبعض الأصوات العربية للقراءة المسموعة حسب الجهاز.</li></ul>
  <h2>بياناتي</h2><p style="margin:0 0 10px">التقدّم محفوظ على هذا الجهاز والمتصفح فقط.</p><button class="btn sm orange" id="wipe">${icon('trash')} مسح كل تقدّمي</button></div>`;
  $('#wipe',v).onclick=()=>App.confirm('مسح كل التقدّم؟','سيُحذف تقدّمك في الدروس وبنك الأسئلة والتقييمات، وكل النقاط والأوسمة، من هذا الجهاز.','مسح',()=>{App.resetAll();App.toast('تم مسح التقدّم.');App.go('home');});
}
App.route(/^home$/,home);
App.route(/^report$/,report);
/* boot: wait for the saved progress (newest of localStorage / IndexedDB), then restore the student's place */
App.ready.then(()=>{
  if(!state.resume&&state.last)state.resume={h:'lesson-'+state.last.id,label:state.last.title,section:'book',at:state.savedAt||Date.now(),y:0};
  App.gameBoot();foot();App.render();
  requestAnimationFrame(()=>{const b=$('#boot');b.classList.add('out');setTimeout(()=>b.remove(),450);});});
/* offline cache when served from a regular web server (ignored inside sandboxed viewers) */
try{if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol)&&window.top===window)navigator.serviceWorker.register('sw.js').catch(()=>{});}catch(e){}
})();
