function lectureMnemonicHTML(q){
 const rows=q.mnemonics||(q.course&&q.course!==SOURCE.courseId?[]:LECTURE_MNEMONICS[q.id])||[];
 return rows.length?`<aside class="lecture-mnemonics" aria-label="讲义口诀"><strong>讲义口诀 · 答后记忆</strong>${rows.map(r=>`<div class="lecture-mnemonic"><p class="mnemonic-quote">${esc(r.text)}</p><p class="mnemonic-meaning">${esc(r.meaning)}</p><small>讲义 PDF 第 ${r.page} 页 · 口诀辅助记忆，以完整知识条件为准</small></div>`).join('')}</aside>`:'';
}
(function installLectureMnemonics(){
 for(const q of ALL)if(LECTURE_MNEMONICS[q.id])q.mnemonics=LECTURE_MNEMONICS[q.id];
 const originalReview=reviewHTML;
 reviewHTML=function(q,chosen){
  const html=originalReview(q,chosen),mnemonic=lectureMnemonicHTML(q);
  return mnemonic?html.replace('<p class="source-ref">',mnemonic+'<p class="source-ref">'):html;
 };
})();
