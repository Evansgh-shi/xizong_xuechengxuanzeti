// Mixed-source practice retains each question's actual lecture and page.
(function installCourseProvenance(){
 if(typeof HUMANITIES_PROVENANCE!=='undefined')for(const q of ALL)Object.assign(q,HUMANITIES_PROVENANCE[q.id]||{});
 const baseReview=reviewHTML;
 reviewHTML=function(q,chosen){let html=baseReview(q,chosen);if(!q.sourceLecture)return html;const s=q.sourceLecture;return html.replace(/<p class="source-ref">[\s\S]*?<\/p>/,()=>`<p class="source-ref">出处：${esc(s.title)} · PDF第 ${s.page} 页${s.originQuestionId?' · 口诀关联知识专项':''}</p>`);};
 if(SOURCE.courseId!=='humanities')return;
 const baseQuestions=renderQuestions;
 renderQuestions=function(){baseQuestions();for(const q of current()){const card=document.querySelector(`[data-question="${q.id}"]`),source=card?.querySelector('.q-source'),s=q.sourceLecture;if(source&&s)source.textContent=`${s.name} · PDF 第 ${s.page} 页`;}const q=current()[0];if(studyViewport.matches&&q){$('mobile-study-context').querySelector('.mobile-mode').title=q.drillSection==='mnemonic'?'口诀专项：先回想所记知识，答后对照原句及展开':'人文知识：医德、沟通、权利与研究规范';}};
})();
