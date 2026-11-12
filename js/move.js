'use strict';
/* ---------- movement ---------- */
const GROUNDED={ground:1,skid:1,crouch:1,slide:1,poundland:1,punch:1};
const HANG=1.7;                                   // how far below a ledge her feet hang
function airStart(type,vy,fwd){
  P.state='air'; P.air=type; P.vy=vy; P.fwd=fwd; P.side=0; P.t=0; P.jumpBuf=0; P.coyote=0; P.kickT=9; showMove(type);
  if(type==='jump') sfx.jump(); else if(type==='double') sfx.double(); else if(type==='triple') sfx.triple();
  else if(type==='long') sfx.long(); else if(type==='wallkick') sfx.kick(); else sfx.flip();
}
function doJump(){
  let type='jump', v=12.6+P.fwd*0.25, f=P.fwd*0.8;
  if(P.landT<0.2&&P.lastAir==='jump'){ type='double'; v=15.6+P.fwd*0.25; }
  else if(P.landT<0.2&&P.lastAir==='double'&&P.fwd>6){ type='triple'; v=20.7; }
  airStart(type,v,f);
}
function bounce(){ P.state='air'; P.air='jump'; P.vy=13; P.t=0; P.kickT=9; P.jumpBuf=0; showMove('stomp'); sfx.jump(); }
function startDive(fromGround){ P.state='dive'; P.t=0; P.fwd=Math.min(P.fwd+4.5,14.4); P.side=0; if(fromGround) P.vy=5; sfx.dive(); showMove('dive'); }
function startPound(){ P.state='pound'; P.t=0; P.fwd=0; P.side=0; P.vy=0; sfx.flip(); showMove('pound'); }
function startPunch(){
  P.combo=(P.punchT<0.4&&P.combo<3)?P.combo+1:1;            // punch, punch, kick
  P.state='punch'; P.t=0; P.fwd=Math.max(P.fwd,P.combo===3?4.5:2.6);
  showMove(P.combo===3?'kick':'punch'); sfx.punch();
}
function hurt(from){
  if(P.invuln>0||mode!=='play') return;
  P.hp--; P.invuln=1.6; shake=0.4; sfx.hurt(); updateHud();
  if(P.hp<=0){ whiteOut(); return; }
  world.up(P.p,up);
  if(from){ _a.copy(from).sub(P.p); tangent(_a,up); P.face.copy(_a); }       // face what hit her, fly back from it
  P.state='air'; P.air='hurt'; P.vy=9; P.fwd=-5; P.side=0; P.t=0; P.kickT=9;
}
function fallOut(){
  P.hp--; updateHud(); sfx.hurt();
  if(P.hp<=0){ whiteOut(); return; }
  P.p.copy(P.safe); P.fwd=P.side=P.vy=0; P.state='ground'; P.lastAir=null; P.invuln=1.6; P.box=null; cam.snap=true; flash();
}
function land(){
  const st=P.state, a=P.air;
  P.squash=1; P.side=0;
  if(st==='pound'){ P.state='poundland'; P.t=0; P.fwd=0; P.vy=0; shake=0.5; sfx.pound(); dust(8,4.5); if(world.onPound) world.onPound(P.p); return; }
  if(st==='dive'){ P.state='slide'; P.vy=0; sfx.land(); dust(3,2); return; }
  P.state='ground'; P.vy=0; P.landT=0; P.lastAir=(a==='jump'||a==='double')?a:null;
  if(P.fwd<0) P.fwd=0;
  sfx.land(); if(a==='triple'||a==='backflip'||a==='sideflip') dust(5,2.5);
}
function setAtk(f,u,r){ atk.on=true; atk.c.copy(P.p).addScaledVector(P.face,f).addScaledVector(up,u); atk.r=r; }

