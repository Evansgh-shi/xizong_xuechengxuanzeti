function currentModule(){return chapter().modules.find(m=>m.id===group().module)||chapter().modules[0];}
function ensureOrders(){
  for(const g of DATA){
    const valid=(saved,ids)=>Array.isArray(saved)&&saved.length===ids.length&&new Set(saved).size===ids.length&&saved.every(id=>ids.includes(id));
    const qids=g.questions.map(q=>q.id),oids=g.options.map(o=>o.id);
    if(!valid(state.orders[g.id],qids))state.orders[g.id]=shuffle(qids);
    if(!valid(state.optionOrders[g.id],oids))state.optionOrders[g.id]=shuffle(oids);
  }
}
function migrateSurgeryState(){
  const change=SOURCE.reorganization;if(state.organizationRevision===change.revision)return;
  const archive=state.retiredArchive&&typeof state.retiredArchive==='object'?state.retiredArchive:{};
  state.favorites=state.favorites||{};state.mistakes=state.mistakes||{};
  const aliases=new Map(change.retired.map(r=>[r.id,r.replaceBy]));
  for(const r of change.retired){
    const id=r.id,had=['answers','grades','history','favorites','mistakes'].some(k=>state[k]?.[id]!==undefined);
    if(had&&!archive[id])archive[id]={revision:change.revision,reason:r.reason,replaceBy:r.replaceBy,question:r.previousQuestion,answer:state.answers[id],grade:state.grades[id],history:state.history[id],favorite:state.favorites[id],mistake:state.mistakes[id]};
    if(state.favorites[id])for(const target of r.replaceBy)if(!state.favorites[target])state.favorites[target]=state.favorites[id];
    if(state.mistakes[id])for(const target of r.replaceBy)if(!state.mistakes[target])state.mistakes[target]={lastWrong:state.mistakes[id].lastWrong||0,wrongCount:state.mistakes[id].wrongCount||1,migratedFrom:id};
    delete state.answers[id];delete state.grades[id];delete state.favorites[id];delete state.mistakes[id];
    // Old history remains keyed by its original ID. It must not mark a replacement mastered.
  }
  state.retiredArchive=archive;
  state.wrongIds=[...new Set((Array.isArray(state.wrongIds)?state.wrongIds:[]).flatMap(id=>aliases.get(id)||[id]))].filter(id=>QMAP.has(id));
  state.group=change.groupAliases[state.group]||state.group;
  state.organizationRevision=change.revision;
  state.batchIndex=0;state.review=false;state.revealed=false;
}
function selectSurgeryModule(id){
  const module=CHAPTERS.flatMap(c=>c.modules).find(m=>m.id===id);if(!module)return;
  state.group=module.groups[0];state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';state.type='all';state.difficulty='all';state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();
}
function renderTabs(){
  const c=chapter(),module=currentModule();
  $('tabs').innerHTML=`<div class="surgery-module-heading"><strong>本章 ${c.modules.length} 个临床专题</strong><span>先选专题，再练同类选项；上下组可连续切换</span></div><div class="surgery-modules" role="group" aria-label="临床专题">${c.modules.map(m=>`<button class="surgery-module${m.id===module.id?' active':''}" data-surgery-module="${m.id}" aria-pressed="${m.id===module.id}"><span>${esc(m.name)}</span><small>已练 ${m.questionIds.filter(id=>state.history[id]?.attempts).length} / ${m.questionIds.length} 题</small></button>`).join('')}</div><div class="surgery-pool-controls"><label for="surgery-pool-select">专题内练习<select id="surgery-pool-select">${module.groups.map((id,i)=>{const g=DATA.find(g=>g.id===id);return `<option value="${id}"${id===state.group?' selected':''}>${i+1}. ${esc(g.name)}（${g.questions.length}题）</option>`;}).join('')}</select></label><button class="btn primary" data-surgery-practice="${module.id}">连练本专题 · ${module.questionIds.length}题</button></div>`;
}
function startSurgeryModulePractice(m){
  state.wrongOnly=true;state.wrongIds=[...m.questionIds];state.practiceLabel=m.name+' · 专题连练';state.type='all';state.difficulty='all';state.group=m.groups[0];state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();
  document.querySelector('.batch-toolbar').scrollIntoView({behavior:'smooth',block:'start'});toast(`已载入本专题 ${m.questionIds.length} 题，上下组连续练习；已有作答保留。`);
}
function renderChapterControls(){
  renderBaseChapterControls();const m=currentModule();$('chapter-page').textContent+=` · ${chapter().modules.length}专题`;
  $('chapter-select').setAttribute('title','按讲义38章排列；每章只展示合并后的临床专题');
}
function renderHeader(){renderBaseHeader();$('group-number').textContent=String(chapter().modules.indexOf(currentModule())+1).padStart(2,'0');}
function renderStudyTools(){
  renderBaseStudyTools();const m=currentModule(),index=m.groups.indexOf(state.group);
  $('exit-wrong-inline').textContent=state.practiceLabel?.includes('专题连练')?'退出专题连练':'退出筛选练习';
  $('batch-position').textContent=`专题内练习 ${index+1}/${m.groups.length} · 当前 ${current().length}题${state.wrongOnly?' · '+(state.practiceLabel||'筛选练习'):''}`;
  const before=navigationTarget(-1),after=navigationTarget(1);
  for(const [ids,target,label] of [[['prev-btn','prev-top-btn'],before,'← 上一组'],[['next-btn','next-top-btn'],after,'下一组 →']])for(const id of ids){const b=$(id);b.textContent=label;b.title=target?'切换到 '+DATA.find(g=>g.id===target.group).name:'已到练习边界';}
}
function catalogItems(term=''){
  const lower=term.trim().toLowerCase();
  const match=c=>!lower||(c.name+' '+c.system+' '+c.modules.map(m=>m.name).join(' ')+' '+c.groups.map(id=>DATA.find(g=>g.id===id).name).join(' ')).toLowerCase().includes(lower);
  return [...new Set(CHAPTERS.map(c=>c.system))].map(system=>{const list=CHAPTERS.filter(c=>c.system===system&&match(c));return list.length?`<section class="catalog-group"><h3>${esc(system)}<small>${list.length}章</small></h3><div class="catalog-list">${list.map(c=>`<button class="catalog-item${c.id===chapter().id?' active':''}" data-catalog-chapter="${c.id}"><span>${String(CHAPTERS.indexOf(c)+1).padStart(2,'0')} · ${esc(c.name)}</span><small>${c.modules.length} 个临床专题 · ${c.questionCount}题 · 已练 ${chapterPracticed(c)}</small><small>${esc(c.modules.map(m=>m.name).join(' / '))}</small></button>`).join('')}</div></section>`:'';}).join('')||'<p class="catalog-empty">没有匹配的章节或专题。</p>';
}
function showCatalog(){openDialog('外科章节与临床专题',`<p class="catalog-count">38章 · ${SOURCE.reorganization.moduleCount}个临床专题 · ${ALL.length}题。细分选项池收进专题内，不再铺满导航。</p><input id="catalog-search" class="catalog-search" type="search" aria-label="搜索章节或专题" placeholder="搜索：髋部骨折、急腹症、休克…"><div id="catalog-items">${catalogItems()}</div>`);document.querySelector('.dialog').classList.add('wide');}
function showRetiredSurgeryRecords(){
  const entries=Object.values(state.retiredArchive||{});
  openDialog('重整前的旧题记录',`<p>这次合并或替换的旧题不会计入新题掌握数；原作答、历史与收藏标记保留在下方，收藏和错题入口已对应到替代题。</p>${entries.length?entries.map(r=>{const names=ids=>(ids||[]).map(id=>r.question?.options.find(o=>o.id===id)?.text||id).map(esc).join(' ＋ ')||'未作答';return `<article class="notebook-entry"><h3>${esc(r.question?.stem||'旧题')}</h3><p>原作答：${names(r.answer)}<br>原答案：${names(r.question?.answer)}<br>历史练习 ${r.history?.attempts||0} 次${r.favorite?' · 曾收藏':''}</p><p>${esc(r.reason)}</p><button class="btn secondary" data-retired-practice="${esc(r.replaceBy.join(','))}">练习替代题</button></article>`;}).join(''):'<p>当前浏览器没有需要归档的旧题记录；未改题的记录仍在原位置。</p>'}`);document.querySelector('.dialog').classList.add('wide');
}
function syncChapterUrl(){try{const url=new URL(location.href);url.searchParams.set('chapter',chapter().id);url.searchParams.set('module',currentModule().id);history.replaceState(null,'',url);}catch{}}
function restoreSurgeryModuleUrl(){try{const id=new URL(location.href).searchParams.get('module'),m=chapter().modules.find(m=>m.id===id);if(m&&!m.groups.includes(state.group)){state.group=m.groups[0];state.batchIndex=0;state.review=false;state.revealed=false;}}catch{}}
$('tabs').addEventListener('click',e=>{
  const practice=e.target.closest('[data-surgery-practice]');if(practice){const m=CHAPTERS.flatMap(c=>c.modules).find(m=>m.id===practice.dataset.surgeryPractice);if(m)startSurgeryModulePractice(m);return;}
  const module=e.target.closest('[data-surgery-module]');if(module)selectSurgeryModule(module.dataset.surgeryModule);
});
$('tabs').addEventListener('change',e=>{if(e.target.id!=='surgery-pool-select')return;const id=e.target.value;if(!currentModule().groups.includes(id))return;state.group=id;state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();});
$('hip-differential-btn').addEventListener('click',()=>{const c=CHAPTERS.find(c=>c.id==='surg-28'),m=c.modules.find(m=>/髋|股骨颈|股骨近端/.test(m.name));if(m)selectSurgeryModule(m.id);document.querySelector('.chapter-controls').scrollIntoView({behavior:'smooth',block:'start'});});
$('surgery-archive-btn').addEventListener('click',showRetiredSurgeryRecords);
$('dialog-body').addEventListener('click',e=>{const b=e.target.closest('[data-retired-practice]');if(b)startNotebookPractice(b.dataset.retiredPractice.split(','),'旧题替代练习');});
