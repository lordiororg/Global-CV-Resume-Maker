
/* ===== Data: countries & rule profiles ===== */
/* ===== State ===== */
const $=(s,r=document)=>r.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SAMPLE={...blank(),name:'Amara Njoroge',title:'Data Analyst',email:'amara.njoroge@example.com',phone:'+254 700 000 000',location:'Nairobi, Kenya',links:'linkedin.com/in/amaranjoroge, github.com/amara-n',dob:'12 March 1994',pob:'Kisumu, Kenya',mar:'Single',hob:'Trail running, chess',nat:'Kenyan',visa:'Eligible to work in Kenya; open to relocation',summary:'Data analyst with 6 years of experience turning messy operational data into decisions. Cut reporting time by 70% and supported a regional rollout across 5 countries.',
exp:[{role:'Senior Data Analyst',company:'Savanna Logistics',loc:'Nairobi',start:'Mar 2021',end:'',bul:'Built a Power BI suite used by 40+ managers, cutting weekly reporting from 10 hours to 3\nForecast model reduced fuel costs by 8% (KES 12M a year)\nMentored 3 junior analysts'},{role:'Data Analyst',company:'Lakeview Bank',loc:'Kisumu',start:'Jul 2018',end:'Feb 2021',bul:'Automated loan-risk reports with SQL and Python, saving 25 hours a month\nImproved data quality scores from 82% to 97%'}],
edu:[{deg:'BSc Statistics',inst:'University of Nairobi',loc:'Nairobi',year:'2017',note:'First Class Honours',eqf:'6'}],tech:'SQL, Python, R, statistics, forecasting',tools:'Power BI, Excel, Tableau, Git',soft:'Communication, stakeholder management',mother:'Swahili',langs:'English – C2\nFrench – A2',certs:'Google Data Analytics Certificate (2020)\nMicrosoft PL-300 (2022)',proj:'',awards:'Employee of the Year 2022, Savanna Logistics',vol:'',pubs:'',refs:'Jane Mwangi, Head of Analytics, Savanna Logistics – jane@example.com – +254 711 000 000'};
let d=blank(),country='',ov={},hist=[],last='',base='',tm,fname='';
const prof=()=>profileFor(country);
const opt=()=>{const p=prof();const r={ref:ov.ref??p.ref,sum:ov.sum??1};for(const k of ['ph','dob','pob','nat','gen','addr','visa','mar','pass','drive','idn','hob'])r[k]=ov[k]??p[k];return r};
const get=(o,p)=>p.split('.').reduce((a,k)=>a?.[k],o),set=(o,p,v)=>{const k=p.split('.'),l=k.pop();k.reduce((a,x)=>a[x],o)[l]=v};
const L=s=>String(s||'').split('\n').map(x=>x.replace(/^[\s•\-*▪●·]+/,'').trim()).filter(Boolean);
const say=t=>{$('#msg').textContent=t};
/* ===== Extraction + parsing ===== */

