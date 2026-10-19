/* Steady insights: profile sync, usage tracking, benefit ratings, patterns, custom toolkits, PDF report.
   Load AFTER steady-layout.js:  <script src="steady-insights.js"></script> */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S=window.STEADY,L=S&&S.L;if(!L){console.error('steady-insights: load steady-layout.js first');return}
const esc=s=>escapeHtml(String(s)),pad=n=>String(n).padStart(2,'0');
const dkey=d=>{d=new Date(d);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const fmt=t=>new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
const nm=k=>(L.META[k]||{t:k}).t,ic=k=>(L.META[k]||{i:'•'}).i;
const FACE=['','😣','😕','😐','🙂','😌'],LAB=['','Not at all','A little','Somewhat','Quite a bit','A lot'];
let sessions=[],toolkits=[],profile={name:'',onb:false},cur=null,use=null;
try{const r=JSON.parse(localStorage.getItem('steady_state_v1')||'null');if(r){sessions=r.sessions||[];toolkits=r.toolkits||[];profile=Object.assign(profile,r.profile||{})}if(!profile.name)profile.name=localStorage.getItem('steady_name')||''}catch(e){}

/* ---------- CSS ---------- */
const st=document.createElement('style');st.textContent=`
.rt-b{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:84px;padding:12px 6px;border-radius:14px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink);font-size:.8rem}
.rt-b span{font-size:1.7rem}.rt-b:hover{border-color:var(--sage-deep)}
.pr{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:.88rem}.pn{width:170px;flex:none}.pb{flex:1;height:10px;background:var(--line);border-radius:9px;overflow:hidden}.pb i{display:block;height:100%;background:var(--sage-deep);border-radius:9px}.pb.rose i{background:var(--rose)}.pc{width:150px;flex:none;color:var(--ink-soft);font-size:.78rem;text-align:right}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:18px 0}.tile{background:var(--card-warm);border-radius:14px;padding:14px;text-align:center}.tile b{display:block;font-size:1.5rem;font-family:var(--font-display)}.tile small{color:var(--ink-soft)}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:26px;margin-top:10px}
.tkrow{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;width:100%;padding:12px 14px;margin:6px 0;border-radius:14px;border:1.5px solid var(--line);background:var(--card-warm);color:var(--ink)}.tkrow.on{border-color:var(--sage-deep);box-shadow:0 0 0 2px var(--sage-soft) inset}
.srow{border-top:1px dashed var(--line);padding:10px 0;font-size:.86rem}
@media(max-width:560px){.pn{width:110px}.pc{width:96px}}`;document.head.appendChild(st);

/* ---------- Persistence (adds sessions, toolkits, profile to the synced state) ---------- */
const _cs=window.collectState;window.collectState=function(){const s=_cs();s.sessions=sessions;s.toolkits=toolkits;s.profile=profile;return s};
const uni=(a,b,pick)=>{const m=new Map();[...(a||[]),...(b||[])].forEach(x=>{const o=m.get(x.id);m.set(x.id,o?pick(o,x):x)});return [...m.values()]};
const _as=window.applyState;window.applyState=function(s){
  _as(s);if(!s)return;
  sessions=uni(sessions,s.sessions,(o,x)=>(x.uses||[]).length>(o.uses||[]).length||(x.end&&!o.end)?x:o).sort((a,b)=>new Date(a.start)-new Date(b.start));
  toolkits=uni(toolkits,s.toolkits,(o,x)=>(x.upd||0)>(o.upd||0)?x:o);
  const p=s.profile||{};profile={name:p.name||profile.name||'',onb:!!(p.onb||profile.onb)};
  if(cur)cur=sessions.find(x=>x.id===cur.id)||cur;
  const n=$('#sName');if(n)n.value=profile.name;S.greet&&S.greet();
};
S.onWipe=()=>{sessions=[];toolkits=[];cur=null;use=null;drawBanner();drawP();drawMyTk()};

/* ---------- Name: stored in the synced profile, asked at most once ---------- */
S.name=()=>profile.name||((window.currentUser&&currentUser.displayName)||'').split(' ')[0]||'';
S.setName=v=>{profile.name=v;profile.onb=true;persist();S.greet&&S.greet()};
function onboard(){
  const o=document.createElement('div');o.className='ov';o.setAttribute('role','dialog');
  o.innerHTML='<div class="ov-in"><h2 style="font-size:1.8rem">Welcome to Steady</h2><p class="lede">What should I call you? You will only be asked once.</p><input type="text" class="tin" id="obName" placeholder="Your name" aria-label="Your name"><div style="display:flex;gap:10px"><button type="button" class="btn btn-primary" id="obGo">Save</button><button type="button" class="btn btn-ghost" id="obSkip">Skip</button></div></div>';
  document.body.appendChild(o);const done=v=>{profile.onb=true;if(v)profile.name=v;persist();o.remove();S.greet&&S.greet();const n=$('#sName');if(n)n.value=profile.name};
  $('#obGo').onclick=()=>done($('#obName').value.trim());$('#obSkip').onclick=()=>done('');
}
function afterLoad(){const n=$('#sName');if(n)n.value=profile.name;S.greet&&S.greet();if(profile.onb||S.name()){if(!profile.onb){profile.onb=true;persist()}return}onboard()}
const _oa=window.onSteadyAuthChange;
window.onSteadyAuthChange=async function(u){try{await _oa(u)}finally{if(u)afterLoad()}};
const dw=setInterval(()=>{if(window.steadyFirebaseReady===false&&$('#appMain').style.display==='block'){clearInterval(dw);afterLoad()}},700);

/* ---------- Stats ---------- */
function uses(from,to){const o=[];sessions.forEach(s=>(s.uses||[]).forEach(u=>{const t=new Date(u.at);if((!from||t>=from)&&(!to||t<=to))o.push(Object.assign({s},u))}));return o}
S.stats=(from,to)=>{const m={};uses(from,to).forEach(u=>{const x=m[u.tool]=m[u.tool]||{uses:0,rounds:0,n:0,sum:0};x.uses++;x.rounds+=u.rounds||0;if(u.rating){x.n++;x.sum+=u.rating}});Object.values(m).forEach(x=>x.avg=x.n?x.sum/x.n:0);return m};

/* ---------- Sessions & uses ---------- */
function startSession(kind,name,tools,extra){endSession();cur=Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),start:new Date().toISOString(),kind,name,symptoms:L.symptoms(),suggested:(tools||[]).slice(),uses:[]},extra||{});cur.last=cur.start;sessions.push(cur);persist();drawBanner()}
function endSession(){if(cur){cur.end=new Date().toISOString();cur=null;persist()}drawBanner()}
S.start=startSession;
S.onOpen=k=>{use={tool:k,t0:Date.now(),rounds:0,touched:false}};
function touch(){if(!use||use.touched)return;use.touched=true;if(cur&&Date.now()-new Date(cur.last)>108e5)endSession();if(!cur)startSession('browse','Browsing tools',[])}
const trk=$('#track');['click','input'].forEach(ev=>trk.addEventListener(ev,e=>{if(!e.target.closest('[data-nav]'))touch()},true));
const _rc=window.registerCheckIn;window.registerCheckIn=function(){if(use&&L.view()==='toolkit'){touch();use.rounds++}return _rc.apply(this,arguments)};
function save(u,r){if(!cur)startSession('browse','Browsing tools',[]);cur.uses.push({tool:u.tool,at:new Date(u.t0).toISOString(),secs:Math.round((Date.now()-u.t0)/1e3),rounds:u.rounds,rating:r||null});cur.last=new Date().toISOString();persist()}
function ask(u,fn){
  const o=document.createElement('div');o.className='ov';o.setAttribute('role','dialog');
  o.innerHTML=`<div class="ov-in"><h2 style="font-size:1.5rem">${ic(u.tool)} How much did ${esc(nm(u.tool))} help?</h2><div style="display:flex;gap:8px;flex-wrap:wrap;width:100%">${[1,2,3,4,5].map(n=>`<button type="button" class="rt-b" data-r="${n}"><span>${FACE[n]}</span>${LAB[n]}</button>`).join('')}</div><button type="button" class="linkbtn" data-r="0">Skip</button></div>`;
  document.body.appendChild(o);o.onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;o.remove();save(u,+b.dataset.r);fn()};
}
S.beforeLeave=fn=>{if(!use||!(use.touched||use.rounds)){use=null;fn();return}const u=use;use=null;ask(u,fn)};
S.finish=()=>S.beforeLeave(()=>{const c=cur;endSession();L.setCtx(null);L.setSort('default');summary(c)});
function summary(c){
  const us=(c&&c.uses)||[],r=us.filter(u=>u.rating),avg=r.length?(r.reduce((a,u)=>a+u.rating,0)/r.length).toFixed(1):null;
  const o=document.createElement('div');o.className='ov';o.setAttribute('role','dialog');
  o.innerHTML=`<div class="ov-in"><div style="font-size:2.4rem">🌿</div><h2 style="font-size:1.6rem">Toolkit finished</h2><p class="lede" style="margin:0">${us.length?us.map(u=>`${ic(u.tool)} ${esc(nm(u.tool))}${u.rounds?' ×'+u.rounds:''} ${u.rating?FACE[u.rating]:''}`).join('<br>')+(avg?`<br><b>Average benefit ${avg}/5</b>`:''):'Well done for showing up for yourself.'}</p><p class="lede" style="margin:0">How anxious do you feel now? Logging it shows whether this toolkit moved the needle.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn-primary" id="smMood">Track my mood →</button><button type="button" class="btn btn-ghost" id="smHome">Not now</button></div></div>`;
  document.body.appendChild(o);$('#smMood').onclick=()=>{o.remove();goToSection('tracker')};$('#smHome').onclick=()=>{o.remove();L.showView('home')};
}

