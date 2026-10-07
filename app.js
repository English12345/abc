const $=s=>document.querySelector(s),app=$('#app');
const em=c=>`<img class="em" src="emoji/${c}.svg" alt="">`;
const get=(k,d)=>{try{return JSON.parse(localStorage['bm:'+k])??d}catch{return d}},set=(k,v)=>{try{localStorage['bm:'+k]=JSON.stringify(v)}catch{}};
const shuf=a=>[...a].sort(()=>Math.random()-.5),MASTER=2,PASS=70;
let idx,words={};
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='id-ID';u.rate=.8;speechSynthesis.speak(u)}catch{}}
function confetti(){const f=$('#fx');for(let i=0;i<50;i++){const d=document.createElement('i'),x=(Math.random()-.5)*200;d.style.cssText='left:'+Math.random()*100+'%;background:hsl('+Math.floor(Math.random()*360)+',90%,60%)';f.append(d);
 if(d.animate)d.animate([{transform:'translate(0,0) rotate(0deg)'},{transform:'translate('+x+'px,105vh) rotate(720deg)'}],{duration:1400+Math.random()*600,delay:Math.random()*250,easing:'ease-in',fill:'forwards'}).onfinish=()=>d.remove();else d.remove()}}
function decoys(w,pool){const sc=x=>(x.s[0]==w.s[0]?2:0)+(x.s.length==w.s.length?1:0)+Math.random();return pool.filter(x=>x.k!=w.k&&x.e!=w.e).sort((a,b)=>sc(b)-sc(a)).slice(0,3).map(x=>x.k)}
async function init(){
 idx=await(await fetch('data/index.json')).json();
 if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js?v='+idx.v);
 for(const l of idx.levels)words[l.id]=await(await fetch('data/'+l.file)).json();
 menu();setTimeout(()=>$('#splash').classList.add('off'),1400);
}
function menu(){
 const b=get('best',{}),ok=get('ok',{});
 app.innerHTML=`<header><h2>Belajar Membaca</h2></header><div class="list">`+idx.levels.map((l,i)=>{
  const w=words[l.id],m=w.filter(x=>(ok[l.id+':'+x.k]||0)>=MASTER).length,sc=b[l.id+':1'],
  open=i==0||(b[idx.levels[i-1].id+':1']||0)>=PASS;
  return `<button class="lv c${i%3}" ${open?'':'disabled'} data-i="${i}">${em(!open?'1f512':m==w.length?'2b50':'1f4d6')}<span><b>${l.nama}</b><small>${m}/${w.length} kata dikuasai${sc!=null?' · skor terbaik '+sc+'%':''}${open?'':' · selesaikan level sebelumnya (≥'+PASS+'%)'}</small></span></button>`}).join('')
  +`</div><p class="note">Mode "Susun Suku Kata" segera hadir.<br>Emoji: Twemoji (CC-BY 4.0)</p>`;
 app.querySelectorAll('.lv').forEach(x=>x.onclick=()=>quiz(+x.dataset.i));
}
function quiz(i){
 const l=idx.levels[i],q=shuf(words[l.id]).slice(0,10);let n=0,score=0;
 const step=()=>{
  if(n>=q.length)return end(i,score,q.length);
  const w=q[n];let miss=false;
  app.innerHTML=`<header><button class="back" aria-label="Kembali">‹</button><div class="bar"><i style="width:${n/q.length*100}%"></i></div></header>
  <div class="pic">${em(w.e)}</div>
  <button class="say">${em('1f50a')}<span>Dengarkan</span></button>
  <div class="opts">${shuf([w.k,...(w.d||decoys(w,words[l.id]))]).map(o=>`<button class="opt">${o}</button>`).join('')}</div>`;
  $('.back').onclick=menu;$('.say').onclick=()=>say(w.k);
  app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
   if(app.dataset.lock)return;
   if(b.textContent==w.k){
    app.dataset.lock=1;b.classList.add('yes');confetti();say(w.k);
    if(!miss){score++;const ok=get('ok',{}),k=l.id+':'+w.k;ok[k]=(ok[k]||0)+1;set('ok',ok)}
    setTimeout(()=>{delete app.dataset.lock;n++;step()},1500);
   }else{miss=true;b.classList.add('no');b.disabled=true}
  });
 };step();
}
function end(i,s,t){
 const l=idx.levels[i],p=Math.round(s/t*100),b=get('best',{}),k=l.id+':1';
 b[k]=Math.max(b[k]||0,p);set('best',b);
 app.innerHTML=`<div class="end"><div class="pic">${em(p>=PASS?'1f389':'1f4aa')}</div><h2>${s} dari ${t} benar</h2><p>${p>=PASS?(idx.levels[i+1]?'Level berikutnya terbuka!':'Hebat!'):'Ulangi lagi, pasti bisa!'}</p><button class="opt" id="again">Main lagi</button><button class="opt alt" id="home">Menu</button></div>`;
 if(p>=PASS)confetti();$('#again').onclick=()=>quiz(i);$('#home').onclick=menu;
}
init();