function updatePlayer(dt){
  const W=world;
  W.up(P.p,up); tangent(P.face,up); tangent(cam.fwd,up);
  right.crossVectors(cam.fwd,up);
  want.copy(right).multiplyScalar(inp.x).addScaledVector(cam.fwd,inp.y);
  let mag=Math.min(1,want.length());
  if(mag>0.05) want.normalize(); else mag=0;
  if(inp.jumpPressed) P.jumpBuf=0.13; else P.jumpBuf-=dt;
  P.t+=dt; P.landT+=dt; P.coyote-=dt; P.punchT+=dt; P.kickT+=dt; P.noGrab-=dt; P.lean=0;
  if(P.invuln>0) P.invuln-=dt;
  pright.crossVectors(P.face,up);

  switch(P.state){
    case 'ground': {
      if(inp.crouch){ P.state='crouch'; P.t=0; break; }
      if(mag>0){
        const ang=signedAngle(P.face,want,up);
        if(Math.abs(ang)>1.9&&P.fwd>4.8){ P.state='skid'; P.t=0; sfx.skid(); dust(2,1.5); break; }
        if(P.fwd<1.5) P.face.copy(want);
        else { P.face.applyAxisAngle(up,clamp(ang,-7*dt,7*dt)); P.lean=clamp(ang,-1,1)*0.35*Math.min(1,P.fwd/MAXRUN); }
        const target=MAXRUN*mag;
        if(P.fwd<target) P.fwd=Math.min(target,P.fwd+(11-0.7*P.fwd)*dt); else P.fwd=Math.max(target,P.fwd-9*dt);
      } else P.fwd=approach(P.fwd,0,20*dt);
      if(P.jumpBuf>0) doJump();
      else if(inp.divePressed){ if(P.fwd>8) startDive(true); else startPunch(); }      // at a full run the hit button dives
      break; }
    case 'punch': {
      P.fwd=approach(P.fwd,0,12*dt);
      if(P.jumpBuf>0){ P.punchT=0; doJump(); }
      else if(P.t>0.1&&inp.divePressed&&P.combo<3){ P.punchT=0; startPunch(); }
      else if(P.t>=(P.combo===3?0.36:0.22)){ P.state='ground'; P.punchT=0; }
      break; }
    case 'skid': {
      P.fwd=Math.max(0,P.fwd-20*dt);
      if(P.jumpBuf>0){ if(mag>0) P.face.copy(want); else P.face.negate(); airStart('sideflip',18.6,2.4); }
      else if(mag===0||Math.abs(signedAngle(P.face,want,up))<1.5) P.state='ground';
      else if(P.fwd<=0.3){ P.face.copy(want); P.fwd=2.4; P.state='ground'; }
      break; }
    case 'crouch': {
      P.fwd=approach(P.fwd,0,10*dt);
      if(P.jumpBuf>0){ if(P.fwd>3) airStart('long',9,Math.min(P.fwd*1.5,14.4)); else airStart('backflip',18.6,-4.8); }
      else if(!inp.crouch) P.state='ground';
      break; }
    case 'air': {
      if(P.coyote>0&&P.jumpBuf>0){ doJump(); break; }
      P.fwd=approach(P.fwd,0,3.15*dt); P.side=0;
      if(mag>0){ P.fwd+=want.dot(P.face)*mag*13.5*dt; P.side=want.dot(pright)*mag*3; }
      const cap=P.air==='long'?14.4:MAXRUN;
      if(P.fwd>cap) P.fwd-=9*dt;
      if(P.fwd<-4.8) P.fwd+=18*dt;
      P.vy=Math.max(-22.5,P.vy-(P.air==='long'?18:36)*dt);
      if((P.air==='jump'||P.air==='double'||P.air==='triple')&&!inp.jump&&P.vy>6) P.vy*=Math.pow(0.25,dt*30);
      if(P.air!=='long'&&P.air!=='hurt'){
        if(inp.divePressed){
          if(P.fwd>6.5) startDive(false);
          else if(P.kickT>0.6){ P.kickT=0; if(P.vy<5) P.vy=5; showMove('jumpkick'); sfx.punch(); }
        } else if(inp.crouchPressed) startPound();
      }
      break; }
    case 'wall': {
      P.fwd=0.6; P.side=0; P.vy=Math.max(-3,P.vy-36*dt);              // leaning into the wall keeps her on it
      if(P.jumpBuf>0){ P.face.reflect(P.wallN); tangent(P.face,up); airStart('wallkick',18.6,7.2); }
      else if(P.t>0.25){ P.state='air'; P.air='fall'; P.fwd=-1.5; }
      break; }
    case 'ledge': {
      P.fwd=0; P.side=0; P.vy=0;
      const push=mag>0?want.dot(P.face):0;
      if(P.t>0.15&&(P.jumpBuf>0||push>0.5)){                           // pull up
        P.p.addScaledVector(P.face,0.55); W.setAlt(P.p,P.ledgeTop);
        P.state='ground'; P.lastAir=null; P.landT=9; P.squash=0.6; P.jumpBuf=0; sfx.land();
      } else if(P.t>0.15&&(inp.crouchPressed||push<-0.5)){ P.state='air'; P.air='fall'; P.noGrab=0.4; P.fwd=-1.5; }
      break; }
    case 'dive': P.vy=Math.max(-22.5,P.vy-36*dt); break;
    case 'slide': {
      P.fwd=Math.max(0,P.fwd-8*dt);
      if(P.jumpBuf>0||inp.divePressed) airStart('rollout',9,Math.max(P.fwd,3));
      else if(P.fwd<0.6){ P.state='ground'; P.lastAir=null; }
      break; }
    case 'pound': P.vy=P.t<0.28?1.2:Math.max(-26,Math.min(P.vy,-15)-60*dt); break;
    case 'poundland': {
      if(P.t>0.12&&P.jumpBuf>0){ P.lastAir=null; doJump(); }
      else if(P.t>0.4){ P.state='ground'; P.lastAir=null; }
      break; }
  }

  // ride a moving platform, then move, then resolve walls and ground
  if(P.box&&P.box.vx&&GROUNDED[P.state]) P.p.x+=P.box.vx*dt;
  pright.crossVectors(P.face,up);
  const alt0=W.alt(P.p);
  P.p.addScaledVector(P.face,P.fwd*dt).addScaledVector(pright,P.side*dt);
  const hit=W.walls(P.p,R_PLAYER,alt0,wallN), hitTop=W.hitTop;
  let alt=alt0+P.vy*dt;
  if(W.ceil&&alt+HEIGHT>W.ceil){ alt=W.ceil-HEIGHT; if(P.vy>0) P.vy=0; }
  const gy=W.ground(P.p,alt0), gbox=W.gBox||null;
  const st=P.state;
  if(GROUNDED[st]){
    if(gy>=alt0-0.5){ alt=gy; P.vy=0; P.box=gbox; }
    else { alt=alt0; P.t=0; P.box=null; if(st==='slide') P.state='dive'; else { if(st==='ground') P.coyote=0.1; P.state='air'; P.air='fall'; P.lastAir=null; } }
  } else {
    P.box=null;
    if(st!=='ledge'&&P.vy<=0&&alt<=gy){ alt=gy; W.setAlt(P.p,alt); land(); P.box=gbox; }
  }
  W.setAlt(P.p,alt);
  if(GROUNDED[P.state]&&(!P.box||P.box.safe)) P.safe.copy(P.p);         // last solid ground, for coming back after a fall
  if(W.killAlt!==undefined&&alt<W.killAlt){ fallOut(); return; }

  if(hit){
    const facing=-P.face.dot(wallN), into=facing*(P.fwd<0?-1:1), reach=hitTop-alt;
    if((P.state==='air'||P.state==='wall')&&P.air!=='hurt'&&P.vy<=2&&P.noGrab<=0&&facing>0.35&&reach>0.55&&reach<HANG&&hitTop-HANG>gy+0.05){
      P.state='ledge'; P.t=0; P.vy=0; P.fwd=0; P.side=0; P.ledgeTop=hitTop; P.wallN.copy(wallN);
      P.face.copy(wallN).negate(); tangent(P.face,up); W.setAlt(P.p,hitTop-HANG); showMove('ledge');
    }
    else if(P.state==='air'&&P.air!=='fall'&&P.air!=='hurt'&&into>0.35&&P.fwd>4){ P.state='wall'; P.t=0; P.wallN.copy(wallN); P.fwd=0; P.side=0; }
    else if(P.state==='dive'&&into>0.35&&P.fwd>3){ P.state='air'; P.air='fall'; P.fwd=-2.5; P.vy=Math.max(P.vy,2); sfx.land(); }
    else if(into>0.6&&P.state!=='wall') P.fwd=clamp(P.fwd,-1.5,1.5);
  }

  // where this frame's attack lands, for Blots, speakers and gobs
  atk.on=false;
  const s2=P.state;
  if(s2==='punch'&&P.t>0.04&&P.t<0.2) setAtk(0.95,0.9,0.95);
  else if(s2==='air'&&P.kickT<0.25) setAtk(0.8,0.9,0.95);
  else if((s2==='dive'||s2==='slide')&&P.fwd>3) setAtk(0.6,0.4,0.9);
  else if(s2==='poundland'&&P.t<0.1) setAtk(0,0.3,2.4);
}