async function pdfText(b){
if(!window.pdfjsLib)throw Error('The PDF reader did not load. Check your connection and reload the page.');
const W=window['pdfjs-dist/build/pdf.worker'];if(W&&!window.pdfjsWorker)window.pdfjsWorker=W;
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const pdf=await pdfjsLib.getDocument({data:new Uint8Array(b)}).promise;let out='';
for(let n=1;n<=pdf.numPages;n++){const pg=await pdf.getPage(n),vw=pg.getViewport({scale:1}).width,tc=await pg.getTextContent();out+=order(tc.items.filter(i=>i.str&&i.str.trim()),vw)+'\n'}
return out}
async function docxText(b){const h=(await mammoth.convertToHtml({arrayBuffer:b})).value,doc=new DOMParser().parseFromString(h,'text/html'),tx=n=>n.innerHTML.replace(/<\/(p|li|h\d)>|<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
return[...doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,tr')].filter(e=>!(e.tagName=='P'&&e.closest('li,td,th'))).map(e=>{if(e.tagName=='TR'){const c=[...e.children].map(x=>tx(x).trim()).filter(Boolean);return c.every(x=>!x.includes('\n'))?c.join(' | '):c.join('\n')}return(e.tagName=='LI'?'• ':'')+tx(e).trim()}).filter(Boolean).join('\n')}
const readTxt=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error||Error('File could not be read.'));r.readAsText(f)});
async function extract(f,ext){const w=[];
if(ext=='pdf')return{text:await pdfText(await f.arrayBuffer()),w};
if(ext=='docx')return{text:await docxText(await f.arrayBuffer()),w};
if(ext=='doc'){w.push('Legacy .doc files are read approximately. For best results save as .docx or PDF.');return{text:(new TextDecoder('latin1').decode(await f.arrayBuffer()).match(/[\x20-\x7e]{6,}/g)||[]).join('\n'),w}}
return{text:await readTxt(f),w}}
let imp=null;
const err=m=>{const e=$('#emsg');e.className='err';e.textContent=m};
function tab(m){document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.m==m));document.querySelectorAll('.mp').forEach(p=>p.hidden=p.id!='m-'+m)}
function ingest(text,name,method,warn=[]){text=cleanText(text);const n=text.replace(/\s/g,'').length;
if(n<50){err(method=='pdf'?'This appears to be a scanned/image-based PDF. Please upload a text-based PDF/DOCX or paste your CV text below.':`Almost no text was found in ${name} (${n} characters). Paste your CV text below or try another file.`);tab('paste');return}
const r=parse(text),w=[...warn,...check(r.o)];imp={name,method,raw:text,un:r.un,w};load(r.o,status(r.o,name,w),name);$('#emsg').textContent='';$('#emsg').className='';if(aiAuto())aiRun('auto')}
function status(o,name,w){const x=[['Name',o.name],['Email',o.email],['Phone',o.phone],['Location',o.location],['Summary',o.summary],['Experience',o.exp.length],['Education',o.edu.length],['Skills',o.tech||o.tools||o.soft],['Languages',o.langs]].map(([k,v])=>`<span class="chip ${v?'ok':'bad'}">${v?'✓':'!'} ${k}</span>`).join('');
return `<h2>Imported from ${E(name)}</h2><div class="chips">${x}</div>${w.length?`<ul class="wl">${w.slice(0,6).map(a=>`<li>${E(a)}</li>`).join('')}</ul>`:''}<p style="font-size:13px;color:var(--mut);margin:4px 0 0">Open “Extraction review” above the CV to compare the raw text with the mapped fields.</p>${aiAuto()?'<p class="hint" style="margin:6px 0 0">AI remap: <span data-aistat>starting…</span></p>':'<p class="hint" style="margin:6px 0 0">Tip: add a free Google AI key under “Extraction review” (step 3) to have AI place every field after each upload.</p>'}`}
function mapHTML(o,un){const r=(k,v)=>`<tr class="${v?'':'bad'}"><th>${k}</th><td>${v?E(String(v).slice(0,400)):'<em>not found</em>'}</td></tr>`;
return `<table class="mt">${r('Name',o.name)}${r('Target role',o.title)}${r('Email',o.email)}${r('Phone',o.phone)}${r('Location',o.location)}${r('Links',o.links)}${r('Summary',o.summary)}${r('Experience',o.exp.map(e=>`${e.role||'?'} @ ${e.company||'?'} (${e.start||'?'} – ${e.end||'Present'}) · ${L(e.bul).length} bullets`).join('\n'))}${r('Education',o.edu.map(e=>`${e.deg||'?'} @ ${e.inst||'?'} (${e.year||'?'})`).join('\n'))}${r('Skills',[o.tech,o.tools&&'Tools: '+o.tools,o.soft&&'Soft: '+o.soft].filter(Boolean).join('\n'))}${r('Languages',o.langs)}${r('Certifications',o.certs)}${r('Projects',o.proj)}${r('Awards',o.awards)}${r('Volunteering',o.vol)}${r('Publications',o.pubs)}${r('Referees',o.refs)}${un?r('Unassigned',un):''}</table>`}
function drawer(){const el=$('#drw');if(!imp){el.style.display='none';return}el.style.display='block';if(!imp.shown){el.open=true;imp.shown=1}
if(document.activeElement!==$('#raw'))$('#raw').value=imp.raw;
$('#dmsg').innerHTML=`<p>Read <b>${E(imp.name)}</b> (${imp.method}, ${imp.raw.length} characters).</p>${imp.w.length?`<ul class="wl">${imp.w.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:'<p><span class="chip ok">✓ No problems detected</span></p>'}`;$('#mapd').innerHTML=mapHTML(d,imp.un)}
async function up(f){if(!f)return;const ext=(f.name.match(/\.(\w+)$/)||[])[1]?.toLowerCase();
if(!['pdf','docx','doc','txt'].includes(ext))return err(`Unsupported file type “.${ext||'?'}”. Upload a .pdf, .docx, .doc or .txt file, or paste the text.`);
const m=$('#emsg');m.className='';m.textContent='Reading '+f.name+'…';
try{const r=await extract(f,ext);ingest(r.text,f.name,ext,r.w)}catch(e){err(`Could not read ${f.name}: ${e.message||e}. Try another format or paste the text.`)}}

/* ===== Model (shared by preview + Word) ===== */
function model(){const p=prof(),o=opt(),h={name:d.name,title:d.title,contact:[d.email,d.phone,d.location,...L(d.links.replace(/,/g,'\n'))].filter(Boolean),photo:o.ph&&d.photo,pers:[]};
const PR=(k,l,v)=>o[k]&&v&&h.pers.push([l,v]);PR('dob','Date of birth',d.dob);PR('pob','Place of birth',d.pob);PR('nat','Nationality',d.nat);PR('gen','Gender',d.gen);PR('mar','Marital status',d.mar);PR('addr','Address',d.addr);PR('visa','Work authorisation',d.visa);PR('pass','Passport validity',d.pass);PR('idn','ID / tax number',d.idn);p.lay!='eu'&&PR('drive','Driving licence',d.drive);
const pe=p.pe?h.pers.splice(0):[];
const f={s:()=>o.sum&&d.summary&&{h:p.s,k:'t',t:d.summary,p:'summary'},
k:()=>{const eu=p.lay=='eu',r=[['Technical',d.tech],['Tools',d.tools],['Soft skills',d.soft],...(eu?[]:[['Mother tongue',d.mother],['Languages',L(d.langs).join(' · ')]])].filter(x=>x[1]);return r.length&&{h:eu?'Skills':'Skills & Languages',k:'kv',r}},g:()=>(d.mother||L(d.langs).length)&&{h:'Language Skills',k:'cefr',m:d.mother,l:L(d.langs)},d:()=>o.drive&&d.drive&&{h:'Driving Licence',k:'t',t:'Driving Licence: '+d.drive},
x:()=>d.exp.length&&{h:'Work Experience',k:'i',i:d.exp.map((e,i)=>({a:e.role,pa:`exp.${i}.role`,co:e.company,lc:e.loc,b:[e.company,e.loc].filter(Boolean).join(', '),d:[e.start,e.end||(e.start?'Present':'')].filter(Boolean).join(' – '),bl:L(e.bul)}))},
e:()=>d.edu.length&&{h:'Education',ed:1,k:'i',i:d.edu.map((e,i)=>({a:e.deg,pa:`edu.${i}.deg`,co:e.inst,lc:e.loc,eqf:e.eqf,b:[e.inst,e.loc].filter(Boolean).join(', '),d:e.year,bl:L(e.note)}))},
c:()=>[['Certifications',d.certs],[p.pj||'Projects',d.proj],['Awards',d.awards],['Volunteering',d.vol],['Publications',d.pubs],...(o.hob?[['Interests',d.hob]]:[])].filter(x=>L(x[1]).length).map(([h,v])=>({h,k:'l',l:L(v)})),
p:()=>pe.length&&[{h:'Personal Details',k:'kv',r:pe},{h:'Declaration',k:'t',t:'I hereby declare that the information above is true to the best of my knowledge.'}],
r:()=>o.ref==2?L(d.refs).length&&{h:'Referees',k:'l',l:L(d.refs)}:o.ref==1&&{h:'References',k:'t',t:'Available on request.'}};
return{h,secs:p.o.split('').flatMap(c=>[].concat(f[c]()||[])).filter(Boolean)}}
/* ===== Live preview ===== */
function html(m,edit){const p=prof(),ce=(path,t)=>edit&&path?`<span contenteditable data-e="${path}">${E(t)}</span>`:E(t),h=m.h,tb=p.lay=='tab'||p.lay=='box';
const sec=s=>`<section><h3>${E(s.h)}</h3>`+(s.k=='t'?`<p>${ce(s.p,s.t)}</p>`:s.k=='kv'?`<table class="kv">${s.r.map(([k,v])=>`<tr><td>${k}</td><td>${E(v)}</td></tr>`).join('')}</table>`:s.k=='l'?`<ul>${s.l.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:s.i.map(i=>`<div class="it${tb?' tb':''}"><div class="dt">${E(i.d)}</div><div class="bd"><div><b>${ce(i.pa,i.a)}</b>${i.b?', '+E(i.b):''}</div>${i.bl.length?`<ul>${i.bl.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:''}</div></div>`).join(''))+'</section>';
const img=h.photo?`<img src="${h.photo}" alt="">`:'',nm=`<h1>${ce('name',h.name||'Your Name')}</h1>${h.title?`<div class="tt">${ce('title',h.title)}</div>`:''}`;
if(p.lay=='eu'){const up=x=>E(String(x||'').toUpperCase()),ul=a=>a.length?`<ul>${a.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:'',
cf=l=>{const m=l.match(/^(.+?)\s*[–—:(-]?\s*((?:[ABC][12]\b[\s,/]*){1,5})\)?\s*$/i);if(m){const lv=m[2].match(/[ABC][12]/gi).map(x=>x.toUpperCase());return{n:m[1].trim(),lv:lv.length==5?lv:Array(5).fill(lv[0])}}const q=l.split(/\s*[–—:(-]\s*/);return{n:q[0],raw:q.slice(1).join(' – ').replace(/\)$/,'')}},
cefr=s=>{const R=s.l.map(cf);return `<p><b>Mother tongue(s):</b> ${up(s.m)||'—'}</p>`+(R.length?`<p><b>Other language(s):</b></p><table class="cf"><tr><th></th><th colspan="2">UNDERSTANDING</th><th colspan="2">SPEAKING</th><th>WRITING</th></tr><tr><th></th><th>Listening</th><th>Reading</th><th>Spoken production</th><th>Spoken interaction</th><th></th></tr>${R.map(r=>`<tr><td><b>${up(r.n)}</b></td>${r.lv?r.lv.map(x=>`<td>${x}</td>`).join(''):`<td colspan="5">${E(r.raw||'')}</td>`}</tr>`).join('')}</table><p class="lv">Levels: A1 and A2: Basic user; B1 and B2: Independent user; C1 and C2: Proficient user</p>`:'')},
es=s=>`<section><h3>${E(s.ed?'Education and Training':s.h)}</h3>`+(s.k=='t'?`<p>${ce(s.p,s.t)}</p>`:s.k=='kv'?s.r.map(([k,v])=>`<p><b>${k}:</b> ${E(v)}</p>`).join(''):s.k=='l'?ul(s.l):s.k=='cefr'?cefr(s):s.i.map(i=>s.ed?`<div class="ei"><div class="ed">${E(i.d)} ${E(i.lc)}</div><div class="et"><b>${up(i.a)}</b> ${E(i.co)}</div><hr>${i.eqf?`<div class="eq"><b>Level in EQF</b> EQF level ${E(i.eqf)}</div>`:''}${ul(i.bl)}</div>`:`<div class="ew"><div class="et"><b>${up(i.a)}${i.co?' – '+up(i.co):''}</b>${i.d?' – '+E(i.d):''}${i.lc?' – '+up(i.lc):''}</div><hr>${ul(i.bl)}</div>`).join(''))+'</section>';
return `<div class="eph"><img class="logo" src="${LOGO}" alt="Europass"><div class="epc">${img?`<div class="eimg">${img}</div>`:''}<div class="epn"><h1>${ce('name',h.name||'Your Name')}</h1>${h.title?`<div class="tt">${ce('title',h.title)}</div>`:''}<hr>${h.pers.length?`<div class="epp">${h.pers.map(([k,v])=>`<span><b>${k}:</b> ${E(v)}</span>`).join('')}</div>`:''}<div class="epc2">${h.contact.map(E).join(' &nbsp;|&nbsp; ')}</div></div></div></div><div class="epb">${m.secs.map(es).join('')}${p.sig?'<div class="sig"><span>Place, date</span><span>Signature</span></div>':''}</div>`}
if(p.lay=='side'){const kv=m.secs.filter(s=>s.k=='kv'),bx=(k,v)=>`<div><b>${k}</b><br>${E(v)}</div>`;
return `<div class="sd"><aside>${img}<h4>Contact</h4>${h.contact.map(c=>`<div>${E(c)}</div>`).join('')}${h.pers.length?'<h4>Personal</h4>'+h.pers.map(([k,v])=>bx(k,v)).join(''):''}${kv.map(s=>`<h4>${E(s.h)}</h4>`+s.r.map(([k,v])=>bx(k,v)).join('')).join('')}</aside><main>${nm}${m.secs.filter(s=>s.k!='kv').map(sec).join('')}</main></div>`}
return `<header><div>${nm}<div class="ct">${h.contact.map(E).join(' &nbsp;|&nbsp; ')}</div>${h.pers.length?`<div class="pers">${h.pers.map(([k,v])=>`<span><b>${k}:</b> ${E(v)}</span>`).join('')}</div>`:''}</div>${img}</header>`+m.secs.map(sec).join('')+(p.sig?'<div class="sig"><span>Place, date</span><span>Signature</span></div>':'')}
function skin(el,p){el.className='paper'+(p.pp=='Letter'?' L':'')+' lay-'+p.lay+(p.ff=='sans'?' ff-sans':'');el.style.setProperty('--ac',p.ac)}
function renderPreview(){const p=prof(),el=$('#paper');skin(el,p);el.innerHTML=html(model(),1);meta();strip();fit()}
function meta(el=$('#paper'),o=$('#pgs')){const p=prof(),mm=el.scrollHeight/3.7795,H=p.pp=='Letter'?279.4:297,n=Math.max(1,Math.ceil((mm-28)/(H-28)));o.textContent=`≈ ${n} page${n>1?'s':''} · target ${p.pg}`;o.className='chip '+(n>p.mx?'bad':'ok');return n}
function renderGuide(){const p=prof(),o=opt(),on=v=>v?'customary':'omit by default',LN={classic:'Classic single column',tab:'Tabular, dates left',side:'Sidebar',box:'Boxed, form-style',mini:'Minimal, centred',eu:'Europass (with logo)'},q=encodeURIComponent((country||'international')+' CV format template');
$('#guide').innerHTML=`<h3>${country?E(country)+' · ':''}${p.t}, ${p.pg}, ${p.pp}</h3><div class="chips"><span class="chip">Layout: ${LN[p.lay]}</span><span class="chip">Photo: ${on(p.ph)}</span><span class="chip">Date of birth: ${on(p.dob)}</span><span class="chip">Nationality: ${on(p.nat)}</span><span class="chip">Work authorisation: ${on(p.visa)}</span><span class="chip">Referees: ${['omitted','on request','listed'][p.ref]}</span></div><p>${country?'':'<b>Choose a target country above to adapt this CV.</b> '}${p.w}</p>${p.en?`<p style="font-size:13.5px"><b>Engineering tip:</b> ${E(p.en)}</p>`:''}<p style="font-size:13px">Rules follow the regional guide you supplied, cross-checked with ${p.r.map(k=>`<a href="${SR[k][1]}" target="_blank" rel="noopener">${SR[k][0]}</a>`).join(', ')}. <a href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">Search for more ${E(country||'international')} templates ↗</a></p>`;
const OPTS=[['ph','Photo'],['dob','Date of birth'],['pob','Place of birth'],['nat','Nationality'],['gen','Gender'],['mar','Marital status'],['addr','Address'],['visa','Work authorisation'],['pass','Passport validity'],['drive','Driving licence'],['idn','ID / tax number'],['hob','Interests'],['sum','Summary']],
tag=(k,v)=>{const pv=k=='sum'?1:p[k];return `<small class="tg ${(v?1:0)!=(pv?1:0)?'bad':''}">${(v?1:0)!=(pv?1:0)?'differs from local norm':pv?'customary':'not customary'}</small>`},
cb=([k,l])=>`<label><input type="checkbox" data-t="${k}" ${o[k]?'checked':''}>${l}${tag(k,o[k])}</label>`,
RL=['omit references','“References available on request”','list two or three referees'],onL=OPTS.filter(x=>o[x[0]]).map(x=>x[1]),offL=OPTS.filter(x=>!o[x[0]]).map(x=>x[1]),dif=OPTS.some(([k])=>(o[k]?1:0)!=((k=='sum'?1:p[k])?1:0))||o.ref!=p.ref;
$('#tog').innerHTML=`<div class="rn"><b>${country?'Set automatically for '+E(country)+':':'Choose a country in step 2 to set these automatically.'}</b> ${country?`shown: ${onL.join(', ')||'none'}. Hidden: ${offL.join(', ')||'none'}. References: ${RL[p.ref]}.`:''} ${dif?'<button id="rst" class="lnk">Restore country defaults</button>':''}</div><b style="font-size:13.5px">Show:</b>${OPTS.map(cb).join('')}<label>References <select data-t="ref">${['None','On request','List referees'].map((x,i)=>`<option value="${i}" ${o.ref==i?'selected':''}>${x}</option>`).join('')}</select><small class="tg ${o.ref!=p.ref?'bad':''}">${o.ref!=p.ref?'differs from local norm':'customary: '+RL[p.ref]}</small></label>`;thumb()}
function thumb(){const k=d,el=$('#paper3');if(!el)return;d=(k.name||k.exp.length)?k:JSON.parse(JSON.stringify(SAMPLE));try{skin(el,prof());el.innerHTML=html(model(),0)}finally{d=k}fit()}
/* ===== Form ===== */
const fld=(p,l,o={})=>{const v=get(d,p)??'';return `<label class="f ${o.w||''}"><span>${l}</span>${o.t?`<textarea data-p="${p}" rows="${o.r||3}" placeholder="${E(o.ph||'')}">${E(v)}</textarea>`:`<input data-p="${p}" value="${E(v)}" placeholder="${E(o.ph||'')}">`}</label>`};
function photoBlock(){const o=opt(),need=o.ph&&!d.photo;return `<div class="${need?'phn':''}" style="margin:0 0 14px">${need?`<b>A photo is expected${country?' in '+E(country):''}.</b> Upload a recent passport-style headshot with a neutral background.<br>`:''}<label class="f">Profile photo${o.ph?'':' (hidden for this country: tick “Photo” above the CV to show it)'}<input type="file" id="photo" accept="image/*"></label>${d.photo?`<img src="${d.photo}" alt="" width="48" style="vertical-align:middle;margin-right:8px"><button data-a="nophoto">Remove photo</button>`:''}</div>`}
function renderForm(st){$('#ed').innerHTML=(st||stat||'')+`${photoBlock()}<h2>Contact &amp; identity</h2><div class="g">${fld('name','Full name')}${fld('title','Target role')}${fld('email','Email')}${fld('phone','Phone')}${fld('location','City, country')}${fld('links','LinkedIn / portfolio',{ph:'comma separated'})}</div>

<h2>Regional details</h2><div class="g">${fld('dob','Date of birth')}${fld('pob','Place of birth')}${fld('nat','Nationality')}${fld('mar','Marital status')}${fld('visa','Visa / work authorisation',{w:1})}${fld('gen','Gender')}${fld('pass','Passport validity')}${fld('drive','Driving licence')}${fld('idn','ID / tax number')}${fld('addr','Full address',{w:1})}</div>
<h2>Summary</h2>${fld('summary','Summary / personal statement / objective',{t:1,r:4,w:1})}
<h2>Work experience</h2>${d.exp.map((e,i)=>`<div class="card"><div class="g">${fld(`exp.${i}.role`,'Role')}${fld(`exp.${i}.company`,'Company')}${fld(`exp.${i}.loc`,'Location')}${fld(`exp.${i}.start`,'Start',{ph:'Jan 2021'})}${fld(`exp.${i}.end`,'End',{ph:'blank = Present'})}</div>${fld(`exp.${i}.bul`,'Responsibilities & quantified achievements (one per line)',{t:1,r:4})}<button data-a="delx" data-i="${i}">Remove</button></div>`).join('')}<button data-a="addx">+ Add role</button>
<h2>Education</h2>${d.edu.map((e,i)=>`<div class="card"><div class="g">${fld(`edu.${i}.deg`,'Degree / qualification')}${fld(`edu.${i}.inst`,'Institution')}${fld(`edu.${i}.loc`,'Location')}${fld(`edu.${i}.year`,'Year / dates')}${fld(`edu.${i}.eqf`,'EQF level (Europass)')}</div>${fld(`edu.${i}.note`,'GPA / honours',{t:1,r:2})}<button data-a="dele" data-i="${i}">Remove</button></div>`).join('')}<button data-a="adde">+ Add education</button>
<h2>Skills &amp; languages</h2>${fld('tech','Technical / hard skills',{t:1,r:2,w:1})}${fld('tools','Tools',{t:1,r:2,w:1})}${fld('soft','Soft skills',{t:1,r:2,w:1})}${fld('mother','Mother tongue(s)',{w:1})}${fld('langs','Languages with level (one per line)',{t:1,r:3,w:1,ph:'English – C2 (CEFR A1–C2), or: French – B1 B1 A2 A2 B1'})}
<h2>Additional sections</h2>${fld('certs','Certifications',{t:1,w:1})}${fld('proj','Projects',{t:1,w:1})}${fld('awards','Awards',{t:1,w:1})}${fld('vol','Volunteering',{t:1,w:1})}${fld('pubs','Publications',{t:1,w:1})}${fld('hob','Interests',{t:1,w:1})}${fld('refs','Referees (name, role, contact, one per line)',{t:1,w:1})}`}
function renderAll(st){renderForm(st);renderGuide();renderPreview();$('#undo').disabled=!hist.length}
/* ===== History ===== */
function commit(){const s=JSON.stringify(d);if(s!==last){hist.push(last);hist.length>60&&hist.shift();last=s;$('#undo').disabled=0;$('#reset').disabled=0}persist()}
const later=()=>{clearTimeout(tm);tm=setTimeout(commit,500)};
function load(o,st,nm){d=o;base=JSON.stringify(o);last=base;hist=[];fname=nm||'';started=1;stat=st||'';$('#reset').disabled=1;renderAll(st);go(2)}
/* ===== Events ===== */
$('#cl').innerHTML=COUNTRIES.map(c=>`<option value="${E(c)}">`).join('');
$('#cty').addEventListener('input',e=>{const c=COUNTRIES.find(x=>x.toLowerCase()==e.target.value.trim().toLowerCase());if(c&&c!==country){country=c;ov={};renderGuide();renderForm();renderPreview();nav()}});
$('#ed').addEventListener('input',e=>{const p=e.target.dataset.p;if(!p)return;set(d,p,e.target.value);renderPreview();later()});
$('#ed').addEventListener('change',e=>{if(e.target.id!='photo')return;const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),W=320,H=400;c.width=W;c.height=H;const x=c.getContext('2d'),k=Math.max(W/im.width,H/im.height),w=im.width*k,h=im.height*k;x.drawImage(im,(W-w)/2,(H-h)/2,w,h);d.photo=c.toDataURL('image/png');commit();renderAll()};im.src=r.result};r.readAsDataURL(f)});
$('#ed').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;const i=+e.target.dataset.i;
if(a=='addx')d.exp.push({role:'',company:'',loc:'',start:'',end:'',bul:''});if(a=='adde')d.edu.push({deg:'',inst:'',loc:'',year:'',note:'',eqf:''});if(a=='delx')d.exp.splice(i,1);if(a=='dele')d.edu.splice(i,1);if(a=='nophoto')d.photo='';commit();renderAll()});
$('#tog').addEventListener('change',e=>{const k=e.target.dataset.t;if(!k)return;ov[k]=e.target.type=='checkbox'?+e.target.checked:+e.target.value;renderGuide();renderPreview();persist()});
$('#tog').addEventListener('click',e=>{if(e.target.id=='rst'){ov={};renderGuide();renderForm();renderPreview();persist()}});
$('#paper').addEventListener('input',e=>{const p=e.target.dataset.e;if(!p)return;set(d,p,e.target.textContent);meta();strip();fit();later()});
$('#paper').addEventListener('focusout',e=>{if(e.target.dataset.e){commit();renderForm()}});
$('#undo').onclick=()=>{commit();if(!hist.length)return;d=JSON.parse(hist.pop());last=JSON.stringify(d);renderAll()};
$('#reset').onclick=()=>{d=JSON.parse(base);commit();renderAll();$('#reset').disabled=1};

