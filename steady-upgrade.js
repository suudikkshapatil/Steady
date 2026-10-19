/* Steady upgrade add-on. Load AFTER your main <script>, right before </body>:
   <script src="steady-upgrade.js"></script> */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS={g:(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const pad=n=>String(n).padStart(2,'0');
const localDay=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const esc=s=>escapeHtml(String(s));

/* ---------- CSS: dark mode, low-stim, big text, new components ---------- */
const st=document.createElement('style');st.textContent=`
[data-theme=dark]{--bg:#1d1b22;--bg-deep:#17151c;--card:#26232d;--card-warm:#2e2a36;--ink:#ECE7F0;--ink-soft:#aaa3b3;--line:rgba(236,231,240,.17);--sage-deep:#9bc29e;--shadow:0 16px 40px rgba(0,0,0,.4)}
[data-theme=dark] nav{background:rgba(29,27,34,.92)}
[data-theme=dark] .btn-primary,[data-theme=dark] .chip.selected,[data-theme=dark] .pattern-btn.active,[data-theme=dark] .sound-btn.active,[data-theme=dark] .move-list li.active,[data-theme=dark] .icon-btn.on,[data-theme=dark] .gender-btn.active{background:#4d6b50;border-color:#4d6b50;color:#F5F1E7}
[data-theme=dark] .gate-google-btn{background:#fff;color:#2B2430}
[data-theme=dark] .icon-btn svg{stroke:var(--ink)}
.lowstim *{animation:none!important;transition:none!important}
.lowstim{filter:saturate(.55)}
html.bigtext{font-size:120%}
.gender-btn{background:var(--card-warm);border:1.5px solid var(--line);border-radius:14px;padding:14px 20px;font-weight:600;font-size:.9rem;color:var(--ink)}
.gender-btn.active{background:var(--sage-deep);color:#fff;border-color:var(--sage-deep)}
.tin{width:100%;margin-bottom:8px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink);font:inherit}
.bf{display:flex;gap:70px;justify-content:center;margin:14px 0}.bf i{width:26px;height:26px;border-radius:50%;background:var(--sage);animation:bf 1.6s ease-in-out infinite}.bf i:last-child{animation-delay:.8s}
@keyframes bf{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.ov{position:fixed;inset:0;z-index:200;background:var(--bg);display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
.ov-in{max-width:440px;width:100%;display:flex;flex-direction:column;align-items:center;gap:22px}
.po-orb{width:200px;height:200px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#d7e6d5,var(--sage) 62%,var(--sage-deep));animation:poB 10s ease-in-out infinite}
@keyframes poB{0%,100%{transform:scale(.7)}40%{transform:scale(1.2)}}
.po-cue{font-family:var(--font-display);font-size:1.3rem;min-height:3em}
.help-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 0;border-bottom:1px dashed var(--line)}
#nudge{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:70;background:var(--ink);color:var(--bg);padding:12px 18px;border-radius:14px;max-width:92vw;display:none;gap:12px;align-items:center;box-shadow:var(--shadow);font-size:.88rem}
.set-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
`;document.head.appendChild(st);

/* ---------- Theme, low-stim, text size (22, 25) ---------- */
function applyPrefs(){
  document.documentElement.dataset.theme=LS.g('steady_theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  document.documentElement.classList.toggle('bigtext',LS.g('steady_big','0')==='1');
  document.body.classList.toggle('lowstim',LS.g('steady_low','0')==='1');
}
applyPrefs();
const tb=document.createElement('button');tb.type='button';tb.className='icon-btn';tb.textContent='🌓';tb.title='Toggle dark mode';tb.setAttribute('aria-label','Toggle dark mode');
tb.onclick=()=>{LS.s('steady_theme',document.documentElement.dataset.theme==='dark'?'light':'dark');applyPrefs()};
$('.nav-right').insertBefore(tb,$('#voiceToggleBtn'));
const nl=document.createElement('button');nl.type='button';nl.className='navlink';nl.textContent='Help now';nl.onclick=()=>goToSection('crisis');$('.navlinks').appendChild(nl);
['#phaseLabel','#scanText','#pmrInstruction','#reassure'].forEach(s=>{const e=$(s);if(e)e.setAttribute('aria-live','polite')});
$$('.progress-track').forEach(e=>e.setAttribute('role','progressbar'));

/* ---------- Section helper ---------- */
function sec(id,deep,h){const s=document.createElement('section');s.id=id;if(deep)s.style.background='var(--bg-deep)';s.innerHTML='<div class="wrap"><div class="card tool-panel">'+h+'</div></div>';$('footer').parentNode.insertBefore(s,$('footer'))}

/* ---------- 3-10-11 etc: extra techniques (1,2,3,4,5,6,7,8,10,11) ---------- */
const TECH=[
{id:'defuse',i:'☁️',t:'Thought defusion',s:['Notice the sticky thought. Put it in a sentence, e.g. "I\'m going to fail."','Now say it again starting with: "I\'m having the thought that…" Notice what shifts.','Go one step further: "I notice I\'m having the thought that…"','Picture the thought as words on a leaf floating down a stream. You don\'t have to push it away, just watch it drift.','Quietly say "Thanks, mind." A thought is an event in your head, not a fact. Return to what you were doing.']},
{id:'worry',i:'🌳',t:'Worry tree & worry time',s:['Name the worry in one sentence.','Ask: is there something I can DO about this, in my control, right now?','If YES: pick one small next action and decide when you will do it. Write it down, then let it rest.','If NO: it is a "what if". Label it "worry" and park it for your worry time (15 minutes, same time each day). Return gently to what is in front of you.',{text:'Optional: park the worry now so it feels held.',inputs:['The worry I\'m parking for later'],save:'Parked worry'}]},
{id:'sigh',i:'😮‍💨',t:'Physiological sigh & cold reset',s:[{text:'Breathe in through the nose, sip a second small breath in on top, then a long slow exhale through the mouth. Fast, calming, great for sudden panic.',sigh:1},'Cold reset (optional): hold a cold damp cloth or cold bottle against your cheeks and under your eyes for 15-30 seconds while exhaling slowly. Skip this if a doctor has told you to avoid it.']},
{id:'safe',i:'🏝️',t:'Safe place visualization',s:['Close your eyes if comfortable. Picture a place where you feel safe: real or imagined.','What do you SEE there? Colours, light, shapes.','What do you HEAR and SMELL? Let it be vivid.','What does your body feel: temperature, softness, weight? Let your shoulders settle.','Give the place a one-word name. You can return to it any time by saying that word.']},
{id:'good',i:'🌤️',t:'Three good things',s:[{text:'Write three small things that went okay today, however tiny.',inputs:['Good thing 1','Good thing 2','Good thing 3'],save:'Three good things'},'Pick one and notice how it feels in your body to remember it.']},
{id:'kind',i:'🤍',t:'Self-compassion break',s:['Say to yourself: "This is a moment of struggle." (Mindfulness: name it without judging.)','"Struggle is part of being human. Many people feel this way." (Common humanity.)','Place a hand on your chest. Say: "May I be kind to myself right now." Stay for three slow breaths.']},
{id:'hug',i:'🦋',t:'Butterfly hug',s:[{text:'Cross your arms over your chest, hands near your collarbones.',html:'<div class="bf"><i></i><i></i></div>'},{text:'Tap alternately, left, right, left, right, slowly, like a heartbeat. Breathe out as you tap.',html:'<div class="bf"><i></i><i></i></div>'},'Continue for about a minute. Notice what changes.']},
{id:'neck',i:'🧘',t:'Neck, jaw & gentle stretch',s:['Unclench your jaw: let the teeth part, tongue drop from the roof of your mouth.','Slowly tilt your right ear toward your right shoulder. Hold 20s. Switch sides.','Roll your shoulders back 5 times, then forward 5 times.','Cat-cow: on hands and knees (or seated), arch and round your back with your breath, 6 rounds.','Child\'s pose or a forward fold for 5 slow breaths.']},
{id:'stop',i:'✋',t:'STOP & name it',s:['S: Stop. Pause whatever you are doing.','T: Take one slow breath.','O: Observe. What are my thoughts, feelings, body sensations right now?',{text:'Name it to tame it: finish the sentence.',inputs:['I feel ___ because ___'],save:'Name it'},'P: Proceed with one small, deliberate action that fits what matters to you.']},
{id:'sleep',i:'🛌',t:'Sleep wind-down',s:['Dim the lights and put screens away if you can. Tell yourself: "Work for today is done."',{text:'Brain dump: empty tomorrow\'s worries and to-dos onto the page so your mind can let go.',inputs:['Things on my mind','Tomorrow I will…'],save:'Sleep brain dump'},'Do the 4-7-8 breathing for about four rounds (Guided breathing section).','Run the body scan, then start Calming sounds with the sleep timer.']},
{id:'walk',i:'🚶',t:'Mindful walking',s:['Stand still. Feel your feet on the ground and let your arms hang loose.','Start walking slower than usual. Feel the heel land, the foot roll, the toes lift.','Match breath to steps, for example in for 3 steps, out for 4.','When your mind drifts to worries, notice it kindly and return to your feet. Keep going for 3 to 5 minutes.','Stop. Take one slow breath and notice what changed in your body.']},
{id:'nostril',i:'🌬️',t:'Alternate nostril breathing',s:['Sit comfortably. With your right thumb, gently close your right nostril.','Breathe in slowly through the left nostril for 4 counts.','Close the left nostril with your ring finger, release the right, and breathe out for 6 counts.','Breathe in through the right for 4, switch, and breathe out through the left for 6. That is one round.','Do 5 rounds, gently and never forced. If you feel lightheaded, stop and breathe normally.']},
{id:'wave',i:'🌊',t:'Ride the wave (urge surfing)',s:['Notice the urge (to flee, check, avoid or seek reassurance). Where do you feel it in your body?','Rate it 0 to 10. Instead of acting on it, picture it as a wave that rises, peaks and falls.','Breathe slowly and describe it without judging: tight, hot, buzzing. Watch how it changes.','Stay with it a little longer. Most waves ease within minutes. Rate it again.',{text:'Optional: note how the number changed.',inputs:['Before _/10, after _/10'],save:'Ride the wave'}]},
{id:'observe',i:'🔍',t:'Mindful observation',s:['Choose any small object near you: a cup, a leaf, your keys.','Look at it as if for the first time. Notice colours, shadows, edges and texture.','If you can, hold it. Feel its weight, temperature and surface.','Keep noticing details for a full minute. When your mind drifts, bring it back to the object.']},
{id:'mantra',i:'💬',t:'Calming phrase',s:['Pick a phrase that feels true and kind, such as "This will pass", "I am safe right now" or "One step at a time".','Breathe in and silently say the first half. Breathe out and say the second half.','Repeat slowly for about 10 breaths. Keep it gentle, not forced.',{text:'Write your own phrase to keep.',inputs:['My phrase'],save:'My calming phrase'}]},
{id:'tiny',i:'🌱',t:'One tiny step',s:['Name what you are avoiding or feeling stuck on.','Shrink it until it takes under two minutes: open the document, send one line, put your shoes on.','Do just that step now. You are allowed to stop afterwards.','Notice that starting is usually the hardest part. Give yourself a small reward or a rest.']},
{id:'bee',i:'🐝',t:'Humming bee breath',s:['Sit tall and close your eyes. Breathe in gently through your nose.','Breathe out slowly with lips closed, making a soft hum like a bee.','Feel the vibration in your face and chest. Do 6 rounds at your own pace.','Rest in silence for a few breaths and notice the stillness.']},
];
sec('moretech',false,'<div class="eyebrow">More techniques</div><h3>Extra tools</h3><p class="panel-sub">Pick one. Each takes just a few minutes.</p><div class="breathe-row" id="techTabs"></div><div id="techBox"></div>');
let cur=null,si=0,vals={},sighT=null;
$('#techTabs').innerHTML=TECH.map(x=>`<button type="button" class="pattern-btn" data-id="${x.id}">${x.i} ${x.t}</button>`).join('');
$('#techTabs').onclick=e=>{const b=e.target.closest('button');if(b){cur=b.dataset.id;si=0;drawTech()}};
function runSigh(){let n=0,ph=0;const P=[['Breathe in through your nose',2],['Sip in a little more',1],['Long, slow breath out through your mouth',6]];(function step(){const o=$('#sighOut');if(!o)return;if(n>=5){o.textContent='Done. Notice how your body feels.';return}o.textContent=P[ph][0];speak(P[ph][0]);const d=P[ph][1];ph++;if(ph>=3){ph=0;n++}sighT=setTimeout(step,d*1000)})()}
function drawTech(){
  clearTimeout(sighT);
  $$('#techTabs button').forEach(b=>b.classList.toggle('active',b.dataset.id===cur));
  const T=TECH.find(x=>x.id===cur),box=$('#techBox');
  if(!T){box.innerHTML='';return}
  if(si>=T.s.length){box.innerHTML='<div class="ground-title">🌿 Well done. Notice how you feel now compared to when you started.</div><button type="button" class="btn btn-ghost btn-sm" id="techAgain">Do it again</button>';$('#techAgain').onclick=()=>{si=0;drawTech()};return}
  const p=T.s[si],s=typeof p==='string'?{text:p}:p;
  box.innerHTML=`<div class="ground-dots">${T.s.map((_,i)=>`<span class="${i<=si?'on':''}"></span>`).join('')}</div><div class="ground-title">${T.i} ${T.t} · ${si+1}/${T.s.length}</div><p style="max-width:560px">${s.text}</p>${s.html||''}${(s.inputs||[]).map((ph,k)=>`<input type="text" class="tin" data-k="${T.id}-${si}-${k}" aria-label="${esc(ph)}" placeholder="${esc(ph)}" value="${esc(vals[T.id+'-'+si+'-'+k]||'')}">`).join('')}${s.sigh?'<button type="button" class="btn btn-ghost btn-sm" id="sighGo">Start 5 rounds</button><div id="sighOut" class="phase-label" style="margin:10px 0"></div>':''}<div class="ground-nav" style="margin-top:14px"><button type="button" class="btn btn-ghost btn-sm" id="tBack">Back</button><button type="button" class="btn btn-ghost btn-sm" id="tSpeak">🔊 Read aloud</button><button type="button" class="btn btn-primary btn-sm" id="tNext">${si===T.s.length-1?'Finish':(s.inputs?'Save &amp; next':'Done')}</button></div>`;
  speak(s.text.replace(/<[^>]+>/g,''));
  $$('.tin').forEach(i=>i.oninput=()=>{vals[i.dataset.k]=i.value});
  if(s.sigh)$('#sighGo').onclick=runSigh;
  $('#tSpeak').onclick=()=>speak(s.text.replace(/<[^>]+>/g,''),{force:true});
  $('#tBack').onclick=()=>{si=Math.max(0,si-1);drawTech()};
  $('#tNext').onclick=()=>{
    if(si===T.s.length-1){
      const txt=Object.entries(vals).filter(([k,v])=>k.startsWith(T.id+'-')&&v.trim()).map(e=>e[1].trim()).join(' · ');
      const sv=T.s.find(x=>x.save);
      if(sv&&txt){journalEntries.unshift({text:txt,prompt:sv.save,time:new Date()});renderJournal();persist()}
      awardBadge('explorer');registerCheckIn();
    }
    si++;drawTech();
  };
}

window.STEADY={TECH,open(id){cur=id;si=0;vals={};drawTech()}};
/* ---------- Exposure ladder (9) ---------- */
let ladder=[];try{ladder=JSON.parse(LS.g('steady_ladder','[]'))}catch(e){}
function saveLadder(){LS.s('steady_ladder',JSON.stringify(ladder));persist()}
sec('ladder',true,'<div class="eyebrow">Technique</div><h3>Exposure ladder</h3><p class="panel-sub">Facing avoided things gradually shrinks fear. List situations you avoid and rate each 1-10. Start around 3-4/10, stay with it until anxiety eases a little, repeat, then move up. For intense fears or past trauma, do this with a therapist.</p><div class="set-row"><input type="text" id="ladTxt" class="tin" style="flex:1;min-width:200px;margin:0" placeholder="e.g. Ask a question in class" aria-label="Situation"><label>Difficulty <input type="number" id="ladD" min="1" max="10" value="4" style="width:60px;padding:8px;border-radius:10px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink)"></label><button type="button" class="btn btn-primary btn-sm" id="ladAdd">Add</button></div><div class="entry-list" id="ladList"></div>');
function drawLadder(){$('#ladList').innerHTML=[...ladder].sort((a,b)=>a.d-b.d).map(x=>`<div class="entry" style="display:flex;gap:10px;align-items:center"><input type="checkbox" data-id="${x.id}" ${x.done?'checked':''} aria-label="Done"><span style="flex:1;${x.done?'text-decoration:line-through;opacity:.6':''}">${esc(x.t)}</span><b>${x.d}/10</b><button type="button" class="del" style="position:static" data-del="${x.id}" aria-label="Remove">✕</button></div>`).join('')||'<p class="hint-text">Nothing here yet.</p>'}
$('#ladAdd').onclick=()=>{const t=$('#ladTxt').value.trim();if(!t)return;ladder.push({id:Date.now()+'',t,d:Math.min(10,Math.max(1,+$('#ladD').value||4)),done:false});$('#ladTxt').value='';saveLadder();drawLadder()};
$('#ladList').onclick=e=>{const d=e.target.dataset.del;if(d){ladder=ladder.filter(x=>x.id!==d);saveLadder();drawLadder()}};
$('#ladList').onchange=e=>{const x=ladder.find(y=>y.id===e.target.dataset.id);if(x){x.done=e.target.checked;if(x.done){awardBadge('climber');registerCheckIn()}saveLadder();drawLadder()}};
drawLadder();

/* ---------- Crisis resources (18, 21) ---------- */
sec('crisis',false,'<div class="eyebrow">Support</div><h3>If you need help right now</h3><p class="panel-sub">If you might hurt yourself or someone else, or feel unsafe, contact emergency help or someone you trust right away. You do not have to handle it alone.</p><div class="help-row"><b>Emergency services (India)</b><span>112</span></div><div class="help-row"><b>Tele-MANAS, free 24/7 mental health helpline (India)</b><span>14416 or 1-800-891-4416</span></div><div class="help-row"><b>Outside India</b><span><a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a></span></div><p class="hint-text">Numbers can change, please double-check them. Talking to a doctor or counsellor is a good step if anxiety is frequent, lasts weeks, or affects sleep, studies or daily life.</p>');
const fl=document.createElement('div');fl.className='hint-text';fl.style.marginTop='12px';fl.innerHTML='<a href="#crisis" onclick="goToSection(\'crisis\');return false">Need help now? See support numbers.</a>';$('.footer-note').appendChild(fl);
const nud=document.createElement('div');nud.id='nudge';document.body.appendChild(nud);
function nudge(msg){nud.innerHTML=`<span>${msg}</span><button type="button" class="btn btn-ghost btn-sm" style="color:inherit;border-color:currentColor" id="nudgeGo">Get help</button>`;nud.style.display='flex';$('#nudgeGo').onclick=()=>{nud.style.display='none';goToSection('crisis')};setTimeout(()=>nud.style.display='none',15000)}

/* ---------- Panic mode: simplified full-screen (17) ---------- */
let pT=null,pC=null;
function closePanic(ok){clearTimeout(pT);clearInterval(pC);const o=$('#panicOv');if(o)o.remove();window.speechSynthesis&&speechSynthesis.cancel();if(ok){awardBadge('breather');registerCheckIn()}}
window.panicMode=function(){
  if($('#panicOv'))return;
  const o=document.createElement('div');o.id='panicOv';o.className='ov';o.setAttribute('role','dialog');o.setAttribute('aria-label','Calming screen');
  o.innerHTML='<div class="ov-in"><p class="po-cue" id="poCue" aria-live="polite">You are safe right now.</p><div class="po-orb"></div><div class="phase-label" id="poLab" aria-live="polite">Breathe in…</div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn-primary" id="poOk">I\'m feeling a bit better</button><button type="button" class="btn btn-ghost" id="poHelp">I need more help</button></div></div>';
  document.body.appendChild(o);
  const cues=['You are safe right now.','This feeling peaks and passes.','Feel your feet on the floor.','Name one thing you can see.','Let your shoulders drop.','You have gotten through this before.'];let ci=0,ins=true;
  pC=setInterval(()=>{ci=(ci+1)%cues.length;$('#poCue').textContent=cues[ci]},9000);
  (function lab(){const l=$('#poLab');if(!l)return;l.textContent=ins?'Breathe in…':'Breathe out slowly…';pT=setTimeout(lab,ins?4000:6000);ins=!ins})();
  speak('You are safe. Breathe in for four, and out for six.');
  $('#poOk').onclick=()=>closePanic(true);
  $('#poHelp').onclick=()=>{closePanic(false);goToSection('crisis')};
  $('#poOk').focus();
};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanic(false)});

/* ---------- Mood tracker upgrades (13, 21, 24) ---------- */
const TAGS=['Exam/study','Family','Sleep','Caffeine','Health worry','Social','Work/money','Not sure'],selTags=new Set();
const tg=document.createElement('div');tg.className='distortion-row';tg.setAttribute('aria-label','What might be behind it?');
tg.innerHTML=TAGS.map(t=>`<button type="button" class="distortion-chip mtag" data-t="${t}">${t}</button>`).join('');
$('.mood-slider-row').after(tg);
tg.onclick=e=>{const b=e.target.closest('.mtag');if(!b)return;b.classList.toggle('on');selTags.has(b.dataset.t)?selTags.delete(b.dataset.t):selTags.add(b.dataset.t)};
window.logMood=function(){const v=+$('#moodSlider').value;moodLog.push({v,time:new Date(),tags:[...selTags]});selTags.clear();$$('.mtag').forEach(c=>c.classList.remove('on'));renderMoodChart();registerCheckIn();persist();if(moodLog.length>=3)awardBadge('tracker');if(v>=9)nudge('That sounds really intense. Support is available.')};
window.renderMoodChart=function(){
  const c=$('#moodChart'),stt=$('#moodStats'),d=moodLog.slice(-30);c.style.display='block';c.style.height='auto';
  if(!d.length){c.innerHTML='';stt.textContent='';return}
  const W=300,H=110,px=i=>d.length<2?W/2:10+i*(W-20)/(d.length-1),py=v=>H-8-(v/10)*(H-16);
  c.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-height:160px" role="img" aria-label="Anxiety level over time"><polyline fill="none" stroke="var(--sage-deep)" stroke-width="2.5" points="${d.map((m,i)=>px(i)+','+py(m.v)).join(' ')}"/>${d.map((m,i)=>`<circle cx="${px(i)}" cy="${py(m.v)}" r="4" fill="var(--rose)"><title>${m.v}/10 · ${new Date(m.time).toLocaleString()}</title></circle>`).join('')}</svg>`;
  const avg=(moodLog.reduce((a,b)=>a+b.v,0)/moodLog.length).toFixed(1),by={};
  moodLog.forEach(m=>(m.tags||[]).forEach(t=>{(by[t]=by[t]||[]).push(m.v)}));
  const ins=Object.entries(by).filter(([,a])=>a.length>=2).map(([t,a])=>[t,a.reduce((x,y)=>x+y)/a.length]).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const rec=moodLog.filter(m=>Date.now()-new Date(m.time)<14*864e5),ra=rec.length?rec.reduce((a,b)=>a+b.v,0)/rec.length:0;
  stt.style.flexWrap='wrap';
  stt.innerHTML=`<span>${moodLog.length} logged</span><span>Average: ${avg}</span><span>Latest: ${moodLog[moodLog.length-1].v}</span>${ins.length?'<span>Highest around: '+ins.map(([t,a])=>t+' ('+a.toFixed(1)+')').join(', ')+'</span>':''}${rec.length>=5&&ra>=7?'<span style="flex-basis:100%;color:var(--rose);font-weight:600">Your scores have been high for the past two weeks. Consider talking to a doctor or counsellor. <a href="#crisis" onclick="goToSection(\'crisis\');return false">Support</a></span>':''}`;
};

/* ---------- Bug fixes: streak timezone (29), sound/voice buttons (30), grounding restart (31), journal dates (33) ---------- */
window.registerCheckIn=function(){const t=localDay();if(streakData.lastCheckIn===t)return;const y=new Date();y.setDate(y.getDate()-1);streakData.count=streakData.lastCheckIn===localDay(y)?streakData.count+1:1;streakData.longest=Math.max(streakData.longest,streakData.count);streakData.lastCheckIn=t;renderStreak();persist()};
const AFF=['Feelings are visitors, not residents.','You only need to take the next small step.','Calm is a skill, and every practice counts.','You have survived every hard day so far.','It is okay to rest.','Progress is not a straight line.','You are allowed to take up space.','This moment is manageable.'];
const aff=document.createElement('p');aff.className='hint-text';aff.style.marginTop='8px';$('#streakSub').after(aff);
window.renderStreak=function(){const n=streakData.count,t=localDay(),h=$('#streakHeadline'),s=$('#streakSub');$('#streakFlame').textContent=n>=7?'🔥':n>=3?'✨':'🌱';
  if(!n){h.textContent='No check-ins yet';s.textContent="Complete any technique below and it counts — there's no penalty for a quiet day."}
  else if(streakData.lastCheckIn===t){h.textContent=n+'-day check-in streak';s.textContent='Nice work showing up for yourself today.'}
  else{h.textContent=n+'-day streak so far';s.textContent="Whenever you're ready today, one technique keeps it going. No pressure either way."}
  $('#streakLongest').textContent='Longest streak: '+streakData.longest+' day'+(streakData.longest===1?'':'s');
  aff.textContent='✨ '+AFF[Math.floor(Date.now()/864e5)%AFF.length]};
$$('.gender-btn').forEach(b=>b.classList.remove('sound-btn'));
const _gs=groundStep,saved=$('#groundSteps').innerHTML;
window.groundStep=function(d){_gs(d);const b=$('#groundNextBtn');if(b.textContent==='Restart')b.onclick=()=>{$('#groundSteps').innerHTML=saved;groundIdx=0;$$('.ground-dots span').forEach((e,i)=>e.classList.toggle('on',i===0));b.textContent='Done';b.onclick=()=>groundStep(1)}};
function entry(kind,i,meta,body){const d=document.createElement('div');d.className='entry';d.innerHTML=`<button type="button" class="del" aria-label="Delete" onclick="delete${kind}(${i})">✕</button><div class="meta">${meta}</div>${body}`;return d}
const fmt=t=>new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
window.renderJournal=function(){const el=$('#journalEntries');el.innerHTML='';journalEntries.forEach((e,i)=>el.appendChild(entry('Journal',i,fmt(e.time)+' · '+esc(e.prompt),esc(e.text))))};
window.renderReframe=function(){const el=$('#reframeEntries');el.innerHTML='';reframeEntries.forEach((e,i)=>el.appendChild(entry('Reframe',i,fmt(e.time)+(e.tags.length?' · '+e.tags.join(', '):''),'<strong>Thought:</strong> '+esc(e.thought)+'<br><strong>Reframe:</strong> '+esc(e.answer))))};
const _pp=primePhase;window.primePhase=function(){_pp();if(breathing.running&&navigator.vibrate)navigator.vibrate(40)};

/* ---------- Sync merge (32) + extra state ---------- */
const un=(a,b,k,dir)=>{const m=new Map();[...(a||[]),...(b||[])].forEach(e=>{const x=k(e);if(!m.has(x))m.set(x,e)});return [...m.values()].sort((p,q)=>dir*(new Date(p.time)-new Date(q.time)))};
const _cs=collectState;window.collectState=function(){const s=_cs();s.moodLog.forEach((e,i)=>{e.tags=(moodLog[i]&&moodLog[i].tags)||[]});s.ladder=ladder;return s};
const _as=applyState;window.applyState=function(s){
  if(!s)return;const l=collectState();
  const m={streak:(s.streak&&(s.streak.lastCheckIn||'')>(l.streak.lastCheckIn||''))?{...s.streak,longest:Math.max(s.streak.longest||0,l.streak.longest||0)}:{...l.streak,longest:Math.max(l.streak.longest||0,(s.streak||{}).longest||0)},
    badges:[...new Set([...(l.badges||[]),...(s.badges||[])])],
    symptomLog:un(l.symptomLog,s.symptomLog,e=>e.time+e.symptom,-1),
    journalEntries:un(l.journalEntries,s.journalEntries,e=>e.time+e.text,-1),
    reframeEntries:un(l.reframeEntries,s.reframeEntries,e=>e.time+e.thought,-1),
    moodLog:un(l.moodLog,s.moodLog,e=>e.time+e.v,1)};
  _as(m);moodLog.forEach((x,i)=>x.tags=m.moodLog[i].tags||[]);renderMoodChart();
  const seen=new Set(ladder.map(x=>x.id));(s.ladder||[]).forEach(x=>{if(!seen.has(x.id))ladder.push(x)});LS.s('steady_ladder',JSON.stringify(ladder));drawLadder();
};
BADGES.explorer={icon:'🧰',label:'Explorer',desc:'Finished one of the extra techniques'};
BADGES.climber={icon:'🪜',label:'Climber',desc:'Completed an exposure ladder step'};
renderBadges();renderStreak();renderMoodChart();renderJournal();renderReframe();

/* ---------- Toolkit cards ---------- */
TECHNIQUES.more={title:'More techniques',icon:'🧰',blurb:'Defusion, worry tree, self-compassion, sleep wind-down and more.',target:'moretech'};
TECHNIQUES.ladder={title:'Exposure ladder',icon:'🪜',blurb:'Face avoided things gradually, one small step at a time.',target:'ladder'};
SYMPTOMS.forEach(s=>{if(/thoughts|worry|panic|sleep|edge|detached|wired|concentrat|restless/i.test(s.name))s.tags.push('more');if(/avoiding/i.test(s.name))s.tags.push('ladder')});
renderToolkit();

/* ---------- Sounds: sleep timer (27) ---------- */
let slT=null;const sl=document.createElement('div');sl.className='vol-row';sl.innerHTML='<label for="sleepT" style="font-size:.85rem;color:var(--ink-soft)">Sleep timer</label><select id="sleepT" style="padding:8px;border-radius:10px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink)"><option value="0">Off</option><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min</option></select>';
$('.vol-row').after(sl);$('#sleepT').onchange=e=>{clearTimeout(slT);const m=+e.target.value;if(m)slT=setTimeout(()=>{setSound('off');e.target.value='0'},m*6e4)};

/* ---------- Settings, privacy, reminders (16, 20, 25) ---------- */
sec('settings',true,'<div class="eyebrow">You</div><h3>Settings & privacy</h3><div class="set-row"><label><input type="checkbox" id="sLow"> Low-stimulation mode (no animation, muted colours)</label></div><div class="set-row"><label><input type="checkbox" id="sBig"> Larger text</label></div><div class="set-row"><label>Your name <input type="text" id="sName" class="tin" style="width:180px;margin:0"></label></div><div class="set-row"><label><input type="checkbox" id="sRem"> Daily reminder at</label><input type="time" id="sRemT" style="padding:8px;border-radius:10px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink)"></div><p class="hint-text">Reminders work while Steady is open or installed on your device; for guaranteed alerts when the app is closed, a server push service is needed.</p><div class="set-row" style="margin-top:18px"><button type="button" class="btn btn-ghost btn-sm" id="sExp">Download my data (JSON)</button><button type="button" class="btn btn-rose btn-sm" id="sDel">Delete all my data</button></div>');
$('#sLow').checked=LS.g('steady_low','0')==='1';$('#sBig').checked=LS.g('steady_big','0')==='1';$('#sName').value=LS.g('steady_name','');$('#sRem').checked=LS.g('steady_rem','0')==='1';$('#sRemT').value=LS.g('steady_rem_t','20:00');
$('#sLow').onchange=e=>{LS.s('steady_low',e.target.checked?'1':'0');applyPrefs()};
$('#sBig').onchange=e=>{LS.s('steady_big',e.target.checked?'1':'0');applyPrefs()};
$('#sName').onchange=e=>{const v=e.target.value.trim();LS.s('steady_name',v);STEADY.setName&&STEADY.setName(v);greet()};
$('#sRemT').onchange=e=>LS.s('steady_rem_t',e.target.value);
$('#sRem').onchange=async e=>{if(e.target.checked&&'Notification' in window){const p=await Notification.requestPermission();if(p!=='granted'){e.target.checked=false;alert('Notifications are blocked for this site.');return}}LS.s('steady_rem',e.target.checked?'1':'0')};
setInterval(()=>{if(LS.g('steady_rem','0')!=='1'||!('Notification' in window)||Notification.permission!=='granted')return;const n=new Date();if(pad(n.getHours())+':'+pad(n.getMinutes())===LS.g('steady_rem_t','20:00')&&LS.g('steady_rem_d','')!==localDay()){LS.s('steady_rem_d',localDay());const b='Take a minute for a check-in. One small technique counts.';navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification('Steady',{body:b,icon:'icon-192.png'})):new Notification('Steady',{body:b})}},20000);
$('#sExp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(collectState(),null,2)],{type:'application/json'}));a.download='steady-data.json';a.click()};
$('#sDel').onclick=()=>{if(!confirm('Delete all journal entries, reframes, mood logs, badges and streaks? This also clears your cloud copy and cannot be undone.'))return;
  journalEntries=[];reframeEntries=[];moodLog=[];symptomLog=[];ladder=[];earnedBadges=new Set();streakData={count:0,longest:0,lastCheckIn:null};
  try{localStorage.removeItem('steady_state_v1');localStorage.removeItem('steady_ladder')}catch(e){}
  renderJournal();renderReframe();renderMoodChart();renderStreak();renderBadges();renderPatterns();drawLadder();STEADY.onWipe&&STEADY.onWipe();persist();alert('Your data has been deleted.')};

/* ---------- Greeting (name now lives in the synced profile, see steady-insights.js) ---------- */
function greet(){const n=(STEADY.name&&STEADY.name())||LS.g('steady_name','')||((currentUser&&currentUser.displayName)||'').split(' ')[0];const e=$('.hero .eyebrow');if(e)e.textContent=n?'Welcome back, '+n:'A companion for anxious moments'}
STEADY.greet=greet;

/* ---------- Offline / PWA (23) ---------- */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
