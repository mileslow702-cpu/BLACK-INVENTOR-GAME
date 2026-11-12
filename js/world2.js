'use strict';
/* ---------- world 2: Sound Check (James E. West, Bell Labs, 1962) ---------- */
const soundcheck=(function(){
  const X0=-34, X1=58, ZB=16, LX=X1-X0, CX=(X0+X1)/2;
  const w=makeBoxWorld({floorY:-30,bounds:{x0:X0,x1:X1,z0:-ZB,z1:ZB},ceil:30,camFloor:-6.5});
  const g=w.group, solid=w.solid; g.visible=false;

  // the silent room: foam wedges on every wall, and White-Out where the floor should be
  function foam(rx,ry){
    const t=tex(64,64,(c,W,H)=>{
      c.fillStyle='#3a332b'; c.fillRect(0,0,W,H);
      for(let y=0;y<H;y+=16) for(let x=0;x<W;x+=16){
        const v=((x+y)/16)%2===0;
        c.fillStyle='#b39a70'; c.beginPath();
        if(v){ c.moveTo(x+1,y+15); c.lineTo(x+8,y+1); c.lineTo(x+15,y+15); } else { c.moveTo(x+1,y+1); c.lineTo(x+15,y+8); c.lineTo(x+1,y+15); }
        c.closePath(); c.fill();
        c.fillStyle='#8f7a55'; c.beginPath();
        if(v){ c.moveTo(x+8,y+1); c.lineTo(x+15,y+15); c.lineTo(x+8,y+15); } else { c.moveTo(x+15,y+8); c.lineTo(x+1,y+15); c.lineTo(x+1,y+8); }
        c.closePath(); c.fill();
      }
    });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(rx,ry); return t;
  }
  const longM=lam(0xffffff,{map:foam(LX/4,10)}), endM=lam(0xffffff,{map:foam(8,10)});
  mesh(new T.PlaneGeometry(LX,40),longM,g,CX,10,-ZB);
  mesh(new T.PlaneGeometry(LX,40),longM,g,CX,10,ZB).rotation.y=Math.PI;
  mesh(new T.PlaneGeometry(ZB*2,40),endM,g,X0,10,0).rotation.y=Math.PI/2;
  mesh(new T.PlaneGeometry(ZB*2,40),endM,g,X1,10,0).rotation.y=-Math.PI/2;
  mesh(new T.PlaneGeometry(LX,ZB*2),bas(0x6b5c42,{map:foam(LX/4,8)}),g,CX,30,0).rotation.x=Math.PI/2;
  mesh(new T.PlaneGeometry(LX,ZB*2),bas(0xf6f3ea),g,CX,-9,0).rotation.x=-Math.PI/2;

  const steel=lam(0x5b6675), dark=lam(0x2a2f38), cabM=lam(0x2b2118), stageM=lam(0x3b2a1e);
  function leg(x,z,top){ mesh(new T.BoxGeometry(0.5,top+9,0.5),dark,g,x,(top-9)/2,z); }
  solid(-30,-20,-4,4,0,steel,-0.8);            // start catwalk
  solid(-5.6,5,-6,6,1,steel,-0.2);             // island B
  solid(-2,2,-13.5,-10.5,1,steel,-0.2);        // islet off island B
  solid(19,27,-5,5,5,steel,3.8);               // island C
  solid(40,54,-9,9,3,stageM,1.4);              // the stage
  [[-29,-3,-0.8],[-29,3,-0.8],[-21,-3,-0.8],[-21,3,-0.8],[-4.6,-5,-0.2],[-4.6,5,-0.2],[4,-5,-0.2],[4,5,-0.2],[0,-12,-0.2],
   [20,-4,3.8],[20,4,3.8],[26,-4,3.8],[26,4,3.8],[41,-8,1.4],[41,8,1.4],[53,-8,1.4],[53,8,1.4],[47,0,1.4]].forEach(o=>leg(o[0],o[1],o[2]));

  // speakers and the sound bars each one holds up
  const groups={gold:{c:0xf4b731,dur:8,ring:0,notes:[262,330,392]},teal:{c:0x2ec4b6,dur:12,ring:0,notes:[349,440,523]},red:{c:0xff5468,dur:10,ring:0,notes:[392,494,587]}};
  const speakers=[];
  function speaker(x,z,y,name){
    solid(x-0.7,x+0.7,z-0.6,z+0.6,y+2.2,cabM,y);
    const m=bas(groups[name].c), discs=[];
    [[0.71,0,Math.PI/2],[-0.71,0,-Math.PI/2],[0,0.61,0],[0,-0.61,Math.PI]].forEach(o=>{ const d=mesh(new T.CircleGeometry(0.46,12),m,g,x+o[0],y+1.35,z+o[1]); d.rotation.y=o[2]; discs.push(d); });
    speakers.push({name:name,c:new V3(x,y+1.1,z),discs:discs});
  }
  speaker(-21.2,-3.2,0,'gold'); speaker(4.1,-5.2,1,'teal'); speaker(26.1,-4.2,5,'red');

  const bars=[];
  function bar(name,xc,zc,y,wx,wz){
    const m=lam(groups[name].c,{transparent:true,opacity:0.18,depthWrite:false});
    const b=solid(xc-wx/2,xc+wx/2,zc-wz/2,zc+wz/2,y,m,y-0.5);
    b.on=false; b.safe=false; b.grp=name; b.mat=m; bars.push(b); return b;
  }
  // gold: close enough together to run straight across
  bar('gold',-17.9,0,0.2,2.6,3); bar('gold',-14.5,0,0.4,2.6,3); bar('gold',-11.1,0,0.6,2.6,3); bar('gold',-7.7,0,0.8,2.6,3);
  // teal: real jumps, then a bar that rides back and forth like a wave
  bar('teal',7.7,0,1.8,3,3); bar('teal',11.9,0,2.6,3,3);
  const mover=bar('teal',16.3,0,3.4,2.6,3);
  // red: one long bar that needs a run-up
  bar('red',33,0,5,5,3);

  // the stage: the mic under White-Out, and the speaker stack
  const micM=lam(0xffffff,{emissive:0x8a8a8a});
  solid(46.7,47.3,-0.3,0.3,8.6,dark,3);
  mesh(flat(new T.CylinderGeometry(1.2,1.4,0.3,10)),dark,g,47,3.15,0);
  const mic=mesh(flat(new T.IcosahedronGeometry(1.5,1)),micM,g,47,10,0); mic.scale.set(1,1.25,1);
  const gobs=[[43.2,-5.2],[43.2,5.2],[49.8,2.2]].map(p=>{ const m=mesh(blotGeo,blotM,g,p[0],3.75,p[1]); return {m:m,c:new V3(p[0],3.8,p[1]),alive:true}; });
  solid(50.6,53.4,-8,-5.2,5.2,cabM,3); solid(51,53,-7.6,-5.6,8.1,cabM,5.2);
  const coneM=bas(0x8d95a3);
  mesh(new T.CircleGeometry(0.85,12),coneM,g,50.59,4.1,-6.6).rotation.y=-Math.PI/2;
  mesh(new T.CircleGeometry(0.75,12),coneM,g,50.99,6.65,-6.6).rotation.y=-Math.PI/2;
  const seal=makeSeal(g); seal.g.position.set(52,9.7,-6.6);
  const lights=[[42.5,-6],[42.5,6],[51.5,-3],[51.5,6]].map(p=>{
    const L=mesh(new T.ConeGeometry(2.2,9,8,1,true),bas(0xf4b731,{transparent:true,opacity:0.16,depthWrite:false,side:T.DoubleSide}),g,p[0],7.5,p[1]); L.visible=false; return L; });

  // Royalties
  const coin=(x,y,z)=>addRoyalty(w,new V3(x,y,z));
  const ring=(cx,cy,cz,r,n)=>{ for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; coin(cx+Math.cos(a)*r,cy,cz+Math.sin(a)*r); } };
  for(let i=0;i<8;i++) coin(-29+i,0.9,2.2);
  bars.forEach(b=>{ if(b!==mover) coin((b.x0+b.x1)/2,b.y1+0.9,0); });
  ring(0,1.9,0.5,3.6,12); ring(23,5.9,0.5,2.7,10); ring(47,3.9,0,5.2,16); ring(47,3.9,0,2.6,8);
  for(let i=0;i<10;i++) coin(-1.5+(i%5)*0.75,1.9+(i>4?0.9:0),-12);
  for(let i=0;i<5;i++){ coin(-21.2,3.2+i*0.8,-3.2); coin(4.1,4.2+i*0.8,-5.2); coin(26.1,8.2+i*0.8,-4.2); }
  for(let i=0;i<6;i++) coin(27.8+i*0.5,6.6+Math.sin(i/5*Math.PI)*1.2,0);
  coin(52,6.1,-6.6); coin(52,6.1,-7.2);

  addBlot(w,new V3(1.5,1,3)); addBlot(w,new V3(2.5,1,-1.5)); addBlot(w,new V3(22,5,1.5));
  addBlot(w,new V3(44.5,3,-2),'trooper'); addBlot(w,new V3(44.5,3,3)); addBlot(w,new V3(50,3,6),'trooper');

  const m={gobs:3,live:false,told:false};
  function refresh(){ const tag=$('missionTag'); tag.textContent=m.live?'Mic live':'White-Out on the mic '+m.gobs; tag.classList.toggle('done',m.live); }
  function setBar(b,on){
    b.on=on; b.mat.opacity=on?1:0.18; b.mat.transparent=!on; b.mat.depthWrite=on;
    b.mat.emissive.setHex(on?groups[b.grp].c:0).multiplyScalar(0.1); b.mat.needsUpdate=true; b.mesh.visible=true;
  }
  function reset(){
    m.gobs=3; m.live=false; m.told=false;
    for(const k in groups) groups[k].ring=0;
    bars.forEach(b=>setBar(b,false));
    gobs.forEach(gb=>{ gb.alive=true; gb.m.visible=true; });
    micM.color.setHex(0xffffff); micM.emissive.setHex(0x8a8a8a); seal.g.visible=false; lights.forEach(L=>{ L.visible=false; });
    refresh();
  }
  function goLive(quiet){
    m.live=true; micM.color.setHex(0xdfe5ee); micM.emissive.setHex(0x30343c); seal.g.visible=true; lights.forEach(L=>{ L.visible=true; });
    if(quiet){ seal.g.visible=false; return; }
    toast('The mic is live',3); setHint(HINT_W2_LIVE); sfx.crowd(); sfx.beat(); refresh();
  }

  return Object.assign(w,{
    name:'soundcheck', key:'w2', mission:true, bg:new T.Color(0x1a1612), amb:0.75, sun:0.4, killAlt:-7.5,
    goLive:goLive, refresh:refresh, foam:[longM,endM], groups:groups, bars:bars, mover:mover, speakers:speakers, gobs:gobs, m:m, sealPos:seal.g.position,
    intro:{eyebrow:'World 02 · Murray Hill, New Jersey',title:'Sound Check',mission:'Mission 1 · Turn the mic back on'},
    card:{n:2,name:'James E. West',years:'Born 1931 · Acoustician · Bell Labs, Murray Hill, New Jersey',
      p1:'In 1962 he and Gerhard Sessler built the foil electret microphone at Bell Labs: small, cheap and sensitive. About nine of every ten microphones made today run on that design, in phones, hearing aids and recording gear.',
      p2:'At Bell Labs he co-founded the Association of Black Laboratory Employees to push for fair placement and promotion. He holds more than 250 patents and entered the National Inventors Hall of Fame in 1999.'},
    spawn(){
      reset(); resetThings(w);
      P.p.set(-27,9,0); P.fwd=P.side=P.vy=0; P.state='air'; P.air='fall'; P.lastAir=null; P.t=0; P.safe.set(-27,0,0);
      P.face.set(1,0,0); cam.fwd.set(1,0,0); cam.pitch=0.4; cam.dist=9.5; setHint(HINT_W2);
    },
    respawn(){ P.p.set(-27,0,0); P.fwd=P.side=P.vy=0; P.state='ground'; P.lastAir=null; P.face.set(1,0,0); cam.fwd.set(1,0,0); },
    animate(dt,t){
      for(const b of bars){
        const G=groups[b.grp], on=m.live||G.ring>0;
        if(on!==b.on) setBar(b,on);
        b.mesh.visible=!(on&&!m.live&&G.ring<2)||((t*8)|0)%2===0;          // blink before the sound dies
      }
      const cx=16.3+1.1*Math.sin(t), dx=cx-(mover.x0+mover.x1)/2;
      mover.x0+=dx; mover.x1+=dx; mover.mesh.position.x=cx; mover.vx=dt>0?dx/dt:0;
      for(const s of speakers){ const k=groups[s.name].ring>0?1+0.15*Math.sin(t*30):1; for(const d of s.discs) d.scale.setScalar(k); }
      seal.spin.rotation.y=t*3;
      if(m.live){ const k=1+0.05*Math.sin(t*8); mic.scale.set(k,1.25*k,k); lights.forEach((L,i)=>{ L.rotation.z=0.35*Math.sin(t*1.3+i*1.7); }); }
      for(const gb of gobs){ if(gb.alive){ const k=1+0.06*Math.sin(t*5+gb.c.z); gb.m.scale.set(1.9*k,1.3/k,1.9*k); } }
    },
    logic(dt){
      for(const k in groups){ const G=groups[k]; if(G.ring>0) G.ring=Math.max(0,G.ring-dt); }
      if(atk.on){
        for(const s of speakers){ const G=groups[s.name]; if(G.ring<G.dur-0.6&&atk.c.distanceTo(s.c)<atk.r+1.15){ G.ring=G.dur; sfx.ring(G.notes,G.dur); } }
      }
      const airborne=P.state==='air'||P.state==='dive'||P.state==='pound';
      for(const gb of gobs){
        if(!gb.alive||w.mission!==0) continue;
        let hit=atk.on&&atk.c.distanceTo(gb.c)<atk.r+1.1;
        if(!hit&&airborne&&P.vy<0&&Math.hypot(P.p.x-gb.c.x,P.p.z-gb.c.z)<1.3&&P.p.y<gb.c.y+0.9&&P.p.y>gb.c.y-0.6){ hit=true; if(P.state!=='pound') bounce(); }
        if(hit){
          gb.alive=false; gb.m.visible=false; sfx.pop(); dust(8,4,gb.c); m.gobs--;
          if(m.gobs===0) goLive(); else { toast(m.gobs+' to go'); refresh(); }
        }
      }
      if(w.mission!==0) return;
      if(!m.live&&!m.told&&P.p.x>39.6&&P.state==='ground'){ m.told=true; setHint(HINT_W2_STAGE); }
      if(m.live){ _a.copy(P.p); _a.y+=0.8; if(_a.distanceTo(seal.g.position)<1.5) collectSeal('w2m1'); }
    }
  });
})();