let armed=0,at;const guard=fn=>()=>{if(started&&!armed){armed=1;clearTimeout(at);at=setTimeout(()=>{armed=0;$('#emsg').textContent=''},8000);const m=$('#emsg');m.className='err';m.textContent='You already have a CV in progress. Click again to replace it with a new one, or use the step tabs above to keep working on it.';return}armed=0;fn()};
$('#manual').onclick=guard(()=>{imp=null;load(blank())});$('#sample').onclick=guard(()=>{imp=null;load(JSON.parse(JSON.stringify(SAMPLE)))});
$('#seg').onclick=e=>{const b=e.target.closest('button');b&&tab(b.dataset.m)};
$('#pgo').onclick=guard(()=>{const t=$('#pt').value;if(!t.trim())return err('Paste your CV text first.');ingest(t,'pasted text','paste')});
const dz=$('#drop');dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('on')});dz.addEventListener('dragleave',()=>dz.classList.remove('on'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('on');up(e.dataTransfer.files[0])});dz.addEventListener('keydown',e=>{if(e.key=='Enter')$('#file').click()});$('#file').onchange=e=>up(e.target.files[0]);
/* ===== Export ===== */
async function save(name,blob){const dl=window.claude?.use?await claude.use('downloads'):null;
if(dl){try{await dl.save({filename:name,data:blob});say('Saved '+name)}catch(e){say(e.code=='declined'?'Download cancelled.':'Could not save: '+(e.message||e.code))}return}
const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);say('Saved '+name)}
const slug=()=>(d.name||'CV').replace(/[^\w]+/g,'_')+'_'+(country||'Global').replace(/[^\w]+/g,'_');
$('#dx').onclick=async()=>{say('Building Word file…');try{const m=model(),p=prof(),D=docx,{Paragraph:Pa,TextRun:R,TabStopType:TS,BorderStyle:BS,HeadingLevel:HL}=D,AC=(p.ac||'#1f4e8c').slice(1),pg=p.pp=='Letter'?{width:12240,height:15840}:{width:11906,height:16838},mg=1000,tw=pg.width-2*mg,run=(t,o)=>new R({text:t,...o});
const left=[new Pa({children:[run(m.h.name||'Your Name',{bold:true,size:40,color:AC})]})];
m.h.title&&left.push(new Pa({children:[run(m.h.title,{size:24,color:'555555'})]}));
left.push(new Pa({spacing:{after:60},children:[run(m.h.contact.join('  |  '),{size:19})]}));
m.h.pers.length&&left.push(new Pa({children:[run(m.h.pers.map(a=>a.join(': ')).join('   '),{size:19})]}));
let head=left;if(m.h.photo){const by=Uint8Array.from(atob(m.h.photo.split(',')[1]),c=>c.charCodeAt(0));
head=[new D.Table({width:{size:tw,type:D.WidthType.DXA},borders:D.TableBorders.NONE,columnWidths:[tw-1800,1800],rows:[new D.TableRow({children:[new D.TableCell({width:{size:tw-1800,type:D.WidthType.DXA},children:left}),new D.TableCell({width:{size:1800,type:D.WidthType.DXA},children:[new Pa({alignment:D.AlignmentType.RIGHT,children:[new D.ImageRun({data:by,transformation:{width:82,height:102}})]})]})]})]})]}
if(p.lay=='eu')head=[new Pa({alignment:D.AlignmentType.RIGHT,children:[new D.ImageRun({data:Uint8Array.from(atob(LOGO.split(',')[1]),c=>c.charCodeAt(0)),transformation:{width:LW,height:LH}})]}),...head];
const b=[];for(const s of m.secs){b.push(new Pa({heading:HL.HEADING_2,spacing:{before:240,after:80},border:{bottom:{style:BS.SINGLE,size:6,color:AC,space:1}},children:[run(s.h,{bold:true,size:24,color:AC})]}));
if(s.k=='cefr'){b.push(new Pa({children:[run('Mother tongue(s): ',{bold:true}),run(s.m||'')]}));s.l.forEach(t=>b.push(new Pa({text:t,bullet:{level:0}})))}
if(s.k=='t')b.push(new Pa({children:[run(s.t)]}));
if(s.k=='kv')s.r.forEach(([k,v])=>b.push(new Pa({children:[run(k+': ',{bold:true}),run(v)]})));
if(s.k=='l')s.l.forEach(t=>b.push(new Pa({text:t,bullet:{level:0}})));
if(s.k=='i')s.i.forEach(i=>{b.push(new Pa({keepNext:true,spacing:{before:100},tabStops:[{type:TS.RIGHT,position:tw}],children:[run(i.a||'',{bold:true}),run(i.b?', '+i.b:''),run(i.d?'\t'+i.d:'',{color:'555555'})]}));i.bl.forEach(t=>b.push(new Pa({text:t,bullet:{level:0}})))})}
const doc=new D.Document({styles:{default:{document:{run:{font:p.ff=='serif'?'Georgia':'Calibri',size:21}}}},sections:[{properties:{page:{size:pg,margin:{top:mg,bottom:mg,left:mg,right:mg}}},children:[...head,...b,...(p.sig?[new Pa({spacing:{before:600},children:[run('Place, date: ____________________        Signature: ____________________')]})]:[])]}]});
await save(slug()+'.docx',await D.Packer.toBlob(doc))}catch(e){say('Word export failed: '+(e.message||e))}};
/* Image-based export (used when the CV has characters the text PDF cannot encode). The review sheet is captured
   in place, with no x/y/width/height overrides: those were applied as absolute page coordinates, so screenshots
   of an off-screen copy came back shifted right with the right-hand column cut off. The sheet is laid out at the
   printable width and the page margins come from jsPDF, so every page gets its 14 mm frame. */
