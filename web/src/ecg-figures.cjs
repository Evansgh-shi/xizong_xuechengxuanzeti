// Original, deterministic SVG teaching traces. No patient data or third-party art.
// Coordinates use 100 px/s and 40 px/mV: 4 px = 1 mm at 25 mm/s, 10 mm/mV.
const PX_S=100,PX_MV=40,DT=.004;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const round=n=>Number(n.toFixed(2));
const seq=(start,step,end)=>{const a=[];for(let t=start;t<end;t+=step)a.push(round(t));return a;};
function linear(points,t){if(t<points[0][0]||t>points.at(-1)[0])return 0;for(let i=1;i<points.length;i++)if(t<=points[i][0]){const [a,v]=points[i-1],[b,w]=points[i];return v+(w-v)*(t-a)/(b-a);}return 0;}
function hump(t,start,width,amp){const x=(t-start)/width;return x>=0&&x<=1?amp*Math.sin(Math.PI*x)**2:0;}
function pWave(t,e){const w=e.width||.09,a=e.amp??.15,x=t-e.t;if(e.notched)return linear([[0,0],[.025,a*.6],[.045,a],[.075,a*.55],[.115,a],[.145,a*.5],[.16,0]],x);return hump(t,e.t,w,a);}
function qrs(t,e){const w=e.width||.08,x=(t-e.t)/w,amp=e.amp??1;
  const shapes={normal:[[0,0],[.16,-.12],[.43,1],[.73,-.25],[1,0]],wide:[[0,0],[.17,.25],[.4,1.3],[.64,.7],[.82,-.65],[1,0]],rbbb:[[0,0],[.16,.35],[.35,-.45],[.69,1.1],[.84,.8],[1,0]],lbbb:[[0,0],[.18,.5],[.4,1.2],[.57,.85],[.76,1.15],[1,0]],delta:[[0,0],[.25,.25],[.4,.35],[.61,1],[.85,-.25],[1,0]],qs:[[0,0],[.22,-.4],[.5,-1],[.8,-.6],[1,0]],smallRdeepS:[[0,0],[.25,.12],[.6,-1],[1,0]],qR:[[0,0],[.22,-.08],[.5,1],[.85,-.08],[1,0]]};
  shapes.infarct=[[0,0],[.12,-.5],[.4,-.5],[.48,0],[.68,1],[.82,-.2],[1,0]];
  return amp*linear(shapes[e.shape||'normal'],x)+(e.st&&x>.8&&x<1?e.st*(x-.8)/.2:0);
}
function beatSignal(t,e){let v=qrs(t,e);const start=e.t+(e.tStart??.18),end=e.t+(e.tEnd??.40),peak=e.t+(e.tPeak??.30);
  let ta=e.tAmp??(e.shape==='wide'?-.35:.28);if(e.noT)ta=0;
  if(e.tStyle==='v')v+=linear([[start,0],[peak,ta],[end,0]],t);
  else v+=linear([[start,0],[start+(peak-start)*.45,ta*.2],[peak,ta],[peak+(end-peak)*.55,ta*.55],[end,0]],t);
  if(e.st){const j=e.t+(e.width||.08),ts=start;v+=linear([[j,e.st],[j+.04,e.st*(e.concave?.70:1.25)],[ts,e.st*(e.concave?.55:1.35)],[ts+(peak-ts)*.45,e.st*(e.concave?.35:1.25)],[peak,e.st*.25],[peak+(end-peak)*.55,0],[end,0]],t);}
  if(e.u)v+=hump(t,e.t+.44,.14,e.u);
  return v;
}
function strip(pTimes,qEvents,extra={}){return {duration:8,leads:[{name:'II',p:pTimes.map(t=>typeof t==='number'?{t}:t),q:qEvents.map(e=>typeof e==='number'?{t:e}:e)}],...extra};}
function sinus(rate=75,extra={}){const p=seq(.4,60/rate,(extra.duration||8)-.45);return strip(p,p.map(t=>({t:round(t+(extra.pr??.16)),...extra.beat})),extra);}
function fromP(p,pr=.16,beat={}){return strip(p,p.map(t=>({t:round((typeof t==='number'?t:t.t)+pr),...beat})));}
function multiLead(names,options={}){
  const p=seq(.3,.8,2),limb=(i,ii)=>({I:i,II:ii,III:ii-i,aVR:-(i+ii)/2,aVL:i-ii/2,aVF:ii-i/2});
  const qAmps=limb(.75,1),pAmps=limb(.10,.15),tAmps=limb(options.I?.tAmp??.25,options.II?.tAmp??.32);
  // Derived limb leads obey Einthoven/Goldberger relations, including reciprocal ST.
  const limbSt=limb(options.I?.st||0,options.II?.st||0);
  return {duration:2,layout:'twelve',leads:names.map(name=>{const effect={...(options[name]||{})};
    if(name in limbSt){effect.st=limbSt[name];effect.tAmp=tAmps[name];}
    const earlyChest=['V1','V2'].includes(name);
    return {name,p:p.map(t=>({t,amp:pAmps[name]??.12})),q:p.map(t=>({t:round(t+.16),shape:earlyChest?'smallRdeepS':'normal',amp:qAmps[name]??(earlyChest?.6:.85),tAmp:tAmps[name]??.23,...effect}))};
  })};
}
const leads12=['I','aVR','V1','V4','II','aVL','V2','V5','III','aVF','V3','V6'];
const definitions={};
function add(id,model){definitions[id]=model;return id;}
add('E001',sinus(75));
for(const [id,target] of [['E002','p'],['E003','qrs'],['E004','st'],['E005','t'],['E006','pr'],['E007','qt'],['E008','grid'],['E009','pr-measure']])add(id,{...sinus(75),marker:target});
add('E010',sinus(120,{beat:{tStart:.12,tPeak:.22,tEnd:.30}}));add('E011',sinus(45));
add('E012',fromP([.4,1.2,2,4.35,5.15,5.95,6.75,7.55]));
const afRR=[.42,1.08,1.54,2.39,2.96,3.38,4.18,4.77,5.13,5.94,6.49,7.31];
const af=strip([],afRR,{background:'af'});add('E015',sinus(180,{pr:.08,beat:{noT:false},hideP:true}));
definitions.E015.leads[0].p=[];definitions.E015.leads[0].q.forEach(e=>{e.tStart=.09;e.tPeak=.18;e.tEnd=.27;});
add('E016',strip([],seq(.55,.8,7.8),{background:'flutter'}));add('E017',af);
add('E014',{duration:8,leads:[{...sinus(45).leads[0],name:'II · A'},{...af.leads[0],name:'II · B'}],backgroundByLead:{1:'af'},discontinuous:true});
const wp=sinus(75,{pr:.10,beat:{shape:'delta',width:.15,tAmp:-.27}});add('E018',wp);
add('E019',fromP([.4,1.2,2,{t:2.53,amp:-.18},3.38,4.18,4.98,5.78,6.58,7.38]));
const pj=fromP([.4,1.2,2,3.45,4.25,5.05,5.85,6.65,7.45]);pj.leads[0].q.push({t:2.69});pj.leads[0].p.push({t:2.79,amp:-.16,width:.08});add('E020',pj);
function premature(kind){const p=seq(.4,.8,7.6),regular=p.map(t=>({t:round(t+.16)}));
  const keep=e=>!(e.t>2.5&&e.t<3.2);
  let q=regular.filter(keep),ps=p.filter(t=>!(t>2.2&&t<3.1));
  if(kind==='interpolated'){q=regular;ps=p;q.push({t:2.53,shape:'wide',width:.16});}
  else if(kind==='couplet'){q=q.filter(e=>e.t!==3.76);ps=ps.filter(t=>t!==3.6);q.push({t:2.65,shape:'wide',width:.16},{t:3.00,shape:'wide',width:.16});}
  else if(kind==='multiform'){q.push({t:2.65,shape:'wide',width:.16});q=q.filter(e=>!(e.t>5.6&&e.t<6.2));q.push({t:5.89,shape:'wide',width:.18,amp:-.9,tAmp:.4});ps=ps.filter(t=>!(t>5.5&&t<6.2));}
  else if(kind==='ront'){q=regular.filter(e=>!(e.t>2.7&&e.t<3.4));q.push({t:2.46,shape:'wide',width:.16});ps=p.filter(t=>!(t>2.3&&t<3.3));}
  else q.push({t:2.65,shape:'wide',width:.16});
  return strip(ps,q.sort((a,b)=>a.t-b.t));
}
for(const [id,kind] of [['E021','single'],['E022','interpolated'],['E023','couplet'],['E024','multiform'],['E025','ront']])add(id,premature(kind));
const vt=strip(seq(.32,.82,7.7),seq(.5,.4,7.8).map(t=>({t,shape:'wide',width:.16,tAmp:-.3})));add('E026',vt);
vt.leads.push({name:'V1',p:vt.leads[0].p.map(e=>({...e,amp:.18})),q:vt.leads[0].q.map(e=>({...e,amp:-.35,tAmp:.10}))});
const td=strip([.24,1.24],[{t:.4,tEnd:.64,tPeak:.49},{t:1.4,tEnd:.64,tPeak:.49}],{background:'none'});for(let i=0;i<22;i++){const c=Math.cos(i*Math.PI/7);td.leads[0].q.push({t:2.52+i*.235,shape:'wide',width:.18,amp:(c<0?-1:1)*(.45+Math.abs(c)*.8),noT:true});}add('E027',td);
add('E028',strip([.4,1.25,7.3],[.56,1.41,...[2.34,3.12,3.86,4.60,5.40,6.30].map(t=>({t,shape:'wide',width:.16})),7.46]));
add('E029',sinus(75,{pr:.28}));
const ap=seq(.3,.86,7.7);add('E030',strip(ap,ap.flatMap((t,i)=>i%4===3?[]:[{t:round(t+[.16,.24,.28][i%4])}])));
const bp=seq(.3,.8,7.7);add('E031',strip(bp,bp.flatMap((t,i)=>i%4===3?[]:[{t:round(t+.16),shape:'rbbb',width:.14}])));
add('E032',strip(seq(.3,.72,7.8),seq(.58,1.35,7.8)));
definitions.E032.leads.push({name:'V1',p:definitions.E032.leads[0].p.map(e=>({...e,amp:.18})),q:definitions.E032.leads[0].q.map(e=>({...e,amp:-.45,tAmp:.14}))});
add('E033',fromP([.4,1.2,2,3.6,4.4,5.2,6,6.8,7.6]));
add('E034',fromP([.4,1.45,2.4,3.25,4.9,5.95,6.9,7.75]));
function bundle(left){const p=seq(.4,.8,7.5);return {duration:8,leads:[{name:'V1',p:p.map(t=>({t})),q:p.map(t=>({t:t+.16,shape:left?'qs':'rbbb',width:.15,tAmp:left?.3:-.3}))},{name:'V6',p:p.map(t=>({t})),q:p.map(t=>({t:t+.16,shape:left?'lbbb':'normal',width:.15,tAmp:left?-.32:.26,amp:.9}))}]};}
// RBBB lateral lead has a broad terminal S, not a broad normal-looking QRS.
const rb=bundle(false);rb.leads[1].q.forEach(e=>{e.shape='normal';e.width=.15;});add('E035',rb);add('E036',bundle(true));
const rap=sinus(75);rap.leads[0].p.forEach(e=>{e.amp=.32;e.width=.08;});add('E037',rap);
const lap=sinus(75,{pr:.20});lap.leads[0].p.forEach(e=>{e.amp=.17;e.width=.16;e.notched=true;});add('E038',lap);
function chamber(left,amp=2.4){const p=seq(.35,.8,3.8);return {duration:4,layout:'paired',leads:['I','aVF','V1','V5'].map(name=>({name,p:p.map(t=>({t})),q:p.map(t=>({t:t+.16,shape:name==='V1'?(left?'smallRdeepS':'qR'):name==='V5'?(left?'qR':'smallRdeepS'):'normal',amp:name==='I'?(left?.9:-.6):name==='aVF'?(left?-.8:1):name==='V1'?(left?1.8:1.25):(left?amp:1.1),tAmp:name==='V5'&&left?-.35:.23}))}))};}
add('E039',chamber(false));add('E040',chamber(true,2.4));add('E041',chamber(true,2.0));
const lowK=sinus(65,{beat:{tAmp:.06,u:.38,tEnd:.38}});lowK.leads[0].q=lowK.leads[0].q.filter(e=>!(e.t>3&&e.t<3.6));lowK.leads[0].q.push({t:2.95,shape:'wide',width:.16});lowK.leads[0].p=lowK.leads[0].p.filter(e=>!(e.t>2.9&&e.t<3.5));add('E042',lowK);
for(const [id,regions] of [['E043',['II','III','aVF']],['E044',['V1','V2','V3']],['E045',['V3','V4','V5']],['E046',['I','aVL','V5','V6']],['E047',['I','aVL']],['E048',['V1','V2','V3','V4','V5','V6']]]){
  const changes=Object.fromEntries(regions.map(n=>[n,{st:.28,tAmp:.35,concave:false}]));add(id,multiLead(leads12,changes));
}
add('E049',multiLead(['V1','V2','V3','V7','V8','V9'],Object.fromEntries(['V7','V8','V9'].map(n=>[n,{st:.2}]))));
add('E050',sinus(75,{beat:{tAmp:.9,tPeak:.32,tStart:.12,tEnd:.40}}));
add('E051',sinus(75,{beat:{tAmp:-.5,tStyle:'v',tStart:.16,tPeak:.28,tEnd:.40}}));
add('E052',sinus(75,{beat:{st:.32,tAmp:.38,concave:false}}));
definitions.E052.leads[0].q.forEach(e=>{e.shape='infarct';e.width=.10;});
const peri=Object.fromEntries(leads12.filter(n=>!['aVR','V1'].includes(n)).map(n=>[n,{st:.22,concave:true}]));peri.I.st=.30;peri.II.st=.40;peri.aVR={concave:true};add('E053',multiLead(leads12,peri));
add('E054',strip([],[],{background:'vf'}));
// Opaque IDs and neutral labels avoid naming the diagnosis in the question image.
function render(id){const m=definitions[id];if(!m)throw Error('Unknown ECG '+id);const multi=m.layout==='twelve',columns=multi?4:m.layout==='paired'?2:1;
  const duration=m.duration,panelWidth=multi?280:80+duration*PX_S+20,rowHeight=multi?160:columns===2?220:190;
  const rows=Math.ceil(m.leads.length/columns),width=columns*panelWidth,height=54+rows*rowHeight+30;
  let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="ECG teaching diagram ${id}"><title>ECG teaching diagram ${id}</title><defs><pattern id="small" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="#edcaca" stroke-width=".4"/></pattern><pattern id="large" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="url(#small)"/><path d="M20 0H0V20" fill="none" stroke="#dca5a5" stroke-width=".7"/></pattern></defs><rect width="100%" height="100%" rx="8" fill="#fffdfb"/><text x="18" y="25" font-family="Arial,sans-serif" font-size="14" fill="#283a34">${id} · 25 mm/s · 10 mm/mV · teaching simulation</text>`;
  if(m.discontinuous)out+='<text x="18" y="44" font-family="Arial,sans-serif" font-size="12" fill="#42574b">A / B: excerpts recorded at different times; not a continuous transition</text>';
  m.leads.forEach((lead,i)=>{const col=i%columns,row=Math.floor(i/columns),ox=col*panelWidth,oy=54+row*rowHeight,left=ox+(multi?66:80),baseline=oy+(multi?96:columns===2?120:110),end=left+duration*PX_S;
    out+=`<rect x="${ox+8}" y="${oy}" width="${panelWidth-16}" height="${rowHeight-8}" fill="url(#large)"/><text x="${ox+14}" y="${oy+19}" font-family="Arial,sans-serif" font-size="14" fill="#283a34">${esc(lead.name)}</text><path d="M${ox+14} ${baseline}h6v-40h20v40h6" fill="none" stroke="#42574b" stroke-width="1.2"/>`;
    const bg=m.backgroundByLead?.[i]||m.background;
    let d='';for(let n=0;n<=Math.round(duration/DT);n++){const t=n*DT;let value=0;
      for(const e of lead.p)value+=pWave(t,e);for(const e of lead.q)value+=beatSignal(t,e);
      if(bg==='af')value+=.055*Math.sin(2*Math.PI*7.3*t)+.029*Math.sin(2*Math.PI*10.1*t+.8)+.018*Math.sin(2*Math.PI*5.1*t+.3);
      if(bg==='flutter'){const x=(t/.2)%1;value+=linear([[0,.08],[.70,-.22],[1,.08]],x);}
      if(bg==='vf')value+=(.55+.22*Math.sin(2*Math.PI*.19*t))*Math.sin(2*Math.PI*4.8*t+.45*Math.sin(2*Math.PI*.71*t))+.24*Math.sin(2*Math.PI*7.1*t+.7)+.11*Math.sin(2*Math.PI*10.6*t);
      const x=left+t*PX_S,y=baseline-value*PX_MV;d+=(n?'L':'M')+round(x)+','+round(y);
    }
    out+=`<path d="${d}" fill="none" stroke="#182c25" stroke-width="1.55" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(!multi){for(let s=0;s<=duration;s++)out+=`<text x="${left+s*PX_S}" y="${oy+rowHeight-13}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#52625c">${s}s</text>`;}
    if(i===0&&m.marker){const b=lead.q[2],p=lead.p[2];const ranges={p:[p.t,p.t+.09],qrs:[b.t,b.t+.08],st:[b.t+.08,b.t+.18],t:[b.t+.18,b.t+.40],pr:[p.t,b.t],qt:[b.t,b.t+.40],'pr-measure':[p.t,b.t],grid:[p.t,b.t]};const a=ranges[m.marker];
      if(a){const x1=left+a[0]*100,x2=left+a[1]*100,y=oy+37;out+=`<path d="M${x1} ${y+8}v-8H${x2}v8" fill="none" stroke="#245d72" stroke-width="1.6"/><text x="${(x1+x2)/2}" y="${y-8}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="16" fill="#245d72">A</text><path d="M${x1} ${y+10}V${baseline+12}M${x2} ${y+10}V${baseline+12}" fill="none" stroke="#245d72" stroke-dasharray="3 3" stroke-width=".8"/>`;}
    }
  });
  out+='</svg>';return {id,svg:out,width,height,duration,leads:m.leads.map(l=>l.name),calibration:{paperSpeed:25,gain:10,pxPerSecond:PX_S,pxPerMillivolt:PX_MV,gridPx:4}};
}
function allFigures(){return Object.fromEntries(Object.keys(definitions).map(id=>[id,render(id)]));}
module.exports={allFigures,definitions,render,seq,PX_S,PX_MV,DT};
