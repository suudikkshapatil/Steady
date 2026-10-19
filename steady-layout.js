/* Steady layout upgrade. Load AFTER steady-upgrade.js:
   <script src="steady-upgrade.js"></script>
   <script src="steady-layout.js"></script> */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
if(!window.STEADY){console.error('steady-layout: load steady-upgrade.js first');return}
const esc=s=>escapeHtml(String(s)),TECH=STEADY.TECH;

/* ---------- CSS ---------- */
const st=document.createElement('style');st.textContent=`
.tk-bar{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:thin}
.tk-chip{flex:0 0 auto;background:var(--card);border:1.5px solid var(--line);border-radius:999px;padding:9px 16px;font-size:.84rem;font-weight:600;color:var(--ink);white-space:nowrap;position:relative}
.tk-chip.on{background:var(--sage-deep);color:#F5F1E7;border-color:var(--sage-deep)}
.tk-chip.fy::after{content:'';position:absolute;top:5px;right:7px;width:7px;height:7px;border-radius:50%;background:var(--gold)}
[data-theme=dark] .tk-chip.on{background:#4d6b50;border-color:#4d6b50}
.slide{display:none}.slide.on{display:block;animation:sIn .35s ease}
@keyframes sIn{from{opacity:0;transform:translateX(calc(var(--dir,1)*40px))}to{opacity:1;transform:none}}
.slide-nav{display:flex;justify-content:space-between;gap:10px;margin-top:18px}
.slide-nav button:disabled{opacity:.4;cursor:default}
#stage .next-row{display:none}#stage .tool-panel{margin-top:0}
.fgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:16px 0}
.fblock{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius-sm);padding:20px 14px;min-height:98px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--ink);font-size:.98rem;box-shadow:var(--shadow-sm);transition:.18s}
.fblock:hover{transform:translateY(-2px);border-color:var(--sage-soft)}
.fblock span{font-size:1.7rem}
.fblock.on{border-color:var(--sage-deep);box-shadow:0 0 0 2px var(--sage-soft) inset}
.fq{font-size:1.2rem;margin:22px 0 0}
#drawer{position:fixed;top:0;left:0;bottom:0;width:280px;max-width:84vw;background:var(--card);z-index:90;transform:translateX(-100%);transition:transform .28s;padding:18px;display:flex;flex-direction:column;gap:4px;box-shadow:var(--shadow);overflow-y:auto}
#drawer.open{transform:none}
#scrim{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:85;display:none}#scrim.open{display:block}
.dr-link{display:flex;gap:12px;align-items:center;background:none;border:none;padding:12px;border-radius:12px;font-size:.95rem;font-weight:600;color:var(--ink);text-align:left}
.dr-link:hover{background:var(--card-warm)}
.dr-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-family:var(--font-display);font-size:1.2rem}
.navlink.on{color:var(--ink);border-color:var(--sage-deep)}
#symptoms{scroll-margin-top:64px}
@media (max-width:520px){.fgrid{gap:10px}}
`;document.head.appendChild(st);

/* ---------- Tool registry ---------- */
const ORDER=['breathing','grounding','pmr','bodyscan','journal','reframe','movement','sounds',...TECH.map(t=>t.id),'ladder'];
const META={};Object.entries(TECHNIQUES).forEach(([k,t])=>META[k]={i:t.icon,t:t.title});TECH.forEach(t=>META[t.id]={i:t.i,t:t.t});
const SRC={breathing:'breathing',grounding:'grounding',pmr:'pmr',bodyscan:'bodyscan',journal:'journal',reframe:'reframe',movement:'movement',sounds:'sounds-section',ladder:'ladder'};
const SUB={defuse:'Step back from a sticky thought so it loosens its grip.',worry:'Sort worries into "act on it" or "park it".',sigh:'The fastest breathing reset for sudden panic.',safe:'Visit a calm place in your mind.',good:'Shift attention to what went okay today.',kind:'Talk to yourself the way you would to a friend.',hug:'Gentle alternating taps to settle your body.',neck:'Release the places anxiety likes to hide.',stop:'A 30-second pause to name what you feel.',sleep:'Wind down so your mind can let go of the day.',walk:'Slow, mindful steps that pull you out of your head.',nostril:'A calming yogic breath that balances and slows you.',wave:'Let urges and fear rise and fall without acting on them.',observe:'Rest your attention on one real object in front of you.',mantra:'A short kind phrase to steady you, breath by breath.',tiny:'Shrink a stuck task into one two-minute step.',bee:'A gentle hum that slows the breath and settles the body.'};