async function rasterPDF(){say('Building PDF…');const p=prof(),L_=p.pp=='Letter',el=$('#paper2');if(!el)return;
const ce=[...el.querySelectorAll('[contenteditable]')],cl=el.className,tf=el.style.transform,ml=el.style.marginLeft;
try{skin(el,p);el.classList.add('pdfmode');ce.forEach(x=>x.removeAttribute('contenteditable'));
Object.assign(el.style,{width:(L_?187.9:182)+'mm',minHeight:'0',padding:'0',margin:'0',boxShadow:'none',backgroundImage:'none',transform:'none'});
await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const blob=await html2pdf().set({margin:14,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#fff'},jsPDF:{unit:'mm',format:L_?'letter':'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.it','.ei','.ew','h3','li','tr','.sig']}}).from(el).outputPdf('blob');
await save(slug()+'.pdf',blob)}catch(e){say('PDF export failed: '+(e.message||e)+' Try “Print / Save as PDF” instead.')}
finally{el.className=cl;['width','minHeight','padding','margin','boxShadow','backgroundImage'].forEach(k=>el.style[k]='');el.style.transform=tf;el.style.marginLeft=ml;ce.forEach(x=>x.setAttribute('contenteditable',''));fit()}}
/* ===== Vector PDF: real, selectable text with exact margins (Latin-script CVs; other scripts fall back to the image export) ===== */
const WIN={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159},
wcode=c=>{const n=c.charCodeAt(0);return n<128||(n>=160&&n<256)?n:WIN[c]},
wenc=s=>[...s].map(c=>{const n=wcode(c);return n===undefined?'?':String.fromCharCode(n)}).join('').replace(/[\\()]/g,'\\$&'),
wok=s=>[...s].every(c=>wcode(c)!==undefined);
function cefrRows(l){return l.map(t=>{const m=t.match(/^(.+?)\s*[–—:(-]?\s*((?:[ABC][12]\b[\s,/]*){1,5})\)?\s*$/i);if(m){const lv=m[2].match(/[ABC][12]/gi).map(x=>x.toUpperCase());return{n:m[1].trim(),lv:lv.length==5?lv:Array(5).fill(lv[0])}}const q=t.split(/\s*[–—:(-]\s*/);return{n:q[0],raw:q.slice(1).join(' – ').replace(/\)$/,'')}})}
function pdfFile(pages,imgs,W,H){const o=[],push=s=>{o.push(s);return o.length};push('<< /Type /Catalog /Pages 2 0 R >>');push('');
['Helvetica','Helvetica-Bold','Times-Roman','Times-Bold'].forEach(f=>push(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`));
const ids=imgs.map(im=>push(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.data.length} >>\nstream\n${im.data}\nendstream`));
const res=`<< /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> /XObject << ${imgs.map((im,i)=>`/${im.name} ${ids[i]} 0 R`).join(' ')} >> >>`,kids=[];
pages.forEach(c=>{const cid=push(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);kids.push(push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources ${res} /Contents ${cid} 0 R >>`))});
o[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
let out='%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n';const offs=[];o.forEach((s,i)=>{offs.push(out.length);out+=`${i+1} 0 obj\n${s}\nendobj\n`});const x=out.length;
out+=`xref\n0 ${o.length+1}\n0000000000 65535 f \n`+offs.map(p=>String(p).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${o.length+1} /Root 1 0 R /Info << /Title (CV) >> >>\nstartxref\n${x}\n%%EOF`;
const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return new Blob([u],{type:'application/pdf'})}
async function buildPDF(){
const p=prof(),m=model(),L=p.pp=='Letter',W=L?612:595.28,H=L?792:841.89,M=39.69,CW=W-2*M,sans=p.ff=='sans',lay=p.lay,AC=p.ac,eu=lay=='eu',MUT='#555555';
if(!wok(JSON.stringify(m)))return null;
const cx=document.createElement('canvas').getContext('2d'),FAM=sans?'Helvetica, Arial, "Liberation Sans", sans-serif':'"Times New Roman", Times, "Liberation Serif", serif',
wd=(s,b,z)=>{cx.font=`${b?'bold ':''}100px ${FAM}`;return cx.measureText(s).width*z/100*1.01},fo=b=>sans?(b?'F2':'F1'):(b?'F4':'F3'),
rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255].map(v=>(v/255).toFixed(3)).join(' ')},f2=v=>v.toFixed(2);
const pages=[];let cur='';
const T=(s,x,y,z,b,c)=>{cur+=`BT /${fo(b)} ${z} Tf ${rgb(c||'#171a21')} rg ${f2(x)} ${f2(H-y)} Td (${wenc(s)}) Tj ET\n`},
R=(x,y,w,h,c)=>{cur+=`${rgb(c)} rg ${f2(x)} ${f2(H-y-h)} ${f2(w)} ${f2(h)} re f\n`},RS=(x,y,w,h,c,lw)=>{cur+=`${rgb(c)} RG ${lw} w ${f2(x)} ${f2(H-y-h)} ${f2(w)} ${f2(h)} re S\n`},
LN=(x1,y,x2,c,lw)=>{cur+=`${rgb(c)} RG ${lw} w ${f2(x1)} ${f2(H-y)} m ${f2(x2)} ${f2(H-y)} l S\n`},IMG=(n,x,y,w,h)=>{cur+=`q ${f2(w)} 0 0 ${f2(h)} ${f2(x)} ${f2(H-y-h)} cm /${n} Do Q\n`},
wrap=(s,w,z,b)=>{const out=[];for(const para of String(s).split('\n')){let line='';for(const word of para.split(/\s+/).filter(Boolean)){const t=line?line+' '+word:word;if(wd(t,b,z)<=w){line=t;continue}if(line)out.push(line);line=word;while(wd(line,b,z)>w&&line.length>1){let k=line.length;while(k>1&&wd(line.slice(0,k),b,z)>w)k--;out.push(line.slice(0,k));line=line.slice(k)}}out.push(line)}return out.length?out:['']};
const toJ=(url,w,h,bg)=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.drawImage(i,0,0,w,h);r(atob(c.toDataURL('image/jpeg',.92).split(',')[1]))};i.onerror=()=>r(null);i.src=url}),imgs=[];
let hasPh=false,hasLogo=false;
if(m.h.photo){const j=await toJ(m.h.photo,320,400,'#ffffff');if(j){imgs.push({name:'Im1',w:320,h:400,data:j});hasPh=true}}
if(eu){const j=await toJ(LOGO,342,64,'#f3f3f3');if(j){imgs.push({name:'Im2',w:342,h:64,data:j});hasLogo=true}}
const blocks=[],B=(h,draw,keep)=>blocks.push({h,draw,keep}),LH=1.3;
const lines=(arr,z,b,c,x,gap,keep)=>arr.forEach((t,i)=>B(z*LH+(i==arr.length-1?gap||0:0),y=>T(t,x,y+z*.95,z,b,c),keep&&i==arr.length-1));
const contact=m.h.contact.join('  |  '),pers=m.h.pers.map(([k,v])=>k+': '+v).join('  |  ');
/* header */
if(eu){const pw=hasPh?66:0,tx=M+12+(hasPh?pw+14:0),tw=W-M-tx-12,nm=wrap(m.h.name||'Your Name',tw,18,true),ti=m.h.title?wrap(m.h.title,tw,11,false):[],ps=pers?wrap(pers,tw,9,false):[],ct=wrap(contact,tw,9,false);
const th=34+nm.length*21.6+ti.length*14.3+8+ps.length*11.7+ct.length*11.7+10,hb=Math.max(th,hasPh?14+82+12:0);
B(hb+6,y=>{R(M,y,CW,hb,'#f3f3f3');if(hasLogo)IMG('Im2',M+CW-112,y+9,102,19.1);if(hasPh)IMG('Im1',M+12,y+16,pw,82);let yy=y+34;nm.forEach(t=>{T(t,tx,yy+17,18,true,'#555555');yy+=21.6});ti.forEach(t=>{T(t,tx,yy+10,11,false,MUT);yy+=14.3});LN(tx,yy+3,tx+tw,'#aaaaaa',.6);yy+=8;ps.forEach(t=>{T(t,tx,yy+8.5,9);yy+=11.7});ct.forEach(t=>{T(t,tx,yy+8.5,9,false,'#444444');yy+=11.7})})}
else{const pw=hasPh?64:0,lw=CW-(hasPh?pw+14:0)-(lay=='box'?16:0),nm=wrap(m.h.name||'Your Name',lw,22,true),ti=m.h.title?wrap(m.h.title,lw,12,false):[],ct=wrap(contact,lw,9,false),ps=pers?wrap(pers,lw,9,false):[],
th=nm.length*26.4+ti.length*15.6+ct.length*11.7+ps.length*11.7+4,hh=Math.max(th,hasPh?80:0),bx=lay=='box';
B(hh+(bx?24:16),y=>{const o=bx?8:0;if(bx)RS(M,y,CW,hh+16,AC,1);let yy=y+o;nm.forEach(t=>{T(t,M+o,yy+20,22,true,AC);yy+=26.4});ti.forEach(t=>{T(t,M+o,yy+11.5,12,false,MUT);yy+=15.6});yy+=3;ct.forEach(t=>{T(t,M+o,yy+8.5,9);yy+=11.7});ps.forEach(t=>{T(t,M+o,yy+8.5,9);yy+=11.7});if(hasPh)IMG('Im1',M+CW-pw-o,y+o,pw,80);if(!bx&&lay!='tab')LN(M,y+hh+6,M+CW,AC,1.2)})}
/* sections */
const dcol=lay=='tab'||lay=='box'||eu,DW=82;
for(const s of m.secs){const ttl=eu?(s.ed?'Education and Training':s.h).toUpperCase():lay=='tab'?s.h.toUpperCase():s.h;
B(26,y=>{const t=y+12;if(lay=='box'){R(M,y+4,CW,17,AC);T(ttl,M+6,y+16.5,10.5,true,'#ffffff')}else if(lay=='tab'){R(M,y+5,3,14,AC);T(ttl,M+9,y+16,10,true,'#171a21');LN(M+9,y+21,M+CW,'#bbbbbb',.5)}else if(eu){T(ttl,M,y+17,10.5,true,'#000000');LN(M,y+21,M+CW,'#999999',.7)}else{T(ttl,M,y+17,11.5,true,AC);LN(M,y+21,M+CW,AC,.7)}},true);
if(s.k=='t')lines(wrap(s.t,CW,10,false),10,false,null,M,4);
else if(s.k=='kv')for(const[k,v]of s.r){const vl=wrap(v,CW-92,10,false);B(vl.length*13+3,y=>{T(k,M,y+9.5,10,true);vl.forEach((t,i)=>T(t,M+92,y+9.5+i*13,10))})}
else if(s.k=='l')s.l.forEach(t=>{const l=wrap(t,CW-16,10,false);B(l.length*13+1.5,y=>{T('•',M+4,y+9.5,10);l.forEach((x,i)=>T(x,M+16,y+9.5+i*13,10))})});
else if(s.k=='cefr'){B(15,y=>T('Mother tongue(s): '+(s.m||'—').toUpperCase(),M,y+10,10,true));const R2=cefrRows(s.l);if(R2.length){const nw=96,cw=(CW-nw)/5;B(13,y=>{T('Other language(s):',M,y+9,10,true)},true);
B(13,y=>{['UNDERSTANDING','','SPEAKING','','WRITING'].forEach((t,i)=>{if(t)T(t,M+nw+i*cw,y+9,7.5,true)})},true);B(15,y=>{LN(M,y+13,M+CW,'#999999',.6);['Listening','Reading','Spoken production','Spoken interaction',''].forEach((t,i)=>T(t,M+nw+i*cw,y+9,7.2,true))},true);
R2.forEach(r=>B(15,y=>{T(r.n.toUpperCase(),M,y+10,8.5,true);if(r.lv)r.lv.forEach((v,i)=>T(v,M+nw+i*cw,y+10,8.5));else T(r.raw||'',M+nw,y+10,8.5);LN(M,y+14,M+CW,'#dddddd',.4)}));B(13,y=>T('Levels: A1 and A2: Basic user; B1 and B2: Independent user; C1 and C2: Proficient user',M,y+9,7,false,MUT))}}
else s.i.forEach(i=>{const bl=i.bl;
if(eu&&s.ed){const a=wrap(i.a.toUpperCase(),CW,10,true),c=i.co?wrap(i.co,CW,10,false):[];B(11.5+a.length*13+c.length*13+4,y=>{T((i.d||'')+(i.lc?'  '+i.lc:''),M,y+8.5,8.7,false,MUT);a.forEach((t,k)=>T(t,M,y+21+k*13,10,true));c.forEach((t,k)=>T(t,M,y+21+(a.length+k)*13,10));LN(M,y+21+(a.length+c.length)*13-6,M+CW,'#bbbbbb',.4)},!!(i.eqf||bl.length));
if(i.eqf)B(14,y=>{T('Level in EQF',M,y+9.5,9,true);T('EQF level '+i.eqf,M+62,y+9.5,9)},bl.length>0)}
else if(eu){const a=wrap(i.a.toUpperCase()+(i.co?' – '+i.co.toUpperCase():''),CW,10,true),sub=[i.d,(i.lc||'').toUpperCase()].filter(Boolean).join(' – ');B(a.length*13+(sub?12:0)+5,y=>{a.forEach((t,k)=>T(t,M,y+9.5+k*13,10,true));if(sub)T(sub,M,y+9.5+a.length*13,9,false,MUT);LN(M,y+a.length*13+(sub?12:0)+1,M+CW*.7,'#bbbbbb',.4)},bl.length>0)}
else if(dcol){const tw=CW-DW-6,a=wrap(i.a,tw,10.5,true),c=i.b?wrap(i.b,tw,10,false):[],dl=wrap(i.d||'',DW-4,9,false);B(Math.max(a.length*13.5+c.length*13,dl.length*11.5)+3,y=>{dl.forEach((t,k)=>T(t,M,y+10+k*11.5,9,false,MUT));a.forEach((t,k)=>T(t,M+DW+6,y+10+k*13.5,10.5,true));c.forEach((t,k)=>T(t,M+DW+6,y+10+(a.length+k)*13.5-.5,10,false,'#333333'))},bl.length>0)}
else{const dwid=i.d?wd(i.d,false,9.5)+8:0,a=wrap(i.a,CW-dwid,10.5,true),c=i.b?wrap(i.b,CW,10,false):[];B(a.length*13.5+c.length*13+3,y=>{a.forEach((t,k)=>T(t,M,y+10+k*13.5,10.5,true));if(i.d)T(i.d,M+CW-wd(i.d,false,9.5),y+10,9.5,false,MUT);c.forEach((t,k)=>T(t,M,y+10+(a.length+k)*13.5-.5,10,false,'#333333'))},bl.length>0)}
const ix=eu?M:dcol?M+DW+6:M;bl.forEach((t,k)=>{const l=wrap(t,CW-(ix-M)-14,10,false);B(l.length*13+1.5+(k==bl.length-1?5:0),y=>{T('•',ix+3,y+9.5,10);l.forEach((x,n)=>T(x,ix+14,y+9.5+n*13,10))},false)})})}
if(p.sig){if(blocks.length)blocks[blocks.length-1].keep=true;B(60,y=>{LN(M,y+40,M+CW*.45,'#333333',.5);LN(M+CW*.55,y+40,M+CW,'#333333',.5);T('Place, date',M,y+50,8.5,false,MUT);T('Signature',M+CW*.55,y+50,8.5,false,MUT)})}
/* place blocks on pages, keeping headings and item headers with what follows */
let y=M;const lim=H-M;
for(let i=0;i<blocks.length;i++){let need=blocks[i].h,j=i;while(blocks[j].keep&&blocks[j+1]){j++;need+=blocks[j].h}if(y+need>lim&&y>M+1){pages.push(cur);cur='';y=M}blocks[i].draw(y);y+=blocks[i].h}
pages.push(cur);return pdfFile(pages,imgs,W,H)}