/* ---------- Toolkit controls: sort, banner, finish, my toolkits ---------- */
const ctl=document.createElement('div');ctl.className='set-row';ctl.id='tkCtl';
ctl.innerHTML='<label>Sort <select id="tkSort" class="tin" style="width:auto;margin:0;padding:8px"><option value="default">Default order</option><option value="sug">Suggested for me first</option><option value="best">Most helpful to me</option><option value="used">Most used</option><option value="az">A to Z</option></select></label><button type="button" class="btn btn-ghost btn-sm" id="tkMine">🧩 My toolkits</button><button type="button" class="btn btn-primary btn-sm" id="tkFin">✓ Finish toolkit</button><span class="hint-text" id="tkBan" style="margin:0"></span>';
$('#tkFilter').after(ctl);
$('#tkSort').onchange=e=>{L.setSort(e.target.value);L.refresh()};
$('#tkMine').onclick=()=>goToSection('mytk');$('#tkFin').onclick=()=>S.finish();
function drawBanner(){const b=$('#tkBan');if(b)b.textContent=cur?'In progress: '+cur.name+' · started '+new Date(cur.start).toLocaleTimeString([],{timeStyle:'short'}):'';const s=$('#tkSort');if(s)s.value=L.sort()}

/* ---------- Custom toolkits ---------- */
const mt=document.createElement('section');mt.id='mytk';mt.dataset.view='mytk';mt.style.display='none';
mt.innerHTML='<div class="wrap"><div class="section-head"><div class="eyebrow">Yours</div><h2>My toolkits</h2><p class="lede">Build as many toolkits as you like, name them, and start one any time. Their use is tracked like any other toolkit.</p></div><div id="mtList"></div><div class="card tool-panel" id="mtEd"></div></div>';
$('footer').parentNode.insertBefore(mt,$('footer'));
let ed={id:'',name:'',tools:[]};
function drawMyTk(){
  const live=toolkits.filter(t=>!t.del);
  $('#mtList').innerHTML=live.map(t=>{const cs=sessions.filter(s=>s.tkid===t.id),r=cs.flatMap(s=>s.uses).filter(u=>u.rating),a=r.length?(r.reduce((x,u)=>x+u.rating,0)/r.length).toFixed(1):'–';
    return `<div class="card" style="padding:18px 22px;margin-bottom:12px"><b>${esc(t.name)}</b><div class="hint-text">${t.tools.map(ic).join(' ')} · ${t.tools.length} tools · used ${cs.length}× · average benefit ${a}</div><div class="set-row" style="margin:12px 0 0"><button type="button" class="btn btn-primary btn-sm" data-a="start" data-id="${t.id}">Start</button><button type="button" class="btn btn-ghost btn-sm" data-a="edit" data-id="${t.id}">Edit</button><button type="button" class="btn btn-rose btn-sm" data-a="del" data-id="${t.id}">Delete</button></div></div>`}).join('')||'<p class="hint-text" style="margin-bottom:16px">No toolkits yet. Build your first one below.</p>';
  $('#mtEd').innerHTML=`<h3>${ed.id?'Edit toolkit':'New toolkit'}</h3><input type="text" class="tin" id="mtName" placeholder="Name, e.g. Before exams" value="${esc(ed.name)}"><div class="field-label">Browse every tool, tap to add or remove</div>${L.ORDER.map(k=>`<button type="button" class="tkrow${ed.tools.includes(k)?' on':''}" data-pick="${k}"><b>${ic(k)} ${esc(nm(k))}${ed.tools.includes(k)?' ✓':''}</b><span class="hint-text" style="margin:0">${esc(L.blurb(k))}</span></button>`).join('')}<div class="field-label" style="margin-top:16px">Order (${ed.tools.length} chosen)</div>${ed.tools.map((k,i)=>`<div class="set-row" style="margin:4px 0"><span style="flex:1">${i+1}. ${ic(k)} ${esc(nm(k))}</span><button type="button" class="btn btn-ghost btn-sm" data-mv="${i}:-1" aria-label="Move up">▲</button><button type="button" class="btn btn-ghost btn-sm" data-mv="${i}:1" aria-label="Move down">▼</button><button type="button" class="btn btn-ghost btn-sm" data-pick="${k}" aria-label="Remove">✕</button></div>`).join('')}<div class="set-row" style="margin-top:16px"><button type="button" class="btn btn-primary btn-sm" id="mtSave">Save toolkit</button>${ed.id||ed.tools.length?'<button type="button" class="btn btn-ghost btn-sm" id="mtCancel">Clear</button>':''}</div>`;
}
mt.addEventListener('input',e=>{if(e.target.id==='mtName')ed.name=e.target.value});
mt.addEventListener('click',e=>{const c=s=>e.target.closest(s);let b;
  if(b=c('[data-pick]')){const k=b.dataset.pick,i=ed.tools.indexOf(k);i<0?ed.tools.push(k):ed.tools.splice(i,1);drawMyTk()}
  else if(b=c('[data-mv]')){const[i,d]=b.dataset.mv.split(':').map(Number),j=i+d;if(j>=0&&j<ed.tools.length){[ed.tools[i],ed.tools[j]]=[ed.tools[j],ed.tools[i]];drawMyTk()}}
  else if(c('#mtSave')){ed.name=($('#mtName').value||'').trim();if(!ed.name||!ed.tools.length){alert('Give your toolkit a name and pick at least one tool.');return}
    const t={id:ed.id||Date.now().toString(36),name:ed.name,tools:ed.tools.slice(),upd:Date.now()};toolkits=toolkits.filter(x=>x.id!==t.id).concat(t);ed={id:'',name:'',tools:[]};persist();drawMyTk()}
  else if(c('#mtCancel')){ed={id:'',name:'',tools:[]};drawMyTk()}
  else if(b=c('[data-a]')){const t=toolkits.find(x=>x.id===b.dataset.id);if(!t)return;
    if(b.dataset.a==='edit'){ed={id:t.id,name:t.name,tools:t.tools.slice()};drawMyTk();$('#mtEd').scrollIntoView({behavior:'smooth'})}
    else if(b.dataset.a==='del'){if(confirm('Delete "'+t.name+'"? Past usage stays in your patterns.')){t.del=true;t.upd=Date.now();persist();drawMyTk()}}
    else{L.setCtx(t.tools.slice());L.setSort('default');startSession('custom',t.name,t.tools,{tkid:t.id});L.open(t.tools[0])}}});

