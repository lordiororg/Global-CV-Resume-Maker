/* Optional AI remap: re-reads the text taken from an uploaded CV and returns a filled record.
   It calls Google's Gemini API, whose free tier covers this use generously (around 500 requests a day on the
   Flash-Lite models, no card, and the endpoint answers browser requests for this origin). The key is the user's
   own: it is kept in this browser's localStorage, sent only to Google, and never written into the project.
   app.js uses aiSettings(), aiInit(), aiAuto(), aiRemap() and aiRecord(). */
const AIK='cvmaker:ai:v1',AIB='https://generativelanguage.googleapis.com/v1beta/models/';
/* The shape asked of the model: the same fields as blank() in parser.js. */
const AISHAPE='{"name":"","title":"","email":"","phone":"","location":"","links":"","dob":"","pob":"","mar":"","hob":"","gen":"","addr":"","mother":"","drive":"","pass":"","idn":"","nat":"","visa":"","summary":"","exp":[{"role":"","company":"","loc":"","start":"","end":"","bul":"one bullet per line"}],"edu":[{"deg":"","inst":"","loc":"","year":"","note":"","eqf":""}],"tech":"comma separated","tools":"comma separated","soft":"comma separated","langs":"one per line with any CEFR level","certs":"one per line","proj":"","awards":"","vol":"","pubs":"","refs":""}';
function aiSettings(){let o={key:'',model:'',auto:1};try{const s=JSON.parse(localStorage.getItem(AIK)||'null');if(s&&typeof s=='object')o={...o,...s}}catch(e){}return o}
function aiSet(p){try{localStorage.setItem(AIK,JSON.stringify({...aiSettings(),...p}))}catch(e){}}
const aiAuto=()=>{const s=aiSettings();return !!(s.key&&s.auto)};
function aiInit(){const s=aiSettings(),k=document.getElementById('aikey'),a=document.getElementById('aiauto');if(k&&!k.value)k.value=s.key||'';if(a)a.checked=!!s.auto}
const aiPrompt=t=>`You are a precise CV parser. Map the CV text below into a JSON object with exactly this shape and reply with JSON only. Rules: use "" when a detail is not in the text and never invent, translate or improve anything; copy wording as written, one bullet per line in "bul"; "end" is "" for a current job; keep dates exactly as written; skills and tools are comma separated; keep any CEFR level with the language; a job goes in "exp" and a qualification goes in "edu", never the other way round; ignore page headers, footers and page numbers.\n\nShape:\n${AISHAPE}\n\nCV text:\n${t}`;
function aiJSON(t){t=String(t||'').trim().replace(/^```[a-z]*\s*/i,'').replace(/\s*```$/,'');const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)return null;try{return JSON.parse(t.slice(a,b+1))}catch(e){return null}}
function aiFail(r,j){const m=((j||{}).error||{}),msg=m.message||'';
if(r.status==400&&/key/i.test(msg))return Error('That API key was rejected. Create or copy a key at aistudio.google.com/apikey and paste it again.');
if(r.status==401||r.status==403)return Error('This key is not allowed to use the Gemini API'+(msg?': '+msg:'')+'.');
if(r.status==429)return Error('The free quota for today is used up (it resets at midnight Pacific).');
return Error('Google returned '+r.status+(msg?': '+msg:''))}
async function aiGet(key){
const r=await fetch(AIB+'?pageSize=200',{headers:{'x-goog-api-key':key}}),j=await r.json().catch(()=>null);
if(!r.ok)throw aiFail(r,j);
return ((j||{}).models||[]).filter(m=>{const s=m.supportedGenerationMethods;return !Array.isArray(s)||s.includes('generateContent')})}
/* Prefers a Flash-Lite model, which has the largest free daily allowance, then the newest name. */
function aiPick(ms){const n=(ms||[]).map(m=>String(m.name||'').replace(/^models\//,'')).filter(x=>x&&!/image|tts|audio|embed|aqa|veo|imagen|native/i.test(x)),
v=x=>{const m=x.match(/(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):0},c=k=>n.filter(x=>new RegExp(k,'i').test(x)&&!/preview|exp/i.test(x)),
l=c('lite'),f=c('flash');return (l.length?l:f.length?f:n).sort((a,b)=>v(b)-v(a))[0]||''}
async function aiSend(key,model,prompt){
const r=await fetch(AIB+encodeURIComponent(model)+':generateContent',{method:'POST',
headers:{'Content-Type':'application/json','x-goog-api-key':key},
body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:4096,responseMimeType:'application/json'}})});
const j=await r.json().catch(()=>null);return{r,j}}
async function aiRemap(text,s){
if(!navigator.onLine)throw Error('You are offline.');
let model=s.model||'';
if(!model){model=aiPick(await aiGet(s.key));if(!model)throw Error('No text model is available to this key.');aiSet({model})}
const prompt=aiPrompt(String(text||'').slice(0,20000));
let {r,j}=await aiSend(s.key,model,prompt);
if(r.status==404){model=aiPick(await aiGet(s.key));if(!model)throw Error('No text model is available to this key.');aiSet({model});({r,j}=await aiSend(s.key,model,prompt))}
if(!r.ok)throw aiFail(r,j);
const c=((j||{}).candidates||[])[0]||{},out=((c.content&&c.content.parts)||[]).map(p=>p.text||'').join(''),o=aiJSON(out);
if(!o)throw Error('The AI reply could not be read as JSON. Try again.');
if(c.finishReason=='MAX_TOKENS')throw Error('That CV is too long for one reply. Shorten the text and try again.');
return{json:o,model}}
/* Builds a record from the model's JSON. Anything the model left blank keeps the value the rule-based parser
   found, so a partial reply never wipes a field that was already right. */
function aiRecord(j,prev){const o=blank(),str=v=>Array.isArray(v)?v.join('\n'):String(v??'').trim(),
keep=(k,v)=>{const x=str(v);return x||str(prev&&prev[k])};
for(const k of Object.keys(o)){if(k=='exp'||k=='edu'||k=='photo')continue;o[k]=keep(k,j[k])}
const ex=(Array.isArray(j.exp)?j.exp:[]).map(e=>({role:str(e.role),company:str(e.company),loc:str(e.loc),start:str(e.start),end:str(e.end),bul:str(e.bul)})).filter(e=>e.role||e.company||e.bul),
ed=(Array.isArray(j.edu)?j.edu:[]).map(e=>({deg:str(e.deg),inst:str(e.inst),loc:str(e.loc),year:str(e.year),note:str(e.note),eqf:str(e.eqf)})).filter(e=>e.deg||e.inst);
o.exp=ex.length?ex:(prev&&prev.exp)||[];o.edu=ed.length?ed:(prev&&prev.edu)||[];o.photo=(prev&&prev.photo)||'';
return o}
