const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get = (p,k) => String(p[k] ?? '').trim();
const localized=(p,ua,en,L)=>get(p,L==='en'?en:ua)||get(p,ua)||get(p,en);
const split = s => String(s||'').split(';').map(x=>x.trim()).filter(Boolean);
const validUrl = s => {try{let u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
let people=[];
let lang=localStorage.getItem('mip-lang')==='en'?'en':'ua';
const ui={ua:{eyebrow:'Наука · Експертиза · Співпраця',heading:'Науковці університету',intro:'Знайдіть дослідників за напрямами експертизи, кафедрами та ключовими компетентностями для наукової, освітньої й міжнародної співпраці.',search:'Пошук за ім’ям, кафедрою, компетентністю…',allDepts:'Усі кафедри',allFields:'Усі напрями',listHeading:'Каталог науковців',count:'профілів знайдено',open:'Переглянути портфоліо →',empty:'За вашим запитом науковців не знайдено.',footer:'Демонстраційний прототип: усі особи та досягнення вигадані.',loading:'Завантаження даних…',error:'Не вдалося завантажити researchers.json. Перевірте, чи файл розміщений поруч із HTML.'},en:{eyebrow:'Research · Expertise · Collaboration',heading:'University Researchers',intro:'Find researchers by expertise, department and competencies for research, education and international collaboration.',search:'Search by name, department, expertise…',allDepts:'All departments',allFields:'All research areas',listHeading:'Researcher Directory',count:'profiles found',open:'View portfolio →',empty:'No researchers match your search.',footer:'Demonstration prototype: all people and achievements are fictional.',loading:'Loading researchers…',error:'Could not load researchers.json. Check that it is next to the HTML files.'}};
const id=p=>get(p,'ID науковця (унікальний, латиницею)');
const name=(p,L)=>localized(p,'ПІБ (UA)','Full name (EN)',L);
const degree=(p,L)=>localized(p,'Науковий ступінь, звання (UA)','Degree and academic title (EN)',L);
const department=(p,L)=>localized(p,'Кафедра (UA)','Department (EN)',L);
const interests=(p,L)=>split(localized(p,'Наукові інтереси (UA; через ;)','Research interests (EN; separated by ;)',L));
const expertise=(p,L)=>split(localized(p,'Ключові компетентності (UA; через ;)','Key expertise (EN; separated by ;)',L));
function render(){
 if(!$('cards'))return;
 document.documentElement.lang=lang;document.title=(lang==='ua'?'Науковці':'Researchers')+' | Metinvest Polytechnic';
 for(const key of ['eyebrow','heading','intro','listHeading','footer'])$(key).textContent=ui[lang][key];
 $('search').placeholder=ui[lang].search;
 for(const key of ['ua','en'])$(key).classList.toggle('active',lang===key);
 const depSelect=$('department'),fieldSelect=$('field');const prevDep=depSelect.value,prevField=fieldSelect.value;
 const depts=[...new Set(people.map(p=>department(p,lang)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const fields=[...new Set(people.flatMap(p=>interests(p,lang)))].sort((a,b)=>a.localeCompare(b));
 depSelect.innerHTML='<option value="">'+esc(ui[lang].allDepts)+'</option>'+depts.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join('');
 fieldSelect.innerHTML='<option value="">'+esc(ui[lang].allFields)+'</option>'+fields.map(f=>'<option value="'+esc(f)+'">'+esc(f)+'</option>').join('');
 depSelect.value=depts.includes(prevDep)?prevDep:'';fieldSelect.value=fields.includes(prevField)?prevField:'';
 const q=$('search').value.trim().toLocaleLowerCase();
 const shown=people.filter(p=>(!depSelect.value||department(p,lang)===depSelect.value)&&(!fieldSelect.value||interests(p,lang).includes(fieldSelect.value))&&(!q||[name(p,'ua'),name(p,'en'),degree(p,lang),department(p,'ua'),department(p,'en'),...interests(p,'ua'),...interests(p,'en'),...expertise(p,'ua'),...expertise(p,'en')].join(' ').toLocaleLowerCase().includes(q)));
 $('count').textContent=shown.length+' '+ui[lang].count;
 $('cards').innerHTML=shown.map(p=>`<article class="card"><div class="identity"><div class="avatar" aria-hidden="true">👤</div><div><h3 class="name">${esc(name(p,lang))}</h3><div class="degree">${esc(degree(p,lang))}</div></div></div><div class="dept">${esc(department(p,lang))}</div><div class="tags">${interests(p,lang).map(x=>'<span class="tag">'+esc(x)+'</span>').join('')}</div><a class="open" href="profile.html?id=${encodeURIComponent(id(p))}&lang=${lang}">${esc(ui[lang].open)}</a></article>`).join('');
 $('empty').hidden=shown.length>0;$('empty').textContent=ui[lang].empty;
}
async function loadResearchers(){const res=await fetch('researchers.json',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);const raw=await res.json();if(!Array.isArray(raw))throw new Error('Expected JSON array');return raw.filter(p=>p&&get(p,'Статус портфоліо')==='Затверджено'&&id(p)&&get(p,'ПІБ (UA)'))}
async function initCatalog(){if(!$('cards'))return;
 $('empty').hidden=false;$('empty').textContent=ui[lang].loading;
 $('search').addEventListener('input',render);$('department').addEventListener('change',render);$('field').addEventListener('change',render);
 for(const L of ['ua','en'])$(L).addEventListener('click',()=>{lang=L;localStorage.setItem('mip-lang',L);$('department').value='';$('field').value='';render()});
 try{people=await loadResearchers();render()}catch(e){console.error(e);$('empty').hidden=false;$('empty').textContent=ui[lang].error;}
}
initCatalog();
