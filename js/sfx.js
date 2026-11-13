/* Sound effects — synthesized with the Web Audio API (no audio files, works offline).
   Browser rule respected: the audio engine is created only after the student's first tap/click/key press.
   Settings: App.state.prefs.sfx (on/off) and App.state.prefs.vol (0–1). */
(function(){
'use strict';
let ctx=null,master=null,unlocked=false;
function init(){if(ctx)return ctx;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;comp.connect(ctx.destination);
  master=ctx.createGain();master.connect(comp);}catch(e){ctx=null;}return ctx;}
function unlock(){unlocked=true;if(init()&&ctx.state==='suspended')ctx.resume().catch(()=>{});}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
const prefs=()=>App.state.prefs;
const ok=()=>unlocked&&prefs().sfx!==false&&init()&&(prefs().vol==null||prefs().vol>0);

/* one soft "bell" voice: sine fundamental + quiet overtone, smooth attack/decay (no harsh clicks) */
function bell(f,t,dur,g,type){const o=ctx.createOscillator(),o2=ctx.createOscillator(),v=ctx.createGain(),v2=ctx.createGain();
  o.type=type||'sine';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.01;
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0008,t+dur);
  v2.gain.setValueAtTime(0,t);v2.gain.linearRampToValueAtTime(g*.22,t+.01);v2.gain.exponentialRampToValueAtTime(.0005,t+dur*.6);
  o.connect(v).connect(master);o2.connect(v2).connect(master);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);}
function glide(f1,f2,t,dur,g,type){const o=ctx.createOscillator(),v=ctx.createGain();o.type=type||'sine';
  o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.02);v.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(v).connect(master);o.start(t);o.stop(t+dur+.05);}
function shimmer(t,dur,g){const n=ctx.createBufferSource(),b=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(5000,t);f.frequency.exponentialRampToValueAtTime(9000,t+dur);f.Q.value=2;
  const v=ctx.createGain();v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0005,t+dur);
  n.buffer=b;n.connect(f).connect(v).connect(master);n.start(t);}
const N=x=>440*Math.pow(2,(x-69)/12); // MIDI note -> Hz

const S={
  correct(t){[72,76,79].forEach((m,i)=>bell(N(m),t+i*.075,.55,.32,'triangle'));bell(N(84),t+.24,.7,.18);shimmer(t+.18,.35,.05);},
  wrong(t){glide(N(64),N(59),t,.32,.22,'sine');glide(N(60),N(55),t+.16,.38,.16,'sine');},
  xp(t){[84,88].forEach((m,i)=>bell(N(m),t+i*.06,.25,.16,'triangle'));},
  badge(t){[67,72,76,79,84].forEach((m,i)=>bell(N(m),t+i*.09,.9,.26,'triangle'));[72,76,79].forEach(m=>bell(N(m),t+.5,1.4,.12));shimmer(t+.45,.8,.07);},
  level(t){[60,64,67,72].forEach((m,i)=>bell(N(m),t+i*.12,.6,.24,'triangle'));[72,76,79,84].forEach((m,i)=>bell(N(m),t+.55+i*.02,1.6,.14));shimmer(t+.5,1.1,.08);},
  quiz(t){[[67,71,74],[69,72,76],[72,76,79]].forEach((ch,i)=>ch.forEach(m=>bell(N(m),t+i*.18,.7,.13,'triangle')));shimmer(t+.36,.5,.05);},
  streak(t){shimmer(t,.35,.08);glide(N(60),N(72),t,.3,.12,'triangle');[79,84].forEach((m,i)=>bell(N(m),t+.28+i*.1,.7,.22,'triangle'));},
  tap(t){bell(N(91),t,.12,.08,'sine');}
};
App.sfx={
  play(name){if(!ok()||!S[name])return;try{if(ctx.state==='suspended')ctx.resume();master.gain.value=Math.max(0,Math.min(1,prefs().vol==null?.7:prefs().vol));S[name](ctx.currentTime+.02);}catch(e){}},
  available:()=>!!(window.AudioContext||window.webkitAudioContext),
  toggle(){prefs().sfx=prefs().sfx===false;App.save();return prefs().sfx;},
  on:()=>prefs().sfx!==false
};
})();
