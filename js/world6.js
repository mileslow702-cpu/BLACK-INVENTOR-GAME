'use strict';
/* ---------- world 6: Immortal (Henrietta Lacks, Baltimore) ---------- */
// No fighting here. Low gravity, living cells, and her full name.
const immortal=(function(){
  const w=makeLevel({key:'w6',floorY:-30,killAlt:-10,grav:0.55,bounds:{x0:-30,x1:30,z0:-30,z1:30},bg:0x2a0f24,amb:0.95,sun:0.35,
    caseAt:[5,0,-5],spawn:[-4,0,4,1,0],
    intro:{eyebrow:'World 06 · Baltimore, Maryland',title:'Immortal',mission:''},
    card:{n:6,name:'Henrietta Lacks',years:'1920 – 1951 · Mother of five · Baltimore, Maryland',
      p1:'In 1951 doctors at Johns Hopkins took cells from her tumor without asking her. Her cells did not die in the lab. They kept dividing, and the line was named HeLa, from the first two letters of her names.',
      p2:'HeLa cells helped make the polio vaccine, map genes and develop COVID-19 vaccines. Her family went unpaid for decades. In 2023, on what would have been her 103rd birthday, they reached a settlement with a company that profited from her cells.'},
    missions:[
      {hint:'Gather the six vials floating among the cells. You can jump higher here.',
       setup(w){ w.ms.n=0; showPickups(vials,true); },
       tag(w){ return 'Vials '+w.ms.n+'/6'; },
       logic(w){ for(const v of vials){ if(v.done) continue; if(touching(v.pos,1.5)){ v.done=true; v.m.visible=false; w.ms.n++; tone(523+w.ms.n*60,523+w.ms.n*60,0.4,'triangle',0.07); w.tag(); if(w.ms.n===6) w.sealReady('Every vial is gathered. The Seal of Record is over the glass case.'); } } }},
      {hint:'Five labels read only “HeLa.” Touch each one to write her full name.',
       setup(w){ w.ms.n=0; labels.forEach(l=>{ l.done=false; l.s.setText('HeLa','#f1e8d4','#8a8a8a'); }); },
       tag(w){ return 'Names written '+w.ms.n+'/5'; },
       logic(w){ for(const l of labels){ if(l.done) continue; if(touching(l.pos,2)){ l.done=true; l.s.setText('Henrietta\nLacks','#f1e8d4','#1b2440'); w.ms.n++; sfx.lock(); w.tag(); if(w.ms.n===5) w.sealReady('Her name is whole. The Seal of Record is over the glass case.'); } } }},
      {hint:'Climb the cells to the table at the top. Her family is waiting.',
       setup(w){ w.ms.arrived=false; },
       tag(w){ return w.ms.arrived?'Home':'Climb to the table'; },
       logic(w){ if(!w.ms.arrived&&touching(table.pos,3)){ w.ms.arrived=true;
         runScene([{talk:['The Curator','For more than twenty years her family did not know her cells were still alive in labs around the world.']},
                   {talk:['The Curator','On August 1, 2023, what would have been her 103rd birthday, they brought balloons and a cake, and announced a settlement.']},
                   {talk:['The Curator','Her name is Henrietta Lacks. Say it whole.']}],()=>w.sealReady()); } }}
    ],
    animate(w,dt,t){
      movers.forEach(m=>{ const nx=m.x+Math.sin(t*m.sp+m.ph)*m.a, dx=nx-(m.b.x0+m.b.x1)/2; m.b.x0+=dx; m.b.x1+=dx; m.b.vx=dt>0?dx/dt:0; m.b.mesh.position.x=nx; });
      cells.forEach((c,i)=>{ const k=1+0.04*Math.sin(t*1.5+i); c.scale.set(k,1,k); });
      spinPickups(vials,t); table.cake.rotation.y=t*0.4;
    }
  });
  const g=w.group, solid=w.solid;
  const membrane=lam(0xe88aa8), nucleus=lam(0x8a2b5a), gold=lam(0xf4b731,{emissive:0x5a3a00});
  const cells=[];
  function cell(x,y,z,s,move){
    const b=solid(x-s/2,x+s/2,z-s/2,z+s/2,y,null,y-1.2);
    const grp=new T.Group(); grp.position.set(x,y,z); g.add(grp);
    const m=mesh(flat(new T.SphereGeometry(s*0.62,12,6,0,Math.PI*2,0,Math.PI/2)),membrane,grp,0,-0.6,0); m.scale.y=0.35;
    mesh(flat(new T.SphereGeometry(s*0.18,8,5)),nucleus,grp,0,0,0).scale.y=0.4;
    cells.push(grp); b.mesh=grp;
    return b;
  }
  cell(0,0,0,16);
  const path=[[11,2.5,6,5],[16,5.5,-1,5],[12,8.5,-9,4.5],[4,11,-14,5],[-6,13.5,-12,4.5],[-13,16,-5,5],[-12,19,5,4.5],[-4,21.5,11,5],[6,24,10,6]];
  const blocks=path.map(p=>cell(p[0],p[1],p[2],p[3]));
  const movers=[{b:blocks[2],x:12,a:2.5,sp:0.8,ph:0},{b:blocks[5],x:-13,a:2.2,sp:1,ph:1.5}];
  const side=[[-12,3,-4,4],[-18,6,-14,4],[18,4,12,4]].map(p=>cell(p[0],p[1],p[2],p[3]));
  // the birthday table at the top
  const top=path[path.length-1];
  const table={pos:new V3(top[0],top[1]+0.8,top[2])};
  mesh(new T.BoxGeometry(3,0.2,1.6),lam(0xf1e8d4),g,top[0],top[1]+1,top[2]);
  for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(new T.BoxGeometry(0.12,1,0.12),lam(0x6b4a2b),g,top[0]+sx*1.3,top[1]+0.5,top[2]+sz*0.65);
  table.cake=mesh(flat(new T.CylinderGeometry(0.45,0.45,0.4,10)),lam(0xf4b731),g,top[0],top[1]+1.3,top[2]);
  [0xd7263d,0x2ec4b6,0xf4b731].forEach((c,i)=>{ mesh(new T.SphereGeometry(0.35,8,6),lam(c),g,top[0]-1+i,top[1]+3+i*0.3,top[2]-0.6); mesh(new T.CylinderGeometry(0.01,0.01,2,3),lam(0xffffff),g,top[0]-1+i,top[1]+2,top[2]-0.6); });
  w.collectTints();
  const vials=[[11,3.6,6],[12,9.6,-9],[-6,14.6,-12],[-12,4.1,-4],[18,5.1,12],[-18,7.1,-14]].map(p=>pickup(w,p[0],p[1],p[2],0xff9ec4,new T.CylinderGeometry(0.18,0.18,0.7,8)));
  const labels=[[16,5.5,-1],[4,11,-14],[-13,16,-5],[-4,21.5,11],[-4,0,-5]].map(p=>{ const s=sign(g,'HeLa',p[0],p[1]+1.6,p[2],1.8,0.9,0,'#f1e8d4','#8a8a8a'); const s2=s.clone(); s2.rotation.y=Math.PI; g.add(s2); s2.material=s.material; return {s:s,pos:new V3(p[0],p[1]+0.8,p[2]),done:false}; });
  for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; addRoyalty(w,new V3(Math.cos(a)*6,0.9,Math.sin(a)*6)); }
  path.forEach(p=>{ for(let i=-1;i<=1;i++) addRoyalty(w,new V3(p[0]+i*1.1,p[1]+0.9,p[2])); });
  Object.assign(w,{vials:vials,labels:labels,table:table});
  return w;
})();
