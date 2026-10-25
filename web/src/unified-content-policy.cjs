const assert=require('node:assert/strict');
const REVISION='2026-10-23-unified-focus-v4';
function applyContentPolicy(input,plan){
  const bank=JSON.parse(JSON.stringify(input)),all=()=>bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions));
  const audit={revision:REVISION,rewrites:[],retired:[],addedQuestionIds:[],groupAliases:{}};
  const original=new Map(all().map(q=>[q.id,q]));
  for(const r of plan.rewrites||[]){
    const q=original.get(r.id);assert(q,'unknown rewrite '+r.id);assert(r.reason&&r.stem,'rewrite must have rationale');
    const g=bank.chapters.flatMap(c=>c.groups).find(g=>g.questions.includes(q));
    audit.rewrites.push({id:q.id,reason:r.reason,previousQuestion:{stem:q.stem,answer:q.answer,options:g.options,page:q.page}});
    for(const key of ['stem','explanation','page'])if(r[key]!==undefined)q[key]=r[key];
  }
  for(const a of plan.additions||[]){
    const c=bank.chapters.find(c=>c.id===a.chapter);assert(c,'addition chapter');
    const id=c.id+'-'+a.key;assert(!c.groups.some(g=>g.id===id),'addition id');
    const m=c.modules?.find(m=>m.id===a.moduleKey||m.id===c.id+'-module-'+a.moduleKey);assert(m,'addition clinical module '+id);
    const g={id,name:a.name,module:m.id,options:a.options.map((text,i)=>({id:'o'+i,text})),questions:a.rows.map((r,i)=>({id:id+'-q'+(i+1),stem:r[0],answer:(Array.isArray(r[1])?r[1]:[r[1]]).map(n=>'o'+n),page:r[2],explanation:r[3],difficulty:'contrast',type:Array.isArray(r[1])&&r[1].length>1?'multiple':'single',knowledgePoint:a.name,sourceRef:`${bank.source||'讲义'} PDF第${r[2]}页；${c.name}`}))};
    c.groups.push(g);m.groups.push(g.id);audit.addedQuestionIds.push(...g.questions.map(q=>q.id));
  }
  const retiring=new Set((plan.retire||[]).map(r=>r.id));
  for(const r of plan.retire||[]){
    const q=original.get(r.id);assert(q&&r.replaceBy?.length&&r.reason,'invalid retirement '+r.id);
    const g=bank.chapters.flatMap(c=>c.groups).find(g=>g.questions.includes(q));
    audit.retired.push({...r,previousQuestion:{stem:q.stem,answer:q.answer,options:g.options,page:q.page}});
  }
  const valid=new Set(all().filter(q=>!retiring.has(q.id)).map(q=>q.id));
  for(const r of audit.retired)assert(r.replaceBy.every(id=>valid.has(id)),'broken replacement '+r.id);
  const replacement=new Map(audit.retired.map(r=>[r.id,r.replaceBy]));
  for(const c of bank.chapters){
    for(const g of c.groups)g.questions=g.questions.filter(q=>!retiring.has(q.id));
    const groups=new Map(c.groups.map(g=>[g.id,g]));
    for(const m of c.modules){
      const before=m.groups;m.groups=m.groups.filter(id=>groups.get(id)?.questions.length);
      for(const id of before)if(!m.groups.includes(id)&&m.groups.length)audit.groupAliases[id]=m.groups[0];
      m.questionIds=m.groups.flatMap(id=>groups.get(id).questions.map(q=>q.id));
    }
    c.modules=c.modules.filter(m=>m.groups.length);c.groups=c.modules.flatMap(m=>m.groups.map(id=>groups.get(id)));
    for(const t of c.coverage?.priorityTopics||[]){t.questionIds=[...new Set((t.questionIds||[]).flatMap(id=>replacement.get(id)||[id]))];}
    for(const g of c.groups)for(const q of g.questions){assert(q.page>=c.startPage&&q.page<=c.endPage,'page '+q.id);assert(q.answer.length&&q.answer.length<g.options.length&&q.answer.every(id=>g.options.some(o=>o.id===id)),'answer '+q.id);}
  }
  audit.notes=plan.notes||[];bank.previousEditorialRevision=bank.revision||bank.qualityAudit?.revision;bank.revision=REVISION;bank.edition='内外科统一专题精练版 v4';bank.contentAudit=audit;return bank;
}
function applyInternalModules(bank,plan){
  for(const c of bank.chapters){
    const spec=plan.chapters.find(x=>x.chapter===c.id);assert(spec,'missing module plan '+c.id);
    const groups=new Map(c.groups.map(g=>[g.id,g])),seen=new Set();
    c.modules=spec.modules.map(m=>({id:c.id+'-module-'+m.key,name:m.name,groups:m.groupIds,questionIds:m.groupIds.flatMap(id=>{assert(groups.has(id)&&!seen.has(id),'duplicate/unknown pool '+id);seen.add(id);groups.get(id).module=c.id+'-module-'+m.key;return groups.get(id).questions.map(q=>q.id);})}));
    assert.equal(seen.size,groups.size,'unassigned internal pool');c.groups=c.modules.flatMap(m=>m.groups.map(id=>groups.get(id)));c.coverage.mappedTopics=c.modules.map(m=>m.name);
  }
  return bank;
}
module.exports={applyContentPolicy,applyInternalModules,REVISION};