/* ---------- camera ---------- */
const ZOOMS=[0.65,1,1.5];
function updateCamera(dt){
  if(cam.lock){ camera.position.copy(cam.pos); world.up(cam.look,camera.up); camera.lookAt(cam.look); return; }   // a cutscene is driving
  world.up(P.p,up); tangent(cam.fwd,up);
  if(inp.zoomPressed&&mode==='play') cam.zoom=(cam.zoom+1)%3;
  const yaw=-(inp.camX*2.4*dt+drag.x*0.006), pit=-inp.camY*1.3*dt+drag.y*0.004;
  drag.x=drag.y=0;
  if(yaw||pit){ cam.manualT=1.5; cam.fwd.applyAxisAngle(up,yaw); cam.pitch=clamp(cam.pitch+pit,0.06,1.25); } else cam.manualT-=dt;
  if(mode==='play'&&cam.manualT<=0&&P.state==='ground'&&P.fwd>1){
    const a=signedAngle(cam.fwd,P.face,up);
    if(Math.abs(a)<2.4) cam.fwd.applyAxisAngle(up,a*Math.min(1,1.4*dt)*Math.min(1,P.fwd/MAXRUN));
  }
  const dist=mode==='title'?12:cam.dist*ZOOMS[cam.zoom], pitch=mode==='title'?0.26:cam.pitch;
  _a.copy(P.p).addScaledVector(up,1.25);
  _b.copy(_a).addScaledVector(cam.fwd,-dist*Math.cos(pitch)).addScaledVector(up,dist*Math.sin(pitch));
  if(world.camRay){ const f=world.camRay(_a,_b); if(f<1) _b.lerpVectors(_a,_b,Math.max(0.12,f-0.05)); }      // pull in rather than look through a wall
  if(world.clampCam) world.clampCam(_b);
  if(cam.snap){ cam.pos.copy(_b); cam.look.copy(_a); cam.snap=false; }
  else { cam.pos.lerp(_b,1-Math.exp(-8*dt)); cam.look.lerp(_a,1-Math.exp(-16*dt)); }
  camera.position.copy(cam.pos);
  if(shake>0&&!reduceMotion) camera.position.addScaledVector(up,(Math.random()-0.5)*shake);
  camera.up.copy(up); camera.lookAt(cam.look);
  if(world.stars){ sun.position.copy(cam.pos).addScaledVector(up,10); sun.target.position.copy(P.p); }
}