/* ---------- Which feeling suggests which tools ---------- */
const XT={'Trouble falling asleep':['sleep','safe'],'Racing or pounding heart':['sigh','hug'],'Racing, spiraling thoughts':['defuse','worry','stop'],'Tight chest / short of breath':['sigh'],'Muscle tension or aches':['neck','kind'],"Restless, can't sit still":['neck','hug'],'Trouble concentrating':['stop','worry'],'On edge / irritable':['stop','kind'],'Sweating or hot flashes':['sigh'],'Upset stomach / nausea':['hug','sigh'],'Avoiding people or places':['ladder','kind','defuse'],'Sudden panic or dread':['sigh','hug','safe'],'Stuck on the same worry':['worry','defuse'],'Tired but wired':['sleep','neck','good'],'Feeling detached / unreal':['stop','hug'],'Worrying about the future':['worry','good','defuse']};

const NEWSYM={'Trembling or shaking':['sigh','pmr','grounding'],'Dizzy or lightheaded':['breathing','grounding','observe'],'Headache or tight head':['neck','pmr','nostril'],'Numbness or tingling':['breathing','grounding','bee'],'Dry mouth or lump in throat':['sigh','bee','neck'],'Chest pain or pressure (new or severe? see a doctor)':['breathing','sigh','grounding'],'Fatigue or exhaustion':['walk','bodyscan','kind'],'Stomach cramps or frequent toilet trips':['hug','breathing','bodyscan'],'Clenching jaw or grinding teeth':['neck','pmr','bee'],'Easily startled or jumpy':['grounding','observe','sigh'],'Mind going blank':['grounding','observe','stop'],'Intrusive or unwanted thoughts':['defuse','wave','observe'],'Imagining the worst':['reframe','defuse','worry'],'Replaying the past':['defuse','worry','walk'],"Can't make decisions":['worry','stop','tiny'],'Fear of losing control or dying':['sigh','grounding','mantra','safe'],'Perfectionism or fear of mistakes':['kind','reframe','mantra'],'Constant health worries':['worry','reframe','stop'],'Overwhelmed':['stop','tiny','sigh','kind'],'Tearful or about to cry':['hug','kind','bee'],'Sense of doom':['mantra','grounding','sigh'],'Low mood or hopeless':['tiny','walk','good','kind'],'Guilt or harsh self-criticism':['kind','reframe','mantra'],'Lonely or isolated':['kind','good','tiny'],'Procrastinating or frozen':['tiny','stop','wave'],'Needing constant reassurance':['wave','defuse','worry'],'Nail-biting, fidgeting or pacing':['movement','hug','neck'],'Withdrawing from friends':['ladder','tiny','kind'],'Over-checking or over-preparing':['worry','wave','reframe'],'Waking at night anxious':['sleep','bodyscan','bee'],'Nightmares or night-time panic':['sigh','safe','grounding'],'Fear of speaking up or being judged':['reframe','ladder','mantra','sigh'],'Blushing or sweating around people':['sigh','mantra','reframe'],'Exam or performance nerves':['nostril','sigh','mantra','stop'],'Panic in crowds, travel or enclosed spaces':['sigh','grounding','ladder'],'Jittery after caffeine or skipped meals':['walk','sigh','nostril']};
Object.entries(NEWSYM).forEach(([n,t])=>{SYMPTOMS.push({name:n,tags:[]});XT[n]=t});
Object.entries({'Racing or pounding heart':['bee','nostril'],'Trouble concentrating':['observe'],"Restless, can't sit still":['walk'],'Tired but wired':['walk','bee'],'Worrying about the future':['mantra'],'Sudden panic or dread':['mantra'],'Feeling detached / unreal':['observe'],'On edge / irritable':['nostril']}).forEach(([n,t])=>XT[n]=(XT[n]||[]).concat(t));
SYMPTOMS.forEach(s=>(XT[s.name]||[]).forEach(k=>{if(!s.tags.includes(k))s.tags.push(k)}));
const SY=SYMPTOMS.map(s=>s.name);
const matched=()=>{const m=new Set();selectedSymptoms.forEach(i=>SYMPTOMS[i].tags.forEach(t=>{if(ORDER.includes(t))m.add(t)}));return m};

