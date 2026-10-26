const crypto=require('node:crypto');
function humanMnemonicChapter(source){
 const c={id:'human-mnemonics',name:'人文口诀解码',system:'口诀专项',startPage:2,endPage:2,modules:[],groups:[],coverage:[]},title='27考研讲义：人文 天天师兄.pdf';
 function add(id,name,cue,options,words,sourceRows){const mid='mx-human-'+id,module={id:mid,name,groups:['mx-human-'+id+'-g'],questionIds:[]},g={id:module.groups[0],module:mid,name:'字词解码 · '+cue,options:options.map((text,i)=>({id:'o'+i,text})),questions:[]};c.modules.push(module);c.groups.push(g);
  words.forEach(([word,index],i)=>{const id='mx-human-'+crypto.createHash('sha256').update(cue+'|'+word).digest('hex').slice(0,12),m=sourceRows[i]||sourceRows[0],q={id,stem:`人文口诀“${cue}”中的“${word}”主要对应哪项知识？`,answer:['o'+index],page:2,difficulty:'basic',explanation:`字词解码：${word}→${options[index]}。${m.meaning}。${id.startsWith('mx-human-')&&cue==='咏宣言'?'仅按讲义主要记忆定位，不表示该文献只包含一个主题。':'口诀不能代替完整的事故分级条件。'}`,sourceRef:title+' · PDF第2页',sourceLecture:{course:'humanities',name:'人文',title,page:2},drillSection:'mnemonic',mnemonicMode:'word-expansion',mnemonicKey:m.key,mnemonicCue:cue,mnemonicWord:word,mnemonics:[m]};g.questions.push(q);module.questionIds.push(id);c.coverage.push({id,page:2,mnemonicKey:m.key,cue,word,answers:[options[index]]});});
 }
 add('declarations','咏宣言：字词与主题','咏宣言',['人体试验伦理文献','人体试验知情同意','国际性医德文件','被拘禁者人道关怀','精神科医师道德准则','死亡与器官移植准则'],[['纽伦堡',0],['赫尔辛基',1],['日内瓦',2],['东京',3],['夏威夷',4],['悉尼',5]],source.mnemonics.slice(0,6));
 add('middle-degree','中二：残疾程度','中二',['中度残疾','重度残疾','轻度残疾','其他明显人身损害'],[['中',0]],[source.mnemonics[6]]);
 add('middle-level','中二：事故级别','中二',['一级医疗事故','二级医疗事故','三级医疗事故','四级医疗事故'],[['二',1]],[source.mnemonics[6]]);
 return c;
}
module.exports={humanMnemonicChapter};
