// This stays in the existing progress record, so upgrades never discard answers.
let notebookUI={scope:'all',chapter:'all',term:'',page:0};
const NOTEBOOK_PAGE_SIZE=18;
function normalizeNotebook(){
  // Changed choices require a fresh answer, but retain history and saved collections.
  if(state.questionQualityRevision!==SOURCE.qualityRevision){
    const changedIds=SOURCE.qualityChangeSets?.[state.questionQualityRevision]||SOURCE.changedQuestionIds;
    for(const id of changedIds||[]){delete state.answers[id];delete state.grades[id];}
    state.questionQualityRevision=SOURCE.qualityRevision;state.review=false;state.revealed=false;state.batchIndex=0;
  }
  for(const key of ['favorites','mistakes']){
    if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
    for(const id of Object.keys(state[key]))if(!QMAP.has(id))delete state[key][id];
  }
  if(!state.notebookInitialized){
    for(const q of ALL){const h=state.history[q.id];if(h?.attempts&&!h.correct&&!state.mistakes[q.id])state.mistakes[q.id]={lastWrong:h.last||0,wrongCount:1};}
    state.notebookInitialized=true;
  }
  // A retired question must not leave a saved wrong-only session permanently empty.
  state.wrongIds=Array.isArray(state.wrongIds)?state.wrongIds.filter(id=>QMAP.has(id)):[];
  if(state.wrongOnly&&!state.wrongIds.length){state.wrongOnly=false;state.practiceLabel='';state.batchIndex=0;state.review=false;state.revealed=false;}
  const selectedGroup=DATA.find(g=>g.id===state.group);
  if(!selectedGroup||(state.wrongOnly&&!selectedGroup.questions.some(q=>state.wrongIds.includes(q.id)))){
    state.group=(state.wrongOnly?DATA.find(g=>g.questions.some(q=>state.wrongIds.includes(q.id))):null)?.id||DATA[0].id;
    state.batchIndex=0;state.review=false;state.revealed=false;
  }
}
function noteResult(q,correct,chosen){
  if(correct)return;
  const previous=state.mistakes[q.id]||{};
  state.mistakes[q.id]={...previous,lastWrong:Date.now(),wrongCount:(previous.wrongCount||0)+1,lastWrongChoice:[...chosen]};
}
function navigationTarget(direction){
  const parts=pages();
  if(direction<0&&state.batchIndex>0)return {group:state.group,batch:state.batchIndex-1};
  if(direction>0&&state.batchIndex<parts.length-1)return {group:state.group,batch:state.batchIndex+1};
  const start=DATA.indexOf(group());
  for(let i=start+direction;i>=0&&i<DATA.length;i+=direction){
    const g=DATA[i],count=pool(g).length;
    if(!count)continue;
    const size=state.quantity==='all'?count:Number(state.quantity);
    return {group:g.id,batch:direction<0?Math.ceil(count/size)-1:0};
  }
  return null;
}
function navigateBatch(direction){
  const target=navigationTarget(direction);if(!target)return;
  state.group=target.group;state.batchIndex=target.batch;state.review=false;state.revealed=false;
  selected=null;dragged=null;$('option-search').value='';render();
  document.querySelector('.batch-toolbar').scrollIntoView({behavior:'smooth',block:'start'});
}
function syncStudyToolbarHeight(){
  const bar=document.querySelector('.batch-toolbar');
  if(typeof bar?.getBoundingClientRect==='function')document.documentElement?.style.setProperty('--study-nav-height',Math.ceil(bar.getBoundingClientRect().height)+'px');
}
function renderStudyTools(){
  const before=navigationTarget(-1),after=navigationTarget(1),parts=pages(),qs=current();
  for(const id of ['prev-btn','prev-top-btn']){$(id).disabled=!before;$(id).textContent='← 上一组';$(id).title=before?'切换到上一组，已有作答保留':'已经是第一组';}
  for(const id of ['next-btn','next-top-btn']){$(id).disabled=!after;$(id).textContent='下一组 →';$(id).title=after?'切换到下一组，自动跳过无符合条件题目的小节':'已经是最后一组';}
  $('batch-position').textContent=`当前小节 ${state.batchIndex+1} / ${parts.length} 组 · ${qs.length} 题`;
  const wrong=state.review?qs.filter(q=>!equals(answersFor(q),q.answer)):[];
  $('collect-wrong-btn').disabled=!wrong.length;
  $('collect-wrong-btn').textContent=state.review?`☆ 一键收藏本组错题（${wrong.length}）`:'☆ 一键收藏本组错题';
  $('collect-wrong-btn').title=state.review?'将本组错题长期保存在错题本的「已收藏」里':'提交本组判分后可一键收藏错题';
  $('notebook-count').textContent=Object.keys(state.mistakes).length;
  syncStudyToolbarHeight();
}
function toggleFavorite(id){
  if(!QMAP.has(id))return;
  const was=!!state.favorites[id];if(was)delete state.favorites[id];else state.favorites[id]=Date.now();
  save();renderQuestions();renderStudyTools();toast(was?'已取消收藏，错题记录和作答仍保留。':'已收藏到错题本，答对后也会保留。');
}
function collectQuestionIds(ids){
  let added=0;
  for(const id of ids)if(QMAP.has(id)&&!state.favorites[id]){state.favorites[id]=Date.now();added++;}
  save();renderQuestions();renderStudyTools();
  toast(added?`已收藏 ${added} 道题；重复题目不会重复加入。`:'这些题已全部收藏。');
  return added;
}
function collectCurrentWrong(){
  if(!state.review){toast('请先提交本组判分，再收藏错题。');return;}
  collectQuestionIds(current().filter(q=>!equals(answersFor(q),q.answer)).map(q=>q.id));
}
function notebookCandidates(scope=notebookUI.scope){
  return ALL.filter(q=>scope==='favorites'?!!state.favorites[q.id]:scope==='unmastered'?!!state.mistakes[q.id]&&!state.history[q.id]?.correct:!!state.mistakes[q.id]);
}
function notebookFiltered(){
  const term=notebookUI.term.trim().toLowerCase();
  return notebookCandidates().filter(q=>(notebookUI.chapter==='all'||q.chapter===notebookUI.chapter)&&(!term||(q.stem+' '+CHAPTERS.find(c=>c.id===q.chapter).name).toLowerCase().includes(term))).sort((a,b)=>{
    const date=q=>notebookUI.scope==='favorites'?state.favorites[q.id]:(state.mistakes[q.id]?.lastWrong||0);
    return date(b)-date(a)||a.id.localeCompare(b.id);
  });
}
function notebookEntry(q){
  const c=CHAPTERS.find(c=>c.id===q.chapter),g=DATA.find(g=>g.id===q.group),record=state.mistakes[q.id],correct=!!state.history[q.id]?.correct;
  const optionText=id=>g.options.find(o=>o.id===id)?.text||id;
  const previous=record?.lastWrongChoice;
  return `<article class="notebook-entry"><div class="notebook-meta"><span>${esc(c.name)} · ${q.type==='multiple'?'多选':'单选'} · 合集 P${q.page}</span><span class="notebook-status${correct?' mastered':''}">${record?(correct?'最近已答对':'待重练'):'主动收藏'}</span></div><h3>${esc(q.stem)}</h3>${record?`<p class="notebook-attempts">累计答错 ${record.wrongCount||1} 次${record.lastWrong?' · 最近答错 '+esc(new Date(record.lastWrong).toLocaleDateString('zh-CN')):''}</p>`:''}<details class="notebook-solution"><summary>查看答案${record?'与上次错选':''}</summary>${record?`<p>上次错选：${Array.isArray(previous)?(previous.length?previous.map(id=>esc(optionText(id))).join(' ＋ '):'未作答'):'旧版记录未保存具体选项'}</p>`:''}<p class="answer-list">正确答案：${q.answer.map(id=>esc(optionText(id))).join(' ＋ ')}</p><p>${esc(q.explanation)}</p></details><div class="notebook-entry-actions"><button class="btn secondary" data-notebook-practice="${q.id}">重练此题</button><button class="btn favorite-question${state.favorites[q.id]?' active':''}" data-notebook-favorite="${q.id}" aria-pressed="${!!state.favorites[q.id]}">${state.favorites[q.id]?'★ 已收藏':'☆ 收藏'}</button>${record?`<button class="btn ghost" data-notebook-remove="${q.id}">移出错题本</button>`:''}</div></article>`;
}
function showNotebook(reset=true){
  if(reset)notebookUI={scope:'all',chapter:'all',term:'',page:0};
  const scopes=[['all','全部错题'],['unmastered','未掌握'],['favorites','已收藏']];
  openDialog('我的错题本',`<p class="notebook-intro">提交后答错的题自动收入；答对后仍保留。收藏长期保留，可单题收藏，也可一键收藏本组错题。记录仅在当前浏览器，不与他人共享。</p><div class="notebook-scopes" role="group" aria-label="错题范围">${scopes.map(([id,label])=>`<button class="btn ${notebookUI.scope===id?'primary':'secondary'}" data-notebook-scope="${id}" aria-pressed="${notebookUI.scope===id}">${label}（${notebookCandidates(id).length}）</button>`).join('')}</div><div class="notebook-filters"><label>章节<select id="notebook-chapter"><option value="all">全部章节</option>${CHAPTERS.filter(c=>notebookCandidates().some(q=>q.chapter===c.id)).map(c=>`<option value="${c.id}"${notebookUI.chapter===c.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label class="notebook-search-label">搜索<input id="notebook-search" type="search" placeholder="搜索题干或章节" value="${esc(notebookUI.term)}"></label></div><div class="notebook-bulk"><button class="btn primary" id="notebook-practice-all">重练筛选题目</button><button class="btn secondary" id="notebook-collect-all">☆ 收藏筛选题目</button><span id="notebook-summary" aria-live="polite"></span></div><div id="notebook-list"></div><div class="notebook-pagination"><button class="btn secondary" id="notebook-prev">上一页</button><span id="notebook-page" aria-live="polite"></span><button class="btn secondary" id="notebook-next">下一页</button></div>`);
  document.querySelector('.dialog').classList.add('wide');renderNotebookList();
}
function renderNotebookList(){
  const qs=notebookFiltered(),count=Math.max(1,Math.ceil(qs.length/NOTEBOOK_PAGE_SIZE));
  notebookUI.page=Math.max(0,Math.min(notebookUI.page,count-1));
  $('notebook-list').innerHTML=qs.length?qs.slice(notebookUI.page*NOTEBOOK_PAGE_SIZE,(notebookUI.page+1)*NOTEBOOK_PAGE_SIZE).map(notebookEntry).join(''):'<div class="notebook-empty">当前范围没有题目。完成练习后，答错的题会自动出现；也可以点击题目下方的「收藏本题」。</div>';
  $('notebook-summary').textContent=`筛选结果 ${qs.length} 题`;
  $('notebook-page').textContent=`${notebookUI.page+1} / ${count} 页`;
  $('notebook-prev').disabled=notebookUI.page===0;$('notebook-next').disabled=notebookUI.page===count-1;
  $('notebook-practice-all').disabled=!qs.length;$('notebook-collect-all').disabled=!qs.length;
}
function startNotebookPractice(ids,label='错题本重练'){
  const valid=[...new Set(ids)].filter(id=>QMAP.has(id));if(!valid.length)return;
  state.wrongOnly=true;state.wrongIds=valid;state.practiceLabel=label;state.type='all';state.difficulty='all';
  // Start at the first matching source group, not the most recently mistaken one.
  // Otherwise pressing Next could miss earlier chapters in this selection.
  const selectedIds=new Set(valid);
  state.group=ALL.find(q=>selectedIds.has(q.id)).group;state.batchIndex=0;state.review=false;state.revealed=false;
  for(const id of valid){delete state.answers[id];delete state.grades[id];}
  selected=null;dragged=null;$('option-search').value='';closeDialog();render();
  document.querySelector('.batch-toolbar').scrollIntoView({behavior:'smooth',block:'start'});
  toast(`已载入 ${valid.length} 题；上下组会自动跳过没有入选题目的小节。`);
}
$('prev-top-btn').addEventListener('click',()=>navigateBatch(-1));
$('next-top-btn').addEventListener('click',()=>navigateBatch(1));
$('collect-wrong-btn').addEventListener('click',collectCurrentWrong);
$('notebook-btn').addEventListener('click',()=>showNotebook());
$('question-grid').addEventListener('click',e=>{const button=e.target.closest('[data-favorite]');if(button)toggleFavorite(button.dataset.favorite);});
$('dialog-body').addEventListener('click',e=>{
  const scope=e.target.closest('[data-notebook-scope]');if(scope){notebookUI.scope=scope.dataset.notebookScope;notebookUI.chapter='all';notebookUI.page=0;showNotebook(false);return;}
  const favorite=e.target.closest('[data-notebook-favorite]');if(favorite){toggleFavorite(favorite.dataset.notebookFavorite);showNotebook(false);return;}
  const remove=e.target.closest('[data-notebook-remove]');if(remove){delete state.mistakes[remove.dataset.notebookRemove];save();renderStudyTools();showNotebook(false);toast('已移出错题本；原作答、学习记录与收藏仍保留。');return;}
  const practice=e.target.closest('[data-notebook-practice]');if(practice){startNotebookPractice([practice.dataset.notebookPractice]);return;}
  if(e.target.closest('#notebook-practice-all')){startNotebookPractice(notebookFiltered().map(q=>q.id),notebookUI.scope==='favorites'?'收藏重练':'错题本重练');return;}
  if(e.target.closest('#notebook-collect-all')){collectQuestionIds(notebookFiltered().map(q=>q.id));showNotebook(false);return;}
  if(e.target.closest('#notebook-prev')){notebookUI.page--;renderNotebookList();}
  if(e.target.closest('#notebook-next')){notebookUI.page++;renderNotebookList();}
});
$('dialog-body').addEventListener('change',e=>{if(e.target.id==='notebook-chapter'){notebookUI.chapter=e.target.value;notebookUI.page=0;renderNotebookList();}});
$('dialog-body').addEventListener('input',e=>{if(e.target.id==='notebook-search'){notebookUI.term=e.target.value;notebookUI.page=0;renderNotebookList();}});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(syncStudyToolbarHeight).observe(document.querySelector('.batch-toolbar'));