/* ---------- Views ---------- */
function pauseAll(){try{if(breathing.running)toggleBreathing();if(pmr.running)togglePmr();if(scan.running)toggleScan();if(move.running)toggleMoveTimer()}catch(e){}if(window.speechSynthesis)speechSynthesis.cancel()}
let curView='home';function showView(v,keep){pauseAll();curView=v;$$('[data-view]').forEach(e=>e.style.display=e.dataset.view.split(' ').includes(v)?'':'none');$$('.navlink[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));closeDrawer();if(!keep)window.scrollTo({top:0,behavior:'smooth'});window.STEADY&&STEADY.onView&&STEADY.onView(v)}
[['.hero','home'],['#streaks','patterns'],['#symptoms','home'],['#tracker','mood'],['#patterns','patterns'],['#crisis','crisis'],['#settings','settings']].forEach(([s,v])=>{const e=$(s);if(e)e.dataset.view=v});
$('#settings h3').textContent='Customize & privacy';$('#patterns').after($('#streaks'));

/* ---------- Toolkit stage: horizontal slides ---------- */
const stage=document.createElement('section');stage.id='stage';stage.dataset.view='toolkit';
stage.innerHTML='<div class="wrap"><div class="section-head" style="margin-bottom:14px"><div class="eyebrow">Your toolkit</div><h2>Pick a tool, or swipe through</h2></div><div class="tk-bar" id="tkBar" role="tablist" aria-label="Techniques"></div><div class="set-row" id="tkFilter" style="margin:6px 0 18px"></div><div id="track"></div></div>';
$('footer').parentNode.insertBefore(stage,$('footer'));
ORDER.forEach(k=>{
  const s=document.createElement('div');s.className='slide';s.dataset.key=k;
  if(SRC[k]){const sec=$('#'+SRC[k]),c=sec&&sec.querySelector('.card');if(c)s.appendChild(c);if(sec)sec.style.display='none'}
  else{const t=TECH.find(x=>x.id===k);s.innerHTML=`<div class="card tool-panel"><div class="eyebrow">Technique</div><h3>${t.i} ${t.t}</h3><p class="panel-sub">${SUB[k]} Tap 🔊 on any step to hear it, or switch on voice guidance (speaker icon, top bar) to hear steps automatically.</p><div class="tb-slot"></div></div>`}
  s.insertAdjacentHTML('beforeend','<div class="slide-nav"><button type="button" class="btn btn-ghost btn-sm" data-nav="-1">‹ Previous</button><button type="button" class="btn btn-primary btn-sm" data-nav="1">Next technique ›</button></div>');
  $('#track').appendChild(s);
});
['moretech','toolkit'].forEach(id=>{const e=$('#'+id);if(e)e.style.display='none'});
$('#groundNextBtn').textContent='Done';
const _g=groundStep;window.groundStep=function(d){_g(d);const t=$('.ground-step.active .ground-title')||$('#groundSteps .ground-title');if(t)speak(t.textContent)};

let curKey=null,onlyMine=false;
let ctxTools=null,sortMode='default';
const vis=()=>{const m=matched();let l=ctxTools?ctxTools.slice():(onlyMine&&m.size?ORDER.filter(k=>m.has(k)):ORDER.slice());const st=(STEADY.stats&&STEADY.stats())||{},g=k=>st[k]||{},sc=k=>{let n=0;selectedSymptoms.forEach(i=>{if(SYMPTOMS[i].tags.includes(k))n++});return n};
if(sortMode==='az')l.sort((a,b)=>META[a].t.localeCompare(META[b].t));else if(sortMode==='sug')l.sort((a,b)=>sc(b)-sc(a)||ORDER.indexOf(a)-ORDER.indexOf(b));else if(sortMode==='best')l.sort((a,b)=>(g(b).avg||0)-(g(a).avg||0)||(g(b).uses||0)-(g(a).uses||0));else if(sortMode==='used')l.sort((a,b)=>(g(b).uses||0)-(g(a).uses||0));
return l};
const guard=fn=>{if(curView==='toolkit'&&curKey&&STEADY.beforeLeave)STEADY.beforeLeave(fn);else fn()};
function nb(d){const v=vis(),i=v.indexOf(curKey);if(i>=0)return v[i+d];const c=ORDER.indexOf(curKey);return d>0?v.find(k=>ORDER.indexOf(k)>c):[...v].reverse().find(k=>ORDER.indexOf(k)<c)}
function step(d){const k=nb(d);if(k)guard(()=>openSlide(k,d));else if(d>0)(STEADY.finish?STEADY.finish():goToSection('tracker'))}
function updateNav(){const s=$('.slide.on');if(!s)return;s.querySelector('[data-nav="1"]').textContent=nb(1)?'Next technique ›':'Finish toolkit ✓';s.querySelector('[data-nav="-1"]').disabled=!nb(-1)}
function drawBar(){
  const m=matched(),v=vis();
  $('#tkBar').innerHTML=v.map(k=>`<button type="button" role="tab" class="tk-chip${k===curKey?' on':''}${m.has(k)?' fy':''}" data-k="${k}">${META[k].i} ${META[k].t}</button>`).join('');
  $('#tkFilter').innerHTML=m.size?`<label><input type="checkbox" id="tkOnly" ${onlyMine?'checked':''}> Only tools for my feelings (${m.size}) <span class="hint-text" style="margin:0">· gold dot = suggested for you</span></label>`:'<span class="hint-text" style="margin:0">Tip: tell Steady how you feel on the home page and suggested tools get a gold dot here.</span>';
  const a=$('#tkBar .on');if(a&&a.scrollIntoView)a.scrollIntoView({inline:'center',block:'nearest'});
}
function openSlide(k,dir){
  if(!META[k]||!ORDER.includes(k))return;
  const d=dir||(curKey&&ORDER.indexOf(k)<ORDER.indexOf(curKey)?-1:1);
  curKey=k;showView('toolkit');
  $$('.slide').forEach(s=>{const on=s.dataset.key===k;s.classList.toggle('on',on);if(on)s.style.setProperty('--dir',d)});
  if(!SRC[k]){$('.slide.on .tb-slot').appendChild($('#techBox'));STEADY.open(k)}
  drawBar();updateNav();STEADY.onOpen&&STEADY.onOpen(k);
}
$('#tkBar').onclick=e=>{const b=e.target.closest('.tk-chip');if(b&&b.dataset.k!==curKey)guard(()=>openSlide(b.dataset.k))};
$('#tkFilter').onchange=e=>{onlyMine=e.target.checked;drawBar();updateNav()};
$('#track').onclick=e=>{const b=e.target.closest('[data-nav]');if(b)step(+b.dataset.nav)};
let tx=0,ty=0;
$('#track').addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
$('#track').addEventListener('touchend',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2)step(dx<0?1:-1)},{passive:true});

