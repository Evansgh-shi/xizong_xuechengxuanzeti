// Only a public page URL (without query/hash) leaves the page. No third-party
// JavaScript, visitor IDs, cookies, localStorage or answer/search data are used.
(function installVisitCounter(){
 if(window.__xuechengVisitsInstalled)return;window.__xuechengVisitsInstalled=true;
 const host=document.createElement('section');host.className='visit-counter';host.setAttribute('aria-label','访问统计');
 host.innerHTML='<p>累计访问人次（PV）：<strong data-visit-value aria-live="polite">加载中…</strong></p><small>各域名分别累计；刷新或换页计一次，切题不重复计数，不等于去重访客数。</small><small>由 <a href="https://www.vercount.one/" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Vercount</a> 提供统计，仅发送无查询参数的页面地址，不上传答题或搜索内容；不补算未接入统计的历史访问。</small>';
 const footer=document.querySelector('footer');if(footer)footer.after(host);else document.body.append(host);
 const value=host.querySelector('[data-visit-value]');
 if(!['evansgh-shi.github.io','xuecheng-poisoning-practice.hakimi666.chatgpt.site'].includes(location.hostname)){value.textContent='本地／离线不计数';return;}
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
 fetch('https://events.vercount.one/api/v2/log',{method:'POST',mode:'cors',credentials:'omit',referrerPolicy:'origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:location.origin+location.pathname,isNewUv:false}),signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('Counter unavailable');const result=await response.json(),count=result?.status==='success'?result.data?.site_pv:null;if(typeof count!=='number'||!Number.isSafeInteger(count)||count<0)throw Error('Invalid counter data');value.textContent=count.toLocaleString('zh-CN')+' 次';}).catch(()=>{value.textContent='暂不可用（稍后刷新查看）';}).finally(()=>clearTimeout(timeout));
})();