/* ---------- Patterns dashboard with date range ---------- */
const pw=$('#patterns .wrap');
pw.innerHTML='<div class="section-head"><div class="eyebrow">Over time</div><h2>Your patterns</h2><p class="lede">Choose a time window to see what you felt, which toolkits you used and which tools help you most.</p></div><div class="card" style="padding:30px 32px"><div class="set-row"><label>From <input type="date" id="pFrom" class="tin" style="width:auto;margin:0"></label><label>To <input type="date" id="pTo" class="tin" style="width:auto;margin:0"></label><button type="button" class="btn btn-ghost btn-sm" data-p="7">7 days</button><button type="button" class="btn btn-ghost btn-sm" data-p="30">30 days</button><button type="button" class="btn btn-ghost btn-sm" data-p="90">90 days</button><button type="button" class="btn btn-ghost btn-sm" data-p="0">All time</button></div><div id="pDash"></div><div id="patternsEmpty" hidden></div><div id="patternsGrid" hidden><div id="topSymptoms"></div><div id="timeOfDay"></div></div><div style="margin-top:26px;padding-top:20px;border-top:1px dashed var(--line)"><button type="button" class="btn btn-ghost btn-sm" onclick="exportSummary()">📄 Download report (PDF) for this window</button><p class="hint-text" style="margin-top:10px">The report uses the dates chosen above. If PDF download is unavailable it opens your print dialog instead.</p></div></div>';
const setR=(f,t)=>{$('#pFrom').value=f;$('#pTo').value=t;drawP()};
const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return dkey(d)};
pw.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const n=+b.dataset.p;setR(n?ago(n):'2020-01-01',dkey(new Date()))});
pw.addEventListener('change',e=>{if(e.target.type==='date')drawP()});
const range=()=>{const f=$('#pFrom').value,t=$('#pTo').value;return{f:f?new Date(f+'T00:00:00'):null,t:t?new Date(t+'T23:59:59'):null,fs:f||'start',ts:t||'today'}};
const inR=(x,r)=>{const d=new Date(x);return(!r.f||d>=r.f)&&(!r.t||d<=r.t)};
function data(){
  const r=range(),st=S.stats(r.f,r.t),ss=sessions.filter(s=>inR(s.start,r)),sy={};
  symptomLog.filter(e=>inR(e.time,r)).forEach(e=>sy[e.symptom]=(sy[e.symptom]||0)+1);
  const rated=Object.entries(st).filter(([,x])=>x.n).sort((a,b)=>b[1].avg-a[1].avg||b[1].n-a[1].n);
  const best=rated.slice(0,3),least=rated.length>1?rated.slice(-3).reverse().filter(x=>!best.includes(x)||rated.length<4):[];
  const tm={Morning:0,Afternoon:0,Evening:0,Night:0};ss.forEach(s=>{const h=new Date(s.start).getHours();tm[h<6?'Night':h<12?'Morning':h<17?'Afternoon':h<21?'Evening':'Night']++});
  const ml=moodLog.filter(m=>inR(m.time,r)),all=uses(r.f,r.t),rt=all.filter(u=>u.rating);
  return{r,st,ss,sy:Object.entries(sy).sort((a,b)=>b[1]-a[1]),rated,best,least,tm,ml,all,avg:rt.length?rt.reduce((a,u)=>a+u.rating,0)/rt.length:null,nr:rt.length};
}
const bar=(l,p,c,cls)=>`<div class="pr"><span class="pn">${esc(l)}</span><div class="pb ${cls||''}"><i style="width:${Math.max(3,Math.round(p))}%"></i></div><span class="pc">${esc(c)}</span></div>`;
const toolLine=([k,x])=>bar(ic(k)+' '+nm(k),x.avg/5*100,x.avg.toFixed(1)+'/5 · '+x.n+' rating'+(x.n>1?'s':'')+' · '+x.rounds+' rounds');
function sessLine(s){return `<div class="srow"><b>${fmt(s.start)}</b> · ${esc(s.name)}${s.symptoms&&s.symptoms.length?'<br>Feeling: '+s.symptoms.map(esc).join(', '):''}<br>${(s.uses||[]).map(u=>`${ic(u.tool)} ${esc(nm(u.tool))}${u.rounds?' ×'+u.rounds:''} ${u.rating?FACE[u.rating]+' '+u.rating+'/5':''}`).join(' · ')||'<span class="hint-text">No tools used</span>'}</div>`}
function drawP(){
  const d=data(),el=$('#pDash');if(!el)return;
  const mavg=d.ml.length?(d.ml.reduce((a,m)=>a+m.v,0)/d.ml.length).toFixed(1):'–',mx=Math.max(1,...Object.values(d.tm)),sx=d.sy[0]?d.sy[0][1]:1;
  el.innerHTML=`<div class="tiles"><div class="tile"><b>${d.ss.length}</b><small>toolkit sessions</small></div><div class="tile"><b>${d.all.length}</b><small>tools used</small></div><div class="tile"><b>${d.avg?d.avg.toFixed(1)+'/5':'–'}</b><small>average benefit (${d.nr} rated)</small></div><div class="tile"><b>${mavg}</b><small>average anxiety (${d.ml.length} mood logs)</small></div></div>
  ${d.rated.length?`<div class="pgrid"><div><h3 style="font-size:1rem">💚 Helps you most</h3>${d.best.map(toolLine).join('')}</div><div><h3 style="font-size:1rem">🌧️ Helps you least</h3>${d.least.length?d.least.map(x=>toolLine(x).replace('class="pb "','class="pb rose"')).join(''):'<p class="hint-text">Use and rate a few more tools to see this.</p>'}</div></div>`:'<p class="hint-text">Start a toolkit and rate your tools. Your most and least helpful ones will appear here.</p>'}
  <div class="pgrid"><div><h3 style="font-size:1rem">All tools in this window</h3>${Object.entries(d.st).sort((a,b)=>b[1].uses-a[1].uses).map(([k,x])=>bar(ic(k)+' '+nm(k),x.uses/Math.max(...Object.values(d.st).map(y=>y.uses))*100,x.uses+'× · '+x.rounds+' rounds · '+(x.n?x.avg.toFixed(1)+'/5':'unrated'))).join('')||'<p class="hint-text">Nothing yet.</p>'}</div>
  <div><h3 style="font-size:1rem">Feelings you noticed</h3>${d.sy.slice(0,8).map(([n,c])=>bar(n,c/sx*100,c+'×')).join('')||'<p class="hint-text">Nothing yet.</p>'}<h3 style="font-size:1rem;margin-top:18px">When you reach for Steady</h3>${Object.entries(d.tm).map(([n,c])=>bar(n,c/mx*100,c+' sessions')).join('')}</div></div>
  <h3 style="font-size:1rem;margin-top:24px">Session history</h3>${d.ss.slice().reverse().slice(0,20).map(sessLine).join('')||'<p class="hint-text">No sessions in this window.</p>'}`;
}
const _vw=S.onView;S.onView=v=>{if(v==='patterns')drawP();if(v==='mytk')drawMyTk();if(v==='toolkit')drawBanner();_vw&&_vw(v)};