const VMAP={symptoms:'home',streaks:'home',tracker:'mood',patterns:'patterns',crisis:'crisis',settings:'settings',mytk:'mytk'};
window.goToSection=function(id){
  if(id==='sounds-section')id='sounds';
  if(id==='toolkit')return curView==='toolkit'?0:openSlide(curKey||vis()[0]);
  if(ORDER.includes(id))return id===curKey&&curView==='toolkit'?0:guard(()=>openSlide(id));
  if(id==='symptoms')return guard(()=>{showView('home',true);setTimeout(()=>{const e=$('#symptoms');e&&e.scrollIntoView({behavior:'smooth',block:'start'})},90)});
  guard(()=>showView(VMAP[id]||'home'));
};

/* ---------- Feeling finder (guided Q&A or simple picker) ---------- */
const TREE=[
{l:'In my body',i:'🫀',c:[{l:'Heart, chest & breathing',i:'💓',c:['Racing or pounding heart','Tight chest / short of breath','Chest pain or pressure (new or severe? see a doctor)','Dizzy or lightheaded','Sudden panic or dread']},{l:'Shaky, numb or hot',i:'🌡️',c:['Trembling or shaking','Numbness or tingling','Sweating or hot flashes','Dry mouth or lump in throat','Easily startled or jumpy']},{l:'Muscles, head & jaw',i:'💪',c:['Muscle tension or aches','Headache or tight head','Clenching jaw or grinding teeth','On edge / irritable']},{l:'Stomach & gut',i:'🫃',c:['Upset stomach / nausea','Stomach cramps or frequent toilet trips']},{l:'Energy',i:'⚡',c:["Restless, can't sit still",'Tired but wired','Fatigue or exhaustion','Jittery after caffeine or skipped meals']}]},
{l:'In my mind',i:'🧠',c:[{l:'Spiralling thoughts',i:'🌀',c:['Racing, spiraling thoughts','Stuck on the same worry','Replaying the past','Intrusive or unwanted thoughts']},{l:'Fear of what is ahead',i:'🔮',c:['Worrying about the future','Imagining the worst','Constant health worries','Fear of losing control or dying']},{l:'Foggy or stuck',i:'🌫️',c:['Trouble concentrating','Mind going blank',"Can't make decisions",'Feeling detached / unreal']}]},
{l:'My feelings',i:'💛',c:[{l:'Heavy or overwhelmed',i:'🌊',c:['Overwhelmed','Sense of doom','Tearful or about to cry','Low mood or hopeless']},{l:'Hard on myself',i:'🪞',c:['Guilt or harsh self-criticism','Perfectionism or fear of mistakes','Lonely or isolated']}]},
{l:'Sleep',i:'🌙',c:[{l:'At bedtime',i:'🛌',c:['Trouble falling asleep','Racing, spiraling thoughts']},{l:'In the night',i:'🌌',c:['Waking at night anxious','Nightmares or night-time panic']}]},
{l:'People & situations',i:'🧍',c:[{l:'Around others',i:'👥',c:['Fear of speaking up or being judged','Blushing or sweating around people','Panic in crowds, travel or enclosed spaces']},{l:'Exams & big moments',i:'📝',c:['Exam or performance nerves','Worrying about the future']}]},
{l:'What I am doing',i:'🚪',c:[{l:'Avoiding or withdrawing',i:'🙈',c:['Avoiding people or places','Withdrawing from friends','Procrastinating or frozen']},{l:'Checking & seeking',i:'🔁',c:['Needing constant reassurance','Over-checking or over-preparing','Nail-biting, fidgeting or pacing']}]},
];
const FW=$('#symptoms .wrap');
FW.innerHTML='<span id="selectedCount" hidden></span><div class="section-head"><div class="eyebrow">Step one</div><h2>What are you noticing right now?</h2><p class="lede">No long list to read. Choose how you want to find it.</p></div><div class="breathe-row" id="fMode"><button type="button" class="pattern-btn" data-m="guide">🧭 Help me find it</button><button type="button" class="pattern-btn" data-m="pick">👆 I know what I feel</button></div><div id="fBody"></div><div id="fSel"></div>';
let mode='guide',path=[],cat=null;
const node=()=>{let n={c:TREE};path.forEach(i=>n=n.c[i]);return n};
function toggleSym(i){if(i<0)return;if(selectedSymptoms.has(i))selectedSymptoms.delete(i);else{selectedSymptoms.add(i);symptomLog.push({symptom:SY[i],time:new Date()});persist();renderPatterns()}drawFinder();drawBar()}
function drawFinder(){
  $$('#fMode button').forEach(b=>b.classList.toggle('active',b.dataset.m===mode));
  const B=$('#fBody'),blk=(ic,l,on,i)=>`<button type="button" class="fblock${on?' on':''}" data-i="${i}"><span>${ic}</span><b>${esc(l)}</b></button>`;
  if(mode==='guide'){
    const kids=node().c,leaf=typeof kids[0]==='string';
    B.innerHTML=`<h3 class="fq">${leaf?'Which of these fits? Tap all that apply.':path.length?'Which sounds closest?':'Where do you notice it most?'}</h3><div class="fgrid">${kids.map((k,i)=>leaf?blk(selectedSymptoms.has(SY.indexOf(k))?'✓':'○',k,selectedSymptoms.has(SY.indexOf(k)),i):blk(k.i,k.l,false,i)).join('')}</div>${path.length?'<button type="button" class="linkbtn" id="fBack">← Back</button>':''}`;
  }else{
    const lv=cat===null?[]:[...new Set(TREE[cat].c.flatMap(x=>x.c))];
    B.innerHTML=`<h3 class="fq">Tap a group, then what fits.</h3><div class="fgrid">${TREE.map((k,i)=>blk(k.i,k.l,cat===i,i)).join('')}</div>${lv.length?'<div class="chip-grid">'+lv.map(l=>{const i=SY.indexOf(l);return `<button type="button" class="chip${selectedSymptoms.has(i)?' selected':''}" data-s="${i}">${esc(l)}</button>`}).join('')+'</div>':''}`;
  }
  const S=$('#fSel'),m=matched();
  S.innerHTML=selectedSymptoms.size?`<div class="card" style="padding:22px;margin-top:22px"><div class="field-label">You're noticing</div><div class="chip-grid">${[...selectedSymptoms].map(i=>`<button type="button" class="chip selected" data-rm="${i}">${esc(SY[i])} ✕</button>`).join('')}</div><div class="field-label" style="margin-top:18px">Tools that can help</div><div class="chip-grid">${ORDER.filter(k=>m.has(k)).map(k=>`<button type="button" class="tk-chip fy" data-go="${k}">${META[k].i} ${META[k].t}</button>`).join('')}</div><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:20px"><button type="button" class="btn btn-primary btn-sm" id="fOpen">Start with my toolkit →</button><button type="button" class="linkbtn" id="fClear">Clear all</button></div></div>`:'';
}
FW.onclick=e=>{const c=s=>e.target.closest(s);let b;
  if(b=c('[data-m]')){mode=b.dataset.m;path=[];cat=null;drawFinder()}
  else if(b=c('.fblock')){const i=+b.dataset.i;if(mode==='pick'){cat=cat===i?null:i;drawFinder()}else{const kids=node().c;if(typeof kids[0]==='string')toggleSym(SY.indexOf(kids[i]));else{path.push(i);drawFinder()}}}
  else if(b=c('[data-s]'))toggleSym(+b.dataset.s);
  else if(c('#fBack')){path.pop();drawFinder()}
  else if(b=c('[data-rm]'))toggleSym(+b.dataset.rm);
  else if(b=c('[data-go]')){onlyMine=false;openSlide(b.dataset.go)}
  else if(c('#fOpen')){onlyMine=true;ctxTools=null;sortMode='sug';const v=vis();if(v[0]){STEADY.start&&STEADY.start('suggested','Suggested toolkit',v);openSlide(v[0])}}
  else if(c('#fClear')){selectedSymptoms.clear();drawFinder();drawBar()}};

