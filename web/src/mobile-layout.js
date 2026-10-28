// Mobile-only presentation: keep all question/option text and original IDs intact.
(function installCompactMobileLayout(){
 let frame=0;
 function measure(){
  if(!studyViewport.matches){document.body.classList.remove('mobile-density-tight');return;}
  const card=$('question-grid').querySelector('.card'),heading=card?.querySelector('.mobile-question-heading'),stem=heading?.querySelector('.stem'),options=card?.querySelector('.mobile-options');if(!card||!stem||!options)return;
  const chrome=()=>{const bar=Math.ceil(document.querySelector('.topbar').getBoundingClientRect().height),context=Math.ceil($('mobile-study-context').getBoundingClientRect().height);document.documentElement.style.setProperty('--mobile-bar-height',bar+'px');document.documentElement.style.setProperty('--mobile-context-height',context+'px');return bar+context;};
  document.body.classList.remove('mobile-density-tight');
  const end=card.querySelector('.instant-actions')||options,lastBottom=()=>end.getBoundingClientRect().bottom-card.getBoundingClientRect().top;
  const room=(window.visualViewport?.height||innerHeight)-document.querySelector('.study-dock').getBoundingClientRect().height-8;
  const count=options.querySelectorAll('[data-mobile-choice]').length;
  if(count<=5&&chrome()+lastBottom()+12>room)document.body.classList.add('mobile-density-tight');
  const height=chrome(),lineHeight=parseFloat(getComputedStyle(stem).lineHeight),lines=Math.round(stem.getBoundingClientRect().height/lineHeight);
  heading.classList.toggle('is-short',lines>=1&&lines<=4);heading.dataset.lines=String(lines);
  document.body.dataset.mobileFits=String(height+lastBottom()+12<=room);
 }
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);}
 const baseQuestions=renderQuestions;
 renderQuestions=function(){
  baseQuestions();if(!studyViewport.matches)return;
  const grid=$('question-grid'),card=grid.querySelector('.card');if(!card)return;
  const head=card.querySelector('.card-head'),stem=card.querySelector('.stem');if(!head||!stem)return;
  const heading=document.createElement('div');heading.className='mobile-question-heading';card.prepend(heading);heading.append(head,stem);
  const tools=card.querySelector('.question-tools'),favorite=tools?.querySelector('.favorite-question');
  if(favorite){favorite.setAttribute('aria-label',favorite.textContent.trim());favorite.title=favorite.textContent.trim();head.querySelector('.q-meta')?.append(favorite);tools.remove();}
  const options=grid.querySelector('.mobile-options'),actions=grid.querySelector(':scope > .instant-actions'),review=grid.querySelector(':scope > .review');
  if(options){const footer=card.querySelector('.q-footer');if(footer)options.querySelector('.mobile-options-heading')?.append(footer);card.append(options);}
  if(actions)card.append(actions);if(review)card.append(review);
  schedule();
 };
 const baseHeader=renderHeader;renderHeader=function(){baseHeader();if(studyViewport.matches){const progress=$('mobile-question-progress'),q=current()[0];if(q)progress.textContent=`本选项组 ${state.batchIndex+1}/${pages().length} 题 · 左右滑动`;renderTopicProgress();for(const el of document.querySelectorAll('#mobile-study-context strong,.mobile-topic,.mobile-next-chapter'))el.title=el.textContent;schedule();}};
 const baseRender=render;render=function(){baseRender();schedule();};
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);
})();
