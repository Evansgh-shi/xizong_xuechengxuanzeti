const assert=require('node:assert/strict');
const REVISION='2026-10-23-surgery-reorganized-v3';
function applyReorganization(base,plan){
  const bank=JSON.parse(JSON.stringify(base));
  const before=bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions));
  const oldIds=new Set(before.map(q=>q.id)),oldGroups=bank.chapters.reduce((n,c)=>n+c.groups.length,0);
  const retired=new Map((plan.retire||[]).map(r=>[r.id,r]));
  assert.equal(retired.size,(plan.retire||[]).length,'duplicate retirement');
  for(const r of retired.values()){assert(oldIds.has(r.id),'retiring unknown '+r.id);assert(r.replaceBy?.length&&r.reason,'retirement requires replacement and reason '+r.id);}
  for(const r of retired.values()){const q=before.find(q=>q.id===r.id),g=base.chapters.flatMap(c=>c.groups).find(g=>g.questions.some(q=>q.id===r.id));r.previousQuestion={stem:q.stem,options:g.options,answer:q.answer,page:q.page};}
  for(const addition of plan.additions||[]){
    const c=bank.chapters.find(c=>c.id===addition.chapter);assert(c,'unknown chapter');
    const id=c.id+'-'+addition.key;assert(!c.groups.some(g=>g.id===id),'duplicate addition '+id);
    c.groups.push({id,name:addition.name,options:addition.options.map((text,i)=>({id:'o'+i,text})),questions:addition.rows.map((r,i)=>({id:id+'-q'+(i+1),stem:r[0],answer:(Array.isArray(r[1])?r[1]:[r[1]]).map(n=>'o'+n),page:r[2],explanation:r[3],difficulty:'contrast',type:Array.isArray(r[1])&&r[1].length>1?'multiple':'single',knowledgePoint:addition.name,sourceRef:`《04.27天天外科讲义合集【全】》PDF第${r[2]}页；${c.name}`}))});
  }
  const groupAliases={};
  for(const c of bank.chapters){
    const spec=plan.chapters.find(x=>x.chapter===c.id);assert(spec,'missing module plan '+c.id);
    const assigned=new Map();
    const modules=spec.modules.map(m=>({id:c.id+'-module-'+m.key,name:m.name,groups:[...(m.groupIds||[])],questionIds:[]}));
    for(const a of (plan.additions||[]).filter(a=>a.chapter===c.id)){
      const gid=c.id+'-'+a.key;
      if(!modules.some(m=>m.groups.includes(gid))){const m=modules.find(m=>m.id===c.id+'-module-'+a.moduleKey);assert(m,'unassigned addition '+gid);m.groups.push(gid);}
    }
    for(const m of modules)for(const id of m.groups){assert(!assigned.has(id),'pool assigned twice '+id);assert(c.groups.some(g=>g.id===id),'unknown pool '+id);assigned.set(id,m);}
    for(const g of c.groups){assert(assigned.has(g.id),'unassigned pool '+g.id);g.module=assigned.get(g.id).id;g.questions=g.questions.filter(q=>!retired.has(q.id));}
    const groups=new Map(c.groups.map(g=>[g.id,g]));
    for(const m of modules){
      const original=[...m.groups];m.groups=m.groups.filter(id=>groups.get(id).questions.length);
      for(const id of original)if(!m.groups.includes(id)&&m.groups.length)groupAliases[id]=m.groups[0];
      m.questionIds=m.groups.flatMap(id=>groups.get(id).questions.map(q=>q.id));
    }
    c.modules=modules.filter(m=>m.groups.length);
    assert(c.modules.length&&c.modules.length<=7,'chapter needs compact module navigation '+c.id);
    c.groups=c.modules.flatMap(m=>m.groups.map(id=>groups.get(id)));
    c.coverage.mappedTopics=c.modules.map(m=>m.name);
  }
  const all=bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions)),ids=new Set(all.map(q=>q.id));
  assert.equal(ids.size,all.length,'duplicate question ids');
  const resolve=(id,seen=new Set())=>{if(ids.has(id))return [id];assert(!seen.has(id),'retirement cycle');seen.add(id);const r=retired.get(id);assert(r,'unresolvable replacement '+id);return [...new Set(r.replaceBy.flatMap(next=>resolve(next,new Set(seen))))];};
  for(const r of retired.values())r.replaceBy=[...new Set(r.replaceBy.flatMap(id=>resolve(id)))];
  for(const c of bank.chapters){
    for(const t of c.coverage.priorityTopics||[]){t.questionIds=[...new Set((t.questionIds||[]).flatMap(id=>resolve(id)))];if(t.questionRefs?.some(id=>retired.has(id))){t.previousQuestionRefs=[...t.questionRefs];t.questionRefs=[...t.questionIds];}if(t.status==='covered')assert(t.questionIds.length,'orphan covered topic');}
    for(const g of c.groups)for(const q of g.questions){
      assert(q.page>=c.startPage&&q.page<=c.endPage,'source page '+q.id);
      assert(q.answer.length&&q.answer.length<g.options.length,'no distractor '+q.id);
      assert(new Set(q.answer).size===q.answer.length&&q.answer.every(id=>g.options.some(o=>o.id===id)),'invalid answer '+q.id);
    }
  }
  bank.revision=REVISION;bank.edition='临床专题与鉴别重整版 v3';
  bank.reorganization={revision:REVISION,previousQuestions:before.length,previousPools:oldGroups,questionCount:all.length,moduleCount:bank.chapters.reduce((n,c)=>n+c.modules.length,0),poolCount:bank.chapters.reduce((n,c)=>n+c.groups.length,0),addedQuestionIds:all.filter(q=>!oldIds.has(q.id)).map(q=>q.id),retired:[...retired.values()],groupAliases,notes:plan.notes||[]};
  bank.editorialNotes.push('v3将细分选项池归入临床大专题；仅在同一字段内配伍，不用异质选项凑干扰项。重复或词面提示题有替代映射；旧记录保存在本机归档。');
  return bank;
}
module.exports={applyReorganization,REVISION};
