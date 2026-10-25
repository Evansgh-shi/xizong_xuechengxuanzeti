// Test knowledge and mnemonic mappings, not which alternatives a historical exam used.
// Keep this rule in the source build so importing lecture banks cannot reintroduce it.
const removedIds=new Set(['o06']);
const rewrites={
  'blood-aa-04-q1':{
    stem:'巨幼细胞贫血的骨髓细胞核与胞浆发育有何特点？',
    explanation:'记忆要点：巨幼细胞贫血为“核幼浆老”；缺铁性贫血为“核老浆幼”，注意两者对比。'
  },
  'rheum-overview-01-q6':{
    stem:'本组选项中，哪一种关节炎属于脊柱关节炎谱系？'
  }
};
const examRecall=/真题|原题|试题|考题|题号|(?:19|20)\d{2}\s*年\s*(?:题目|题|考试)|所附.*病例/;
function applyQuestionPolicy(bank){
  for(const chapter of bank.chapters){
    for(const group of chapter.groups){
      group.questions=group.questions.filter(q=>!removedIds.has(q.id));
      for(const q of group.questions){
        if(rewrites[q.id]){Object.assign(q,rewrites[q.id]);q.knowledgePoint=q.stem.replace(/[？?]$/,'');}
        if(examRecall.test(q.stem))throw Error('Exam-recall stem is not allowed: '+q.id+' '+q.stem);
      }
      if(!group.questions.length)throw Error('Empty group after content policy: '+group.id);
    }
  }
  bank.questionPolicy={focus:'知识点与口诀对应关系，不考历史真题选项记忆',removedQuestionIds:[...removedIds],rewrittenQuestionIds:Object.keys(rewrites)};
  require('./distractor-policy.cjs').applyDistractorPolicy(bank);
  require('./comparison-policy.cjs').applyComparisonPolicy(bank);
  return require('./ecg-policy.cjs').applyEcgPolicy(bank);
}
module.exports={applyQuestionPolicy,removedIds,examRecall};
