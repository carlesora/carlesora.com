// Filters: any .filters group toggles items with a matching data-t
document.querySelectorAll('.filters').forEach(group=>{
  const items=document.querySelectorAll(group.dataset.target||'[data-t]');
  group.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));
    items.forEach(p=>p.hidden=!(b.dataset.f==='all'||p.dataset.t.split(' ').includes(b.dataset.f)));
    document.querySelectorAll('[data-group]').forEach(g=>g.hidden=!g.querySelector('[data-t]:not([hidden])'));
  }));
  // Optional data-default="<filter>": start with that filter selected
  const d=group.dataset.default&&group.querySelector(`button[data-f="${group.dataset.default}"]`);
  if(d)d.click();
});

// Invert colours (B/W ↔ W/B)
const r=document.documentElement;
try{const t=localStorage.getItem('theme');if(t)r.dataset.theme=t}catch(e){}
const tb=document.getElementById('theme');
if(tb)tb.onclick=()=>{
  const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  r.dataset.theme=dark?'light':'dark';try{localStorage.setItem('theme',r.dataset.theme)}catch(e){}
};

// Home page only: highlight the nav item of the section in view
const sections=document.querySelectorAll('body.home section[id]');
if(sections.length){
  const links=[...document.querySelectorAll('.nav a')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)links.forEach(l=>l.classList.toggle('active',l.dataset.section===e.target.id));
  }),{rootMargin:'-30% 0px -65% 0px'});
  sections.forEach(s=>io.observe(s));
}

// Project grids: on every visit show only half of the project images, picked at random.
// The others fall back to the line drawing underneath.
const cardImgs=[...document.querySelectorAll('.project .ph img')];
for(let i=cardImgs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cardImgs[i],cardImgs[j]]=[cardImgs[j],cardImgs[i]]}
cardImgs.slice(0,Math.floor(cardImgs.length/2)).forEach(img=>{img.hidden=true;img.removeAttribute('src')});

// Generative backgrounds: every [data-gen] panel gets its two circles placed at random on each visit,
// always overlapping. Clicking an element with data-regen="<selector>" draws them again.
const GEN={ // circle diameter as a share of the panel width, and where the first centre may fall (x, y as 0–1)
  a:{s:[.38,.56],x:[.15,.6],y:[-.15,.35]},
  b:{s:[.5,.75],x:[.35,.85],y:[-.2,.4]},
  cbw:{s:[.38,.56],x:[.15,.65],y:[-.15,.35]},
  d:{s:[.4,.6],x:[.35,.75],y:[-.1,.4]},
  e:{s:[.45,.65],x:[.1,.6],y:[-.2,.3]},
  f:{s:[.16,.26],x:[.65,.82],y:[.75,1]}
};
const rnd=([a,b])=>a+Math.random()*(b-a);
function generate(el){
  const v=Object.keys(GEN).find(k=>el.classList.contains(k))||'b',g=GEN[v];
  const w=el.clientWidth,h=el.clientHeight||1;
  const s1=rnd(g.s)*w,s2=s1*rnd([.7,1]);
  const x1=rnd(g.x)*w,y1=rnd(g.y)*h;
  const dist=(s1+s2)/2*rnd([.4,.7]); // < sum of radii → they overlap
  let x2,y2,tries=0; // pick a direction that keeps the second centre inside the panel
  do{const ang=Math.random()*Math.PI*2;x2=x1+Math.cos(ang)*dist;y2=y1+Math.sin(ang)*dist}
  while(++tries<20&&(x2<w*.08||x2>w*.95||y2<-h*.25||y2>h*1.05));
  const svg=el.querySelector('svg.gen');
  if(svg){ // variant D: two outlines, only the overlap is filled
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const [ca,cb,lens,clip]=['.ca','.cb','.lens','clipPath circle'].map(q=>svg.querySelector(q));
    [[ca,x1,y1,s1],[clip,x1,y1,s1],[cb,x2,y2,s2],[lens,x2,y2,s2]].forEach(([c,x,y,s])=>{c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',s/2)});
    return;
  }
  const cs=el.querySelectorAll('.c');
  [[x1,y1,s1],[x2,y2,s2]].forEach(([x,y,s],i)=>{
    const c=cs[i];if(!c)return;
    c.style.setProperty('--x',x/w*100+'%');c.style.setProperty('--y',y/h*100+'%');c.style.setProperty('--s',s/w*100+'%');
    c.style.setProperty('--fx',rnd([25,75])+'%');c.style.setProperty('--fy',rnd([25,75])+'%');
  });
}
// data-variants="a b cbw d e f": pick one of those variants at random on each visit
let genId=0;
document.querySelectorAll('[data-variants]').forEach(el=>{
  const vs=el.dataset.variants.split(' '),v=vs[Math.floor(Math.random()*vs.length)];
  el.classList.remove(...Object.keys(GEN));el.classList.add(v);
  if(v==='d'&&!el.querySelector('svg.gen')){const id='genclip'+(++genId);
    el.insertAdjacentHTML('afterbegin',`<svg class="gen" aria-hidden="true"><defs><clipPath id="${id}"><circle/></clipPath></defs><circle class="lens" clip-path="url(#${id})"/><circle class="ca"/><circle class="cb"/></svg>`)}
});
document.querySelectorAll('[data-gen]').forEach(generate);
document.querySelectorAll('[data-regen]').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll(b.dataset.regen).forEach(generate)));

// Logo mark (box next to the name): on every visit, one of the line drawings used on the project cards
// (same six patterns as lines() in _includes/macros.njk).
const mark=document.getElementById('mark');
if(mark){
  const L=[
    [[0,0,100,100],[0,100,100,0]],
    [[20,0,20,100],[20,100,100,20]],
    [[0,60,100,60],[10,0,70,100]],
    [[0,100,60,0],[60,0,60,100]],
    [[0,30,100,30],[50,30,50,100]],
    [[0,0,100,70],[100,70,100,100]]
  ];
  mark.setAttribute('viewBox','0 0 100 100');
  mark.innerHTML=L[Math.floor(Math.random()*L.length)].map(([a,b,c,d])=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('');
}
