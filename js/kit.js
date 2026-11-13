'use strict';
/* ---------- shared pieces for Worlds 3-8 and the Ghost Writer arena ---------- */
const pickGeo=flat(new T.OctahedronGeometry(0.45,0));
function signTex(text,bg,fg,W,H,font){
  return tex(W||512,H||128,(c,w,h)=>{ c.fillStyle=bg; c.fillRect(0,0,w,h); c.fillStyle=fg; c.font=font||'bold 52px Georgia, serif';
    c.textAlign='center'; c.textBaseline='middle'; const lines=String(text).split('\n'); lines.forEach((l,i)=>c.fillText(l,w/2,h/2+(i-(lines.length-1)/2)*(h/lines.length*0.9))); },true);
}
function sign(parent,text,x,y,z,w,h,rotY,bg,fg,font){
  const m=new T.MeshBasicMaterial({map:signTex(text,bg||'#f1e8d4',fg||'#1b2440',512,Math.round(512*h/w),font)});
  const s=mesh(new T.PlaneGeometry(w,h),m,parent,x,y,z); s.rotation.y=rotY||0;
  s.setText=(t,b,f)=>{ m.map=signTex(t,b||bg||'#f1e8d4',f||fg||'#1b2440',512,Math.round(512*h/w),font); m.needsUpdate=true; };
  return s;
}
function pickup(w,x,y,z,color,geo){
  const m=new T.Mesh(geo||pickGeo,lam(color,{emissive:new T.Color(color).multiplyScalar(0.4)})); m.position.set(x,y,z); w.group.add(m);
  return {m:m,pos:m.position,done:false,y0:y};
}
function chest(){ _a.copy(P.p); _a.y+=0.8; return _a; }
function touching(pos,r){ return chest().distanceTo(pos)<(r||1.4); }
function tintBlot(b,color){ b.g.traverse(o=>{ if(o.isMesh&&o.material===blotM) o.material=lam(color,{emissive:new T.Color(color).multiplyScalar(0.25)}); }); }
function spinPickups(list,t){ list.forEach((p,i)=>{ if(!p.done){ p.m.rotation.y=t*2+i; p.m.position.y=p.y0+Math.sin(t*3+i)*0.15; } }); }
function showPickups(list,on){ list.forEach(p=>{ p.done=false; p.m.visible=on; }); }

/* A world with a glass case, three missions and a seal that appears over the case */
function makeLevel(o){
  const w=makeBoxWorld({floorY:o.floorY===undefined?0:o.floorY,bounds:o.bounds,ceil:o.ceil,camFloor:o.camFloor});
  w.group.visible=false;
  Object.assign(w,{name:o.key,key:o.key,mission:0,bg:new T.Color(o.bg),amb:o.amb||0.7,sun:o.sun===undefined?0.45:o.sun,
    killAlt:o.killAlt,grav:o.grav,intro:o.intro,card:o.card,ms:{},ready:false,o:o,tints:[]});
  const cg=new T.Group(); cg.position.set(o.caseAt[0],o.caseAt[1],o.caseAt[2]); cg.rotation.y=o.caseRot||0; w.group.add(cg);
  w.case=makeCase(cg,INV[o.key]);
  w.solid(o.caseAt[0]-0.8,o.caseAt[0]+0.8,o.caseAt[2]-0.8,o.caseAt[2]+0.8,o.caseAt[1]+2.75,null,o.caseAt[1]);
  const sealG=new T.Group(); w.group.add(sealG); const seal=makeSeal(sealG);
  sealG.position.set(o.caseAt[0],o.caseAt[1]+4,o.caseAt[2]); sealG.visible=false; w.sealPos=sealG.position;
  // scenery fades to gray until the inventor is free
  w.collectTints=function(){
    const seen=new Set();
    w.group.traverse(m=>{ if(!m.isMesh||!m.material||!m.material.color||seen.has(m.material)) return;
      let p=m; while(p){ if(p===cg||p===sealG) return; p=p.parent; }
      if(m.material.transparent&&m.material.opacity<1) return;
      seen.add(m.material); w.tints.push({m:m.material,c:m.material.color.clone()}); });
  };
  w.restore=function(k){ const s=0.25+0.75*k; for(const t of w.tints){ const g=(t.c.r+t.c.g+t.c.b)/3; t.m.color.setRGB(g+(t.c.r-g)*s,g+(t.c.g-g)*s,g+(t.c.b-g)*s); } };
  w.M=()=>o.missions[w.mission];
  w.tag=function(){ const el=$('missionTag'), M=w.M(); el.textContent=w.ready?'Seal ready':(M.tag?M.tag(w):MISSIONS[w.key][w.mission]); el.classList.toggle('done',w.ready); };
  w.sealReady=function(msg){ w.ready=true; sealG.visible=true; sfx.crowd(); toast(msg||'The Seal of Record is over the glass case',3); setHint('Climb onto the glass case to take the Seal of Record.'); w.tag(); };
  w.place=function(p){ P.p.set(p[0],p[1],p[2]); P.fwd=P.side=P.vy=0; P.state='ground'; P.lastAir=null; P.box=null; P.face.set(p[3]||1,0,p[4]||0).normalize(); cam.fwd.copy(P.face); };
  w.spawn=function(){
    resetThings(w); w.ms={}; w.ready=false; sealG.visible=false;
    const n=sealsFor(w.key); w.case.set(n); if(n===3) w.case.free(); else w.case.lock(); w.restore(n/3);
    const s=o.spawn; w.place(s); P.p.y+=6; P.state='air'; P.air='fall'; P.safe.set(s[0],s[1],s[2]); cam.pitch=0.4; cam.dist=9.5;
    if(o.reset) o.reset(w);
    const M=w.M(); if(M.setup) M.setup(w); setHint(M.hint); w.tag();
  };
  w.respawn=function(){ w.place(o.spawn); const M=w.M(); if(M.respawn) M.respawn(w); };
  w.logic=function(dt){
    if(w.ready){ if(touching(w.sealPos,1.6)) collectSeal(w.key+'m'+(w.mission+1)); return; }
    const M=w.M(); if(M.logic) M.logic(w,dt);
  };
  w.animate=function(dt,t){ seal.spin.rotation.y=t*3; if(o.animate) o.animate(w,dt,t); };
  return w;
}

