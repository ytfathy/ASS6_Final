/* Gamification engine: XP ledger, levels, badges, daily streak & goal, reward animations, header HUD,
   the «إنجازاتي» dashboard and the welcome-back card.
   Fairness: every reward has a unique key in state.game.keys; a key is granted once only, so refreshing, re-opening
   pages, retaking a quiz or toggling a lesson never pays twice. Wrong answers never remove XP.
   Everything is stored in the same auto-saved state (localStorage + IndexedDB), on this device. */
(function(){
'use strict';
const C=window.GAME_CONFIG,{esc,ar,icon,state,$}=App;
const BY={};C.badges.forEach(b=>BY[b.id]=b);
const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const today=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const dayBefore=s=>{const[y,m,d]=s.split('-').map(Number);return today(new Date(y,m-1,d-1));};
function G(){const g=state.game;
  const def={xp:0,tx:[],keys:{},badges:{},days:{},daily:{},quizzes:{},run:0,bestRun:0,bestStreak:0,sec:{},lvl:0,speed:0};
  for(const k in def)if(g[k]===undefined)g[k]=def[k];return g;}

/* ---------- levels ---------- */
function levelOf(xp){let i=0;C.levels.forEach((l,k)=>{if(xp>=l.min)i=k;});const L=C.levels[i],N=C.levels[i+1];
  return{n:i+1,name:L.name,en:L.en,min:L.min,next:N?N.min:null,nextName:N?N.name:null,pct:N?Math.min(100,Math.round((xp-L.min)/(N.min-L.min)*100)):100};}

/* ---------- streak ---------- */
function streak(){const g=G(),d=g.days;let cur=today();if(!d[cur])cur=dayBefore(cur);let n=0,start=cur;while(d[cur]){n++;start=cur;cur=dayBefore(cur);}return{n,start,active:!!d[today()]};}

/* ---------- metrics used by badges ---------- */
const countKeys=p=>Object.keys(G().keys).filter(k=>k.startsWith(p)).length;
function metrics(){const g=G(),q=Object.values(g.quizzes);
  return{lessons:countKeys('les:'),units:countKeys('unit:'),quizzes:q.length,
    perfects:q.filter(x=>x.b===100&&x.n>=3).length,q90:q.filter(x=>x.b>=90&&x.n>=C.minQuizForStats).length,
    bestRun:g.bestRun,correct:countKeys('mcq:')+countKeys('ai:'),days:Object.keys(g.days).length,bestStreak:Math.max(g.bestStreak,streak().n),
    speed:g.speed,sections:Object.keys(g.sec).length,xp:g.xp};}

/* ---------- the ledger ---------- */
let pend=0,pendFrom=null,silent=false,flushT=null;const queue=[];
const awardRaw=(...a)=>award(...a);
function award(key,xp,o){o=o||{};const g=G();if(!key||g.keys[key])return 0;
  g.keys[key]=1;g.tx.push([key,xp,Date.now()]);g.xp+=xp;
  if(!o.meta){g.days[today()]=1;}
  if(!silent&&!o.quiet){pend+=xp;if(o.from)pendFrom=o.from;clearTimeout(flushT);flushT=setTimeout(flush,30);}
  App.save();return xp;}
function settle(quietly){ // streak milestones, daily goal, badges, levels — repeated until nothing new unlocks
  const g=G();let changed=true,guard=0;
  while(changed&&guard++<8){changed=false;
    const st=streak();if(st.n>g.bestStreak)g.bestStreak=st.n;
    Object.keys(C.streak).forEach(n=>{if(st.n>=+n){const x=award('stk:'+n+':'+st.start,C.streak[n],{meta:1,quiet:1});if(x){changed=true;if(!quietly)queue.push({t:'streak',n:+n,xp:x});}}});
    if((g.daily[today()]||0)>=C.dailyGoal){const x=award('goal:'+today(),C.xp.dailyGoal,{meta:1,quiet:1});if(x){changed=true;if(!quietly)queue.push({t:'goal',xp:x});}}
    const m=metrics();
    C.badges.forEach(b=>{if(!g.badges[b.id]&&m[b.metric]>=b.need){g.badges[b.id]=Date.now();award('bdg:'+b.id,b.bonus,{meta:1,quiet:1});changed=true;if(!quietly)queue.push({t:'badge',b});}});
  }
  const L=levelOf(g.xp).n;if(!g.lvl)g.lvl=L;if(L>g.lvl){if(!quietly)queue.push({t:'level',L:levelOf(g.xp)});g.lvl=L;}
  App.save();}
function flush(){clearTimeout(flushT);const x=pend,from=pendFrom;pend=0;pendFrom=null;
  const before=G().xp-x;settle(false);const total=G().xp;
  if(x>0){fly(x,from);setTimeout(()=>App.sfx.play('xp'),380);}
  setTimeout(()=>countHud(before,total),x>0&&!reduce()?650:0);
  if(queue.length)setTimeout(nextCele,x>0?1100:300);}

/* ---------- animations: flying XP, confetti, celebration cards ---------- */
function rectOf(f){if(!f)return null;if(f.getBoundingClientRect)return f.getBoundingClientRect();return f;}
function fly(x,from){const target=document.getElementById('hud-xp');const r=rectOf(from)||{left:innerWidth/2-40,top:innerHeight/2,width:80,height:20};
  const el=document.createElement('div');el.className='xpfly';el.textContent='+'+ar(x)+' XP';document.body.appendChild(el);
  const sx=r.left+r.width/2,sy=r.top+r.height/2;el.style.left=sx+'px';el.style.top=sy+'px';
  if(reduce()||!target||!el.animate){el.classList.add('still');setTimeout(()=>el.remove(),1100);return;}
  const t=target.getBoundingClientRect(),dx=t.left+t.width/2-sx,dy=t.top+t.height/2-sy;
  el.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:'translate(-50%,-120%) scale(1.15)',opacity:1,offset:.25},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.5)`,opacity:.2}],{duration:900,easing:'cubic-bezier(.5,-0.2,.6,1)'}).onfinish=()=>{el.remove();const h=document.querySelector('.hud');if(h){h.classList.remove('bump');void h.offsetWidth;h.classList.add('bump');}};}
let cv=null,parts=[],raf=0;
function confetti(n,at,palette){if(reduce())return;const W=innerWidth,H=innerHeight;
  if(!cv){cv=document.createElement('canvas');cv.className='confetti';document.body.appendChild(cv);}
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const cols=palette||['#ffc83d','#11b5a4','#35c9f0','#ff8a1f','#7a4de0','#ffffff','#17a568'];
  const ox=at?at.x:W/2,oy=at?at.y:H*.35;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(at?3:5)+Math.random()*(at?4:9);parts.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(at?2:6),r:3+Math.random()*5,c:cols[i%cols.length],rot:Math.random()*6,vr:(Math.random()-.5)*.4,life:at?45:120,sq:Math.random()<.5});}
  if(!raf)raf=requestAnimationFrame(tick);}
function tick(){const x=cv.getContext('2d'),d=devicePixelRatio;x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,cv.width,cv.height);
  parts=parts.filter(p=>p.life-->0);parts.forEach(p=>{p.vy+=.18;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;x.save();x.globalAlpha=Math.min(1,p.life/30);x.translate(p.x,p.y);x.rotate(p.rot);x.fillStyle=p.c;
    if(p.sq)x.fillRect(-p.r,-p.r/2,p.r*2,p.r);else{x.beginPath();x.arc(0,0,p.r/1.4,0,7);x.fill();}x.restore();});
  if(parts.length)raf=requestAnimationFrame(tick);else{raf=0;x.clearRect(0,0,cv.width,cv.height);}}
function burst(from,kind){const r=rectOf(from);if(!r)return;confetti(kind==='big'?60:26,{x:r.left+r.width/2,y:r.top+r.height/2},kind==='ok'?['#17a568','#7ef0a0','#ffc83d','#ffffff']:null);}

let showing=false;
function nextCele(){if(showing||!queue.length)return;const c=queue.shift();showing=true;
  let art,title,sub,desc,snd,xp=0;
  if(c.t==='badge'){art=badgeSVG(c.b);title='وسام جديد!';sub=c.b.name;desc=c.b.desc;xp=c.b.bonus;snd='badge';}
  else if(c.t==='level'){art=levelSVG(c.L.n,true);title='مستوى جديد!';sub='المستوى '+ar(c.L.n)+': '+c.L.name;desc=c.L.next?('اجمع '+ar(c.L.next-G().xp)+' XP للوصول إلى «'+c.L.nextName+'».'):'وصلت إلى أعلى مستوى. أنت بطل التعليم!';snd='level';}
  else if(c.t==='streak'){art=streakSVG(c.n);title='سلسلة '+ar(c.n)+' أيام!';sub='مواظبة رائعة';desc='تعلّمت '+ar(c.n)+' أيام متتالية. استمر!';xp=c.xp;snd='streak';}
  else{art=goalSVG();title='حققت هدف اليوم!';sub=ar(C.dailyGoal)+' إجابات صحيحة اليوم';desc='أحسنت! عُد غدًا لتحافظ على سلسلتك.';xp=c.xp;snd='streak';}
  const el=document.createElement('div');el.className='cele';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);
  el.innerHTML=`<div class="cele-card ${c.t}"><div class="rays" aria-hidden="true"></div><div class="art">${art}</div><p class="kick">${esc(title)}</p><h3>${esc(sub)}</h3><p>${esc(desc)}</p>${xp?`<span class="bonus">+${ar(xp)} XP</span>`:''}<button class="btn gold" data-ok>رائع! ${icon('check')}</button></div>`;
  document.body.appendChild(el);App.sfx.play(snd);confetti(c.t==='level'?160:110);
  const close=()=>{el.classList.add('out');setTimeout(()=>{el.remove();showing=false;nextCele();},250);document.removeEventListener('keydown',key);};
  const key=e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();close();}};
  el.querySelector('[data-ok]').onclick=close;el.onclick=e=>{if(e.target===el)close();};document.addEventListener('keydown',key);el.querySelector('[data-ok]').focus();}

/* ---------- original badge illustrations (SVG) ---------- */
const EM={
 steps:'<ellipse cx="19" cy="27" rx="5" ry="7"/><ellipse cx="30" cy="20" rx="5" ry="7"/><circle cx="16" cy="17" r="1.8"/><circle cx="20" cy="16" r="1.8"/><circle cx="27" cy="10" r="1.8"/><circle cx="31" cy="9.5" r="1.8"/>',
 book:'<path d="M10 14c5-3 10-3 14 0v18c-4-3-9-3-14 0z"/><path d="M38 14c-5-3-10-3-14 0v18c4-3 9-3 14 0z" opacity=".8"/>',
 compass:'<circle cx="24" cy="24" r="12" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M24 14l4 10-4 10-4-10z"/>',
 crown:'<path d="M11 32l-2-15 8 7 7-11 7 11 8-7-2 15z"/><rect x="11" y="33" width="26" height="4" rx="2"/>',
 trophy:'<path d="M16 10h16v8a8 8 0 01-16 0z"/><path d="M16 13h-5a5 5 0 005 7M32 13h5a5 5 0 01-5 7" fill="none" stroke="#fff" stroke-width="3"/><rect x="21" y="25" width="6" height="6"/><rect x="16" y="31" width="16" height="5" rx="2"/>',
 flag:'<rect x="13" y="9" width="3.5" height="30" rx="1.5"/><path d="M16 10h18l-5 6 5 6H16z"/>',
 star:'<path d="M24 8l4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.5L24 32l-9.4 5.1 1.8-10.5-7.7-7.5 10.6-1.5z"/>',
 medal:'<path d="M17 8h5l3 9h-5zM31 8h-5l-3 9h5z" opacity=".75"/><circle cx="24" cy="28" r="10"/><path d="M24 22l1.8 3.7 4 .6-2.9 2.8.7 4L24 31.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill-opacity=".35" fill="#000"/>',
 bolt:'<path d="M27 6L13 27h9l-3 15 15-22h-9z"/>',
 bulb:'<path d="M24 8a11 11 0 00-6 20v4h12v-4a11 11 0 00-6-20z"/><rect x="19" y="34" width="10" height="4" rx="2"/>',
 sun:'<circle cx="24" cy="26" r="8"/><path d="M24 9v5M11 14l3.5 3.5M37 14l-3.5 3.5M7 26h5M36 26h5" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><rect x="8" y="35" width="32" height="3.5" rx="1.7"/>',
 flame:'<path d="M24 6c2 7 11 10 11 21a11 11 0 01-22 0c0-6 4-9 5-14 2 3 2 6 4 7 1-5 1-9 2-14z"/>',
 rocket:'<path d="M24 6c7 5 9 13 7 22h-14c-2-9 0-17 7-22z"/><circle cx="24" cy="18" r="3" fill="#000" fill-opacity=".3"/><path d="M17 26l-5 7 6-1M31 26l5 7-6-1"/><path d="M20 30h8l-4 10z" opacity=".75"/>',
 gem:'<path d="M14 12h20l6 8-16 18L8 20z"/><path d="M8 20h32M19 12l-3 8 8 18 8-18-3-8" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>',
 globe:'<circle cx="24" cy="24" r="13"/><path d="M11 24h26M24 11c-6 7-6 19 0 26M24 11c6 7 6 19 0 26" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/>',
 burst:'<path d="M24 5l4 9 9-4-3 9 9 4-9 4 3 9-9-4-4 9-4-9-9 4 3-9-9-4 9-4-3-9 9 4z"/>',
 crown2:'<path d="M10 30l-2-14 8 6 8-12 8 12 8-6-2 14z"/><rect x="10" y="31" width="28" height="4" rx="2"/><circle cx="24" cy="7" r="2.5"/><circle cx="8" cy="13" r="2"/><circle cx="40" cy="13" r="2"/>'
};
function shape(cat,id){
  if(cat==='quiz')return'<path d="M50 5l39 22.5v45L50 95 11 72.5v-45z" fill="url(#g'+id+')" stroke="#0b1b3f" stroke-width="4"/>';
  if(cat==='days')return'<path d="M50 6l38 13v28c0 24-17 40-38 47C29 87 12 71 12 47V19z" fill="url(#g'+id+')" stroke="#0b1b3f" stroke-width="4"/>';
  if(cat==='special')return'<path d="M50 4l11 12 16-3 2 16 14 9-9 13 5 15-16 4-6 15-15-7-15 7-6-15-16-4 5-15-9-13 14-9 2-16 16 3z" fill="url(#g'+id+')" stroke="#0b1b3f" stroke-width="4" stroke-linejoin="round"/>';
  return'<path d="M30 70l-10 26 14-6 8 12 8-24M70 70l10 26-14-6-8 12-8-24" fill="#e84a7a" stroke="#0b1b3f" stroke-width="3.5" stroke-linejoin="round"/><circle cx="50" cy="44" r="38" fill="url(#g'+id+')" stroke="#0b1b3f" stroke-width="4"/>';}
let uid=0;
function badgeSVG(b,locked){const id='b'+(uid++);const[c1,c2]=b.c;const cy=b.cat==='learn'?44:50;
  return `<svg class="bsvg${locked?' locked':''}" viewBox="0 0 100 104" aria-hidden="true"><defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
   <ellipse cx="50" cy="100" rx="30" ry="4" fill="#000" opacity=".2"/>${shape(b.cat,id)}
   <path d="M${b.cat==='learn'?'24 30':'26 28'}q10-14 30-16" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>
   <g transform="translate(${50-24*1.05} ${cy-24*1.05}) scale(1.05)" fill="#fff" stroke="#0b1b3f" stroke-width="1.6" stroke-linejoin="round">${EM[b.e]||EM.star}</g>
   ${b.n?`<text x="50" y="${cy+16}" text-anchor="middle" font-family="Baloo Bhaijaan 2,Readex Pro,sans-serif" font-weight="800" font-size="17" fill="#0b1b3f">${b.n}</text>`:''}
   ${locked?'<g transform="translate(64 64)"><circle r="15" cx="15" cy="15" fill="#0b1b3f"/><rect x="8" y="14" width="14" height="11" rx="2.5" fill="#cfd8ee"/><path d="M11 14v-3a4 4 0 018 0v3" stroke="#cfd8ee" stroke-width="2.6" fill="none"/></g>':''}</svg>`;}
function levelSVG(n,big){const id='l'+(uid++);return `<svg class="lvsvg" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#ff8a1f"/></linearGradient></defs>
  <path d="M50 4l40 23v46L50 96 10 73V27z" fill="url(#${id})" stroke="#0b1b3f" stroke-width="5"/><path d="M50 16l29 17v34L50 84 21 67V33z" fill="#0b1b3f"/>
  <text x="50" y="${big?62:64}" text-anchor="middle" font-family="Baloo Bhaijaan 2,Readex Pro,sans-serif" font-weight="800" font-size="${n>9?30:36}" fill="#ffc83d">${ar(n)}</text></svg>`;}
const streakSVG=n=>badgeSVG({cat:'days',c:['#ffad61','#f24e1e'],e:'flame',n:ar(n)});
const goalSVG=()=>badgeSVG({cat:'quiz',c:['#7ef0a0','#139a5b'],e:'flag'});

/* ---------- header HUD + save indicator ---------- */
function hudHTML(){const g=G(),L=levelOf(g.xp),s=streak();
  return `<a class="hud" href="#profile" aria-label="إنجازاتي: المستوى ${ar(L.n)} ${esc(L.name)}، ${ar(g.xp)} نقطة، سلسلة ${ar(s.n)} يوم">
   <span class="hud-lv" title="المستوى ${ar(L.n)}: ${esc(L.name)}">${levelSVG(L.n)}</span>
   <span class="hud-xp"><b id="hud-xp">${ar(g.xp)}</b><small>XP</small><i class="hud-bar"><i style="width:${L.pct}%"></i></i></span>
   <span class="hud-stk ${s.active?'on':''}" title="سلسلة الأيام">${icon('flame')}<b>${ar(s.n)}</b></span></a>
   <button class="hud-snd" data-snd aria-label="${App.sfx.on()?'كتم الأصوات':'تشغيل الأصوات'}" aria-pressed="${App.sfx.on()}">${icon(App.sfx.on()?'volume':'mute')}</button>
`;}
function countHud(a,b){const el=document.getElementById('hud-xp');if(!el)return;const L=levelOf(b);const bar=document.querySelector('.hud-bar i');if(bar)bar.style.width=L.pct+'%';
  const lv=document.querySelector('.hud-lv');if(lv&&lv.dataset.n!=L.n){lv.innerHTML=levelSVG(L.n);lv.dataset.n=L.n;}
  const s=streak();const sk=document.querySelector('.hud-stk');if(sk){sk.classList.toggle('on',s.active);sk.querySelector('b').textContent=ar(s.n);}
  if(reduce()||a===b){el.textContent=ar(b);return;}const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/600);el.textContent=ar(Math.round(a+(b-a)*k));if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
function paintSave(info){const el=document.getElementById('savest');if(!el)return;info=info||App.saveInfo();
  const t=info.at?new Date(info.at).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}):'';
  let cls='',txt='';
  if(!info.ok&&info.status==='error'){cls='err';txt='تعذّر الحفظ على هذا الجهاز';}
  else if(info.status==='saving'){cls='ing';txt='جارٍ الحفظ…';}
  else if(info.status==='saved'){cls=info.online?'ok':'off';txt=info.online?'تم الحفظ':'دون اتصال — محفوظ على هذا الجهاز';}
  el.className='savest '+cls;el.innerHTML=txt?`<i aria-hidden="true"></i><span>${txt}</span>`:'';el.title=info.at?'آخر حفظ تلقائي: '+t:'';}
App.onSaveStatus(paintSave);
document.addEventListener('click',e=>{const b=e.target.closest('[data-snd]');if(!b)return;const on=App.sfx.toggle();b.innerHTML=icon(on?'volume':'mute');b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'كتم الأصوات':'تشغيل الأصوات');App.toast(on?'الأصوات مفعّلة':'الأصوات مكتومة');if(on)setTimeout(()=>App.sfx.play('tap'),50);});

/* ---------- learning events (called by the three sections) ---------- */
const pick=(arr,seed)=>{let h=0;for(const ch of String(seed))h=(h*31+ch.charCodeAt(0))|0;return arr[Math.abs(h)%arr.length];};
const API={
  levelOf,streak,metrics,badgeSVG,levelSVG,hudHTML,paintSave,burst,confetti,
  msg:(ok,seed)=>pick(C.messages[ok?'ok':'no'],seed),
  explore(sec){const g=G();if(!g.sec[sec]){g.sec[sec]=Date.now();App.save();if(!silent)flushSoon();}},
  /* MCQ answer: +correct once per question, +firstTry when the first ever attempt was right */
  mcqAnswer(q,ok,first,from){const g=G();g.sec.mcq=g.sec.mcq||Date.now();let x=0;
    if(ok){g.run++;if(g.run>g.bestRun)g.bestRun=g.run;x+=award('mcq:'+q.id,C.xp.correct,{from});if(first)x+=award('mcq1:'+q.id,C.xp.firstTry,{from});if(x)g.daily[today()]=(g.daily[today()]||0)+1;}
    else g.run=0;
    App.sfx.play(ok?'correct':'wrong');if(ok)burst(from,'ok');if(!x)flushSoon();App.save();return x;},
  /* MCQ quiz finished: structured sets (lesson / unit / full bank) pay once; random sets only count for stats */
  mcqQuizDone(S,score,total){const g=G(),p=App.pct(score,total);const key=S.src&&S.src.o&&S.src.o.key;const rk=key?'mq:'+key:'mr:'+S.started;
    const r=g.quizzes[rk]||{l:S.label,b:0,n:total,c:0};r.c++;r.b=Math.max(r.b,p);r.n=total;r.at=Date.now();r.l=S.label;g.quizzes[rk]=r;pruneQuizzes();
    let x=0;if(key){x+=award('quiz:'+key,C.xp.quiz);if(p===100)x+=award('perf:'+key,C.xp.perfect);}
    if(total>=10&&p>=90&&S.act&&S.act/total<=C.speedSecPerQ*1000&&!S.sp){S.sp=1;g.speed++;}
    App.sfx.play('quiz');if(p>=85)setTimeout(()=>confetti(p===100?140:70),200);if(!x)flushSoon();App.save();return x;},
  /* Student Book */
  lessonOpen(){API.explore('book');},
  lessonPanels(L,st){if(L.panels.every((_,i)=>st.seen&&st.seen[i]))return award('info:'+L.id,C.xp.infographic);return 0;},
  lessonDone(L,from){let x=award('les:'+L.id,C.xp.lesson,{from});
    const un=window.BOOK.lessons.filter(l=>l.unit===L.unit);if(un.every(l=>(state.lessons[l.id]||{}).done))x+=award('unit:'+L.unit,C.xp.unit,{from});
    if(x){App.sfx.play('quiz');burst(from,'big');}else flushSoon();return x;},
  /* Assessment Book sheet submitted (auto-graded items only; teacher overrides never change XP) */
  sheetDone(S,st,R,answered,total,from){const g=G();g.sec.assess=g.sec.assess||Date.now();let x=0,ok=0;const first=(st.tries||0)<=1;
    S.items.forEach(it=>{const r=R.per[it.id];if(r&&r.auto==='ok'){ok++;const a=award('ai:'+it.id,C.xp.correct,{from});x+=a;if(a&&first)x+=award('ai1:'+it.id,C.xp.firstTry,{from});if(a)g.daily[today()]=(g.daily[today()]||0)+1;}});
    const p=R.n?App.pct(R.pts,R.n):0;
    if(answered>=Math.ceil(total/2)){const r=g.quizzes['as:'+S.id]||{l:S.title,b:0,n:R.n,c:0};r.c++;r.b=Math.max(r.b,p);r.n=R.n;r.at=Date.now();r.l=S.title+' — '+S.id.replace(/^a(\d).*/,'الوحدة $1');g.quizzes['as:'+S.id]=r;
      x+=award('sheet:'+S.id,C.xp.quiz,{from});if(R.n&&R.pts===R.n)x+=award('sperf:'+S.id,C.xp.perfect,{from});}
    App.sfx.play('quiz');if(p>=85)setTimeout(()=>confetti(p===100?140:70),200);if(!x)flushSoon();App.save();return{x,p,ok};}
};
function flushSoon(){clearTimeout(flushT);flushT=setTimeout(flush,30);}
function pruneQuizzes(){const g=G(),ks=Object.keys(g.quizzes).filter(k=>k.startsWith('mr:'));if(ks.length>60)ks.sort((a,b)=>g.quizzes[a].at-g.quizzes[b].at).slice(0,ks.length-60).forEach(k=>delete g.quizzes[k]);}

/* ---------- one-time import of progress made before the reward system existed (no animations) ---------- */
function backfill(){const g=G();if(g.bf)return 0;silent=true;const x0=g.xp;const award=(k,x)=>awardRaw(k,x,{meta:1});
  try{window.BOOK.lessons.forEach(L=>{const st=state.lessons[L.id]||{};if(st.seen&&L.panels.every((_,i)=>st.seen[i]))award('info:'+L.id,C.xp.infographic);if(st.done){award('les:'+L.id,C.xp.lesson);g.sec.book=g.sec.book||1;}});
    [1,2,3].forEach(u=>{const un=window.BOOK.lessons.filter(l=>l.unit===u);if(un.every(l=>(state.lessons[l.id]||{}).done))award('unit:'+u,C.xp.unit);});
    Object.keys(state.mcq.ans).forEach(id=>{g.sec.mcq=g.sec.mcq||1;if(state.mcq.ans[id].ok)award('mcq:'+id,C.xp.correct);});
    if(App.assessResult)window.ASSESS.forEach(U=>U.lessons.forEach(L=>L.periods.forEach(P=>P.sections.forEach(S=>{const st=state.assess[S.id];if(!st||!st.submitted)return;g.sec.assess=g.sec.assess||1;
      const R=App.assessResult(S,st);S.items.forEach(it=>{const r=R.per[it.id];if(r&&r.auto==='ok')award('ai:'+it.id,C.xp.correct);});const p=R.n?App.pct(R.pts,R.n):0;
      g.quizzes['as:'+S.id]={l:S.title,b:p,n:R.n,c:1,at:st.submitted};award('sheet:'+S.id,C.xp.quiz);if(R.n&&R.pts===R.n)award('sperf:'+S.id,C.xp.perfect);}))));
    settle(true);}finally{silent=false;}
  g.bf=1;g.lvl=levelOf(g.xp).n;App.save();return g.xp-x0;}
/* integrity check at boot: total XP must equal the ledger; the key index is rebuilt from the ledger */
function repair(){const g=G();const sum=g.tx.reduce((s,t)=>s+(+t[1]||0),0);if(sum!==g.xp)g.xp=sum;g.tx.forEach(t=>g.keys[t[0]]=1);if(!g.lvl)g.lvl=levelOf(g.xp).n;}

/* ---------- dashboard «إنجازاتي» ---------- */
const TXL=[['mcq1:','مكافأة الإجابة من أول محاولة'],['mcq:','إجابة صحيحة — بنك الأسئلة'],['ai1:','مكافأة أول محاولة — التقييمات'],['ai:','إجابة صحيحة — كتاب التقييمات'],['les:','إكمال درس'],['info:','استكشاف إنفوجرافيك كامل'],['unit:','إكمال وحدة كاملة'],['quiz:','إكمال اختبار'],['perf:','علامة كاملة ١٠٠٪'],['sheet:','إكمال تقييم'],['sperf:','علامة كاملة في تقييم'],['goal:','تحقيق هدف اليوم'],['stk:','مكافأة سلسلة الأيام'],['bdg:','وسام جديد']];
function txLabel(k){const e=TXL.find(x=>k.startsWith(x[0]));let l=e?e[1]:'نقاط';
  if(k.startsWith('les:')||k.startsWith('info:')){const L=window.BOOK.lessons.find(x=>x.id===k.split(':')[1]);if(L)l+=': '+L.title;}
  if(k.startsWith('bdg:')){const b=BY[k.slice(4)];if(b)l+=': '+b.name;}if(k.startsWith('unit:'))l+=' '+ar(k.slice(5));if(k.startsWith('stk:'))l+=' ('+ar(k.split(':')[1])+' أيام)';return l;}
const when=t=>{const d=new Date(t);return d.toLocaleDateString('ar-EG',{day:'numeric',month:'short'})+' • '+d.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});};
function profile(v){const g=G(),L=levelOf(g.xp),s=streak(),m=metrics(),dg=g.daily[today()]||0;
  const qs=Object.values(g.quizzes).sort((a,b)=>b.b-a.b||b.at-a.at).slice(0,6);
  const got=C.badges.filter(b=>g.badges[b.id]).sort((a,b)=>g.badges[b.id]-g.badges[a.id]);
  const recent=g.tx.slice(-12).reverse();const bk=App.progress.book(),mq=App.progress.mcq(),as=App.progress.assess();
  const vol=Math.round((state.prefs.vol==null?.7:state.prefs.vol)*100);
  v.innerHTML=`<nav class="crumbs"><a href="#home">الرئيسية</a> ‹ <span>إنجازاتي</span></nav>
  <section class="pro-hero"><div class="pro-lv">${levelSVG(L.n,true)}</div>
   <div class="pro-main"><p class="kick">المستوى ${ar(L.n)} • ${esc(L.en)}</p><h1>${esc(L.name)}</h1>
    <div class="pro-xp"><b>${ar(g.xp)}</b><span>نقطة XP</span></div>
    <div class="pro-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${L.pct}" aria-label="التقدّم نحو المستوى التالي"><i style="--w:${L.pct}%"></i></div>
    <p class="pro-next">${L.next?`باقي <b>${ar(L.next-g.xp)} XP</b> للوصول إلى المستوى ${ar(L.n+1)}: «${esc(L.nextName)}»`:'وصلت إلى أعلى مستوى!'}</p></div>
   <div class="pro-ring"><div class="ring" style="--p:${App.pct(Math.min(dg,C.dailyGoal),C.dailyGoal)};--c:var(--teal)"><b>${ar(Math.min(dg,C.dailyGoal))}/${ar(C.dailyGoal)}</b></div><small>هدف اليوم: ${ar(C.dailyGoal)} إجابات صحيحة (+${ar(C.xp.dailyGoal)} XP)</small></div></section>
  <section class="pro-stats">
   <div class="pst fl"><span>${icon('flame')}</span><b>${ar(s.n)}</b><small>أيام متتالية${s.n&&!s.active?' — تعلّم اليوم لتحافظ عليها':''}</small></div>
   <div class="pst"><span>${icon('book')}</span><b>${ar(bk.done)}<i>/${ar(bk.total)}</i></b><small>دروس مكتملة</small></div>
   <div class="pst"><span>${icon('quiz')}</span><b>${ar(m.quizzes)}</b><small>اختبارات وتقييمات منتهية</small></div>
   <div class="pst"><span>${icon('check')}</span><b>${ar(m.correct)}</b><small>إجابات صحيحة</small></div>
   <div class="pst"><span>${icon('trophy')}</span><b>${ar(got.length)}<i>/${ar(C.badges.length)}</i></b><small>أوسمة</small></div>
   <div class="pst"><span>${icon('bolt')}</span><b>${ar(g.bestRun)}</b><small>أطول سلسلة إجابات صحيحة</small></div></section>
  ${Object.keys(C.cats).map(cat=>`<section class="pro-sec"><h2>${icon('trophy')} أوسمة ${C.cats[cat]}</h2><div class="badges">${C.badges.filter(b=>b.cat===cat).map(b=>{const has=g.badges[b.id],cur=Math.min(m[b.metric],b.need);
    return `<div class="bdg ${has?'has':'lock'}" tabindex="0"><div class="bimg">${badgeSVG(b,!has)}</div><h3>${esc(b.name)}</h3><small class="en">${esc(b.en)}</small><p>${esc(b.desc)}</p>
     ${has?`<span class="pill g">حصلت عليه • ${new Date(has).toLocaleDateString('ar-EG',{day:'numeric',month:'short'})}</span>`:`<span class="bprog"><i style="width:${App.pct(cur,b.need)}%"></i></span><small class="bnum">${ar(cur)} / ${ar(b.need)}</small>`}
     ${b.bonus?`<span class="bx">+${ar(b.bonus)} XP</span>`:''}</div>`;}).join('')}</div></section>`).join('')}
  <div class="pro-cols">
   <section class="pro-box"><h2>أفضل نتائجي</h2>${qs.length?`<ol class="best">${qs.map(q=>`<li><span>${esc(q.l)}</span><b class="${q.b>=90?'g':q.b>=60?'y':'r'}">${ar(q.b)}٪</b></li>`).join('')}</ol>`:'<p class="none">أنهِ أول اختبار لتظهر نتائجك هنا.</p>'}</section>
   <section class="pro-box"><h2>آخر الإنجازات</h2>${got.length?`<ul class="ach">${got.slice(0,6).map(b=>`<li>${badgeSVG(b)}<span><b>${esc(b.name)}</b><small>${when(g.badges[b.id])}</small></span></li>`).join('')}</ul>`:'<p class="none">لم تحصل على أوسمة بعد — أكمل درسًا أو اختبارًا لتبدأ!</p>'}</section>
   <section class="pro-box"><h2>آخر النقاط المكتسبة</h2>${recent.length?`<ul class="txl">${recent.map(t=>`<li><span>${esc(txLabel(t[0]))}</span><b>+${ar(t[1])}</b><small>${when(t[2])}</small></li>`).join('')}</ul>`:'<p class="none">لا توجد نقاط بعد.</p>'}</section>
  </div>
  <section class="pro-box pro-set"><h2>الإعدادات والحفظ</h2>
   <div class="setrow"><span>المؤثرات الصوتية</span><button class="btn sm ${App.sfx.on()?'teal':'ghost'}" data-set="snd" aria-pressed="${App.sfx.on()}">${icon(App.sfx.on()?'volume':'mute')} ${App.sfx.on()?'مفعّلة':'مكتومة'}</button>
    <label class="vol">مستوى الصوت <input type="range" min="0" max="100" step="5" value="${vol}" data-set="vol" aria-label="مستوى صوت المؤثرات"><b>${ar(vol)}٪</b></label><button class="btn sm ghost" data-set="test">${icon('play')} تجربة</button></div>
   <p class="setnote">الموسيقى الخلفية غير مستخدمة في المنصة. الأصوات تبدأ بعد أول لمسة أو نقرة (قاعدة المتصفحات).</p>
   <div class="setrow"><span>الحفظ التلقائي</span><span class="pill g">${App.storageOK()?'مفعّل على هذا الجهاز والمتصفح':'غير متاح — يُحفظ خلال الجلسة فقط'}</span><small>${App.saveInfo().at?'آخر حفظ: '+when(App.saveInfo().at):''}</small></div>
   <p class="setnote">يُحفظ تقدّمك تلقائيًّا بعد كل خطوة (بدون زر حفظ)، ويبقى بعد إغلاق المتصفح أو إعادة تشغيل الجهاز. لا ينتقل التقدّم تلقائيًّا إلى جهاز أو متصفح آخر.</p>
   <div class="setrow"><button class="btn sm orange" data-set="reset">${icon('trash')} إعادة ضبط كل التقدّم</button></div></section>`;
  const bar=v.querySelector('.pro-bar i');requestAnimationFrame(()=>requestAnimationFrame(()=>bar.classList.add('go')));
  v.onclick=e=>{const b=e.target.closest('[data-set]');if(!b)return;const a=b.dataset.set;
    if(a==='snd'){App.sfx.toggle();profile(v);App.nav('profile');if(App.sfx.on())App.sfx.play('tap');}
    else if(a==='test')App.sfx.play('correct');
    else if(a==='reset')App.confirm('إعادة ضبط كل التقدّم؟','سيُحذف تقدّمك في الدروس والأسئلة والتقييمات، وكل النقاط والأوسمة وسلسلة الأيام من هذا الجهاز. لا يمكن التراجع.','نعم، احذف كل شيء',()=>{App.resetAll();App.toast('تم مسح التقدّم.');App.go('home');});};
  v.oninput=e=>{const r=e.target.closest('[data-set=vol]');if(!r)return;state.prefs.vol=r.value/100;if(+r.value>0&&state.prefs.sfx===false)state.prefs.sfx=true;r.nextElementSibling.textContent=ar(r.value)+'٪';App.save();};
  v.onchange=e=>{if(e.target.closest('[data-set=vol]'))App.sfx.play('xp');};
}

/* ---------- welcome back ---------- */
const SEC={book:['ذاكر من كتاب المدرسة','t'],mcq:['بنك الأسئلة','o'],assess:['كتاب التقييمات','p']};
function welcomeHTML(){const r=state.resume;if(!r||!App.bootSavedAt)return'';const g=G(),L=levelOf(g.xp),bk=App.progress.book(),mq=App.progress.mcq(),as=App.progress.assess(),sc=SEC[r.section]||['',''];
  return `<section class="welcome" aria-label="مرحبًا بعودتك"><div class="wb-txt"><p class="kick">مرحبًا بعودتك! 👋</p><h2>أنت تتقدّم بشكل رائع! لنكمل من حيث توقفت.</h2>
   <p class="wb-last"><span class="pill ${sc[1]}">${esc(sc[0])}</span> <b>${esc(r.label)}</b></p>
   <p class="wb-meta">آخر حفظ: ${when(App.bootSavedAt)} • ${ar(bk.done)} دروس مكتملة • ${ar(mq.answered)} سؤالًا مُجابًا • ${ar(as.done)} تقييمًا مُسلَّمًا</p></div>
   <div class="wb-side"><div class="wb-lv">${levelSVG(L.n)}<span><b>${ar(g.xp)} XP</b><small>${esc(L.name)}</small></span></div>
   <button class="btn gold big" data-resume>${icon('play')} متابعة التعلّم</button></div></section>`;}
document.addEventListener('click',e=>{if(!e.target.closest('[data-resume]'))return;const r=state.resume;if(r)App.go(r.h,r.y||0);});

App.game=API;
App.route(/^profile$/,profile);
App.gameBoot=()=>{repair();const add=backfill();settle(true);
  if(add>0)setTimeout(()=>App.toast('أضفنا '+ar(add)+' نقطة XP من تقدّمك السابق 🎉'),900);
  const h=(location.hash||'').slice(1);if(App.bootSavedAt&&state.resume&&h&&h!=='home'&&!add)setTimeout(()=>App.toast('مرحبًا بعودتك! 👋 أكملنا من حيث توقفت.'),700);};
App.welcomeHTML=welcomeHTML;
})();
