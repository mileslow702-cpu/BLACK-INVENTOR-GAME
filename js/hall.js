'use strict';
/* ---------- world 0: the Hall of Record ---------- */
const HX=16, HZ=30, HH=13;
function hubHint(){
  if(!save.intro) return HINT_CART;
  const a=sealsFor('w1'), b=sealsFor('w2');
  if(a===3&&b===3) return HINT_HUB_DONE;
  if(a+b===0) return HINT_HUB;
  return HINT_HUB_SOME;
}
const hub=(function(){
  const w=makeBoxWorld({floorY:0,bounds:{x0:-HX,x1:HX,z0:-HZ,z1:HZ},ceil:HH});
  const g=w.group, solid=w.solid;
  const marble=lam(0xece6da), gold=lam(0xc9a24a), wood=lam(0x4a2f22), navy=lam(0x1d2a5c), carpetRed=lam(0x8f1d2c);

  const floorT=tex(64,64,c=>{ c.fillStyle='#e9e1cf'; c.fillRect(0,0,64,64); c.fillStyle='#27365a'; c.fillRect(0,0,32,32); c.fillRect(32,32,32,32); });
  floorT.wrapS=floorT.wrapT=T.RepeatWrapping; floorT.repeat.set(HX/2,HZ/2);
  mesh(new T.PlaneGeometry(HX*2,HZ*2),lam(0xffffff,{map:floorT}),g).rotation.x=-Math.PI/2;
  const carpetT=tex(32,8,(c,W,H)=>{ c.fillStyle='#8f1d2c'; c.fillRect(0,0,W,H); c.fillStyle='#c9a24a'; c.fillRect(1,0,2,H); c.fillRect(W-3,0,2,H); });
  mesh(new T.PlaneGeometry(5,49),lam(0xffffff,{map:carpetT}),g,0,0.02,3.5).rotation.x=-Math.PI/2;

  function wallTex(rep){ const t=tex(64,128,(c,W,H)=>{
      c.fillStyle='#d8c9a6'; c.fillRect(0,0,W,H); c.fillStyle='#cdbd97'; for(let x=0;x<W;x+=16) c.fillRect(x,0,2,H);
      c.fillStyle='#4a2f22'; c.fillRect(0,H-30,W,30); c.fillStyle='#c9a24a'; c.fillRect(0,H-33,W,3);
      c.fillStyle='#3b241a'; for(let x=0;x<W;x+=32) c.fillRect(x,H-30,2,30); });
    t.wrapS=T.RepeatWrapping; t.repeat.set(rep,1); return t; }
  const sideM=lam(0xffffff,{map:wallTex(15)}), endM=lam(0xffffff,{map:wallTex(8)});
  mesh(new T.PlaneGeometry(HZ*2,HH),sideM,g,-HX,HH/2,0).rotation.y=Math.PI/2;
  mesh(new T.PlaneGeometry(HZ*2,HH),sideM,g,HX,HH/2,0).rotation.y=-Math.PI/2;
  mesh(new T.PlaneGeometry(HX*2,HH),endM,g,0,HH/2,-HZ);
  mesh(new T.PlaneGeometry(HX*2,HH),endM,g,0,HH/2,HZ).rotation.y=Math.PI;
  const ceilT=tex(128,128,(c,W,H)=>{ c.fillStyle='#0c1638'; c.fillRect(0,0,W,H); const r=rng(64); for(let i=0;i<70;i++){ c.fillStyle=r()<0.3?'#f4b731':'#dce9ff'; c.fillRect((r()*W)|0,(r()*H)|0,2,2); } });
  ceilT.wrapS=ceilT.wrapT=T.RepeatWrapping; ceilT.repeat.set(3,5);
  mesh(new T.PlaneGeometry(HX*2,HZ*2),bas(0xffffff,{map:ceilT}),g,0,HH,0).rotation.x=Math.PI/2;

  for(const sx of [-1,1]) for(const z of [-24,-12,0,12,24]){
    solid(sx*15.3-0.7,sx*15.3+0.7,z-0.7,z+0.7,HH,marble);
    mesh(new T.BoxGeometry(1.8,0.5,1.8),gold,g,sx*15.3,0.25,z); mesh(new T.BoxGeometry(1.8,0.5,1.8),gold,g,sx*15.3,HH-0.25,z);
  }

  // painting art
  const art1=tex(256,256,(c,W,H)=>{
    c.fillStyle='#070b24'; c.fillRect(0,0,W,H);
    const r=rng(7); c.fillStyle='#ffffff'; for(let i=0;i<90;i++) c.fillRect((r()*W)|0,(r()*H)|0,2,2);
    c.strokeStyle='#f4b731'; c.lineWidth=3;
    [[110,40,-0.5],[112,34,0.55],[100,52,1.4]].forEach(o=>{ c.beginPath(); c.ellipse(128,132,o[0],o[1],o[2],0,Math.PI*2); c.stroke(); });
    c.fillStyle='#2a6fdb'; c.beginPath();
    for(let i=0;i<=48;i++){ const a=i/48*Math.PI*2, rr=62+7*Math.sin(a*3+1)+5*Math.sin(a*5+2.2), x=128+Math.cos(a)*rr, y=132+Math.sin(a)*rr; if(i) c.lineTo(x,y); else c.moveTo(x,y); }
    c.closePath(); c.fill();
    c.save(); c.clip(); c.fillStyle='#4caf50'; [[105,110,30],[150,150,26],[140,95,16],[95,165,14]].forEach(o=>{ c.beginPath(); c.arc(o[0],o[1],o[2],0,7); c.fill(); }); c.restore();
    [[40,96],[214,92],[150,222]].forEach(o=>{ c.fillStyle='#8fd3ff'; c.fillRect(o[0]-17,o[1]-3,10,6); c.fillRect(o[0]+7,o[1]-3,10,6); c.fillStyle='#ffffff'; c.fillRect(o[0]-5,o[1]-5,10,10); });
  });
  const art2=tex(256,256,(c,W,H)=>{
    c.fillStyle='#0b2a2e'; c.fillRect(0,0,W,H);
    c.lineWidth=4; for(let i=1;i<=6;i++){ c.strokeStyle=i%2?'#f4b731':'#2ec4b6'; c.beginPath(); c.arc(128,112,i*24,0,Math.PI*2); c.stroke(); }
    c.fillStyle='#0b2a2e'; c.fillRect(92,56,72,176);
    c.fillStyle='#dfe5ee'; c.beginPath(); c.arc(128,96,30,Math.PI,0); c.lineTo(158,128); c.arc(128,128,30,0,Math.PI); c.closePath(); c.fill();
    c.fillStyle='#8d95a3'; for(let y=84;y<142;y+=10) c.fillRect(102,y,52,3);
    c.fillStyle='#dfe5ee'; c.fillRect(123,158,10,54); c.fillRect(100,208,56,8);
    c.fillStyle='#f4b731'; [14,30,22,40,18,34,12].forEach((v,i)=>{ c.fillRect(10+i*11,246-v,7,v); c.fillRect(170+i*11,246-v,7,v); });
  });
  const lockedT=tex(256,256,(c,W,H)=>{
    c.fillStyle='#1c2233'; c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(220,233,255,.12)'; c.lineWidth=1; c.beginPath(); for(let i=16;i<W;i+=16){ c.moveTo(i,0); c.lineTo(i,H); c.moveTo(0,i); c.lineTo(W,i); } c.stroke();
    c.fillStyle='rgba(220,233,255,.2)'; c.font='bold 150px Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('?',W/2,H/2-10);
    c.strokeStyle='#e23a4e'; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(28,196);
    c.bezierCurveTo(70,120,90,250,120,180); c.bezierCurveTo(140,140,150,240,180,170); c.bezierCurveTo(200,130,215,220,236,186); c.stroke();
    c.lineWidth=4; c.beginPath(); c.moveTo(30,226); c.lineTo(230,214); c.stroke();
  });
  function plaqueTex(l1,l2){ return tex(512,128,(c,W,H)=>{
    const stolen=!l2; c.fillStyle=stolen?'#5b4a2a':'#d6ad4c'; c.fillRect(0,0,W,H); c.strokeStyle=stolen?'#3a2f1a':'#7a5a14'; c.lineWidth=8; c.strokeRect(4,4,W-8,H-8);
    c.textAlign='center'; c.textBaseline='middle';
    if(stolen){ c.fillStyle='#ff5468'; c.font='bold 54px Georgia, serif'; c.fillText(l1,W/2,H/2+2); }
    else { c.fillStyle='#1b1405'; c.font='bold 50px Georgia, serif'; c.fillText(l1,W/2,46); c.font='26px Georgia, serif'; c.fillText(l2,W/2,94); }
  },true); }
  const stolenT=plaqueTex('CREDIT STOLEN');

  // the roster, in the order the worlds open. Slots without a "to" are not built yet.
  const slots=[
    {key:'w1',side:-1,z:6,need:0,art:art1,plaque:plaqueTex('DR. GLADYS WEST','The math behind GPS'),to:()=>planet},
    {key:'w2',side:-1,z:18,need:1,art:art2,plaque:plaqueTex('JAMES E. WEST','Co-inventor of the electret microphone'),to:()=>soundcheck},
    {key:'w3',side:-1,z:-6},      // Garrett Morgan
    {key:'w4',side:-1,z:-18},     // Lewis Latimer
    {key:'w5',side:1,z:18},       // Granville T. Woods
    {key:'w6',side:1,z:6},        // Henrietta Lacks
    {key:'w7',side:1,z:-6},       // Dr. David Blackwell
    {key:'w8',side:1,z:-18}       // open
  ];
  const PW=6, PH=5;
  function frameOf(pg,W,H,m){
    mesh(new T.BoxGeometry(W+0.6,0.3,0.3),m,pg,0,H/2+0.15,0.1); mesh(new T.BoxGeometry(W+0.6,0.3,0.3),m,pg,0,-H/2-0.15,0.1);
    mesh(new T.BoxGeometry(0.3,H+0.6,0.3),m,pg,-W/2-0.15,0,0.1); mesh(new T.BoxGeometry(0.3,H+0.6,0.3),m,pg,W/2+0.15,0,0.1);
  }
  for(const s of slots){
    const pg=new T.Group(); pg.position.set(s.side*(HX-0.12),3.5,s.z); pg.rotation.y=-s.side*Math.PI/2; g.add(pg);
    const seg=!!s.to;
    s.geo=new T.PlaneGeometry(PW,PH,seg?24:1,seg?20:1);
    s.pm=bas(0xffffff,{map:lockedT}); mesh(s.geo,s.pm,pg,0,0,0.02);
    s.fm=lam(0x6b5330); frameOf(pg,PW,PH,s.fm);
    s.plm=bas(0xffffff,{map:stolenT}); mesh(new T.PlaneGeometry(4.4,1.1),s.plm,pg,0,PH/2+1.0,0.06);
    if(seg){ s.base=Float32Array.from(s.geo.attributes.position.array); s.rip=0; s.rx=0; s.ry=0; }
    s.open=false; s.done=false;
    const cg=new T.Group(); cg.position.set(s.side*(HX-2.2),0,s.z-4); cg.rotation.y=-s.side*Math.PI/2; g.add(cg);
    s.case=makeCase(cg,INV[s.key]); s.cpos=cg.position;
    solid(cg.position.x-0.8,cg.position.x+0.8,cg.position.z-0.8,cg.position.z+0.8,2.75,null);
    solid(s.side<0?-HX:HX-1.6, s.side<0?-HX+1.6:HX, s.z-3.2, s.z+3.2, 0.4, wood);
  }
  // the last painting, on the stage at the far end
  const fg=new T.Group(); fg.position.set(0,5.5,-HZ+0.12); g.add(fg);
  mesh(new T.PlaneGeometry(9,7),bas(0xffffff,{map:lockedT}),fg,0,0,0.02); frameOf(fg,9,7,lam(0x6b5330));
  mesh(new T.PlaneGeometry(4.4,1.1),bas(0xffffff,{map:stolenT}),fg,0,4.5,0.06);

  const arrow=mesh(new T.ConeGeometry(0.55,1.1,4),bas(0xf4b731),g,-HX+1.7,8.9,6); arrow.rotation.x=Math.PI;
  const glow=new T.PointLight(0xffd98a,0.9,18); glow.position.set(-HX+3.5,4,6); g.add(glow);

  // the Curator's cartridge, waiting on the carpet until Nova picks it up
  const cart=new T.Group(); cart.position.set(0,0.55,19); g.add(cart);
  mesh(new T.BoxGeometry(0.5,0.6,0.16),lam(0x8d95a3,{emissive:0x3a414c}),cart);
  mesh(new T.BoxGeometry(0.36,0.22,0.03),lam(0xd7263d,{emissive:0x5a1019}),cart,0,0.08,0.09);
  cart.add(new T.PointLight(0x8fd3ff,0.9,8));

  // things to jump on
  for(const c of [[-4.6,14],[4.6,14],[-4.6,2],[4.6,2]]){ solid(c[0]-0.8,c[0]+0.8,c[1]-0.8,c[1]+0.8,1.1,wood); mesh(new T.BoxGeometry(1.75,0.1,1.75),gold,g,c[0],1.06,c[1]); }
  solid(-13.5,-10.5,-19,-16,1.9,lam(0xdcd5c6)); solid(-13.5,-10.5,-22,-19,3.1,lam(0xcfc6b4)); solid(-13.5,-10.5,-25,-22,5.4,lam(0xc2b7a1));
  solid(7.6,8.6,-27,-21,9,navy); solid(11.6,12.6,-27,-21,9,navy);          // wall-kick shaft
  mesh(new T.BoxGeometry(1.2,0.2,6.2),gold,g,8.1,9.0,-24); mesh(new T.BoxGeometry(1.2,0.2,6.2),gold,g,12.1,9.0,-24);
  solid(-7,7,-22.2,-21,0.4,wood); solid(-7,7,-23.4,-22.2,0.8,wood); solid(-7,7,-24.6,-23.4,1.2,wood); solid(-7,7,-HZ,-24.6,1.6,carpetRed);

  // a White-Out leak on the stage: three Blots to practise on
  addBlot(w,new V3(-3,1.6,-27.5)); addBlot(w,new V3(3,1.6,-27.5)); addBlot(w,new V3(0,1.6,-26),'trooper');

  let next=null;
  return Object.assign(w,{
    name:'hub', bg:new T.Color(0x140e0a), amb:0.7, sun:0.45, slots:slots, cart:cart,
    spawn(s){
      P.fwd=P.side=P.vy=0; P.state='ground'; P.lastAir=null;
      if(s){ P.p.set(s.side*(HX-3.4),0,s.z); P.face.set(-s.side,0,0); cam.fwd.set(s.side,0,0); cam.pitch=0.2; cam.dist=10; }
      else { P.p.set(0,0,25); P.face.set(0,0,-1); cam.fwd.set(0,0,-1); cam.pitch=0.36; cam.dist=8.5; }
      resetThings(w); setHint(hubHint());
    },
    respawn(){ w.spawn(null); },
    // re-read the save: which paintings are open, which names are back
    refresh(){
      const n=sealCount(); next=null;
      for(const s of slots){
        s.open=!!s.to&&n>=s.need; s.done=sealsFor(s.key)===3;
        s.case.set(sealsFor(s.key)); if(s.done) s.case.free(); else s.case.lock();
        s.pm.map=s.open?s.art:lockedT; s.pm.needsUpdate=true;
        s.fm.color.setHex(s.open?0xf4b731:0x6b5330); s.fm.emissive.setHex(s.open?0x4a3300:0x000000);
        s.plm.map=s.done?s.plaque:stolenT; s.plm.needsUpdate=true;
        if(s.open&&!s.done&&!next) next=s;
      }
      arrow.visible=glow.visible=!!next;
      if(next){ arrow.position.x=next.side*(HX-1.7); arrow.position.z=next.z; glow.position.set(next.side*(HX-3.5),4,next.z); }
      cart.visible=!save.intro;
    },
    ripple(s){ s.rip=1; s.rx=s.side*(P.p.z-s.z); s.ry=clamp(P.p.y+0.8-3.5,-2.4,2.4); },
    animate(dt,t){
      for(const s of slots){
        if(!s.base||!s.open) continue;
        s.rip=Math.max(0,s.rip-dt*0.7);
        const pos=s.geo.attributes.position, a=pos.array, amp=0.05+s.rip*0.45;
        for(let i=0;i<a.length;i+=3){ const d=Math.hypot(s.base[i]-s.rx,s.base[i+1]-s.ry); a[i+2]=amp*(0.5+0.5*Math.sin(d*3.2-t*6))/(1+d*0.35); }
        pos.needsUpdate=true;
      }
      arrow.position.y=8.9+Math.sin(t*3)*0.25; arrow.rotation.y=t*2;
      cart.rotation.y=t*1.5; cart.position.y=0.6+Math.sin(t*2.4)*0.1;
    },
    logic(){
      if(!save.intro){ if(cart.visible&&Math.hypot(P.p.x-cart.position.x,P.p.z-cart.position.z)<1.4&&P.p.y<1.5) curatorScene(); return; }
      if(inp.divePressed&&curatorG.visible&&Math.hypot(P.p.x-curatorG.position.x,P.p.z-curatorG.position.z)<2.6){ runScene(CURATOR_TIPS.map(t=>({talk:['The Curator',t]}))); return; }
      if(inp.divePressed) for(const s of slots){ if(s.done&&Math.hypot(P.p.x-s.cpos.x,P.p.z-s.cpos.z)<2.6&&P.p.y<1){ talkTo(s.key); return; } }
      if(P.p.y<5.2){
        for(const s of slots){
          if(Math.abs(P.p.z-s.z)>2.7) continue;
          if(s.side<0?P.p.x>-HX+0.62:P.p.x<HX-0.62) continue;
          if(s.open) enterPainting(s);
          else if(s.to) flashHint('This painting opens at '+s.need+' Seal'+(s.need===1?'':'s')+' of Record.');
          else flashHint('The Ghost Writer signed this one. That world is not built yet.');
          return;
        }
        if(P.p.z<-HZ+0.62&&Math.abs(P.p.x)<4.2) flashHint('The last painting stays locked until every name is back on the wall.');
      }
    }
  });
})();
