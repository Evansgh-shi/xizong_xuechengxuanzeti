const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {expansionContent}=require('./mnemonic-expansion-content.cjs');
const COURSES={internal:'内科',surgery:'外科',physiology:'生理',biochemistry:'生化',pathology:'病理'};
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,10);
const unique=a=>[...new Map(a.map(x=>[norm(x),x])).values()];
const FALLBACK={
 drug:['阿司匹林','阿奇霉素','阿米洛利','异丙托溴铵','异烟肼','氯丙嗪','甲氨蝶呤','胺碘酮','利多卡因','利奈唑胺'],
 hormone:['胰岛素','胰高血糖素','甲状腺激素','甲状旁腺激素','生长激素','催乳素','睾酮','雌二醇','孕酮'],
 nuclearLigand:['类固醇激素','维甲酸（活化维A）','甲状腺激素','肽类激素','儿茶酚胺'],
 gas:['一氧化氮','一氧化碳','二氧化碳','氧气','氮气'],receptor:['核受体','G蛋白耦联受体','酪氨酸激酶受体','离子通道型受体','酪氨酸激酶结合型受体'],
 molecule:['乙醇','咖啡因','尿素','甘油','葡萄糖'],
 ion:['Na⁺','K⁺','Ca²⁺','Mg²⁺','Cl⁻','磷'],element:['钡','锰','铯','镍','铅','砷','汞','铜','锑','锌'],
 immunoglobulin:['IgG','IgM','IgA','IgE','IgD'],factor:['凝血因子Ⅰ','凝血因子Ⅱ','凝血因子Ⅲ','凝血因子Ⅳ','凝血因子Ⅴ','凝血因子Ⅶ','凝血因子Ⅷ','凝血因子Ⅸ','凝血因子Ⅹ','凝血因子Ⅺ','凝血因子ⅩⅢ','凝血因子Ⅴa','凝血因子Ⅷa'],
 cell:['淋巴细胞','浆细胞','单核细胞','成纤维细胞','类上皮细胞','朗汉斯巨细胞','异物巨细胞','内皮细胞','系膜细胞','神经元','心肌细胞','骨骼肌细胞','肥大细胞','嗜碱性粒细胞','肾小囊壁层上皮细胞'],
 organ:['心','肝','脾','肺','肾','脑','骨','胃','肠','子宫','阑尾','胆囊','肾上腺','血管'],
 disease:['肺水肿','肺纤维化','尘肺','甲状腺功能亢进','糖尿病','白血病','克罗恩病','肠结核','结核性腹膜炎','硬化性胆管炎','强直性脊柱炎','淀粉样变性','骶髂关节炎'],
 pathogen:['肺炎链球菌','肺炎支原体','肺炎衣原体','流感嗜血杆菌','呼吸道病毒','大肠埃希菌','肺炎克雷伯菌','鲍曼不动杆菌','铜绿假单胞菌','金黄色葡萄球菌','厌氧菌','链球菌','变形杆菌','病毒'],
 cellInjury:['水样变性','脂肪变性','嗜酸性变','嗜酸性坏死','溶解性坏死','淀粉样变性'],
 tumor:['畸胎瘤','胸腺瘤','胶质瘤','黑色素瘤','精原细胞瘤','脊索瘤','骨肉瘤','神经源性肿瘤','胸骨后甲状腺肿','肾母细胞瘤','视网膜母细胞瘤'],
 nerve:['正中神经','尺神经','桡神经','坐骨神经','腋神经','胸长神经','胸背神经','副神经'],
 aminoAcid:['酪氨酸','苯丙氨酸','色氨酸','缬氨酸','异亮氨酸','亮氨酸','甘氨酸','谷氨酸'],
 drugClass:['糖皮质激素','静脉丙种球蛋白','白三烯调节剂','吸入糖皮质激素ICS','β受体阻断剂','DPP-4抑制剂','格列汀类','SGLT-2抑制剂'],
 enzyme:['鸟苷酸环化酶','腺苷酸环化酶','磷脂酶C','磷酸二酯酶','ALA合酶','ALA脱水酶','亚铁螯合酶','粪卟啉原氧化酶'],
 muscleStructure:['横管','纵管（肌浆网）','粗肌丝','细肌丝'],muscleProtein:['肌球蛋白','肌动蛋白','原肌球蛋白','肌钙蛋白'],
 messenger:['ADP','ATP','5-羟色胺5-HT','Ca²⁺','cAMP','cGMP'],metabolite:['尿酸','尿素','肌酐','胆红素'],
 transmitter:['神经肽','儿茶酚胺','甘氨酸','乙酰胆碱','谷氨酸','γ-氨基丁酸GABA'],
 plasmaConstituent:['胆固醇','球蛋白','纤维蛋白原','白蛋白','卵磷脂'],
 vitamin:['维生素A','维生素B1','维生素B6','维生素B12','维生素C','维生素D'],
 cdMarker:['CD2','CD3','CD5','CD14','CD16','CD20','CD34','CD38','CD55','CD56','CD59','CD138'],
 sugar:['半乳糖','葡萄糖','果糖','甘露糖','木糖'],bloodCell:['红细胞','血小板','中性粒细胞','嗜酸性粒细胞','淋巴细胞','嗜碱性粒细胞'],
 poison:['氰化物','硝基苯','硫化氢','甲苯','甲醇','亚硝酸盐','苯胺','乙醇'],adverseEffect:['周围神经炎','视神经炎','胰腺炎','心肌损害','小脑共济失调','黏膜炎'],
 virus:['甲型肝炎病毒HAV','乙型肝炎病毒HBV','丙型肝炎病毒HCV','丁型肝炎病毒HDV','戊型肝炎病毒HEV','腺病毒','冠状病毒','流感病毒','麻疹病毒'],
 infection:['细菌性痢疾','白喉','破伤风','结核','真菌感染','气性坏疽','钩端螺旋体病','炭疽','鼠疫','流行性出血热'],
 cancer:['甲状腺癌','甲状腺滤泡癌','乳腺癌','肺癌','肺腺癌','肾癌','前列腺癌','胰腺癌','胆管癌','胆囊癌','绒癌','肝细胞癌'],
 grossType:['溃疡型','蕈伞型','髓质型','缩窄型','肿块（息肉）型','局限溃疡型','浸润溃疡型','弥漫浸润型','浸润型','隆起型'],
 lungType:['肺腺癌','肺鳞癌','小细胞肺癌','大细胞肺癌','大细胞神经内分泌癌','肺类癌'],
 cancerMarker:['AFP','CEA','CA125','CA15-3','CA19-9'],
 tumorMarker:['EMA','细胞角蛋白CK','波形蛋白Vimentin','HMB45','S-100','结蛋白Desmin','LCA'],
 gene:['MCC','DCC','DPC','APC','RAS','BRAF','TP53','RB'],
 inflammatoryMediator:['前列腺素PG','IL-1','TNF','缓激肽','P物质','IL-10','脂质素','TGF-β','组胺'],
 brainSite:['基底节','豆状核','内囊','大脑皮层运动区','脑桥','延髓','小脑'],
 absorbedSubstance:['胆盐','维生素B12','葡萄糖','铁'],gutSite:['十二指肠','空肠','回肠','结肠'],
 vessel:['肝静脉','门静脉','肝动脉','肝内胆管','肠系膜上静脉','肠系膜下静脉','胃左静脉','胃右静脉','胆囊静脉','脾静脉','附脐静脉','胃冠状静脉','左膈下静脉','胃短静脉','胃后静脉'],
 inflammatoryThemes:['人体试验伦理文献','人体试验知情同意','国际性医德文件','被拘禁者人道关怀','精神科医师道德准则','死亡与器官移植准则']
};
// Explicit equivalence groups prevent synonyms or narrower overlapping labels being used as distractors.
const EQUIVALENTS=[['溶解性坏死','液化性坏死'],['胆色素','胆红素'],['胃冠状静脉','胃左静脉'],['微小病变病','脂性肾病'],['IgG','免疫球蛋白G'],['DPP-4抑制剂','格列汀类','DPP-4抑制剂（格列汀类）'],['糖皮质激素','吸入糖皮质激素ICS'],['钠尿肽','心房钠尿肽ANP'],['肺癌','肺腺癌'],['甲状腺癌','甲状腺滤泡癌']];
const same=(a,b)=>norm(a)===norm(b)||EQUIVALENTS.some(g=>g.includes(a)&&g.includes(b));
function buildExpansions(banks,root){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),plans=Object.fromEntries(Object.keys(banks).map(c=>[c,read('src/'+c+'-mnemonic-plan.json')])),rows=expansionContent();
 const selected=new Map(),vocabulary={};
 for(const r of rows){const e=plans[r.course].entries.find(e=>e.key===r.key);assert(e,'unknown expansion source '+r.course+':'+r.key);assert(!selected.has(r.course+':'+r.key),'duplicate selected cue');selected.set(r.course+':'+r.key,r);r.source=e;for(const p of r.parts){assert(p.word&&p.answers.length&&new Set(p.answers).size===p.answers.length);vocabulary[p.kind]=unique([...(vocabulary[p.kind]||[]),...p.answers]);}}
 const chapters=[],audit=[],allWords=new Set(),decodedPairs=new Map();
 for(const [course,bank]of Object.entries(banks)){
  const ch={id:'mn-'+course,name:COURSES[course]+'口诀解码',system:'口诀专项',startPage:1,endPage:Math.max(...bank.chapters.map(c=>c.endPage)),modules:[],groups:[],coverage:[]};
  const qmap=new Map(bank.chapters.flatMap(c=>c.groups.flatMap(g=>g.questions.map(q=>[q.id,{c,g,q}]))));
  const courseRows=rows.filter(r=>r.course===course),covered=[];
  for(const r of courseRows){const e=r.source,original=qmap.get(e.questionIds[0]);assert(original,'missing original source topic '+e.key);let module=ch.modules.find(m=>m.origin===original.c.id);if(!module){module={id:'mx-'+course+'-'+original.c.id,name:original.c.name,origin:original.c.id,groups:[],questionIds:[]};ch.modules.push(module);}
   const partsByKind=Object.groupBy(r.parts,p=>p.kind);
   for(const [kind,parts]of Object.entries(partsByKind))for(let offset=0;offset<parts.length;offset+=3){const chunk=parts.slice(offset,offset+3),correctValues=unique(chunk.flatMap(p=>p.answers)),custom=r.pool&&kind===r.kind?r.pool:null;
    const sourcePool=unique([...(custom||[]),...(vocabulary[kind]||[]),...(FALLBACK[kind]||[])]),related=unique([...(custom||[]),...sourcePool]).filter(value=>!correctValues.some(a=>same(a,value)));
    const similarity=value=>{const best=Math.max(0,...correctValues.map(a=>{const aa=new Set(norm(a)),bb=new Set(norm(value));return [...aa].filter(c=>bb.has(c)).length/Math.max(aa.size,bb.size)+(a[0]===value[0]?0.2:0);}));return best;};
    const rank=v=>custom?.includes(v)?custom.indexOf(v):10000;
    related.sort((a,b)=>rank(a)-rank(b)||similarity(b)-similarity(a)||a.localeCompare(b,'zh'));
    const pool=unique([...correctValues,...related.slice(0,Math.max(1,5-correctValues.length))]);assert(pool.length>=4&&pool.length>correctValues.length,'insufficient homogeneous distractors '+course+':'+r.key+':'+kind);
    const gid='mx-'+course+'-'+r.key+'-'+kind+'-'+offset,g={id:gid,module:module.id,name:'字词解码 · '+r.cue,options:pool.map((text,i)=>({id:'o'+i,text})),questions:[]};
    for(const p of chunk){const duplicate=course+'|'+norm(r.cue)+'|'+norm(p.word)+'|'+p.answers.map(norm).sort().join(',');assert(!allWords.has(duplicate),'duplicate expansion word');allWords.add(duplicate);
     const pair=kind+'|'+norm(p.word.replace(/[（(][^）)]*[）)]/g,''))+'|'+p.answers.map(norm).sort().join(',');
     if(decodedPairs.has(pair)){ch.coverage.push({page:e.page,mnemonicKey:e.key,cue:r.cue,word:p.word,answers:p.answers,duplicateOf:decodedPairs.get(pair)});continue;}
     const id='mx-'+course+'-'+r.key+'-'+hash(p.word),answer=p.answers.map(a=>'o'+pool.findIndex(v=>v===a));decodedPairs.set(pair,id);
     assert(pool.filter(v=>!p.answers.includes(v)).every(v=>!p.answers.some(a=>same(a,v))),'synonym distractor '+id);
     const displayWord=p.word.replace(/[（(][^）)]*[）)]/g,'');
     const stem=`${original.c.name}：口诀“${r.cue}”中的“${displayWord}”对应${p.answers.length>1?'哪些知识项？（多选，选全）':'哪一项知识？'}`;
     const mapping=r.parts.map(x=>x.word+'→'+x.answers.join('、')).join('；');
     const q={id,stem,answer,page:e.page,difficulty:p.answers.length>1?'contrast':'basic',explanation:`本题解码：${p.word}→${p.answers.join('、')}。${e.meaning}${r.note?' '+r.note:''}`,sourceRef:bank.source+' · PDF第'+(r.pages||[e.page]).join('、')+'页',sourceLecture:{course,name:COURSES[course],title:bank.source,page:e.page,pages:r.pages||[e.page]},drillSection:'mnemonic',mnemonicMode:'word-expansion',mnemonicKey:e.key,mnemonicCue:r.cue,mnemonicWord:p.word,mnemonics:[{key:e.key,text:e.text,meaning:e.meaning+' 字词拆解：'+mapping,page:e.page,sourceCourse:COURSES[course],sourceTitle:bank.source}]};
     g.questions.push(q);module.questionIds.push(id);ch.coverage.push({id,page:e.page,mnemonicKey:e.key,cue:r.cue,word:p.word,answers:p.answers});
    }
    if(g.questions.length){ch.groups.push(g);module.groups.push(gid);}
   }
   covered.push({key:e.key,page:e.page,text:e.text,displayCue:r.cue,parts:r.parts.map(p=>({word:p.word,answers:p.answers})),status:'word-mapping-reviewed'});
  }
  const pending=plans[course].entries.filter(e=>!selected.has(course+':'+e.key)).map(e=>({key:e.key,page:e.page,text:e.text,reason:'本轮尚未形成经复核的逐字展开题，暂不展示；不再用原章节知识题代替。'}));
  ch.modules=ch.modules.filter(m=>m.groups.length);assert(ch.groups.length,'empty course expansion');chapters.push(ch);audit.push({course,name:COURSES[course],confirmedMnemonics:covered.length,previousConfirmedAssociations:plans[course].entries.length,questions:ch.groups.reduce((n,g)=>n+g.questions.length,0),sourcePages:ch.endPage,covered,pending,deferred:plans[course].deferred,scope:'New explicit cue-word expansion questions; no normal question copied.'});
 }
 return{chapters,audit};
}
module.exports={buildExpansions,FALLBACK};