/* ---------- Sidebar + top bar ---------- */
const LINKS=[['🧭','Find my feeling','symptoms'],['🧰','Toolkit','toolkit'],['🧩','My toolkits','mytk'],['📊','Mood tracker','tracker'],['📈','My patterns','patterns'],['🎧','Calming sounds','sounds-section'],['🆘','Get help now','crisis'],['⚙️','Customize','settings']];
const dr=document.createElement('aside');dr.id='drawer';dr.setAttribute('aria-label','Menu');
dr.innerHTML=`<div class="dr-head"><span>Steady</span><button type="button" class="icon-btn" id="drClose" aria-label="Close menu">✕</button></div>${LINKS.map(([i,t,g])=>`<button type="button" class="dr-link" data-g="${g}"><span>${i}</span>${t}</button>`).join('')}<hr style="width:100%;border:0;border-top:1px dashed var(--line)"><button type="button" class="dr-link" id="drOut"><span>↩</span>Sign out</button>`;
const sc=document.createElement('div');sc.id='scrim';
$('#appMain').append(dr,sc);
function openDrawer(){dr.classList.add('open');sc.classList.add('open')}
function closeDrawer(){dr.classList.remove('open');sc.classList.remove('open')}
dr.onclick=e=>{const b=e.target.closest('.dr-link');if(!b)return;if(b.id==='drOut'){closeDrawer();window.signOutGoogle&&signOutGoogle();return}goToSection(b.dataset.g)};
$('#drClose').onclick=closeDrawer;sc.onclick=closeDrawer;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
const hb=document.createElement('button');hb.type='button';hb.className='icon-btn';hb.textContent='☰';hb.setAttribute('aria-label','Open menu');hb.onclick=openDrawer;$('.brand').prepend(hb);
$$('.navlink').forEach(b=>{const m={Symptoms:'home',Toolkit:'toolkit',Mood:'mood','Help now':'crisis'}[b.textContent.trim()];if(m)b.dataset.v=m});
const cz=document.createElement('button');cz.type='button';cz.className='navlink';cz.dataset.v='settings';cz.textContent='Customize';cz.onclick=()=>goToSection('settings');$('.navlinks').appendChild(cz);

/* ---------- API for steady-insights.js ---------- */
STEADY.L={view:()=>curView,symptoms:()=>[...selectedSymptoms].map(i=>SY[i]),META,ORDER,blurb:k=>(TECHNIQUES[k]&&TECHNIQUES[k].blurb)||SUB[k]||'',setCtx:t=>{ctxTools=t;if(t)onlyMine=false},setSort:m=>{sortMode=m},sort:()=>sortMode,open:openSlide,showView,refresh:()=>{drawBar();updateNav()}};
/* ---------- Start ---------- */
drawFinder();drawBar();showView('home');
})();
