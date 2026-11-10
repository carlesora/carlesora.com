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
