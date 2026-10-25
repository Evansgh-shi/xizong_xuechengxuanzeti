// UI-only release: question evidence, stable IDs and all course records stay intact.
function prepareHomeEntry(){if(!new URL(location.href).searchParams.has('start'))return;endCommonSession();state.wrongOnly=false;state.wrongIds=[];state.practiceLabel='';state.type='all';state.difficulty='all';state.batchIndex=0;state.review=false;state.revealed=false;}
function restoreMobilePosition(){
 const u=new URL(location.href),q=QMAP.get(state.mobileQuestionId);
 if(u.searchParams.has('start')){endCommonSession();state.batchIndex=0;state.review=false;state.revealed=false;state.wrongOnly=false;state.wrongIds=[];state.type='all';state.difficulty='all';u.searchParams.delete('start');history.replaceState(null,'',u);return;}
 if(studyViewport.matches&&q&&q.group===state.group&&!u.searchParams.has('edge')){const i=pool().findIndex(x=>x.id===q.id);if(i>=0)state.batchIndex=i;}
}
(function installPracticeExperience(){
 const base={pages,navigationTarget,navigateBatch,render,renderQuestions,renderHeader,addAnswer,removeAnswer,chooseOption,renderStudyTools};
 const mobile=()=>studyViewport.matches;
 const graded=q=>!!state.grades[q.id]?.instant&&equals(state.grades[q.id].chosen||[],answersFor(q));
 const locked=q=>state.review||graded(q);
 pages=function(){if(!mobile())return base.pages();const list=pool();return list.length?list.map(q=>[q]):[[]];};
 navigationTarget=function(direction){
  if(!mobile())return base.navigationTarget(direction);
  const parts=pages();if(direction<0&&state.batchIndex>0)return{group:state.group,batch:state.batchIndex-1};if(direction>0&&state.batchIndex<parts.length-1)return{group:state.group,batch:state.batchIndex+1};
  const start=PRACTICE_GROUPS.indexOf(group());for(let i=start+direction;i>=0&&i<PRACTICE_GROUPS.length;i+=direction){const g=PRACTICE_GROUPS[i],n=pool(g).length;if(n)return{group:g.id,batch:direction<0?n-1:0};}
  const s=commonSession();if(s&&s.id===state.commonSessionId&&state.wrongOnly){const id=s.courseOrder[s.courseOrder.indexOf(SOURCE.courseId)+direction];if(id)return{course:id,edge:direction<0?'last':'first'};}return null;
 };
 navigateBatch=function(direction){if(!mobile())return base.navigateBatch(direction);const next=navigationTarget(direction);if(!next)return;if(next.course){navigateToCourse(next.course,commonSession(),next.edge);return;}state.group=next.group;state.batchIndex=next.batch;state.review=false;state.revealed=false;selected=null;selectedPoolId=null;dragged=null;$('option-search').value='';render();window.scrollTo({top:0,behavior:'instant'});};
 function gradeQuestion(q,auto=true){
  if(!q||!current().some(x=>x.id===q.id)||graded(q))return;
  const chosen=answersFor(q),ok=equals(chosen,q.answer),old=state.history[q.id]||{};
  state.grades[q.id]={correct:ok,instant:true,chosen:[...chosen]};
  state.history[q.id]={attempts:(old.attempts||0)+1,correct:ok,last:Date.now()};noteResult(q,ok,chosen);
  selected=null;selectedPoolId=null;save();renderQuestions();renderHeader();updateStats();save();
  if(auto)AUTO_ADVANCE.schedule(q);
 }
 function solution(q){const before=state.review;try{state.review=true;return reviewHTML(q,answersFor(q));}finally{state.review=before;}}
 function decorateCards(){
  for(const q of current()){
   const card=document.querySelector(`[data-question="${q.id}"]`);if(!card)continue;
   const reviewed=locked(q),chosen=answersFor(q),ok=equals(chosen,q.answer);
   if(reviewed){
    card.classList.toggle('correct',ok);card.classList.toggle('incorrect',!ok);
    card.querySelector('[data-drop]')?.setAttribute('aria-disabled','true');
    card.querySelectorAll('[data-choice-q],[data-remove],[data-clear-q]').forEach(el=>{el.disabled=true;});
    const footer=card.querySelector('.q-footer');footer?.querySelector('.clear-question')?.remove();
    if(footer&&!footer.querySelector('.status'))footer.insertAdjacentHTML('beforeend',`<span class="status ${ok?'good':'bad'}" role="status">${ok?'✓ 回答正确':'✕ 回答错误'}</span>`);
    if(!card.querySelector('.review'))card.querySelector('.question-tools')?.insertAdjacentHTML('beforebegin',solution(q));
   }
   if(!reviewed&&(studySettings.quick||mobile())){
    const required=q.type==='multiple'||!studySettings.quick;
    if(required)card.querySelector('.question-tools')?.insertAdjacentHTML('beforebegin',`<div class="instant-actions"><button class="btn primary" data-confirm-question="${q.id}"${chosen.length?'':' disabled'}>确认答案</button><small>${q.type==='multiple'?'多选选齐后确认，不多选、不漏选':'确认后批改并显示解析'}</small></div>`);
   }
  }
 }
 function mobileOptions(q){
  const chosen=answersFor(q),g=STUDY_UI.poolFor(q),reviewed=locked(q);
  return `<section class="mobile-options" aria-label="当前题选项池"><div class="mobile-options-heading"><h3>选项池 <small>${q.type==='single'?'单选':'多选 · 选齐后确认'}</small></h3><span>${g.options.length} 项</span></div>${STUDY_UI.orderedOptions(g).map((o,i)=>`<button type="button" class="mobile-answer-option${chosen.includes(o.id)?' chosen':''}${reviewed&&q.answer.includes(o.id)?' answer-correct':''}${reviewed&&chosen.includes(o.id)&&!q.answer.includes(o.id)?' answer-wrong':''}${studySettings.answer==='drag'?' option':''}" data-mobile-choice="${o.id}" data-mobile-question="${q.id}"${studySettings.answer==='drag'?` data-option="${o.id}" data-option-group="${g.id}" draggable="true"`:''} aria-pressed="${chosen.includes(o.id)}"${reviewed?' disabled':''}>${studySettings.answer==='drag'?'<span class="handle" aria-hidden="true">⠿</span>':''}<span class="mobile-answer-letter">${String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span>${reviewed&&q.answer.includes(o.id)?'<span class="mobile-answer-mark" aria-label="正确选项">✓</span>':''}</button>`).join('')}</section>`;
 }
 renderQuestions=function(){
  if(!mobile()){base.renderQuestions();decorateCards();return;}
  const q=current()[0];if(!q){base.renderQuestions();return;}
  $('question-grid').innerHTML=STUDY_UI.questionCard(q,state.batchIndex)+mobileOptions(q);
  decorateCards();
  const card=$('question-grid').querySelector('.card'),review=card.querySelector('.review'),actions=card.querySelector('.instant-actions');
  if(actions)$('question-grid').append(actions);if(review)$('question-grid').append(review);
  renderSelection();
 };
 addAnswer=function(qid,optionId,owner){const q=QMAP.get(qid);if(!q||locked(q)){if(q)toast('本题已批改，点“重新做题”后可再答。');return;}base.addAnswer(qid,optionId,owner);if(studySettings.quick&&q.type==='single'&&answersFor(q).includes(optionId))gradeQuestion(q);};
 removeAnswer=function(qid,id){const q=QMAP.get(qid);if(q&&locked(q))return;base.removeAnswer(qid,id);};
 chooseOption=function(id,owner){if(mobile()){const q=current()[0];if(!q||locked(q))return;if(studySettings.answer==='choice'){addAnswer(q.id,id,q.group);return;}}return base.chooseOption(id,owner);};
 $('question-grid').addEventListener('click',e=>{
  const confirm=e.target.closest('[data-confirm-question]');if(confirm){e.preventDefault();e.stopImmediatePropagation();gradeQuestion(QMAP.get(confirm.dataset.confirmQuestion));return;}
  const option=e.target.closest('[data-mobile-choice]');if(option){e.preventDefault();e.stopImmediatePropagation();const q=QMAP.get(option.dataset.mobileQuestion);if(!q||locked(q))return;const id=option.dataset.mobileChoice;
   if(studySettings.answer==='drag'){base.chooseOption(id,q.group);return;}
   if(answersFor(q).includes(id))removeAnswer(q.id,id);else addAnswer(q.id,id,q.group);return;
  }
  const card=e.target.closest('[data-question]'),q=card&&QMAP.get(card.dataset.question);
  if(q&&locked(q)&&e.target.closest('[data-choice-q],[data-drop],[data-remove],[data-clear-q]')){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 // Do not count previously instant-graded cards again when submitting a topic.
 $('submit-btn').addEventListener('click',e=>{if(!studySettings.quick)return;e.preventDefault();e.stopImmediatePropagation();if(state.review){for(const q of current())delete state.grades[q.id];state.review=false;state.revealed=false;render();return;}const list=[...current()];for(const q of list)if(!graded(q))gradeQuestion(q,false);state.review=true;state.revealed=true;render();},true);
 renderHeader=function(){base.renderHeader();if(!mobile())return;const q=current()[0],m=currentModule();$('group-title').textContent=m.name;$('group-count').textContent=`第 ${state.batchIndex+1}/${pages().length} 题`;
  const context=$('mobile-study-context');context.querySelector('strong').textContent=SOURCE.courseName+' · '+chapter().name;context.querySelector('.mobile-topic').textContent=m.name;context.querySelector('.mobile-mode').textContent=(studySettings.quick?'快刷':'逐题练习')+' · '+(studySettings.answer==='choice'?'选项模式':'拖拽模式')+' · '+SOURCE.releaseVersion;
  context.querySelector('.mobile-next-chapter').textContent=CHAPTERS[CHAPTERS.indexOf(chapter())+1]?'下一章：'+CHAPTERS[CHAPTERS.indexOf(chapter())+1].name:'本课程最后一章';
  const reviewed=q&&locked(q);$('redo-batch-btn').textContent='重新做题';$('prev-btn').textContent='上一组';$('next-btn').textContent='下一组';
  $('mobile-question-progress').textContent=q?`本选项组 ${state.batchIndex+1}/${pages().length} 题 · 左右滑动切题${reviewed?' · 已批改':''}`:'暂无符合筛选的题目';
 };
 renderStudyTools=function(){base.renderStudyTools();if(mobile()){$('prev-btn').textContent='上一组';$('next-btn').textContent='下一组';$('redo-batch-btn').textContent='重新做题';}else $('redo-batch-btn').textContent='↻ 重做当前题块';};
 render=function(){document.body.classList.toggle('mobile-practice',mobile());document.body.classList.toggle('quick-practice',!!studySettings.quick);base.render();state.homeChapterId=chapter().id;if(mobile()){state.mobileQuestionId=current()[0]?.id;document.documentElement.style.setProperty('--mobile-context-height',Math.ceil($('mobile-study-context').getBoundingClientRect().height)+'px');}save();syncStudyToolbarHeight();};
 const context=document.createElement('section');context.id='mobile-study-context';context.className='mobile-study-context';context.setAttribute('aria-label','当前学习位置');context.innerHTML='<div><strong></strong><span class="mobile-mode"></span></div><p class="mobile-topic"></p><p class="mobile-next-chapter"></p><p id="mobile-question-progress" aria-live="polite"></p>';
 document.querySelector('.workspace').before(context);
 studyViewport.addEventListener('change',()=>{const id=document.querySelector('[data-question]')?.dataset.question;studySettings=readStudySettings();state.review=false;state.revealed=false;state.batchIndex=mobile()?Math.max(0,pool().findIndex(q=>q.id===id)):0;selected=null;selectedPoolId=null;render();});
 // Horizontal one-finger gestures only on non-interactive question surfaces.
 let gesture=null;
 const excluded='button,a,input,select,textarea,[data-drop],.mobile-options,figure,.ecg-figure,.ecg-wrap,.ecg-viewport,.figure-viewer,.dialog-backdrop,img,svg,.image-figure';
 const surface=document.querySelector('.board');
 surface.addEventListener('touchstart',e=>{gesture=null;if(!mobile()||e.touches.length!==1||e.target.closest(excluded)||!$('dialog-backdrop').hidden)return;const t=e.touches[0];if(t.clientX<24||t.clientX>innerWidth-24)return;gesture={x:t.clientX,y:t.clientY,time:Date.now(),group:state.group,batch:state.batchIndex};},{passive:true});
 surface.addEventListener('touchmove',e=>{if(!gesture)return;if(e.touches.length!==1){gesture=null;return;}const t=e.touches[0],dx=t.clientX-gesture.x,dy=t.clientY-gesture.y;if(Math.abs(dy)>24&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}if(Math.abs(dx)>24&&Math.abs(dx)>Math.abs(dy)*1.6&&e.cancelable)e.preventDefault();},{passive:false});
 surface.addEventListener('touchend',e=>{const start=gesture;gesture=null;if(!start||e.touches.length||!e.changedTouches.length||Date.now()-start.time>900||start.group!==state.group||start.batch!==state.batchIndex)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.6)return;const direction=dx<0?1:-1;if(!navigationTarget(direction)){toast(direction>0?'已经是最后一题':'已经是第一题');return;}navigateBatch(direction);},{passive:true});
 surface.addEventListener('touchcancel',()=>{gesture=null;},{passive:true});
})();
