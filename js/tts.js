/* Read-aloud using the browser / operating-system speech engine (no paid or AI voice service).
   Falls back gracefully when no speech engine or no Arabic voice is installed. */
(function(){
'use strict';
const synth=('speechSynthesis' in window)?window.speechSynthesis:null;
let voice=null,queue=[],cur=null,playing=false,paused=false,token=0;
function pickVoice(){if(!synth)return;const v=synth.getVoices()||[];voice=v.find(x=>/^ar/i.test(x.lang)&&x.localService)||v.find(x=>/^ar/i.test(x.lang))||null;}
if(synth){pickVoice();try{synth.addEventListener('voiceschanged',pickVoice);}catch(e){}}
const dock=()=>document.getElementById('tts');
function clean(t){return t.replace(/ﷺ/g,' صلى الله عليه وسلم ').replace(/…+|_{2,}|\.{3,}/g,' ').replace(/[•◄←«»"()]/g,' ').replace(/\s+/g,' ').trim();}
function chunks(t){const out=[];clean(t).split(/(?<=[.؟!؛:،\n])\s+/).forEach(s=>{while(s.length>180){let k=s.lastIndexOf(' ',180);if(k<60)k=180;out.push(s.slice(0,k));s=s.slice(k);}if(s.trim())out.push(s.trim());});return out;}
function mark(el,on){document.querySelectorAll('.saying').forEach(x=>x.classList.remove('saying'));if(el&&on){el.classList.add('saying');try{el.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}}}
function ui(label){const d=dock();if(!playing){d.hidden=true;return;}
  d.hidden=false;d.innerHTML=`<button class="icon-btn on" data-t="toggle" aria-label="${paused?'متابعة القراءة':'إيقاف مؤقت'}">${App.icon(paused?'play':'pause')}</button><button class="icon-btn" data-t="stop" aria-label="إيقاف القراءة">${App.icon('stop')}</button><span>${App.esc(label||'قراءة بصوت مسموع')}</span>`;}
let t0=0,len=0;
function next(tk){if(tk!==token)return;if(!queue.length){const quick=Date.now()-t0<350&&len>60;stop();if(quick)App.toast('تعذّر تشغيل القراءة الصوتية: لا يوجد محرك نطق عربي متاح على هذا الجهاز.');return;}
  const item=queue.shift();if(item.el!==cur){cur=item.el;mark(cur,true);}
  const u=new SpeechSynthesisUtterance(item.text);u.lang=voice?voice.lang:'ar-SA';if(voice)u.voice=voice;u.rate=.92;
  u.onend=()=>next(tk);u.onerror=e=>{if(e&&(e.error==='interrupted'||e.error==='canceled'))return;next(tk);};
  try{synth.speak(u);}catch(e){stop();}}
function stop(){token++;queue=[];playing=false;paused=false;cur=null;mark(null,false);if(synth){try{synth.cancel();}catch(e){}}ui();}
/* parts: [{el, text}] – each part is highlighted while it is read */
function speak(parts,label){
  if(!synth){App.toast('القراءة الصوتية غير مدعومة في هذا المتصفح.');return;}
  stop();pickVoice();
  if(!voice&&synth.getVoices().length){App.toast('لا يوجد صوت عربي مثبَّت على هذا الجهاز؛ سنحاول القراءة بالصوت الافتراضي.');}
  parts.forEach(p=>chunks(p.text).forEach(t=>queue.push({el:p.el,text:t})));
  if(!queue.length)return;t0=Date.now();len=queue.reduce((n,q)=>n+q.text.length,0);playing=true;paused=false;const tk=++token;ui(label);next(tk);
}
function toggle(){if(!playing)return;if(paused){synth.resume();paused=false;}else{synth.pause();paused=true;}ui();}
document.addEventListener('click',e=>{const b=e.target.closest('#tts [data-t]');if(!b)return;if(b.dataset.t==='stop')stop();else toggle();});
window.addEventListener('pagehide',stop);
App.tts={speak,stop,toggle,supported:()=>!!synth,hasArabic:()=>!!voice};
})();