/* ---------- character animation ---------- */
const TWO_PI=Math.PI*2;
const wrap=a=>a-TWO_PI*Math.round(a/TWO_PI);
function animatePlayer(dt,t){
  world.up(P.p,up);
  _x.crossVectors(up,P.face).normalize(); _m.makeBasis(_x,up,P.face);
  nova.root.quaternion.setFromRotationMatrix(_m); nova.root.position.copy(P.p);
  nova.root.visible=!(P.invuln>0&&mode==='play'&&((t*16)|0)%2===0);
  const sr=clamp(Math.abs(P.fwd)/MAXRUN,0,1.2), st=P.state;
  let rx=0, rz=0, y=0.85, sy=1, aL=0, aR=0, lL=0, lR=0, direct=false;
  if(st==='ground'){
    P.runPhase+=P.fwd*dt*1.9; const s=Math.sin(P.runPhase);
    lL=s*0.95*sr; lR=-lL; aL=-s*sr; aR=-aL; rx=0.26*sr; rz=-P.lean; y+=Math.abs(Math.cos(P.runPhase))*0.05*sr;
    if(sr<0.05) y+=Math.sin(t*2.2)*0.012;
  }
  else if(st==='punch'){
    rx=0.2;
    if(P.combo===1){ aR=-1.7; aL=0.4; } else if(P.combo===2){ aL=-1.7; aR=0.4; } else { rx=-0.35; lR=-1.5; aL=aR=0.6; }
  }
  else if(st==='skid'){ rx=-0.4; lL=-0.7; lR=-0.35; aL=-0.6; aR=0.6; }
  else if(st==='crouch'||st==='poundland'){ sy=0.62; lL=lR=-0.4; aL=aR=0.3; rx=0.25; }
  else if(st==='wall'){ rx=-0.25; aL=aR=-2.7; lL=-0.6; lR=0.2; }
  else if(st==='ledge'){ aL=aR=-3.05; lL=0.12; lR=-0.12; }
  else if(st==='dive'||st==='slide'){ rx=1.45; aL=aR=-2.95; lL=lR=0.15; if(st==='slide') y=0.3; }
  else if(st==='pound'){ if(P.t<0.28){ rx=P.t/0.28*TWO_PI; direct=true; } lL=lR=-1.4; aL=aR=-0.5; }
  else {
    const a=P.air; aL=aR=-2.5; lL=-0.9; lR=0.4;
    if(a==='triple'||a==='rollout'){ rx=Math.min(TWO_PI,P.t*(a==='triple'?7:9)); direct=true; lL=lR=-1.2; }
    else if(a==='backflip'){ rx=-Math.min(TWO_PI,P.t*6.5); direct=true; lL=lR=-1.2; }
    else if(a==='sideflip'){ rz=Math.min(TWO_PI,P.t*7); direct=true; aL=aR=-2.9; }
    else if(a==='long'){ rx=1.0; aL=aR=-2.6; lL=lR=0.5; }
    else if(a==='hurt'){ rx=-0.5; aL=aR=-2.2; lL=-0.4; lR=0.5; }
    else if(a==='fall'){ aL=aR=-2.0; lL=-0.3; lR=0.3; }
    else if(a==='double'){ lL=lR=-1.0; }
    if(P.kickT<0.3){ rx=-0.3; lR=-1.5; lL=0.3; aL=aR=-0.8; }
    sy=1+clamp(Math.abs(P.vy)/90,0,0.14);
  }
  const k=1-Math.exp(-20*dt), b=nova.body;
  nova.armL.rotation.x+=(aL-nova.armL.rotation.x)*k; nova.armR.rotation.x+=(aR-nova.armR.rotation.x)*k;
  nova.legL.rotation.x+=(lL-nova.legL.rotation.x)*k; nova.legR.rotation.x+=(lR-nova.legR.rotation.x)*k;
  if(direct){ b.rotation.x=rx; b.rotation.z=rz; }
  else { b.rotation.x=wrap(b.rotation.x); b.rotation.z=wrap(b.rotation.z); b.rotation.x+=(rx-b.rotation.x)*k; b.rotation.z+=(rz-b.rotation.z)*k; }
  P.squash=Math.max(0,P.squash-dt*5);
  const syF=sy*(1-0.28*P.squash), sxz=1+0.2*P.squash;
  b.scale.set(sxz,syF,sxz); b.position.y=y-0.82*(1-syF);

  const feet=world.alt(P.p), gy=world.ground(P.p,feet);
  shadow.position.copy(P.p); world.setAlt(shadow.position,gy+0.04); shadow.quaternion.setFromUnitVectors(Z,up);
  shadow.scale.setScalar(clamp(1-(feet-gy)/14,0.35,1)); shadow.visible=feet-gy<20;
}
