// One navigation, dock and notebook for all courses; answer namespaces stay separate.
const COMMON_SESSION_KEY='xuecheng-common-practice-v1';
// UI topics are the navigation contract; source pools may be interleaved in DATA.
const PRACTICE_GROUPS=CHAPTERS.flatMap(c=>c.modules.flatMap(m=>m.groups.map(id=>DATA.find(g=>g.id===id))));
const ownCourse=()=>COMMON_COURSES.find(c=>c.id===SOURCE.courseId);
const commonKey=(course,id)=>course+':'+id;
const COMMON_QUESTIONS=new Map(COMMON_COURSES.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[commonKey(c.id,q.id),{...q,course:c.id,courseName:c.name,chapter:g.chapter,group:g.id,module:g.module,options:g.options,chapterName:c.chapters.find(ch=>ch.id===g.chapter).name}]))));
function readCourseRecord(c){
  if(c.id===SOURCE.courseId)return state;
  try{const value=JSON.parse(localStorage.getItem(c.key)||(c.id==='internal'?localStorage.getItem('xuecheng-poisoning-drag-v1'):null)||'null');return value?.version===1&&value.state&&typeof value.state==='object'?value.state:{};}catch{return {};}
}
function writeCourseRecord(c,record){if(c.id===SOURCE.courseId){state=record;save();return;}try{localStorage.setItem(c.key,JSON.stringify({version:1,state:record}));}catch{storageAvailable=false;toast('浏览器存储空间不足，部分跨课程记录未能保存。');}}
function migrateCourseRecord(c,record){
  for(const key of ['answers','grades','history','favorites','mistakes','orders','optionOrders','needsReview'])if(!record[key]||typeof record[key]!=='object'||Array.isArray(record[key]))record[key]={};
  if(record.contentRevision===c.revision)return false;
  record.retiredArchive=record.retiredArchive||{};record.revisedArchive=record.revisedArchive||{};
  const audits=c.audit.revisions||[c.audit],from=audits.findIndex(a=>a.revision===record.contentRevision),pending=from>=0?audits.slice(from+1):audits;
  const allRetired=[...(c.organization?.retired||[]),...audits.flatMap(a=>a.retired||[])],aliases=new Map(allRetired.map(r=>[r.id,r.replaceBy]));
  const resolve=(id,seen=new Set())=>{if(seen.has(id))return [];if(COMMON_QUESTIONS.has(commonKey(c.id,id)))return [id];seen.add(id);return (aliases.get(id)||[]).flatMap(next=>resolve(next,new Set(seen)));};
  const archiveKey=(archive,id,revision)=>!archive[id]?id:archive[id].revision===revision?id:revision+':'+id;
  const retire=(items,archive,revision)=>{for(const r of items){
    const id=r.id,has=['answers','grades','history','favorites','mistakes'].some(k=>record[k][id]!==undefined);
    const key=archiveKey(archive,id,revision);if(has&&!archive[key])archive[key]={revision,reason:r.reason,replaceBy:r.replaceBy,coverageLoss:r.coverageLoss,question:r.previousQuestion,answer:record.answers[id],grade:record.grades[id],history:record.history[id],favorite:record.favorites[id],mistake:record.mistakes[id]};
    for(const target of [...new Set(r.replaceBy.flatMap(id=>resolve(id)))]){if(record.favorites[id]&&!record.favorites[target])record.favorites[target]=record.favorites[id];if(record.mistakes[id]&&!record.mistakes[target])record.mistakes[target]={lastWrong:record.mistakes[id].lastWrong||0,wrongCount:record.mistakes[id].wrongCount||1,migratedFrom:id};}
    delete record.answers[id];delete record.grades[id];delete record.favorites[id];delete record.mistakes[id];
  }};
  if(c.organization&&record.organizationRevision!==c.organization.revision){retire(c.organization.retired,record.retiredArchive,c.organization.revision);record.group=c.organization.groupAliases[record.group]||record.group;record.organizationRevision=c.organization.revision;}
  for(const audit of pending){
    retire(audit.retired||[],record.retiredArchive,audit.revision);
    for(const r of audit.rewrites||[]){
      const id=r.id,has=record.answers[id]!==undefined||record.grades[id]!==undefined||record.mistakes[id]?.lastWrongChoice!==undefined||(!record.revisedArchive[id]&&record.history[id]?.attempts);
      const key=archiveKey(record.revisedArchive,id,audit.revision);if(has&&!record.revisedArchive[key])record.revisedArchive[key]={revision:audit.revision,reason:r.reason,question:r.previousQuestion,answer:record.answers[id],grade:record.grades[id],history:record.history[id],mistake:record.mistakes[id]};
      if(record.mistakes[id]?.lastWrongChoice)record.mistakes[id]={...record.mistakes[id],lastWrongChoice:undefined,choiceArchived:true};
      if(record.history[id]?.attempts)record.needsReview[id]=true;
      delete record.answers[id];delete record.grades[id];
    }
    record.group=audit.groupAliases?.[record.group]||record.group;
  }
  record.wrongIds=[...new Set((Array.isArray(record.wrongIds)?record.wrongIds:[]).flatMap(id=>resolve(id)))];
  if(!record.notebookInitialized){for(const [id,h]of Object.entries(record.history))if(h?.attempts&&!h.correct&&COMMON_QUESTIONS.has(commonKey(c.id,id))&&!record.mistakes[id])record.mistakes[id]={lastWrong:h.last||0,wrongCount:1};record.notebookInitialized=true;}
  if(record.wrongOnly&&!record.wrongIds.length){record.wrongOnly=false;record.practiceLabel='';}
  record.contentRevision=c.revision;record.review=false;record.revealed=false;record.batchIndex=0;return true;
}
function normalizeNotebook(){
  for(const c of COMMON_COURSES){const record=readCourseRecord(c);if(migrateCourseRecord(c,record))writeCourseRecord(c,record);}
  legacyNormalizeNotebook();
}
function noteResult(q,correct,chosen){delete state.needsReview[q.id];if(correct)return;const previous=state.mistakes[q.id]||{};state.mistakes[q.id]={...previous,lastWrong:Date.now(),wrongCount:(previous.wrongCount||0)+1,lastWrongChoice:[...chosen]};}
function currentModule(){return chapter().modules.find(m=>m.id===group().module)||chapter().modules[0];}
function ensureOrders(){for(const g of DATA){const valid=(a,ids)=>Array.isArray(a)&&a.length===ids.length&&new Set(a).size===ids.length&&a.every(id=>ids.includes(id));const qids=g.questions.map(q=>q.id),oids=g.options.map(o=>o.id);if(!valid(state.orders[g.id],qids))state.orders[g.id]=shuffle(qids);if(!valid(state.optionOrders[g.id],oids))state.optionOrders[g.id]=shuffle(oids);}}
function commonSession(){try{
  const s=JSON.parse(localStorage.getItem(COMMON_SESSION_KEY)||'null');if(!(s?.version===1&&s.active&&Array.isArray(s.items)))return null;
  const before=JSON.stringify([s.items,s.courseOrder]);
  const rows=s.items.flatMap(item=>{const c=COMMON_COURSES.find(c=>c.id===item.course);if(!c)return [];const retired=[...(c.organization?.retired||[]),...(c.audit.revisions||[c.audit]).flatMap(a=>a.retired||[])],aliases=new Map(retired.map(r=>[r.id,r.replaceBy]));const resolve=(id,seen=new Set())=>{if(COMMON_QUESTIONS.has(commonKey(c.id,id)))return [{course:c.id,id}];if(seen.has(id))return [];seen.add(id);return (aliases.get(id)||[]).flatMap(next=>resolve(next,new Set(seen)));};return resolve(item.id);});
  s.items=[...new Map(rows.map(item=>[commonKey(item.course,item.id),item])).values()];s.courseOrder=COMMON_COURSES.filter(c=>s.items.some(item=>item.course===c.id)).map(c=>c.id);if(!s.items.length)s.active=false;
  if(before!==JSON.stringify([s.items,s.courseOrder])||!s.active){try{localStorage.setItem(COMMON_SESSION_KEY,JSON.stringify(s));}catch{storageAvailable=false;}}
  return s.active?s:null;
}catch{return null;}}
function endCommonSession(){const s=commonSession();if(s&&state.commonSessionId===s.id){s.active=false;try{localStorage.setItem(COMMON_SESSION_KEY,JSON.stringify(s));}catch{}}delete state.commonSessionId;}
function setChapter(id){const c=CHAPTERS.find(c=>c.id===id);if(!c)return;endCommonSession();state.group=c.groups[0];state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();document.querySelector('.chapter-controls').scrollIntoView({behavior:'smooth',block:'start'});}
function selectCommonModule(id){const m=CHAPTERS.flatMap(c=>c.modules).find(m=>m.id===id);if(!m)return;endCommonSession();state.group=m.groups[0];state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';state.type='all';state.difficulty='all';state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();}
function selectSurgeryModule(id){selectCommonModule(id);}
function resetFilters(){endCommonSession();state.type='all';state.difficulty='all';state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';state.batchIndex=0;state.review=false;state.revealed=false;render();}
function startCommonModule(m){endCommonSession();state.wrongOnly=true;state.wrongIds=[...m.questionIds];state.practiceLabel=m.name+' · 专题连练';state.type='all';state.difficulty='all';state.group=m.groups[0];state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();document.querySelector('.board').scrollIntoView({behavior:'smooth',block:'start'});toast('本专题连续练习，已有作答保留；底部上下组切换。');}
function renderChapterControls(){const c=chapter(),systems=[...new Set(CHAPTERS.map(x=>x.system))];$('system-select').innerHTML=systems.map(s=>`<option value="${esc(s)}"${c.system===s?' selected':''}>${esc(s)}</option>`).join('');$('chapter-select').innerHTML=CHAPTERS.filter(x=>x.system===c.system).map(x=>`<option value="${x.id}"${c.id===x.id?' selected':''}>${String(CHAPTERS.indexOf(x)+1).padStart(2,'0')} · ${esc(x.name)}（${x.questionCount}题）</option>`).join('');$('chapter-page').textContent=`${SOURCE.courseName} · P${c.startPage}–${c.endPage} · ${c.modules.length}专题 · 已练 ${chapterPracticed(c)}/${c.questionCount}`;$('current-chapter-name').textContent=c.name;$('prev-chapter-btn').disabled=CHAPTERS.indexOf(c)===0;$('next-chapter-btn').disabled=CHAPTERS.indexOf(c)===CHAPTERS.length-1;}
function renderTabs(){
  const c=chapter(),m=currentModule();
  $('tabs').innerHTML=`<div class="surgery-module-heading"><strong>本章 ${c.modules.length} 个知识专题</strong><span>同类选项配伍 · 线索留在题干，完整鉴别见解析</span></div><label class="common-module-select">知识专题<select id="module-select">${c.modules.map(x=>`<option value="${x.id}"${x.id===m.id?' selected':''}>${esc(x.name)}（${x.questionIds.length}题）</option>`).join('')}</select></label><div class="surgery-modules" role="group" aria-label="知识专题">${c.modules.map(x=>`<button class="surgery-module${x.id===m.id?' active':''}" data-common-module="${x.id}" aria-pressed="${x.id===m.id}"><span>${esc(x.name)}</span><small>已练 ${x.questionIds.filter(id=>state.history[id]?.attempts).length}/${x.questionIds.length}题</small></button>`).join('')}</div><div class="surgery-pool-controls"><label for="pool-select">专题内练习<select id="pool-select">${m.groups.map((id,i)=>{const g=DATA.find(g=>g.id===id);return `<option value="${id}"${id===state.group?' selected':''}>${i+1}. ${esc(g.name)}（${g.questions.length}题）</option>`;}).join('')}</select></label><button class="btn primary" data-common-module-practice="${m.id}">连练本专题 · ${m.questionIds.length}题</button></div>`;
}
function navigationTarget(direction){
  const parts=pages();if(direction<0&&state.batchIndex>0)return {group:state.group,batch:state.batchIndex-1};if(direction>0&&state.batchIndex<parts.length-1)return {group:state.group,batch:state.batchIndex+1};
  const start=PRACTICE_GROUPS.indexOf(group());for(let i=start+direction;i>=0&&i<PRACTICE_GROUPS.length;i+=direction){const g=PRACTICE_GROUPS[i],count=pool(g).length;if(!count)continue;const size=state.quantity==='all'?count:Number(state.quantity);return {group:g.id,batch:direction<0?Math.ceil(count/size)-1:0};}
  const s=commonSession();if(s&&s.id===state.commonSessionId&&state.wrongOnly){const courses=s.courseOrder,index=courses.indexOf(SOURCE.courseId),next=courses[index+direction];if(next)return {course:next,edge:direction<0?'last':'first'};}
  return null;
}
function navigateToCourse(courseId,session,edge='first'){const c=COMMON_COURSES.find(c=>c.id===courseId),url=new URL(c.url,location.href);url.searchParams.set('practice',session.id);url.searchParams.set('edge',edge);save();location.assign(url.href);}
function navigateBatch(direction){const t=navigationTarget(direction);if(!t)return;if(t.course){navigateToCourse(t.course,commonSession(),t.edge);return;}state.group=t.group;state.batchIndex=t.batch;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();document.querySelector('.board').scrollIntoView({behavior:'smooth',block:'start'});}
function renderHeader(){const parts=pages(),qs=current(),g=group();$('group-number').textContent=String(chapter().modules.indexOf(currentModule())+1).padStart(2,'0');$('group-title').textContent=g.name;$('group-subtitle').textContent=(state.wrongOnly?(state.practiceLabel||'筛选练习')+' · ':'')+g.subtitle;$('group-count').textContent=`第 ${state.batchIndex+1}/${parts.length} 组 · ${qs.length}题`;$('submit-btn').innerHTML=icon(state.review?'repeat':'check')+(state.review?'修改作答':'提交本组');$('submit-btn').disabled=!qs.length;$('answers-btn').innerHTML=icon('eye')+(state.revealed?'收起答案':'核对答案');$('answers-btn').disabled=!qs.length||state.review;$('clear-btn').disabled=!qs.length||state.review;$('exit-wrong-inline').hidden=!state.wrongOnly;renderStudyTools();}
function redoCurrentBatch(){
  const qs=current();if(!qs.length)return;
  for(const q of qs){delete state.answers[q.id];delete state.grades[q.id];}
  state.review=false;state.revealed=false;selected=null;dragged=null;
  render();
  toast(`已清空当前题块（${qs.length}题），可以重新作答；历史、错题与收藏保留。`);
}
function syncStudyToolbarHeight(){const dock=document.querySelector('.study-dock');if(typeof dock?.getBoundingClientRect==='function')document.documentElement?.style.setProperty('--dock-height',Math.max(72,Math.ceil(dock.getBoundingClientRect().height))+'px');}
function renderStudyTools(){
  const before=navigationTarget(-1),after=navigationTarget(1),m=currentModule(),qs=current();
  $('redo-batch-btn').disabled=!qs.length;
  for(const [ids,t,label]of [[['prev-btn','prev-top-btn'],before,'← 上一组'],[['next-btn','next-top-btn'],after,'下一组 →']])for(const id of ids){$(id).disabled=!t;$(id).textContent=label;$(id).title=t?.course?'切换至'+COMMON_COURSES.find(c=>c.id===t.course).name+'错题':t?'已有作答保留；切换练习组':'已到本次练习边界';}
  $('batch-position').textContent=`${SOURCE.courseName} · ${currentModule().name} · 练习 ${m.groups.indexOf(state.group)+1}/${m.groups.length} · 当前${qs.length}题`;
  $('dock-chapter').textContent=`${SOURCE.courseName} · ${chapter().name}`;
  $('dock-progress').textContent=`${m.name} · 第${m.groups.indexOf(state.group)+1}/${m.groups.length}部分 · 第${state.batchIndex+1}/${pages().length}组`;
  const wrong=state.review?qs.filter(q=>!equals(answersFor(q),q.answer)):[];$('collect-wrong-btn').disabled=!wrong.length;$('collect-wrong-btn').textContent=state.review?`☆ 收藏本组错题（${wrong.length}）`:'☆ 收藏本组错题';
  $('exit-wrong-inline').textContent=state.commonSessionId?'退出跨科重练':state.practiceLabel?.includes('专题连练')?'退出专题连练':'退出筛选练习';
  $('notebook-count').textContent=notebookCandidates('all').length;syncStudyToolbarHeight();
}
function catalogItems(term=''){const lower=term.trim().toLowerCase();return [...new Set(CHAPTERS.map(c=>c.system))].map(system=>{const list=CHAPTERS.filter(c=>c.system===system&&(!lower||(c.name+' '+c.modules.map(m=>m.name).join(' ')+' '+c.groups.map(id=>DATA.find(g=>g.id===id).name).join(' ')).toLowerCase().includes(lower)));return list.length?`<section class="catalog-group"><h3>${esc(system)}</h3><div class="catalog-list">${list.map(c=>`<button class="catalog-item" data-catalog-chapter="${c.id}"><span>${esc(c.name)}</span><small>${c.modules.length}个知识专题 · ${c.questionCount}题 · 已练 ${chapterPracticed(c)}</small><small>${esc(c.modules.map(m=>m.name).join(' / '))}</small></button>`).join('')}</div></section>`:'';}).join('')||'<p class="catalog-empty">没有匹配的章节或专题。</p>';}
function showCatalog(){openDialog(SOURCE.courseName+'章节与知识专题',`<p class="catalog-count">${CHAPTERS.length}章 · ${SOURCE.moduleCount}个知识专题 · ${ALL.length}题</p><input id="catalog-search" class="catalog-search" type="search" aria-label="搜索章节或专题" placeholder="搜索章节、疾病或专题…"><div id="catalog-items">${catalogItems()}</div>`);document.querySelector('.dialog').classList.add('wide');}
function syncChapterUrl(){try{const u=new URL(location.href);u.searchParams.set('chapter',chapter().id);u.searchParams.set('module',currentModule().id);u.searchParams.delete('edge');if(!state.commonSessionId)u.searchParams.delete('practice');history.replaceState(null,'',u);}catch{}}
function restoreCommonPractice(explicitId){
  const s=commonSession(),u=new URL(location.href),requested=explicitId||u.searchParams.get('practice');
  if(!s||(requested&&s.id!==requested)||(!requested&&state.commonSessionId!==s.id)){
    if(state.commonSessionId){delete state.commonSessionId;state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';}restoreCommonModuleUrl();return;
  }
  const ids=s.items.filter(x=>x.course===SOURCE.courseId&&QMAP.has(x.id)).map(x=>x.id);if(!ids.length){delete state.commonSessionId;state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';restoreCommonModuleUrl();return;}
  state.commonSessionId=s.id;state.wrongOnly=true;state.wrongIds=ids;state.practiceLabel=s.label+' · 跨科重练';state.type='all';state.difficulty='all';
  const eligible=PRACTICE_GROUPS.filter(g=>g.questions.some(q=>ids.includes(q.id)));ensureOrders();
  if(u.searchParams.get('edge')==='last'){state.group=eligible.at(-1).id;state.batchIndex=pages().length-1;}
  else if(u.searchParams.get('edge')==='first'||explicitId||!eligible.some(g=>g.id===state.group)){state.group=eligible[0].id;state.batchIndex=0;}
  state.review=false;state.revealed=false;
}
function restoreCommonModuleUrl(){try{const m=chapter().modules.find(m=>m.id===new URL(location.href).searchParams.get('module'));if(m&&!m.groups.includes(state.group)){state.group=m.groups[0];state.batchIndex=0;state.review=false;state.revealed=false;}}catch{}}
function notebookCandidates(scope=notebookUI.scope){
  const result=[];for(const c of COMMON_COURSES){const r=readCourseRecord(c);for(const g of c.groups)for(const q of g.questions){const favorite=r.favorites?.[q.id],mistake=r.mistakes?.[q.id],mastered=!!r.history?.[q.id]?.correct&&!r.needsReview?.[q.id];if(scope==='favorites'?favorite:scope==='unmastered'?mistake&&!mastered:mistake)result.push({...COMMON_QUESTIONS.get(commonKey(c.id,q.id)),favorite,mistake,mastered,needsReview:!!r.needsReview?.[q.id]});}}
  return result;
}
function notebookFiltered(){const term=(notebookUI.term||'').trim().toLowerCase();return notebookCandidates().filter(q=>(!notebookUI.course||notebookUI.course==='all'||q.course===notebookUI.course)&&(notebookUI.chapter==='all'||commonKey(q.course,q.chapter)===notebookUI.chapter)&&(!term||(q.stem+' '+q.chapterName+' '+q.courseName).toLowerCase().includes(term))).sort((a,b)=>(notebookUI.scope==='favorites'?(b.favorite||0)-(a.favorite||0):(b.mistake?.lastWrong||0)-(a.mistake?.lastWrong||0))||a.id.localeCompare(b.id));}
function commonReferences(q){const refs=(q.references||[]).filter(r=>/^https:\/\//.test(r.url));return lectureMnemonicHTML(q)+(refs.length?`<aside class="supplement-references"><strong>补充核对来源</strong><ul>${refs.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a></li>`).join('')}</ul></aside>`:'');}
function notebookEntry(q){
 const names=ids=>(ids||[]).map(id=>esc(q.options.find(o=>o.id===id)?.text||id)).join(' ＋ ')||'未作答',key=commonKey(q.course,q.id);
 const oldChoice=q.mistake&&(Array.isArray(q.mistake.lastWrongChoice)?names(q.mistake.lastWrongChoice):q.mistake.choiceArchived?'改版前错选已归档，请在旧题记录查看':'旧记录未保存具体选项');
 return `<article class="notebook-entry" data-common-question="${key}"><div class="notebook-meta"><span>${q.courseName} · ${esc(q.chapterName)} · P${q.page} · ${q.type==='multiple'?'多选':'单选'}</span><span class="notebook-status${q.mastered?' mastered':''}">${q.needsReview?'题目已更新，待复核':q.mistake?(q.mastered?'最近已答对':'待重练'):'主动收藏'}</span></div><h3>${esc(q.stem)}</h3>${q.mistake?`<p class="notebook-attempts">累计答错 ${q.mistake.wrongCount||1}次</p>`:''}<details class="notebook-solution"><summary>查看答案${q.mistake?'与上次错选':''}</summary>${q.mistake?`<p>上次错选：${oldChoice}</p>`:''}<p class="answer-list">正确答案：${names(q.answer)}</p><p>${esc(q.explanation)}</p>${commonReferences(q)}</details><div class="notebook-entry-actions"><button class="btn secondary" data-common-practice="${key}">重练此题</button><button class="btn favorite-question${q.favorite?' active':''}" data-common-favorite="${key}" aria-pressed="${!!q.favorite}">${q.favorite?'★ 已收藏':'☆ 收藏'}</button>${q.mistake?`<button class="btn ghost" data-common-remove="${key}">移出错题本</button>`:''}</div></article>`;
}
function showNotebook(reset=true){
  if(reset)notebookUI={scope:'all',course:'all',chapter:'all',term:'',page:0};
  const chapters=COMMON_COURSES.filter(c=>notebookUI.course==='all'||c.id===notebookUI.course).flatMap(c=>c.chapters.map(ch=>({id:commonKey(c.id,ch.id),name:c.name+' · '+ch.name})));
  openDialog('通用错题本',`<p class="notebook-intro">各课程错题与收藏统一查看，可跨科重练。原课程作答、历史和收藏均保留；记录仅在当前浏览器，不会上传或自动跨设备同步。</p><div class="notebook-scopes">${[['all','全部错题'],['unmastered','未掌握'],['favorites','已收藏']].map(([id,label])=>`<button class="btn ${id===notebookUI.scope?'primary':'secondary'}" data-common-scope="${id}">${label}（${notebookCandidates(id).length}）</button>`).join('')}</div><div class="notebook-filters"><label>课程<select id="common-notebook-course"><option value="all">全部课程</option>${COMMON_COURSES.map(c=>`<option value="${c.id}"${notebookUI.course===c.id?' selected':''}>${c.name}</option>`).join('')}</select></label><label>章节<select id="common-notebook-chapter"><option value="all">全部章节</option>${chapters.map(ch=>`<option value="${ch.id}"${ch.id===notebookUI.chapter?' selected':''}>${esc(ch.name)}</option>`).join('')}</select></label><label class="notebook-search-label">搜索<input id="common-notebook-search" type="search" placeholder="搜索题干或章节" value="${esc(notebookUI.term)}"></label></div><div class="notebook-bulk"><button class="btn primary" id="common-practice-all">重练筛选题目</button><button class="btn secondary" id="common-collect-all">☆ 收藏筛选题目</button><button class="btn ghost" id="common-archive">旧题记录归档</button><span id="notebook-summary" aria-live="polite"></span></div><div id="notebook-list"></div><div class="notebook-pagination"><button class="btn secondary" id="common-notebook-prev">上一页</button><span id="notebook-page" aria-live="polite"></span><button class="btn secondary" id="common-notebook-next">下一页</button></div>`);document.querySelector('.dialog').classList.add('wide');renderNotebookList();
}
function renderNotebookList(){const list=notebookFiltered(),count=Math.max(1,Math.ceil(list.length/NOTEBOOK_PAGE_SIZE));notebookUI.page=Math.max(0,Math.min(notebookUI.page,count-1));$('notebook-list').innerHTML=list.length?list.slice(notebookUI.page*NOTEBOOK_PAGE_SIZE,(notebookUI.page+1)*NOTEBOOK_PAGE_SIZE).map(notebookEntry).join(''):'<div class="notebook-empty">当前范围没有题目。两科答错的题都会自动收入，也可主动收藏。</div>';$('notebook-summary').textContent=`筛选结果 ${list.length}题`;$('notebook-page').textContent=`${notebookUI.page+1}/${count}页`;$('common-notebook-prev').disabled=notebookUI.page===0;$('common-notebook-next').disabled=notebookUI.page===count-1;$('common-practice-all').disabled=!list.length;$('common-collect-all').disabled=!list.length;}
function mutateCommonQuestion(key,mutator){const q=COMMON_QUESTIONS.get(key);if(!q)return;const c=COMMON_COURSES.find(c=>c.id===q.course),r=readCourseRecord(c);for(const k of ['favorites','mistakes','history'])r[k]=r[k]||{};mutator(r,q);writeCourseRecord(c,r);renderQuestions();renderStudyTools();}
function collectCommonRows(rows){for(const c of COMMON_COURSES){const selected=rows.filter(q=>q.course===c.id);if(!selected.length)continue;const r=readCourseRecord(c);r.favorites=r.favorites||{};for(const q of selected)if(!r.favorites[q.id])r.favorites[q.id]=Date.now();writeCourseRecord(c,r);}renderQuestions();renderStudyTools();}
function launchCommonPractice(rows,label='错题本'){
  const keys=[...new Set(rows.map(q=>commonKey(q.course,q.id)))],items=keys.map(k=>COMMON_QUESTIONS.get(k)).filter(Boolean).map(q=>({course:q.course,id:q.id}));if(!items.length)return;
  const s={version:1,id:'practice-'+Date.now().toString(36),active:true,label,items,courseOrder:COMMON_COURSES.filter(c=>items.some(i=>i.course===c.id)).map(c=>c.id)};
  try{localStorage.setItem(COMMON_SESSION_KEY,JSON.stringify(s));}catch{toast('浏览器不允许保存跨课程练习，请先在当前课程逐题重练。');return;}
  for(const c of COMMON_COURSES){const ids=items.filter(i=>i.course===c.id).map(i=>i.id);if(!ids.length)continue;const r=readCourseRecord(c);r.answers=r.answers||{};r.grades=r.grades||{};for(const id of ids){delete r.answers[id];delete r.grades[id];}r.commonSessionId=s.id;r.wrongOnly=true;r.wrongIds=ids;r.practiceLabel=label+' · 跨科重练';r.type='all';r.difficulty='all';r.review=false;r.revealed=false;r.batchIndex=0;writeCourseRecord(c,r);}
  closeDialog();if(s.courseOrder[0]!==SOURCE.courseId){navigateToCourse(s.courseOrder[0],s);return;}restoreCommonPractice(s.id);render();document.querySelector('.board').scrollIntoView({behavior:'smooth',block:'start'});toast(`已载入 ${items.length}题，底部上下组可跨课程切换。`);
}
function showCommonArchive(){const entries=COMMON_COURSES.flatMap(c=>{const r=readCourseRecord(c);return [...Object.values(r.retiredArchive||{}),...Object.values(r.revisedArchive||{})].map(row=>({...row,courseName:c.name}));});openDialog('各课程旧题记录归档',`<p>停用题及改写题的旧作答、历史仍保留；改版题需重新验证，不自动继承旧掌握状态。</p>${entries.length?entries.map(r=>{const names=ids=>(ids||[]).map(id=>esc(r.question?.options.find(o=>o.id===id)?.text||id)).join(' ＋ ')||'未作答',coverage=typeof r.coverageLoss==='object'?[r.coverageLoss.knowledge,r.coverageLoss.reason].filter(Boolean).join('：'):r.coverageLoss;return `<article class="notebook-entry"><span>${r.courseName}</span><h3>${esc(r.question?.stem||'旧题')}</h3><p>原作答：${names(r.answer)}<br>原答案：${names(r.question?.answer)}${Array.isArray(r.mistake?.lastWrongChoice)?`<br>原错选：${names(r.mistake.lastWrongChoice)}`:''}<br>历史练习 ${r.history?.attempts||0}次</p><p>${esc(r.reason)}</p>${coverage?`<p>暂缓内容：${esc(coverage)}</p>`:''}</article>`;}).join(''):'<p>当前浏览器没有需要归档的旧题记录。</p>'}`);document.querySelector('.dialog').classList.add('wide');}
function showRetiredSurgeryRecords(){showCommonArchive();}
$('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-common-module]');if(b)selectCommonModule(b.dataset.commonModule);const p=e.target.closest('[data-common-module-practice]');if(p){const m=CHAPTERS.flatMap(c=>c.modules).find(m=>m.id===p.dataset.commonModulePractice);if(m)startCommonModule(m);}});
$('tabs').addEventListener('change',e=>{if(e.target.id==='module-select'){selectCommonModule(e.target.value);return;}if(e.target.id==='pool-select'&&currentModule().groups.includes(e.target.value)){state.group=e.target.value;state.batchIndex=0;state.review=false;state.revealed=false;selected=null;dragged=null;$('option-search').value='';render();}});
$('dialog-body').addEventListener('click',e=>{
  const scope=e.target.closest('[data-common-scope]');if(scope){notebookUI.scope=scope.dataset.commonScope;notebookUI.page=0;showNotebook(false);return;}
  const favorite=e.target.closest('[data-common-favorite]');if(favorite){mutateCommonQuestion(favorite.dataset.commonFavorite,(r,q)=>{if(r.favorites[q.id])delete r.favorites[q.id];else r.favorites[q.id]=Date.now();});showNotebook(false);return;}
  const remove=e.target.closest('[data-common-remove]');if(remove){mutateCommonQuestion(remove.dataset.commonRemove,(r,q)=>{delete r.mistakes[q.id];r.notebookInitialized=true;});showNotebook(false);return;}
  const practice=e.target.closest('[data-common-practice]');if(practice){launchCommonPractice([COMMON_QUESTIONS.get(practice.dataset.commonPractice)]);return;}
  if(e.target.closest('#common-practice-all')){launchCommonPractice(notebookFiltered(),notebookUI.scope==='favorites'?'收藏':'错题本');return;}
  if(e.target.closest('#common-collect-all')){collectCommonRows(notebookFiltered());showNotebook(false);return;}
  if(e.target.closest('#common-archive')){showCommonArchive();return;}
  if(e.target.closest('#common-notebook-prev')){notebookUI.page--;renderNotebookList();}
  if(e.target.closest('#common-notebook-next')){notebookUI.page++;renderNotebookList();}
});
$('dialog-body').addEventListener('change',e=>{if(e.target.id==='common-notebook-course'){notebookUI.course=e.target.value;notebookUI.chapter='all';notebookUI.page=0;showNotebook(false);}if(e.target.id==='common-notebook-chapter'){notebookUI.chapter=e.target.value;notebookUI.page=0;renderNotebookList();}});
$('dialog-body').addEventListener('input',e=>{if(e.target.id==='common-notebook-search'){notebookUI.term=e.target.value;notebookUI.page=0;renderNotebookList();}});
$('redo-batch-btn').addEventListener('click',redoCurrentBatch);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(syncStudyToolbarHeight).observe(document.querySelector('.study-dock'));
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(COMMON_COURSES.some(c=>c.key===e.key)){if(e.key===KEY){try{const r=JSON.parse(e.newValue).state;state.favorites=r.favorites||{};state.mistakes=r.mistakes||{};}catch{}}renderQuestions();renderStudyTools();}});
