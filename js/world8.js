'use strict';
/* ---------- world 8: Don't Let Them Bury My Story (Mother Viola Ford Fletcher, Greenwood, Tulsa) ---------- */
// Greenwood is shown at its height. The violence of 1921 is never shown or played.
const greenwood=(function(){
  const FLOOD=0.42;
  const w=makeLevel({key:'w8',bounds:{x0:-42,x1:44,z0:-14,z1:14},bg:0xf2c89a,amb:0.75,sun:0.5,
    caseAt:[-26,0,-8],spawn:[-20,0,0,1,0],
    intro:{eyebrow:'World 08 · Greenwood, Tulsa',title:'Don’t Let Them Bury My Story',mission:''},
    card:{n:8,name:'Mother Viola Ford Fletcher',years:'1914 – 2025 · Survivor of the Tulsa Race Massacre · Greenwood, Tulsa',
      p1:'She was seven, living in Greenwood, the district known as Black Wall Street, when the massacre began on May 31, 1921. Her family fled with only the clothes they wore, and lost everything else.',
      p2:'In 2021, at 107, she testified before Congress. In 2023 she published her memoir, Don’t Let Them Bury My Story. She died in November 2025 at 111, still waiting for justice from the city.'},
    missions:[
      {hint:'White-Out has paved over Greenwood Avenue. Ground-pound the six white cornerstones to uncover the businesses.',
       setup(w){ w.ms.n=0; stores.forEach(s=>setStore(s,false)); },
       tag(w){ return 'Uncovered '+w.ms.n+'/6'; },
       logic(w){ for(const s of stores){ if(s.done) continue; if(P.state==='poundland'&&P.t<0.05&&Math.hypot(P.p.x-s.stone.x,P.p.z-s.stone.z)<1.6){ setStore(s,true); w.ms.n++; sfx.lock(); dust(8,4,s.stone); toast(s.name); w.tag(); if(w.ms.n===6) w.sealReady('Greenwood Avenue is back. The Seal of Record is over the glass case.'); } } }},
      {hint:'The flood is rising at the east end. Climb the tower and carry all five pages of her story above it.',
       setup(w){ resetFlood(w); },
       tag(w){ return 'Pages '+w.ms.n+'/5'+(w.ms.on?' · the flood is rising':''); },
       logic(w,dt){
         if(!w.ms.on){ if(P.p.x>24) { w.ms.on=true; toast('The flood is rising'); w.tag(); } return; }
         w.ms.flood+=FLOOD*dt; flood.position.y=w.ms.flood;
         for(const p of pages){ if(p.done) continue; if(touching(p.pos,1.5)){ p.done=true; p.m.visible=false; w.ms.n++; sfx.coin(); w.tag(); } }
         if(w.ms.n===5&&P.p.y>17&&P.state==='ground'){ w.ms.on=false; flood.visible=false; w.sealReady('Her story is above the flood. The Seal of Record is over the glass case.'); return; }
         if(P.p.y<w.ms.flood-0.2){ sfx.hurt(); P.hp=Math.max(1,P.hp-1); updateHud(); toast('Swept under. Try again.'); resetFlood(w); w.place([22,0,0,1,0]); }
       }},
      {hint:'The Paver is trying to pave over the avenue again. Stop it, then carry her book to the Capitol steps.',
       setup(w){ boss.start(4,0,0); w.ms.book=false; w.ms.carry=false; w.ms.spoke=false; book.m.visible=false; },
       tag(w){ return !boss.dead?boss.tag():(w.ms.carry?'Carry the book to the Capitol steps':'Pick up her book'); },
       logic(w,dt){
         boss.update(dt);
         if(boss.dead&&!w.ms.book){ w.ms.book=true; book.m.visible=true; book.done=false; w.tag(); }
         if(w.ms.book&&!w.ms.carry&&touching(book.pos,1.6)){ w.ms.carry=true; book.m.visible=false; sfx.lock(); w.tag(); }
         if(w.ms.carry&&!w.ms.spoke&&P.p.x<-33&&P.p.y>2.5){ w.ms.spoke=true;
           runScene([{talk:['The Curator','In May 2021, at 107 years old, Mother Fletcher sat before Congress and told them what she saw in 1921.']},
                     {talk:['The Curator','For decades it was called a riot. It was a massacre.']},
                     {fn(){ caseSign.setText('MASSACRE','#1b2440','#f4b731'); sfx.seal(); }}],()=>w.sealReady()); }
       }}
    ],
    reset(w){ boss.stop(); flood.visible=false; showPickups(pages,false); book.m.visible=false;
      stores.forEach(s=>setStore(s,w.mission!==0&&sealsFor('w8')>=1));
      caseSign.setText(sealsFor('w8')===3?'MASSACRE':'RIOT',sealsFor('w8')===3?'#1b2440':'#f1e8d4',sealsFor('w8')===3?'#f4b731':'#d7263d'); },
    animate(w,dt,t){ spinPickups(pages,t); spinPickups([book],t); if(flood.visible) flood.material.opacity=0.85+0.05*Math.sin(t*3); }
  });
  const g=w.group, solid=w.solid;
  mesh(new T.PlaneGeometry(90,30),lam(0xffffff,{map:groundTex('#8a7a66','#7a6a56',22)}),g,1,0,0).rotation.x=-Math.PI/2;
  const paved=mesh(new T.PlaneGeometry(60,10),lam(0xf6f3ea),g,-4,0.03,0); paved.rotation.x=-Math.PI/2;
  // six businesses on Greenwood Avenue
  const names=['Gurley Hotel','Stradford Hotel','Dreamland Theatre','Williams Confectionery','Mount Zion Baptist Church','Vernon AME Church'];
  const colors=[0x9a5a3a,0x6b3a2a,0x2b4a7a,0x8a6a3a,0xc9b89a,0x7a2a3a];
  const stores=names.map((n,i)=>{
    const north=i%2===0, x=-28+Math.floor(i/2)*16+(north?0:6), z0=north?9:-14, z1=north?14:-9, h=7+((i*3)%4);
    const m=lam(colors[i]); solid(x-5,x+5,z0,z1,h,m);
    const sz=north?8.98:-8.98, s=sign(g,'',x,h-1.4,sz,8,1.4,north?Math.PI:0,'#f6f3ea','#f6f3ea');
    for(let k=-1;k<=1;k++) mesh(new T.PlaneGeometry(1.6,2.2),bas(0x2a1d14),g,x+k*3,1.2,sz).rotation.y=north?Math.PI:0;
    const stone=new V3(x,0,north?7:-7);
    const pad=mesh(new T.BoxGeometry(1.8,0.16,1.8),lam(0xffffff,{emissive:0x555555}),g,stone.x,0.08,stone.z);
    return {name:n,sign:s,pad:pad,stone:stone,done:false,m:m};
  });
  function setStore(s,on){ s.done=on; s.sign.setText(on?s.name:'',on?'#1b2440':'#f6f3ea',on?'#f4b731':'#f6f3ea'); s.pad.material.color.setHex(on?0xc9a24a:0xffffff); s.pad.material.emissive.setHex(on?0x3a2a00:0x555555); }
  // the Capitol steps at the west end
  const marble=lam(0xece6da);
  [[-36,-34,1],[-38,-36,2],[-40,-38,3]].forEach(s=>solid(s[0],s[1],-6,6,s[2],marble));
  solid(-42,-40,-8,8,10,marble); for(let z=-5;z<=5;z+=2.5) mesh(new T.CylinderGeometry(0.35,0.35,6,8),marble,g,-39,6,z);
  sign(g,'U.S. CAPITOL',-39.9,9,0,6,1,Math.PI/2,'#ece6da','#1b2440');
  // the tower at the east end
  const towerM=lam(0x8a6a4a);
  const steps=[[26,29,-4,0,1.6],[30,33,1,5,3.4],[34,37,-5,-1,5.2],[38,42,-1,3,7],[34,37,4,8,8.8],[29,32,0,4,10.6],[33,36,-6,-2,12.4],[38,42,-6,-2,14.2],[38,42,3,8,16],[32,36,6,10,17.6]];
  steps.forEach(s=>solid(s[0],s[1],s[2],s[3],s[4],towerM,s[4]-0.6));
  const flood=mesh(new T.PlaneGeometry(30,30),new T.MeshLambertMaterial({color:0xf6f3ea,transparent:true,opacity:0.88,depthWrite:false}),g,33,0,0); flood.rotation.x=-Math.PI/2; flood.visible=false;
  function resetFlood(w){ w.ms.n=0; w.ms.on=false; w.ms.flood=-0.5; flood.position.y=-0.5; flood.visible=true; showPickups(pages,true); }
  w.collectTints();
  const caseSign=sign(g,'RIOT',-26,3.4,-6.95,1.8,0.5,0,'#f1e8d4','#d7263d');
  const pages=[[27.5,2.6,-2],[31.5,4.4,3],[39.5,8,1],[30.5,11.6,2],[40,15.2,-4]].map(p=>pickup(w,p[0],p[1],p[2],0xf1e8d4,new T.BoxGeometry(0.7,0.05,0.9)));
  const book=pickup(w,4,1.2,0,0x7a2a3a,new T.BoxGeometry(0.8,0.2,0.6));
  const boss=makeBoss(w,{name:'The Paver',hp:4,speed:3.4,r:1.6,height:3,build(bg){
    mesh(new T.BoxGeometry(2.6,1.8,2.4),lam(0xdfe5ee),bg,0,1.6,-0.6); mesh(new T.BoxGeometry(1.6,1.2,1.4),lam(0x2a2f38),bg,0,3,-1);
    const r=mesh(flat(new T.CylinderGeometry(0.9,0.9,3,12)),lam(0xf6f3ea),bg,0,0.9,1.2); r.rotation.z=Math.PI/2; }});
  for(let x=-24;x<20;x+=2.2) addRoyalty(w,new V3(x,0.9,3.5));
  for(let x=-24;x<20;x+=2.2) addRoyalty(w,new V3(x,0.9,-3.5));
  steps.forEach(s=>addRoyalty(w,new V3((s[0]+s[1])/2,s[4]+0.9,(s[2]+s[3])/2)));
  [[-6,4],[10,-4]].forEach(p=>addBlot(w,new V3(p[0],0,p[1]),'trooper'));
  addBlot(w,new V3(16,0,2));
  Object.assign(w,{boss:boss,stores:stores,pages:pages,book:book});
  return w;
})();
