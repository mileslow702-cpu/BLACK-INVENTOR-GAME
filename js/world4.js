'use strict';
/* ---------- world 4: Lights On (Lewis H. Latimer, New York) ---------- */
const lightsOn=(function(){
  const w=makeLevel({key:'w4',floorY:-30,killAlt:-5,bounds:{x0:-32,x1:42,z0:-22,z1:22},bg:0x05070f,amb:0.22,sun:0.06,
    caseAt:[-22,6,14],spawn:[-26,0,-14,1,0],
    intro:{eyebrow:'World 04 · New York City',title:'Lights On',mission:''},
    card:{n:4,name:'Lewis H. Latimer',years:'1848 – 1928 · Inventor and draftsman · Boston and New York',
      p1:'He taught himself mechanical drawing as an office boy at a patent law firm. In 1876 he drew the patent drawings for Alexander Graham Bell’s telephone, and Bell filed hours ahead of a rival.',
      p2:'In 1882 he patented a better way to make carbon filaments, which made electric light last and helped bulbs be made in quantity. Edison’s company hired him in 1884, and he testified for its patents in court. He was the only Black member of the Edison Pioneers.'},
    missions:[
      {hint:'The city is dark. Touch each of the four streetlamps to light it.',
       setup(w){ w.ms.n=0; lamps.forEach(l=>{ l.done=false; }); },
       tag(w){ return 'Lamps '+w.ms.n+'/4'; },
       logic(w){ for(const l of lamps){ if(l.done) continue; if(touching(l.pos,2)){ l.done=true; w.ms.n++; sfx.lock(); toast(w.ms.n<4?'Lamp '+w.ms.n+' of 4':'The street is lit'); w.tag(); if(w.ms.n===4) w.sealReady(); } } }},
      {hint:'Draft the bridge. Punch the glowing post, and a span appears. A new post waits at its end.',
       setup(w){ w.ms.n=0; setBridge(0); },
       tag(w){ return 'Bridge '+w.ms.n+'/4'; },
       logic(w){ const p=posts[w.ms.n]; if(p&&atk.on&&atk.c.distanceTo(p.pos)<atk.r+0.9){ w.ms.n++; setBridge(w.ms.n); sfx.lock(); dust(5,3,p.pos); w.tag();
         if(w.ms.n===4){ toast('The bridge is drawn'); w.sealReady(); } } }},
      {hint:'Take the evidence from the drafting office door to the courthouse across the bridge.',
       setup(w){ setBridge(4); w.ms.carry=false; w.ms.court=false; evid.done=false; evid.m.visible=true; },
       tag(w){ return w.ms.court?boss.tag():(w.ms.carry?'Carry it to the courthouse':'Pick up the evidence'); },
       logic(w,dt){
         if(!w.ms.carry&&touching(evid.pos,1.6)){ w.ms.carry=true; evid.m.visible=false; sfx.lock(); toast('Evidence in hand'); w.tag(); }
         if(w.ms.carry&&!w.ms.court&&P.p.x>26&&Math.abs(P.p.z)<8){ w.ms.court=true; boss.start(32,0,-2); toast('The Blackout wants that evidence'); w.tag(); }
         if(w.ms.court){ boss.update(dt); if(boss.dead&&!w.ready) w.sealReady('Testimony given. The Seal of Record is over the glass case.'); }
       }}
    ],
    reset(w){ boss.stop(); lamps.forEach(l=>{ l.done=sealsFor('w4')>=1&&w.mission!==0; }); setBridge(w.mission>=2||sealsFor('w4')>=2?4:0); evid.m.visible=false; posts.forEach(p=>p.m.visible=false); },
    animate(w,dt,t){
      novaLight.position.set(P.p.x,P.p.y+2.2,P.p.z);
      lamps.forEach(l=>{ l.light.intensity=l.done?1.3:0; l.bulb.material.color.setHex(l.done?0xfff1b0:0x333333); });
      posts.forEach((p,i)=>{ p.m.visible=w.mission===1&&i===w.ms.n; p.m.material.emissive.setHex(0x8a6a00).multiplyScalar(0.6+0.4*Math.sin(t*5)); });
      if(w.mission===2) spinPickups([evid],t);
    }
  });
  const g=w.group, solid=w.solid;
  const cobble=lam(0xffffff,{map:groundTex('#3a3a44','#2a2a33',18)});
  solid(-32,-2,-22,22,0,cobble,-2); solid(10,42,-22,22,0,cobble,-2);
  mesh(new T.PlaneGeometry(12,44),lam(0x0b1b33),g,4,-2.5,0).rotation.x=-Math.PI/2;
  const brick=lam(0x5a3a30), stone=lam(0x8a8478), win=bas(0x1a1a22);
  // the drafting office, with steps up to its roof
  solid(-26,-18,10,18,6,brick);
  [[-12,-10,1.2],[-14,-12,2.4],[-16,-14,3.6],[-18,-16,4.8]].forEach(s=>solid(s[0],s[1],12,16,s[2],stone));
  sign(g,'DRAFTING',-22,4.2,9.98,5,1,Math.PI,'#2b2118','#f4b731');
  [[-31,-24,-22,-16,8],[-31,-26,-8,0,10],[12,20,14,22,9],[22,30,16,22,11],[34,42,-22,-14,8]].forEach(b=>{ solid(b[0],b[1],b[2],b[3],b[4],brick);
    for(let y=2;y<b[4];y+=3) mesh(new T.PlaneGeometry(1.2,1.4),win,g,(b[0]+b[1])/2,y,b[2]<0?b[3]+0.02:b[2]-0.02).rotation.y=b[2]<0?0:Math.PI; });
  // the courthouse
  solid(34,42,-6,6,7,stone); for(let z=-5;z<=5;z+=2.5) solid(32.6,33.4,z-0.4,z+0.4,6,lam(0xd8d0c0));
  sign(g,'COURTHOUSE',33.9,6.4,0,7,1.2,-Math.PI/2,'#d8d0c0','#1b2440');
  // the bridge, drawn in four spans
  const spans=[]; for(let i=0;i<4;i++){ const b=solid(-2+i*3,1+i*3,-1.5,1.5,0,lam(0xc9a24a,{emissive:0x3a2a00}),-0.5); spans.push(b); }
  function setBridge(n){ spans.forEach((b,i)=>{ b.on=i<n; b.mesh.visible=i<n; }); }
  const posts=[0,1,2,3].map(i=>{ const m=mesh(new T.BoxGeometry(0.4,1.6,0.4),lam(0xf4b731,{emissive:0x8a6a00}),g,-2.4+i*3,0.8,1.2); return {m:m,pos:new V3(-2.4+i*3,1,1.2)}; });
  // streetlamps
  const lamps=[[-20,-4],[-8,8],[-28,4],[-10,-18]].map(p=>{
    mesh(new T.CylinderGeometry(0.1,0.14,4.4,6),lam(0x1a1a20),g,p[0],2.2,p[1]);
    const bulb=mesh(new T.SphereGeometry(0.35,8,6),bas(0x333333),g,p[0],4.6,p[1]);
    const light=new T.PointLight(0xffd98a,0,16); light.position.set(p[0],4.4,p[1]); g.add(light);
    return {pos:new V3(p[0],1,p[1]),bulb:bulb,light:light,done:false};
  });
  const novaLight=new T.PointLight(0xffe3a8,1.1,11); g.add(novaLight);
  w.collectTints();
  const evid=pickup(w,-22,1.2,8.4,0xf1e8d4,new T.BoxGeometry(0.8,0.1,0.6));
  const boss=makeBoss(w,{name:'The Blackout',hp:3,speed:3.6,r:1.4,height:3,build(bg){
    mesh(flat(new T.IcosahedronGeometry(1.5,1)),lam(0x0a0a12,{emissive:0x05050a}),bg,0,1.6,0);
    mesh(new T.BoxGeometry(0.4,0.25,0.1),bas(0x8fd3ff),bg,-0.5,2,1.35); mesh(new T.BoxGeometry(0.4,0.25,0.1),bas(0x8fd3ff),bg,0.5,2,1.35); }});
  for(let x=-28;x<-4;x+=2.4) addRoyalty(w,new V3(x,0.9,0));
  for(let x=12;x<32;x+=2.4) addRoyalty(w,new V3(x,0.9,8));
  [[-11,14,2.1],[-13,14,3.3],[-15,14,4.5],[-17,14,5.7],[-19,14,6.9]].forEach(p=>addRoyalty(w,new V3(p[0],p[2],p[1])));
  for(let i=0;i<8;i++) addRoyalty(w,new V3(-24+i,7,12));
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; addRoyalty(w,new V3(24+Math.cos(a)*4,0.9,-6+Math.sin(a)*4)); }
  [[-14,-8],[16,-10],[20,4],[-24,-2]].forEach(p=>tintBlot(addBlot(w,new V3(p[0],0,p[1])),0x16161f));
  Object.assign(w,{boss:boss,lamps:lamps,posts:posts,evid:evid});
  return w;
})();