/* A boss that chases, winds up, charges, and is open to a hit or a stomp while it is dazed */
function makeBoss(w,o){
  const g=new T.Group(); w.group.add(g); o.build(g); g.visible=false;
  const R=o.r||1.4, H=o.height||2.6;
  const b={g:g,max:o.hp,hp:o.hp,p:new V3(),f:new V3(0,0,1),st:'off',t:0,dead:false,name:o.name};
  const to=new V3(), nx=new V3(), wn=new V3();
  function move(step){
    nx.copy(b.p).addScaledVector(b.f,step); const hit=w.walls(nx,R,b.p.y,wn);
    const gy=w.ground(nx,b.p.y+0.6); if(gy<b.p.y-1.2) return true;          // an edge stops it like a wall
    b.p.copy(nx); b.p.y=gy; return hit;
  }
  b.start=function(x,y,z){ b.p.set(x,y,z); b.hp=b.max; b.st='idle'; b.t=0; b.dead=false; g.visible=true; g.position.copy(b.p); };
  b.stop=function(){ b.st='off'; g.visible=false; };
  b.tag=()=>o.name+'  '+'●'.repeat(Math.max(0,b.hp))+'○'.repeat(b.max-Math.max(0,b.hp));
  b.update=function(dt){
    if(b.st==='off'||b.dead) return;
    b.t+=dt; to.copy(P.p).sub(b.p); to.y=0; const d=to.length(); if(d>0.01) to.multiplyScalar(1/d);
    const sp=o.speed*(b.hp<=Math.ceil(b.max/2)?1.25:1);
    if(b.st==='idle'){ if(d<(o.wake||15)){ b.st='chase'; b.t=0; if(o.onWake) o.onWake(b); } }
    else if(b.st==='chase'){ b.f.lerp(to,Math.min(1,4*dt)).normalize(); move(sp*dt); if(b.t>(o.chaseTime||2)&&d<16){ b.st='windup'; b.t=0; sfx.skid(); } }
    else if(b.st==='windup'){ b.f.lerp(to,Math.min(1,8*dt)).normalize(); if(b.t>0.7){ b.st='charge'; b.t=0; sfx.dive(); } }
    else if(b.st==='charge'){ const hit=move(sp*3.4*dt); if(hit||b.t>1.15){ b.st='dazed'; b.t=0; shake=hit?0.45:0.15; sfx.land(); dust(6,3,b.p); } }
    else if(b.st==='dazed'){ if(b.t>2.6){ b.st='chase'; b.t=0; } }
    else if(b.st==='hurt'){ if(b.t>0.9){ b.st='chase'; b.t=0; } }
    g.position.copy(b.p); g.rotation.set(0,Math.atan2(b.f.x,b.f.z),0);
    if(b.st==='windup') g.position.x+=Math.sin(time*50)*0.08;
    if(b.st==='dazed'){ g.rotation.z=Math.sin(time*5)*0.18; g.scale.set(1,0.88,1); } else g.scale.set(1,1,1);
    if(b.st==='hurt') g.visible=((time*20)|0)%2===0; else g.visible=true;
    if(mode!=='play') return;
    const dd=Math.hypot(P.p.x-b.p.x,P.p.z-b.p.z), airborne=P.state==='air'||P.state==='dive'||P.state==='pound';
    _n2.copy(b.p); _n2.y+=H*0.5;
    if(b.st==='dazed'){
      const stomp=airborne&&P.vy<0&&dd<R+0.7&&P.p.y>b.p.y+H*0.55, punch=atk.on&&atk.c.distanceTo(_n2)<atk.r+R;
      if(stomp||punch){
        b.hp--; b.st='hurt'; b.t=0; sfx.pound(); shake=0.5; dust(10,5,b.p); if(stomp&&P.state!=='pound') bounce();
        if(o.onHit) o.onHit(b);
        if(b.hp<=0){ b.dead=true; b.st='off'; g.visible=false; sfx.seal(); dust(16,6,b.p); toast(o.name+' is down',3); if(o.onDead) o.onDead(b); }
        if(w.tag) w.tag();
      }
    } else if(b.st!=='hurt'&&b.st!=='idle'&&dd<R+0.35&&P.p.y<b.p.y+H) hurt(b.p);
  };
  return b;
}

