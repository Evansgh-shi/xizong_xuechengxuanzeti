const head=(body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#fffdf7"/><style>text{font-family:'Microsoft YaHei','Noto Sans CJK SC',sans-serif;font-size:22px;fill:#18372e}.small{font-size:18px}.bone{fill:#f7e8c3;stroke:#5e5037;stroke-width:4}.tube{fill:none;stroke:#496c55;stroke-width:14;stroke-linecap:round;stroke-linejoin:round}.label{fill:none;stroke:#354c44;stroke-width:2}</style>${body}</svg>`;
const t=(x,y,s,cls='')=>{if(s==='腹股沟韧带'){x=50;y=310;}if(s==='远端 / 腕部')y=375;if(s==='胆管形态关系示意（前面观，不按比例）')s='胆管连接展开图（不表示左右方位，不按比例）';return `<text x="${x}" y="${y}" class="${cls}">${s}</text>`;};
function groin(kind){
 const sac=[
  '<path d="M548 145 C590 156 580 197 542 204 C489 213 454 230 410 239 C370 248 345 233 355 212 C363 198 391 204 416 200 C457 193 489 174 514 163" fill="#d8c5f0" stroke="#6a4790" stroke-width="5"/>',
  '<path d="M270 160 C307 158 338 179 337 208 C337 244 302 260 269 243 C244 230 242 205 251 186" fill="#d8c5f0" stroke="#6a4790" stroke-width="5"/>',
  '<path d="M470 282 C494 273 523 288 524 315 C525 341 501 359 479 347 C460 337 457 306 470 282" fill="#d8c5f0" stroke="#6a4790" stroke-width="5"/>'
 ][kind];
 return head(`${t(42,40,'内侧 ←　局部关系展开示意　→ 外侧')}<path d="M165 90 L165 263" stroke="#ad8663" stroke-width="14"/>${t(28,105,'腹直肌外缘')}<path d="M165 267 L690 267" stroke="#ad8663" stroke-width="14"/>${t(525,305,'腹股沟韧带')}<path d="M410 267 L460 90" stroke="#b24343" stroke-width="9"/>${t(468,100,'腹壁下动脉')}<ellipse cx="530" cy="173" rx="28" ry="17" fill="none" stroke="#354c44" stroke-dasharray="6 5" stroke-width="3"/>${t(592,172,'深环')}<path class="label" d="M582 167 L556 173"/><path d="M548 279 L548 365" stroke="#527fa5" stroke-width="18"/>${t(565,365,'股静脉')}<rect x="466" y="278" width="57" height="64" rx="8" fill="none" stroke="#354c44" stroke-dasharray="6 5" stroke-width="3"/>${t(365,368,'股管')}<path class="label" d="M418 360 L469 332"/>${sac}${t(30,418,'紫色为疝囊；以起始位置和通道判断，不按大小判断。','small')}`);
}
function wrist(dorsal){const d=dorsal?-60:60;
 return head(`${t(40,42,'桡骨远端 · 侧面关系示意（不按比例）')}${t(355,87,'背侧 ↑')}${t(355,372,'掌侧 ↓')}<path d="M85 186 L430 186 L441 199 L425 211 L442 225 L85 225 Z" class="bone"/><path d="M460 ${186+d} L558 ${172+d} Q596 ${175+d} 601 ${204+d} Q599 ${236+d} 558 ${240+d} L460 ${225+d} L448 ${214+d} L465 ${201+d} Z" class="bone"/><g transform="translate(0 ${d})"><rect x="615" y="185" width="38" height="35" rx="10" class="bone"/><rect x="660" y="187" width="36" height="35" rx="10" class="bone"/></g><path d="M85 205 L710 205" stroke="#81918a" stroke-width="2" stroke-dasharray="7 6"/>${t(120,283,'近端骨干')}${t(550,316,'远端 / 腕部')}<path class="label" d="M600 297 L590 ${240+d}"/>${t(35,420,'虚线仅表示近端骨干轴线；图中无关节面骨折或腕骨脱位。','small')}`);
}
function duct(type){
 const branch='<path class="tube" d="M400 145 L320 95 L270 70 M320 95 L300 145 M400 145 L480 95 L535 70 M480 95 L505 146"/>';
 const common='<path class="tube" d="M400 145 L400 360"/>';
 const gb='<path d="M543 223 C590 230 603 197 583 172 C560 145 533 166 536 186 L499 209 L400 214" fill="#dee9b8" stroke="#496c55" stroke-width="7"/>';
 let dilation='';
 if(type===0||type===3)dilation+='<path d="M400 226 C354 222 350 262 360 303 Q367 332 400 334 Q431 332 439 303 C450 261 446 222 400 226Z" fill="#d9e8a7" stroke="#496c55" stroke-width="6"/>';
 if(type===1)dilation+='<path d="M407 255 C437 242 476 246 476 276 C476 302 435 312 407 290" fill="#d9e8a7" stroke="#496c55" stroke-width="6"/>';
 if(type===2)dilation+='<ellipse cx="400" cy="357" rx="39" ry="24" fill="#d9e8a7" stroke="#496c55" stroke-width="6"/>';
 if(type===3||type===4)dilation+='<g fill="#d9e8a7" stroke="#496c55" stroke-width="5"><ellipse cx="320" cy="95" rx="30" ry="19" transform="rotate(30 320 95)"/><ellipse cx="480" cy="95" rx="30" ry="19" transform="rotate(-30 480 95)"/><ellipse cx="300" cy="143" rx="23" ry="16"/><ellipse cx="505" cy="144" rx="23" ry="16"/></g>';
 return head(`${t(35,40,'胆管形态关系示意（前面观，不按比例）')}<path d="M220 45 Q164 93 205 167 Q259 185 350 173 M580 45 Q638 100 596 168 Q555 185 450 173" fill="none" stroke="#baa991" stroke-width="2" stroke-dasharray="7 5"/>${t(55,125,'肝内胆管')}<path class="label" d="M180 119 L263 104"/><path d="M347 344 L450 344 L450 393 L347 393Z" fill="#fae5d8" stroke="#bb9075" stroke-width="2"/>${branch}${common}${gb}${dilation}${t(568,213,'胆囊')}${t(485,378,'十二指肠壁')}${t(34,420,'观察扩张位于肝内、肝外、侧壁还是十二指肠壁内段。','small')}`);
}
function allFigures(){const a=[groin(0),groin(1),groin(2),wrist(true),wrist(false),...Array.from({length:5},(_,i)=>duct(i))];return Object.fromEntries(a.map((svg,i)=>{const id='fig-'+String(i+1).padStart(3,'0');return[id,{id,width:800,height:450,svg}];}));}
module.exports={allFigures};
