const assert=require('node:assert/strict');
function applyLectureMnemonics(input,plan){
 const bank=JSON.parse(JSON.stringify(input));
 const questions=new Map(bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[q.id,{c,q}]))));
 const keys=new Set();
 for(const r of plan.entries){
  assert(r.key&&!keys.has(r.key)&&r.text&&r.meaning&&r.questionIds.length,'invalid mnemonic '+r.key);keys.add(r.key);
  assert(new Set(r.questionIds).size===r.questionIds.length,'duplicate mnemonic target '+r.key);
  for(const id of r.questionIds){const e=questions.get(id);assert(e,'unknown mnemonic question '+id);assert(r.page>=1&&r.page<=Math.max(...bank.chapters.map(c=>c.endPage)),'mnemonic source page '+r.key);e.q.mnemonics=e.q.mnemonics||[];e.q.mnemonics.push({key:r.key,text:r.text,meaning:r.meaning,page:r.page});}
 }
 bank.lectureMnemonicAudit={revision:'2026-10-25-lecture-mnemonics-v1',source:bank.source,entries:plan.entries.length,questions:[...questions.values()].filter(e=>e.q.mnemonics?.length).length,deferred:plan.deferred||[],notes:plan.notes||[],preservesGrading:true};
 // Explanation enrichment does not revise question evidence or invalidate mastery.
 return bank;
}
module.exports={applyLectureMnemonics};
