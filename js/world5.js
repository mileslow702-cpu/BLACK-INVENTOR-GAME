'use strict';
/* ---------- world 5: Third Rail (Granville T. Woods) ---------- */
const thirdRail=(function(){
  const RACE=24, CLOCK=32;
  const w=makeLevel({key:'w5',floorY:-30,killAlt:-6,bounds:{x0:-42,x1:42,z0:-21,z1:21},bg:0x8fb4d8,amb:0.7,sun:0.5,
    caseAt:[0,0,-16],spawn:[-36,0,-16,1,0],
    intro:{eyebrow:'World 05 · Cincinnati, Ohio',title:'Third Rail',mission:''},
    card:{n:5,name:'Granville T. Woods',years:'1856 – 1910 · Engineer and inventor · Ohio and New York',
      p1:'Born to free parents in Columbus, Ohio, he learned his trade on the job as a machinist and blacksmith. In 1887 he patented a telegraph that let moving trains send messages to stations, to help keep them from colliding.',
      p2:'Thomas Edison sued him over it, claiming he invented it first. Woods won, and won again. Edison then offered him a job, and Woods turned it down to keep control of his own inventions. He earned around 60 patents.'},
    missions:[
      {hint:'Two trains are headed for each other on the middle track. Cross to the north platform and punch the telegraph key before they meet.',
       setup(w){ w.ms.t=CLOCK; w.ms.done=false; resetCrash(); },
       tag(w){ return w.ms.done?'Signal sent':'Trains meet in '+Math.ceil(w.ms.t)+'s'; },
       logic(w,dt){
         if(w.ms.done) return;
         const old=w.ms.t; w.ms.t-=dt; if((old|0)!==(w.ms.t|0)) w.tag();
         if(atk.on&&atk.c.distanceTo(key.pos)<atk.r+1){ w.ms.done=true; crashA.stop=crashB.stop=true; sfx.lock(); toast('Signal sent. Both trains stop.'); w.sealReady(); return; }
         if(w.ms.t<=0||crashA.x+crashA.o.len>=crashB.x){ sfx.pound(); shake=0.8; toast('Too late. Try again.'); resetCrash(); w.ms.t=CLOCK; w.tag(); }
       }},
      {hint:'The first case: beat the handcar to the flag at the far end of the north platform. Jump the gaps.',
       setup(w){ w.ms.on=false; w.ms.cart=-34; w.ms.lost=false; cart.position.x=-34; },
       tag(w){ return w.ms.on?'Race on':'Climb the stairs to start'; },
       logic(w,dt){
         if(!w.ms.on){ if(P.p.y>2.5&&P.p.x<-24){ w.ms.on=true; toast('Go!'); sfx.jump(); w.tag(); } return; }
         w.ms.cart+=dt*72/RACE; cart.position.x=w.ms.cart;
         if(touching(flag.pos,2.2)){ w.ms.on=false; toast('You won the first case'); w.sealReady(); return; }
         if(w.ms.cart>=37){ w.ms.on=false; sfx.hurt(); toast('The handcar won. Back to the start.'); w.ms.cart=-34; cart.position.x=-34; w.place([-38,3,16,1,0]); w.tag(); }
       }},
      {hint:'The second case: the Claim Jumper says your work is his. Beat him on the tracks.',
       setup(w){ boss.start(0,0,2); w.ms.talked=false; },
       tag(){ return boss.tag(); },
       logic(w,dt){ boss.update(dt);
         if(boss.dead&&!w.ms.talked){ w.ms.talked=true;
           runScene([{talk:['The Curator','He won the second case too. Then Edison offered him a job.']},{talk:['The Curator','Woods said no. He kept control of his own inventions.']}],()=>w.sealReady()); } }}
    ],
    reset(w){ boss.stop(); cart.position.x=-34; trains.forEach(t=>t.stop=w.mission===2); crashA.m.visible=crashB.m.visible=w.mission===0; if(crashA.box) crashA.box.on=crashB.box.on=w.mission===0; },
    animate(w,dt){ trains.forEach(t=>t.update(dt)); if(w.mission===0){ crashA.update(dt); crashB.update(dt); } }
  });
  const g=w.group, solid=w.solid;
  // track bed, platforms and stairs
  solid(-42,42,-12,12,0,lam(0xffffff,{map:groundTex('#7a6a58','#6a5a48',20)}),-2);
  solid(-42,42,-21,-12,0,lam(0xb8b0a0),-2);
  const plat=lam(0xa89070);
  [[-42,-24],[-19,-6],[0,12],[17,28],[33,42]].forEach(s=>solid(s[0],s[1],12,21,3,plat,-2));
  [[-38,-34,9,12,1],[-34,-30,9,12,2]].forEach(s=>solid(s[0],s[1],s[2],s[3],s[4],plat));
  const tie=lam(0x4a3a2a), rail=lam(0x9aa3b2);
  for(const z of [-7,0,7]){ for(let x=-41;x<42;x+=2) mesh(new T.BoxGeometry(0.5,0.08,2.4),tie,g,x,0.04,z); mesh(new T.BoxGeometry(84,0.12,0.12),rail,g,0,0.1,z-0.75); mesh(new T.BoxGeometry(84,0.12,0.12),rail,g,0,0.1,z+0.75); }
  // telegraph key and finish flag
  solid(23,25,15,17,4,lam(0x4a3a2a),3);
  const key={pos:new V3(24,4.5,16)}; mesh(new T.BoxGeometry(1,0.3,0.6),lam(0xc9a24a,{emissive:0x5a3a00}),g,24,4.15,16);
  sign(g,'TELEGRAPH',24,5.3,14.9,2.6,0.6,0,'#2b2118','#f4b731');
  const flag={pos:new V3(38,3.6,16)}; mesh(new T.CylinderGeometry(0.08,0.08,3,6),lam(0xdfe5ee),g,38,4.5,16); mesh(new T.BoxGeometry(1.2,0.7,0.05),lam(0xd7263d),g,38.6,5.6,16);
  // trains on the outer tracks, always running; two on the middle track for the first mission
  const trains=[];
  [[-7,7,0x2b59c3],[7,-6,0x8a2b2b]].forEach(L=>{ for(let k=0;k<2;k++){ const t=slider(w,{x0:-70,x1:70,z:L[0],y:0,len:9,wid:2.2,h:2.4,speed:L[1],color:L[2],solid:true}); t.x=-60+k*70; trains.push(t); } });
  const crashA=slider(w,{x0:-80,x1:80,z:0,y:0,len:8,wid:2.2,h:2.4,speed:2.4,color:0x2a2f38,solid:true});
  const crashB=slider(w,{x0:-80,x1:80,z:0,y:0,len:8,wid:2.2,h:2.4,speed:-2.4,color:0x5a2a2a,solid:true});
  function resetCrash(){ crashA.x=-80; crashB.x=72; crashA.stop=crashB.stop=false; }
  w.collectTints();
  const cart=new T.Group(); g.add(cart); cart.position.set(-34,0.2,9.5);
  mesh(new T.BoxGeometry(2,0.6,1.6),lam(0x6b4a2b),cart,0,0.4,0); mesh(new T.BoxGeometry(0.2,1.2,1.2),lam(0x2a2f38),cart,0,1.2,0);
  const boss=makeBoss(w,{name:'The Claim Jumper',hp:3,speed:3.8,r:1.5,height:3,build(bg){
    mesh(new T.BoxGeometry(2.4,2.2,3.2),lam(0x2a2f38),bg,0,1.4,0); mesh(flat(new T.CylinderGeometry(0.5,0.5,1.4,8)),lam(0x1a1a1a),bg,0,3.1,0.8);
    mesh(new T.BoxGeometry(2.5,1.2,1.4),lam(0x5a4a3a),bg,0,2.2,-0.6);
    for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(flat(new T.CylinderGeometry(0.5,0.5,0.3,10)),lam(0x9aa3b2),bg,sx*1.25,0.5,sz*1).rotation.z=Math.PI/2;
    mesh(new T.BoxGeometry(1,0.3,0.1),bas(0xf4b731),bg,0,1.8,1.62); }});
  for(let x=-38;x<38;x+=2.5) addRoyalty(w,new V3(x,0.9,-16));
  [[-21.5,4.5],[-3,4.5],[14.5,4.5],[30.5,4.5]].forEach(p=>{ for(let i=-1;i<=1;i++) addRoyalty(w,new V3(p[0]+i,p[1],16)); });
  for(let x=-30;x<30;x+=3) addRoyalty(w,new V3(x,0.9,-3.5));
  [[-10,-15],[14,-17]].forEach(p=>tintBlot(addBlot(w,new V3(p[0],0,p[1]),'trooper'),0xdfe5ee));
  Object.assign(w,{boss:boss,telegraph:key,flag:flag,cart:cart});
  return w;
})();