/* ---------- PDF / print report for the chosen window ---------- */
function report(){
  const d=data(),o=[];const P=(t,x)=>o.push([t,x]);
  P('h1','Steady: Progress Report');P('s','Generated '+new Date().toLocaleString()+(window.currentUser?' · '+(currentUser.displayName||currentUser.email||''):''));P('s','Period: '+d.r.fs+' to '+d.r.ts);
  P('h2','Overview');P('p',d.ss.length+' toolkit sessions · '+d.all.length+' tools used · average benefit '+(d.avg?d.avg.toFixed(1)+'/5 ('+d.nr+' ratings)':'not rated yet'));
  P('p','Current streak '+streakData.count+' day(s) · longest '+streakData.longest+' · badges: '+([...earnedBadges].map(id=>BADGES[id].label).join(', ')||'none yet'));
  P('h2','Which tools help most');
  if(d.rated.length){P('p','Most helpful: '+d.best.map(([k,x])=>nm(k)+' ('+x.avg.toFixed(1)+')').join(', '));if(d.least.length)P('p','Least helpful: '+d.least.map(([k,x])=>nm(k)+' ('+x.avg.toFixed(1)+')').join(', '));
    d.rated.forEach(([k,x])=>P('p','• '+nm(k)+': benefit '+x.avg.toFixed(1)+'/5 from '+x.n+' rating(s), used '+x.uses+'×, '+x.rounds+' rounds'))}else P('p','No rated tools in this window.');
  P('h2','Feelings noticed');d.sy.length?d.sy.slice(0,10).forEach(([n,c])=>P('p','• '+n+': '+c+'×')):P('p','None recorded.');
  P('h2','When Steady is used');P('p',Object.entries(d.tm).map(([n,c])=>n+' '+c).join(' · '));
  P('h2','Mood');P('p',d.ml.length?d.ml.length+' logs · average '+(d.ml.reduce((a,m)=>a+m.v,0)/d.ml.length).toFixed(1)+'/10 · range '+Math.min(...d.ml.map(m=>m.v))+' to '+Math.max(...d.ml.map(m=>m.v)):'No mood logs in this window.');
  P('h2','Session log (latest 25)');d.ss.slice().reverse().slice(0,25).forEach(s=>{P('b',fmt(s.start)+' · '+s.name);if(s.symptoms&&s.symptoms.length)P('p','Feeling: '+s.symptoms.join(', '));P('p','Tools: '+((s.uses||[]).map(u=>nm(u.tool)+(u.rounds?' x'+u.rounds:'')+(u.rating?' ('+u.rating+'/5)':'')).join('; ')||'none'))});
  P('s','A self-reported summary from the Steady app, not a clinical assessment. It may be useful context to share with a therapist or doctor.');return o;
}
window.exportSummary=function(){
  const R=report();
  try{const{jsPDF}=window.jspdf,doc=new jsPDF({unit:'pt',format:'letter'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=54;let y=64;
    R.forEach(([t,x])=>{const sz=t==='h1'?19:t==='h2'?13:t==='s'?9:11;doc.setFont('helvetica',t==='h1'||t==='h2'||t==='b'?'bold':'normal');doc.setFontSize(sz);if(t==='h2')y+=10;
      doc.splitTextToSize(String(x).replace(/[^\x00-\xFF]/g,''),W-2*M).forEach(l=>{if(y>H-50){doc.addPage();y=64}doc.text(l,M,y);y+=sz+4})});
    doc.save('steady-report.pdf')}catch(e){
    $('#printSummary').innerHTML=R.map(([t,x])=>t==='h1'?`<h1>${esc(x)}</h1>`:t==='h2'?`<h2>${esc(x)}</h2>`:`<p>${t==='b'?'<b>'+esc(x)+'</b>':esc(x)}</p>`).join('');setTimeout(()=>window.print(),80)}
};
drawBanner();drawMyTk();setR(ago(30),dkey(new Date()));
})();