/* Cars, trains and other things that slide back and forth and hurt on contact */
function slider(w,o){            // o: {x0,x1,z,y,len,wid,h,speed,color,solid}
  const m=lam(o.color);
  const box=o.solid?w.solid(o.x0,o.x0+o.len,o.z-o.wid/2,o.z+o.wid/2,o.y+o.h,m,o.y):null;
  const mm=box?box.mesh:mesh(new T.BoxGeometry(o.len,o.h,o.wid),m,w.group,0,o.y+o.h/2,o.z);
  const s={o:o,x:o.x0,box:box,m:mm,mat:m,stop:false,speed:o.speed};
  s.update=function(dt){
    const v=s.stop?0:s.speed, old=s.x; s.x+=v*dt;
    if(s.x>o.x1) s.x=o.x0-o.len; if(s.x<o.x0-o.len) s.x=o.x1;
    const dx=s.x-old;
    if(box){ box.x0=s.x; box.x1=s.x+o.len; box.vx=Math.abs(dx)<5?dx/Math.max(dt,1e-4):0; }
    mm.position.x=s.x+o.len/2;
    if(mode==='play'&&o.hurts!==false&&Math.abs(v)>0.1){
      const inX=P.p.x>s.x-0.4&&P.p.x<s.x+o.len+0.4, inZ=Math.abs(P.p.z-o.z)<o.wid/2+0.4, low=P.p.y<o.y+o.h-0.3&&P.p.y>o.y-1;
      if(inX&&inZ&&low){ hurt(new V3(P.p.x-Math.sign(v)*2,P.p.y,P.p.z)); }
    }
  };
  return s;
}

/* Flat ground with a texture, and boxes that act as walls or platforms */
function groundTex(c1,c2,rep){ const t=tex(64,64,(c,W,H)=>{ c.fillStyle=c1; c.fillRect(0,0,W,H); c.fillStyle=c2; c.fillRect(0,0,W,2); c.fillRect(0,0,2,H); }); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(rep,rep); return t; }

/* Ghost Writer appearances need these from the Hall */
function gwFightOpen(){
  if(save.seals.gw1&&save.seals.gw2) return null;
  if(!save.seals.gw1&&(sealsFor('w3')===3||ALLW)) return 'gw1';
  if(save.seals.gw1&&!save.seals.gw2&&(sealsFor('w6')===3||ALLW)) return 'gw2';
  return null;
}
function freedCount(){ let n=0; for(let i=1;i<=8;i++) if(sealsFor('w'+i)===3) n++; return n; }
const ALLW=/allworlds/.test(location.hash);
