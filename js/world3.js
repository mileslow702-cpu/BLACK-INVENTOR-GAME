'use strict';
/* ---------- world 3: Caution (Garrett A. Morgan, Cleveland) ---------- */
const caution=(function(){
  const w=makeLevel({key:'w3',bounds:{x0:-30,x1:70,z0:-22,z1:22},bg:0x3a4048,amb:0.65,sun:0.45,
    caseAt:[0,0,-16],spawn:[-24,0,14,1,0],
    intro:{eyebrow:'World 03 · Cleveland, Ohio',title:'Caution',mission:''},
    card:{n:3,name:'Garrett A. Morgan',years:'1877 – 1963 · Inventor · Cleveland, Ohio',
      p1:'He patented a safety hood that let a wearer breathe in smoke. In 1916, after an explosion trapped workers in a tunnel under Lake Erie, he and his brother Frank went down in their hoods and brought men out. Early news reports played down his part.',
      p2:'In 1923 he patented a three-position traffic signal that could stop every direction at once, the pause before the light changes. General Electric bought the rights for $40,000. The federal government honored him for it near the end of his life.'},
    missions:[
      {hint:'Grab the safety hood at the tunnel mouth, then bring all four workers out before your air runs out.',
       setup(w){ w.ms.air=1; w.ms.hood=false; w.ms.saved=0; workers.forEach(k=>{ k.done=false; k.g.visible=true; }); hood.done=false; hood.m.visible=true; },
       tag(w){ return 'Workers '+w.ms.saved+'/4 · Air '+'▮'.repeat(Math.ceil(w.ms.air*5))+'▯'.repeat(5-Math.ceil(w.ms.air*5)); },
       logic(w,dt){
         if(!w.ms.hood&&touching(hood.pos,1.5)){ w.ms.hood=true; hood.m.visible=false; sfx.lock(); toast('Safety hood on'); w.tag(); }
         const inT=P.p.x>26&&P.p.x<67&&Math.abs(P.p.z)<4.5;
         if(inT){ const old=w.ms.air; w.ms.air-=dt/(w.ms.hood?40:9); if(((old*5)|0)!==((w.ms.air*5)|0)) w.tag();
           if(w.ms.air<=0){ w.ms.air=1; sfx.hurt(); toast('Out of air. Back to the tunnel mouth.'); P.hp=Math.max(1,P.hp-1); updateHud(); w.place([22,0,0,1,0]); w.tag(); } }
         else if(w.ms.air<1){ w.ms.air=Math.min(1,w.ms.air+dt/3); w.tag(); }
         for(const k of workers){ if(k.done) continue; if(touching(k.pos,1.6)){ k.done=true; k.g.visible=false; w.ms.saved++; sfx.lock(); dust(6,3,k.pos);
           toast(w.ms.saved<4?'Worker '+w.ms.saved+' of 4 is out':'Everyone is out'); w.tag(); if(w.ms.saved===4) w.sealReady(); } }
       }},
      {hint:'Install a signal on each of the three poles. Cross the street between cars.',
       setup(w){ w.ms.n=0; poles.forEach(p=>{ p.done=false; p.lights.forEach(l=>l.visible=false); }); },
       tag(w){ return 'Signals '+w.ms.n+'/3'; },
       logic(w){ for(const p of poles){ if(p.done) continue; if(touching(p.pos,1.8)){ p.done=true; w.ms.n++; sfx.lock(); toast(w.ms.n<3?'Signal '+w.ms.n+' of 3 installed':'Every lane has a signal'); w.tag(); if(w.ms.n===3) w.sealReady(); } } }},
      {hint:'The Smokestack is choking the plaza. Dodge its charge, then hit it while it is dazed.',
       setup(w){ w.ms.boss=true; boss.start(-6,0,0); },
       tag(){ return boss.tag(); },
       logic(w,dt){ boss.update(dt); if(boss.dead&&!w.ready) w.sealReady('The air is clear. The Seal of Record is over the glass case.'); }}
    ],
    reset(w){ boss.stop(); workers.forEach(k=>{ k.g.visible=w.mission===0; }); hood.m.visible=w.mission===0; },
    animate(w,dt,t){
      const m=w.mission;
      cars.forEach(c=>{ const p=poles[c.lane]; const sig=(m===1&&p.done)||m===2||sealsFor('w3')>=2;
        c.stop=m===2||(sig&&((t%6)<3)); c.update(dt); });
      poles.forEach((p,i)=>{ const on=(m===1&&p.done)||m===2||sealsFor('w3')>=2, red=m===2||((t%6)<3);
        p.lights[0].visible=on&&red; p.lights[2].visible=on&&!red; p.lights[1].visible=on&&((t%6)>2.4&&(t%6)<3); });
      smoke.forEach((s,i)=>{ s.position.y=1.6+Math.sin(t*0.8+i)*0.3; s.material.opacity=0.32+0.08*Math.sin(t+i); });
      if(w.mission===0) spinPickups([hood],t);
      workers.forEach((k,i)=>{ if(!k.done) k.g.rotation.y=Math.sin(t*2+i)*0.3; });
    }
  });
  const g=w.group, solid=w.solid;
  // street and sidewalks
  mesh(new T.PlaneGeometry(100,44),lam(0xffffff,{map:groundTex('#6a6f78','#5d626b',25)}),g,20,0,0).rotation.x=-Math.PI/2;
  const road=mesh(new T.PlaneGeometry(50,18),lam(0x2b2e33),g,-5,0.02,0); road.rotation.x=-Math.PI/2;
  for(const z of [-3,3]) for(let x=-29;x<20;x+=4) mesh(new T.PlaneGeometry(2,0.3),bas(0xf4b731),g,x,0.03,z).rotation.x=-Math.PI/2;
  const brick=lam(0x8a4a3a), stone=lam(0xb8b0a0), glassy=lam(0x2c4a63);
  [[-30,-18,18,22,9],[-16,-4,18,22,12],[-2,12,18,22,7],[-30,-14,-22,-19,10],[10,22,-22,-19,8]].forEach((b,i)=>{
    solid(b[0],b[1],b[2],b[3],b[4],i%2?brick:stone);
    for(let x=b[0]+1.5;x<b[1]-1;x+=3) for(let y=2;y<b[4]-1;y+=3) mesh(new T.PlaneGeometry(1.4,1.6),glassy,g,x,y,b[2]<0?b[3]+0.02:b[2]-0.02).rotation.y=b[2]<0?0:Math.PI;
  });
  // the tunnel under the lake
  const rock=lam(0x4a4036);
  solid(24,68,4,6,4,rock); solid(24,68,-6,-4,4,rock); solid(66,68,-4,4,4,rock);
  mesh(new T.PlaneGeometry(44,8),lam(0x2e2822),g,46,0.02,0).rotation.x=-Math.PI/2;
  mesh(new T.PlaneGeometry(44,8),lam(0x1d1915),g,46,4,0).rotation.x=Math.PI/2;
  [[33,1],[41,1.3],[49,0.9],[57,1.4]].forEach((d,i)=>solid(d[0]-0.6,d[0]+0.6,i%2?-4:-1,i%2?1:4,d[1],lam(0x6b5a44)));
  sign(g,'WATER WORKS\nTUNNEL No. 5',24,4.6,0,4,1.2,-Math.PI/2,'#2b2118','#f4b731','bold 64px Georgia, serif');
  const smoke=[]; for(let x=30;x<66;x+=6){ const s=mesh(new T.BoxGeometry(6,2.4,7.6),new T.MeshLambertMaterial({color:0x9a958c,transparent:true,opacity:0.35,depthWrite:false}),g,x,1.6,0); smoke.push(s); }
  // traffic: three lanes
  const cars=[]; [[-6,9,0xd7263d],[0,-11,0x2ec4b6],[6,8,0xf4b731]].forEach((L,i)=>{
    for(let k=0;k<2;k++){ const c=slider(w,{x0:-30,x1:22,z:L[0],y:0,len:3.2,wid:1.8,h:1.5,speed:L[1],color:L[2]}); c.x=-28+k*26+i*7; c.lane=i; cars.push(c); }
  });
  // three signal poles, across the lanes from each other
  const poles=[[-10,-10.5],[6,10.5],[14,-10.5]].map(p=>{
    mesh(new T.CylinderGeometry(0.12,0.12,4,6),lam(0x2a2f38),g,p[0],2,p[1]);
    const head=mesh(new T.BoxGeometry(0.6,1.6,0.5),lam(0x2a2f38),g,p[0],4.6,p[1]);
    const lights=[0xff3344,0xf4b731,0x35ff7a].map((c,i)=>mesh(new T.SphereGeometry(0.18,6,5),bas(c),g,p[0],5.1-i*0.5,p[1]+(p[1]<0?0.26:-0.26)));
    return {pos:new V3(p[0],1,p[1]),lights:lights,done:false};
  });
  w.collectTints();
  // the hood and four workers
  const hood=pickup(w,23,1.2,-2.4,0xc9a24a,new T.BoxGeometry(0.6,0.7,0.6));
  const workers=[[34,2],[44,-2],[53,2],[63,-1.5]].map(p=>{ const fg=makeFigure({skin:0x7a5236,top:0x5a6b7a,bottom:0x3a3a40,hair:0x2a2a2a},false,false); fg.position.set(p[0],0,p[1]); g.add(fg); return {g:fg,pos:new V3(p[0],0.6,p[1]),done:false}; });
  // the Smokestack
  const boss=makeBoss(w,{name:'The Smokestack',hp:3,speed:3.4,r:1.3,height:4,build(bg){
    mesh(flat(new T.CylinderGeometry(1,1.3,4,10)),lam(0x55504a),bg,0,2,0); mesh(flat(new T.CylinderGeometry(1.15,1.15,0.4,10)),lam(0x2a2622),bg,0,4.1,0);
    mesh(new T.BoxGeometry(0.3,0.5,0.1),bas(0xff7a3a),bg,-0.4,2.8,1.15); mesh(new T.BoxGeometry(0.3,0.5,0.1),bas(0xff7a3a),bg,0.4,2.8,1.15);
    for(let i=0;i<3;i++) mesh(flat(new T.IcosahedronGeometry(0.7-i*0.12,0)),new T.MeshLambertMaterial({color:0x777777,transparent:true,opacity:0.6}),bg,0.2*i,4.8+i*0.8,0); }});
  // Royalties and Smog Blots
  for(let x=-26;x<18;x+=2.2) addRoyalty(w,new V3(x,0.9,12.5));
  for(let x=-26;x<18;x+=2.2) addRoyalty(w,new V3(x,0.9,-12.5));
  for(let x=28;x<66;x+=2.4) addRoyalty(w,new V3(x,0.9,x%4<2?2.5:-2.5));
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; addRoyalty(w,new V3(Math.cos(a)*3,0.9,-16+Math.sin(a)*3)); }
  [[-20,8],[2,-14],[16,14]].forEach(p=>tintBlot(addBlot(w,new V3(p[0],0,p[1])),0x8a8a8a));
  Object.assign(w,{boss:boss,workers:workers,poles:poles,hood:hood});
  return w;
})();