$('#dp').onclick=async()=>{say('Building PDF…');try{const bl=await buildPDF();if(bl){await save(slug()+'.pdf',bl);return}}catch(e){console.error(e)}await rasterPDF()};
/* Native print: the CV is rendered into #pa with the right @page size and margins, so Ctrl/Cmd+P works from any step */
function printPrep(){const p=prof(),pa=$('#pa');skin(pa,p);pa.innerHTML=html(model(),0);let st=$('#pgstyle');if(!st){st=document.createElement('style');st.id='pgstyle';document.head.appendChild(st)}st.textContent=`@page{size:${p.pp=='Letter'?'letter':'A4'};margin:14mm}`}
window.addEventListener('beforeprint',printPrep);
$('#pr').onclick=()=>{try{printPrep();window.print()}catch(e){say('Printing is not available here: '+(e.message||e))}};
if(window.claude){$('#pr').style.display='none';$('#prh').style.display='none'}
let started=0,step=1,stat='';
const reach=()=>started?(country?4:2):1;
function strip(){const p=prof();$('#sName').textContent=d.name||'—';$('#sRole').textContent=d.title||'—';$('#sCty').textContent=country||'Not chosen';$('#sDoc').textContent=p.t;$('#sPg').textContent=p.pg+' · '+p.pp}
function nav(){persist();const r=reach();document.querySelectorAll('#steps button').forEach(b=>{const n=+b.dataset.s;b.disabled=n>r;b.classList.toggle('on',n==step)});$('#n2').disabled=!country;strip();const on=document.querySelector('#steps button.on');on&&on.scrollIntoView&&on.scrollIntoView({inline:'center',block:'nearest'})}
function go(n){if(n>reach())return;step=n;document.querySelectorAll('.pg').forEach((x,i)=>x.classList.toggle('on',i+1==n));nav();
if(n==1)$('#resume').innerHTML=started?`<div class="phn" style="margin-bottom:16px"><b>You have a CV in progress${d.name?': '+E(d.name):''}${country?' for '+E(country):''}.</b> It is saved automatically in this browser. <button class="pri" data-go="${country?3:2}">Continue editing</button><br><small>Uploading, pasting or entering manually below starts a new CV and replaces this one.</small></div>`:'';
if(n==2){$('#impw').style.display=stat?'block':'none';$('#imp').innerHTML=stat}
if(n==3){renderGuide();renderForm();renderPreview();drawer()}if(n==4)review();window.scrollTo(0,0);fit()}
function review(){const p=prof(),el=$('#paper2');skin(el,p);el.innerHTML=html(model(),0);meta(el,$('#pgs2'));fit();
$('#chk').innerHTML=(opt().ph&&!d.photo?`<span class="chip bad">! Photo expected${country?' in '+E(country):''}: not uploaded (go back to step 3)</span>`:'')+[['Name',d.name],['Email',d.email],['Phone',d.phone],['Summary',d.summary],['Experience',d.exp.length],['Education',d.edu.length],['Skills',d.tech||d.tools||d.soft]].map(([k,v])=>`<span class="chip ${v?'ok':'bad'}">${v?'✓':'!'} ${k}</span>`).join('')}
$('#steps').onclick=e=>{const b=e.target.closest('button');b&&go(+b.dataset.s)};
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');g&&go(+g.dataset.go)});
$('#remap').onclick=()=>{const t=$('#raw').value;if(t.replace(/\s/g,'').length<50){$('#amsg').textContent='There is not enough text to map. Paste more of the CV.';return}
commit();const r=parse(t);r.o.photo=d.photo;d=r.o;imp.raw=t;imp.un=r.un;imp.w=check(d);commit();renderAll();drawer();$('#amsg').textContent='Fields re-mapped from the edited text. Use Undo to go back.'};
$('#ai').onclick=async()=>{const a=$('#amsg'),sm=window.claude?.use?await claude.use('sample'):null;if(!sm){a.textContent='Claude refinement is not available in this view. The built-in parser result is unchanged.';return}
try{a.textContent='Asking Claude to re-read the text…';const S='{"name":"","title":"","email":"","phone":"","location":"","links":"","dob":"","nat":"","visa":"","summary":"","exp":[{"role":"","company":"","loc":"","start":"","end":"","bul":"one bullet per line"}],"edu":[{"deg":"","inst":"","loc":"","year":"","note":""}],"tech":"comma separated","tools":"comma separated","soft":"comma separated","langs":"one per line, with level","certs":"one per line","proj":"","awards":"","vol":"","pubs":"","refs":""}';
const j=await sm.json('Extract this CV into JSON with exactly this shape and nothing else (use "" when unknown, "end" is "" for a current job, never invent facts): '+S+'\n\nCV text:\n'+$('#raw').value.slice(0,14000));
if(!j||!Array.isArray(j.exp)||typeof j.name!='string')throw Error('The reply did not match the expected fields.');
const o=blank(),str=v=>Array.isArray(v)?v.join('\n'):String(v??'');for(const k of Object.keys(o)){if(k=='exp'||k=='edu'||k=='photo')continue;o[k]=str(j[k])}
o.exp=j.exp.map(e=>({role:str(e.role),company:str(e.company),loc:str(e.loc),start:str(e.start),end:str(e.end),bul:str(e.bul)}));o.edu=(Array.isArray(j.edu)?j.edu:[]).map(e=>({deg:str(e.deg),inst:str(e.inst),loc:str(e.loc),year:str(e.year),note:str(e.note)}));
commit();o.photo=d.photo;d=o;imp.w=check(d);commit();renderAll();drawer();a.textContent='Claude re-read the text and updated the fields. Use Undo to go back.'}
catch(e){a.textContent='Claude refinement failed: '+(e.message||e.code||e)+' The built-in parser result is unchanged.'}};
/* ===== Optional AI remap: the user's own free Gemini key, kept in this browser ===== */
function aiSay(t){document.querySelectorAll('[data-aistat]').forEach(x=>x.textContent=t);const s=$('#aistat');if(s&&s.textContent!=t)s.textContent=t}
async function aiRun(why){const a=$('#aistat'),s=aiSettings();if(!imp){aiSay('Upload or paste a CV first.');return}
if(!s.key){aiSay('Add a free key below to use AI remap.');$('#aikey').focus();return}
const txt=(($('#raw').value||'').trim()||imp.raw||'').trim();
if(txt.replace(/\s/g,'').length<50){aiSay('There is not enough text to send.');return}
const b=$('#airemap');b.disabled=1;aiSay('AI is reading the text…');
try{const r=await aiRemap(txt,s);commit();d=aiRecord(r.json,d);imp.raw=txt;imp.w=check(d);commit();renderAll();drawer();
aiSay(`AI re-read the text with ${r.model} and filled the fields.${why=='auto'?'':' Use Undo to go back.'}`)}
catch(e){aiSay('AI remap failed: '+(e&&e.message||e)+' Your rule-based result is unchanged.')}
finally{b.disabled=0}}
$('#airemap').onclick=()=>aiRun('manual');
$('#aisave').onclick=()=>{const v=$('#aikey').value.trim();if(!v)return aiSay('Paste a key first, or press Remove to clear it.');aiSet({key:v,model:''});aiSay('Key saved in this browser. Upload a CV or press “AI remap”.')};
$('#aiforget').onclick=()=>{aiSet({key:'',model:''});$('#aikey').value='';aiSay('Key removed from this browser.')};
$('#aiauto').onchange=e=>aiSet({auto:e.target.checked?1:0});
aiInit();
window.addEventListener('error',e=>{const m=$('#emsg');if(m&&step==1){m.className='err';m.textContent='Something went wrong: '+e.message}});
const KEY='cvmaker:session:v1';
function persist(){if(!started)return;try{const o={v:1,d,country,ov,step,started,stat,imp,base};try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){o.d={...d,photo:''};localStorage.setItem(KEY,JSON.stringify(o))}}catch(e){}}
function restore(){try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&o.started&&o.d){d={...blank(),...o.d};country=o.country||'';ov=o.ov||{};started=1;stat=o.stat||'';imp=o.imp||null;base=o.base||JSON.stringify(d);last=JSON.stringify(d);hist=[];$('#cty').value=country;renderAll(stat);go(Math.min(o.step||2,reach()));return}}catch(e){}renderGuide();go(1)}
/* ===== Responsive: scale the A4/Letter sheet to fit the screen ===== */
function fitOne(el,wrap,max){if(!el||!wrap)return;el.style.transform='';el.style.marginLeft='';wrap.style.height='';wrap.classList.remove('fit');const av=wrap.clientWidth,w=el.offsetWidth;if(!av||!w)return;const sc=Math.min(max,av/w);if(sc<1){el.style.transformOrigin='top left';el.style.transform=`scale(${sc})`;el.style.marginLeft=Math.max(0,(av-w*sc)/2)+'px';wrap.style.height=Math.ceil(el.offsetHeight*sc)+'px';wrap.classList.add('fit')}}
function fit(){for(const [id,m] of [['#paper',1],['#paper2',1],['#paper3',.55]]){const el=$(id);el&&fitOne(el,el.parentElement,m)}}
let rzt;window.addEventListener('resize',()=>{clearTimeout(rzt);rzt=setTimeout(fit,120)});window.addEventListener('orientationchange',()=>setTimeout(fit,200));
$('#mv').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('#ws').dataset.v=b.dataset.v;document.querySelectorAll('#mv button').forEach(x=>x.classList.toggle('on',x===b));fit();window.scrollTo(0,0)});
window.addEventListener('pagehide',commit);document.addEventListener('visibilitychange',()=>{if(document.hidden)commit()});
if(!window.claude)$('#ai').style.display='none';
restore();
