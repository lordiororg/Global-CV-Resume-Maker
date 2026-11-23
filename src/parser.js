/* Pure text parser: PDF reading-order reconstruction, section detection, field mapping. No DOM access. */
/* Blank CV record: the single schema shared by the form, preview, exporters and tests. */
const blank=()=>({name:'',title:'',email:'',phone:'',location:'',links:'',photo:'',dob:'',pob:'',mar:'',hob:'',gen:'',addr:'',mother:'',drive:'',pass:'',idn:'',nat:'',visa:'',summary:'',exp:[],edu:[],tech:'',tools:'',soft:'',langs:'',certs:'',proj:'',awards:'',vol:'',pubs:'',refs:''});
/* PARSER-START */
const BU=/^[•\-*▪●·–◦■➢✓]\s*/,
TK=/\b(engineer|developer|analyst|manager|director|officer|consultant|specialist|lead|head|assistant|associate|administrator|coordinator|supervisor|intern|executive|technician|designer|architect|scientist|accountant|auditor|teacher|lecturer|nurse|clerk|representative|advisor|adviser|programmer|researcher|president|founder|trainee|driver|surveyor|attendant|secretary|agent|controller|strategist|producer|editor|writer)\b/i,
CK=/\b(ltd|limited|inc|llc|plc|bank|university|hospital|group|company|co\.|corp|corporation|solutions|technologies|services|school|ministry|agency|foundation|council|authority|logistics|partners|associates|holdings|systems|labs|studio|college|institute|enterprises|consulting|insurance|telecom)\b/i,
DEG=/\b(bachelor|master|doctor|ph\.?d|b\.?\s?sc|m\.?\s?sc|b\.?\s?a|m\.?\s?a|b\.?\s?eng|m\.?\s?eng|b\.?\s?com|b\.?\s?ed|mba|llb|llm|mbbs|bba|b\.?\s?tech|m\.?\s?tech|diploma|certificate|degree|a-levels?|o-levels?|gcse|high school|secondary|kcse|kcpe|hnd)\b/i,
INS=/\b(universit(?:y|é|ät)|college|institute|school|academy|polytechnic|campus|faculty)\b/i,
MON='(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?,?\\s*',DT=`\\d{1,2}[\\/.]\\d{1,2}[\\/.](?:19|20)\\d{2}|(?:${MON})?(?:19|20)\\d{2}|\\d{1,2}[\\/.](?:19|20)\\d{2}`,
ANC=new RegExp('^('+`\\d{1,2}[\\/.]\\d{1,2}[\\/.](?:19|20)\\d{2}|(?:${MON})?(?:19|20)\\d{2}`+')(?:\\s*(?:-|–|—|to)\\s*('+`\\d{1,2}[\\/.]\\d{1,2}[\\/.](?:19|20)\\d{2}|(?:${MON})?(?:19|20)\\d{2}`+'|present|current|now))?','i'),
DR=new RegExp(`(${DT})\\s*(?:-|–|—|to|until|till)\\s*(${DT}|present|current|now|date|ongoing)`,'i'),
HK={x:/^((work|professional|employment|career|relevant|industry)( and \w+)? )?(experience|history|background|record)$|^employment$|^work$|^internships?$/,
e:/^(education|academic( background| qualifications| record| history)?|qualifications|educational background|education and (training|qualifications))$/,
k:/^((technical|key|core|professional|relevant|it|computer|personal) )?(skills?|competenc(e|ies)|expertise|technologies|proficiency)( and (abilities|tools|expertise|competenc(e|ies)|strengths))?$|^tools( and technologies)?$|^areas of expertise$|^strengths$/,
s:/^((professional|career|personal|executive|profile) )?(summary|profile|objective|statement|overview)$|^about( me)?$|^career (summary|objective|profile)$|^summary of qualifications$/,
l:/^languages?( proficiency| skills)?$/,
c:/^(certifications?|licen[sc]es|certificates?|courses|professional (development|certifications?|training)|training( and certifications?)?)( and licen[sc]es)?$/,
p:/^((key|selected|academic|personal|notable) )?projects?$/,
a:/^(awards?|honou?rs|achievements|accomplishments|scholarships|awards and (honou?rs|achievements)|honou?rs and awards)$/,
v:/^(volunteer(ing)?( experience| work)?|community (service|involvement)|extracurricular( activities)?|leadership( and activities)?)$/,
u:/^(publications?|papers|selected publications)$/,
r:/^(referees?|references?)$/,
h:/^(contact( details| information| info)?)$/,
d:/^driving licen[sc]es?$/,
z:/^(interests?|hobbies( and interests)?|personal (details|information|data|particulars)|declaration|additional information|other)$/};
const hk=l=>{if(l.length>45||/\d/.test(l)||BU.test(l))return'';const n=l.toLowerCase().replace(/&/g,' and ').replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();return n.split(' ').length>5?'':Object.keys(HK).find(k=>HK[k].test(n))||''};
const isc=l=>/@|https?:|www\.|linkedin|github/i.test(l)||/\d{4,}/.test(l.replace(/\s/g,''));
const locOk=l=>!isc(l)&&!TK.test(l)&&!CK.test(l)&&(COUNTRIES.some(c=>l.endsWith(c))||/^[\p{L} .'’-]+,\s*[\p{L} .'’-]+$/u.test(l));
const SOFT=/^(communication|leadership|teamwork|team work|team player|problem[- ]solving|time management|adaptab|critical thinking|creativ|collaborat|negotiat|presentation|interpersonal|organi[sz]ation|stakeholder|attention to detail|work ethic|multitask|conflict|decision|mentor|customer service|public speaking|analytical thinking)/i;
const tc=s=>s.trim().toLowerCase().replace(/(^|[\s'’(-])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase()).replace(/\b(Of|And|In|The|For|To)\b/g,m=>m.toLowerCase()),fx=s=>s&&s==s.toUpperCase()&&/[A-Z]{3}/.test(s)?tc(s):s;
const yr=s=>[...s.matchAll(/(?:19|20)\d{2}/g)].map(m=>m[0]);
function order(items,W){
const t=items.map(i=>({s:i.str,x:i.transform[4],y:i.transform[5],w:i.width||0,h:Math.abs(i.transform[3])||10})).sort((a,b)=>b.y-a.y||a.x-b.x),R=[];
for(const i of t){const r=R.find(r=>Math.abs(r.y-i.y)<=Math.max(2,i.h*.4));r?r.t.push(i):R.push({y:i.y,t:[i]})}
const rows=R.map(r=>{r.t.sort((a,b)=>a.x-b.x);const sg=[];let c=null;for(const i of r.t){const g=c?i.x-c.x1:0;if(c&&g<i.h*1.6){c.s+=(g>i.h*.12&&!/\s$/.test(c.s)&&!/^\s/.test(i.s)?' ':'')+i.s;c.x1=i.x+i.w}else{c={s:i.s,x0:i.x,x1:i.x+i.w};sg.push(c)}}return sg});
const S=rows.flat();if(!S.length)return'';const cs=[],ns=[];
for(let c=.3*W;c<=.7*W;c+=W/60){cs.push(c);ns.push(S.filter(s=>s.x0<c-2&&s.x1>c+2).length)}
const best=Math.min(...ns),gs=cs.filter((c,i)=>ns[i]==best),g=gs[gs.length>>1],wd=s=>s.x1-s.x0>.18*W,
two=S.filter(s=>s.x0>=g&&wd(s)).length>=5&&S.filter(s=>s.x1<=g&&wd(s)).length>=5&&best<=.15*S.length,J=(r,j)=>r.map(s=>s.s.trim()).join(j);
if(!two)return rows.map(r=>J(r,' | ')).join('\n');
const out=[];let A=[],B=[];const fl=()=>{out.push(...A,...B);A=[];B=[]};
for(const r of rows){if(r.some(s=>s.x0<g-2&&s.x1>g+2)){fl();out.push(J(r,' '));continue}
const l=r.filter(s=>s.x0<g),q=r.filter(s=>s.x0>=g);l.length&&A.push(J(l,' | '));q.length&&B.push(J(q,' | '))}
fl();return out.join('\n')}
function ph(hs,loc){const P=hs.flatMap(h=>h.split(/\s+[|–—@]\s+|\s+-\s+|\s+at\s+|\s{2,}/)).map(x=>x.trim().replace(/^[–—|-]\s*/,'')).filter(Boolean),
T=P.flatMap(p=>P.length==1||CK.test(p)||(!TK.test(p)&&p.includes(','))?p.split(/,\s+/):[p]),ri=Math.max(0,T.findIndex(x=>TK.test(x))),role=T.splice(ri,1)[0]||'',ci=Math.max(0,T.findIndex(x=>CK.test(x))),co=T.splice(ci,1)[0]||'';
return{role:fx(role),company:fx(co),loc:fx(loc||T.map(x=>x.trim()).join(', '))}}
function jobs(X){const A=[];X.forEach((l,i)=>{if(!BU.test(l)&&l.length<110&&DR.test(l))A.push(i)});
const J=A.map((ai,k)=>{let bs=ai+1;const m=X[ai].match(DR),rest=X[ai].replace(m[0],'').replace(/^[\s()|,–—-]+|[\s()|,–—-]+$/g,''),prev=k?A[k-1]:-1,hdr=[];let from=ai,loc='';
if(!rest||locOk(rest)){loc=rest;for(let j=ai-1;j>prev&&hdr.length<2;j--){const p=X[j];if(BU.test(p)||p.length>90||/[.;]$/.test(p))break;hdr.unshift(p);from=j}}else{hdr.push(rest);const w=X[bs];if(w&&!BU.test(w)&&w.length<25&&w==w.toUpperCase()&&!/[.:]/.test(w)){hdr[0]+=', '+w;bs++}
if(!ph([hdr[0]]).company){const n=X[bs];if(n&&!BU.test(n)&&n.length<90&&!/[.;]$/.test(n)&&!DR.test(n)&&!hk(n)&&(CK.test(n)||locOk(n)||n.includes(',')||n.split(' ').length<=4)){hdr.push(n);bs++}}}
return{ai,from,bs,m,hdr,loc}});
return J.map((j,k)=>{const body=X.slice(j.bs,k+1<J.length?J[k+1].from:X.length),bl=[];
for(const l of body){const b=BU.test(l),s=l.replace(BU,'');if(!b&&bl.length&&/^[a-z(]/.test(s))bl[bl.length-1]+=' '+s;else bl.push(s)}
const h=j.hdr.length?ph(j.hdr,j.loc):{role:'',company:'',loc:j.loc};
return{...h,start:j.m[1].trim().replace(/,$/,''),end:/present|current|now|date|ongoing/i.test(j.m[2])?'':j.m[2].trim(),bul:bl.join('\n')}})}
function edusD(E){const out=[];let cur=null;
const sp=t=>{const m=t.match(/^((?:[A-Z0-9&'’().,\/+-]+\s+)+)(?=[A-Z][a-z])/);return m?{deg:m[1].trim(),inst:t.slice(m[0].length).trim()}:{deg:t.trim(),inst:''}};
for(const l0 of E){const l=l0.replace(/\s*\|\s*/g,' ').trim(),m=l.match(ANC);
if(m){const rest=l.slice(m[0].length).replace(/^[|,\s]+/,'').replace(/\s+,/g,',');cur={deg:'',inst:'',loc:'',year:m[2]?m[1]+' – '+(/present|current|now/i.test(m[2])?'Present':m[2]):m[1],note:'',eqf:''};out.push(cur);if(rest&&(DEG.test(rest)||INS.test(rest)))Object.assign(cur,sp(rest));else cur.loc=rest;continue}
if(!cur)continue;const q=l.match(/level in eqf\s*(?:eqf level)?\s*(\d)/i);if(q){cur.eqf=q[1];continue}
if(!cur.deg){Object.assign(cur,sp(l.replace(BU,'')));continue}
if(!cur.inst&&INS.test(l)){cur.inst=l.replace(BU,'');continue}cur.note+=l.replace(BU,'')+'\n'}
return out.map(e=>({...e,deg:fx(e.deg),loc:fx(e.loc)}))}
function edus(E){if(E.length&&ANC.test(E[0].replace(/\s*\|\s*/g,' ')))return edusD(E);const out=[];let cur=null,pend='';
const cl=l=>l.replace(DR,'').replace(/\(?\b(?:19|20)\d{2}\b\)?/g,'').replace(/^[\s,|–—-]+|[\s,|–—-]+$/g,'').trim(),NOTE=/gpa|cgpa|grade|honou?rs|distinction|first class|second class|cum laude|dean|merit|%/i;
for(const l of E){const s=l.replace(BU,''),y=yr(s),dr=s.match(DR),yv=dr?dr[1]+' – '+(/present|current|now/i.test(dr[2])?'Present':dr[2]):y.length>1?y[0]+' – '+y[y.length-1]:y[0]||'';
if(DEG.test(s)&&!/^(gpa|cgpa|grade)/i.test(s)){const p=cl(s).split(/\s+[|–—@]\s+|\s+-\s+|\s{2,}/).map(x=>x.trim()).filter(Boolean),deg=p.find(x=>DEG.test(x))||p[0]||'',inst=p.find(x=>x!==deg&&INS.test(x))||'';
cur={deg,inst:inst||pend,loc:p.filter(x=>x!==deg&&x!==inst).join(', '),year:yv,note:''};pend='';out.push(cur)}
else if(NOTE.test(s)&&cur)cur.note+=s+'\n';
else if(INS.test(s)){const c=cl(s).split(/,\s+/);if(cur&&!cur.inst){cur.inst=c[0];cur.loc=cur.loc||c.slice(1).join(', ');cur.year=cur.year||yv}else pend=c[0]}
else if(cur&&!cur.inst&&cl(s))cur.inst=cl(s);else if(cur&&!cur.year&&yv)cur.year=yv;else if(!cur&&cl(s))pend=cl(s)}
return out}
function parse(t){const lines=t.replace(/\r/g,'').replace(/\u00a0/g,' ').split('\n').map(s=>s.replace(/[ \t]+/g,' ').trim()).filter(Boolean),o=blank(),B={h:[]};let cur='h';
for(const l of lines){let k=hk(l.replace(/[:：]\s*$/,''));
if(!k){const m=l.match(/^([A-Za-z &/]{3,30})\s*[:：]\s*(\S.*)$/);if(m){const k2=hk(m[1]);if(k2&&k2!=cur&&'klcpauvrd'.includes(k2)){cur=k2;(B[cur]=B[cur]||[]).push(m[2]);continue}}}
if(k){cur=k;B[k]=B[k]||[]}else(B[cur]=B[cur]||[]).push(l)}
const hp=B.h.slice(0,30).flatMap(l=>l.split(/\s*[|•·]\s*|\s{3,}/)).map(s=>s.replace(/^(address|location|tel|phone|mobile|cell|e-?mail|linkedin|website|web)\s*[:\-]\s*/i,'').trim()).filter(Boolean),
nameOk=l=>!isc(l)&&l.length<46&&l.split(' ').length<=5&&!hk(l)&&!TK.test(l)&&/^[\p{L}][\p{L} .'’-]+$/u.test(l)&&!/^(curriculum vitae|resume|résumé|cv|profile)$/i.test(l);
o.name=hp.find(nameOk)||'';if(o.name&&o.name==o.name.toUpperCase())o.name=o.name.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
o.title=hp.find(l=>l!==o.name&&!isc(l)&&l.length<70&&TK.test(l)&&l.split(' ').length<=9)||hp.find(l=>l!==o.name&&!isc(l)&&l.length<60&&l.split(' ').length<=6&&!l.includes(',')&&!locOk(l)&&!/^(curriculum vitae|resume|résumé|cv)$/i.test(l))||'';
o.email=(t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)||[''])[0];
const pf=x=>{const n=x.replace(/\D/g,'').length;return n>=9&&n<=15&&!DR.test(x)&&!/^(19|20)\d{2}/.test(x.trim())},pr=/(?:\+|00)?\d[\d\s().-]{7,}\d/g,ph_=(B.h.slice(0,30).join('\n').match(pr)||[]).find(pf)||(t.match(pr)||[]).find(pf);o.phone=(ph_||'').trim();
o.links=[...new Set((t.match(/(?:https?:\/\/|www\.)[^\s,;|)]+|(?:linkedin\.com|github\.com|behance\.net|gitlab\.com)\/[^\s,;|)]+/gi)||[]).map(x=>x.replace(/[.]$/,'')))].join(', ');
o.location=hp.find(l=>l!==o.name&&l!==o.title&&locOk(l))||'';
const g=(r,n)=>((t.match(r)||[])[1]||'').split(/\s{2,}|\s+(?:marital|gender|sex|dob|date|nationality|address)\b/i)[0].trim();
o.dob=g(/(?:date of birth|dob|born)\s*[:\-]\s*([^\n|;]{6,24})/i);o.nat=g(/nationality\s*[:\-]\s*([A-Za-z ]{3,25})/i);o.visa=g(/(?:visa|work (?:permit|authori[sz]ation)|right to work|residency)(?: status)?\s*[:\-]\s*([^\n|;]{3,60})/i);
o.gen=g(/gender\s*[:\-]\s*([A-Za-z]{3,10})/i);o.addr=g(/address\s*[:\-]\s*([^\n|]{3,80})/i);o.pass=g(/passport (?:validity|expiry|expiration)\s*[:\-]\s*([^\n|;]{4,30})/i);o.drive=(B.d||[]).join(' ').replace(/^driving licen[sc]e\s*[:\-]?\s*/i,'').replace(/\s*\|\s*/g,' ').trim();
o.summary=(B.s||[]).join(' ')||B.h.find(l=>l.length>140)||'';
o.exp=jobs(B.x||[]);o.edu=edus(B.e||[]);
const tech=[],tools=[],soft=[];for(const l of B.k||[]){const m=l.match(/^([A-Za-z &/()-]{3,40})\s*[:：]\s*(.+)$/),lab=m?m[1]:'';
for(const it of (m?m[2]:l).replace(BU,'').split(/\s*[,;•|·]\s*|\s{3,}/).map(x=>x.trim()).filter(Boolean))(/soft|interpersonal|people/i.test(lab)||SOFT.test(it)?soft:/tool|software|platform|framework|system/i.test(lab)&&!/programming/i.test(lab)?tools:tech).push(it)}
o.tech=tech.join(', ');o.tools=tools.join(', ');o.soft=soft.join(', ');
const ls=a=>(B[a]||[]).map(x=>x.replace(BU,'')).join('\n');
const lg=[];for(const l0 of B.l||[]){const l=l0.replace(BU,'').trim(),l2=l.replace(/\s*\|\s*/g,' ');let m;
if(m=l2.match(/^mother tongues?(?:\(s\))?\s*[:\-]\s*(.+)$/i)){o.mother=tc(m[1]);continue}
if(/^(other languages?|understanding|listening|speaking|writing|spoken|levels:?)/i.test(l2))continue;
if(m=l2.match(/^(.+?)\s+((?:[ABC][12]\s*){1,5})$/)){const lv=m[2].match(/[ABC][12]/g);lg.push(tc(m[1])+' – '+(new Set(lv).size==1?lv[0]:lv.join(' ')));continue}
lg.push(...(l.includes('(')?[l]:l.split(/\s*[,;|]\s*/)).filter(Boolean))}o.langs=lg.join('\n');
o.certs=ls('c');o.proj=ls('p');o.awards=ls('a');o.vol=ls('v');o.pubs=ls('u');o.refs=/on request|upon request|on demand/i.test(ls('r'))?'':ls('r');
return{o,un:(B.z||[]).join('\n')}}
function check(o){const w=[];if(!o.name)w.push('No name found: put it in the first line of the file.');if(!o.email)w.push('No email address found.');if(!o.phone)w.push('No phone number found.');if(!o.location)w.push('No location found (expected “City, Country”).');
if(!o.summary)w.push('No summary or objective found.');if(!o.exp.length)w.push('No work experience found. Check that each role has a date range such as “Jan 2020 – Present”.');
o.exp.forEach((e,i)=>{if(!e.role)w.push(`Role ${i+1}: job title unclear.`);if(!e.company)w.push(`Role ${i+1} (${e.role||'untitled'}): company unclear.`);if(!e.bul)w.push(`Role ${i+1}: no bullet points found.`)});
if(!o.edu.length)w.push('No education found.');o.edu.forEach((e,i)=>{if(!e.inst)w.push(`Education ${i+1}: institution unclear.`);if(!e.year)w.push(`Education ${i+1}: no year found.`)});
if(!(o.tech||o.tools||o.soft))w.push('No skills found.');return w}
/* PARSER-END */
const cleanText=t=>t.replace(/\(cid:\d+\)|[\uf000-\uf0ff]/g,'•').replace(/(\S)[ \t]*•[ \t]*(?=[A-Z])/g,'$1\n• ');
