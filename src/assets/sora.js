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

// Mondrian marks (proposals on /fons/): <svg data-mondrian="m1|m2|m3|m4"> is cut into rectangles by
// straight lines and a few cells take the colours of the background circles. New layout on every visit.
const MCOL=['#ef5a3c','#f39a45','#f6c9a8'];
function mondrian(svg){
  const v=svg.dataset.mondrian,W=40,H=72,U=4; // 4px grid keeps lines crisp
  const leaves=[],lines=[];
  if(v==='m2'){ // at most 3 columns and 3 rows: no more than two x and two y positions for the lines
    const xs=[],ys=[],maxLines=2+Math.floor(Math.random()*2); // 2–3 lines
    const pos=(arr,a,len)=>{ // reuse a position inside the rect, or a new one if fewer than two exist
      const inside=arr.filter(p=>p>a+6&&p<a+len-6);
      if(inside.length&&(arr.length>=2||Math.random()<.5))return inside[Math.floor(Math.random()*inside.length)];
      if(arr.length>=2||len<16)return null;
      const p=a+U*Math.round(len*(.3+Math.random()*.4)/U);arr.push(p);return p;
    };
    (function cut(x,y,w,h,first){
      if(lines.length>=maxLines||(!first&&lines.length>=2&&Math.random()<.3)){leaves.push([x,y,w,h]);return}
      const tryV=Math.random()<w/(w+h*.8);
      for(const vert of [tryV,!tryV]){
        const p=vert?pos(xs,x,w):pos(ys,y,h);
        if(p==null)continue;
        if(vert){lines.push([p,y,p,y+h]);const [r1,r2]=Math.random()<.5?[[x,y,p-x,h],[p,y,x+w-p,h]]:[[p,y,x+w-p,h],[x,y,p-x,h]];cut(...r1,false);cut(...r2,false)}
        else{lines.push([x,p,x+w,p]);const [r1,r2]=Math.random()<.5?[[x,y,w,p-y],[x,p,w,y+h-p]]:[[x,p,w,y+h-p],[x,y,w,p-y]];cut(...r1,false);cut(...r2,false)}
        return;
      }
      leaves.push([x,y,w,h]);
    })(0,0,W,H,true);
  }else (function cut(x,y,w,h,d){
    const canV=w>=16,canH=h>=16;
    if(d===0||(!canV&&!canH)||(d<3&&Math.random()<.25)){leaves.push([x,y,w,h]);return}
    const vert=canV&&(!canH||Math.random()<w/(w+h)); // long sides get cut more often
    const len=vert?w:h,at=U*Math.round((len*(.3+Math.random()*.4))/U);
    if(vert){lines.push([x+at,y,x+at,y+h]);cut(x,y,at,h,d-1);cut(x+at,y,w-at,h,d-1)}
    else{lines.push([x,y+at,x+w,y+at]);cut(x,y,w,at,d-1);cut(x,y+at,w,h-at,d-1)}
  })(0,0,W,H,3);
  const pick=n=>[...leaves].sort(()=>Math.random()-.5).slice(0,n);
  let fills='',extra='',stroke='var(--line)';
  if(v==='m1')fills=pick(1).map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${MCOL[0]}"/>`).join('');
  if(v==='m2')fills=pick(Math.min(3,leaves.length-1)).map(([x,y,w,h],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${MCOL[i]}"/>`).join('');
  if(v==='m3')stroke=null; // coloured lines, no fills
  if(v==='m4'){ // two overlapping discs under the grid, like the backgrounds
    const r1=12+Math.random()*8,r2=r1*(.7+Math.random()*.3),cx=8+Math.random()*24,cy=14+Math.random()*44,a=Math.random()*6.28,d=(r1+r2)*.55;
    const id='mclip'+Math.random().toString(36).slice(2,8);
    extra=`<clipPath id="${id}"><rect width="${W}" height="${H}"/></clipPath><g clip-path="url(#${id})"><circle cx="${cx}" cy="${cy}" r="${r1}" fill="${MCOL[0]}"/><circle cx="${cx+Math.cos(a)*d}" cy="${cy+Math.sin(a)*d}" r="${r2}" fill="${MCOL[1]}" style="mix-blend-mode:multiply"/></g>`;
  }
  const ls=lines.map(([x1,y1,x2,y2],i)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${stroke||MCOL[i%2]}${stroke?'':';stroke-width:2'}"/>`).join('');
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML=extra+fills+ls;
}
document.querySelectorAll('svg[data-mondrian]').forEach(mondrian);
document.querySelectorAll('[data-remondrian]').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll('svg[data-mondrian]').forEach(mondrian)));

// Logo mark (box next to the name): Mondrian layout (m2) drawn again on every visit.
const mark=document.getElementById('mark');
if(mark){mark.dataset.mondrian='m2';mondrian(mark)}
