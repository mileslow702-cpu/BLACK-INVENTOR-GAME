'use strict';
/* ---------- player ---------- */
const P={p:new V3(),face:new V3(0,0,-1),fwd:0,side:0,vy:0,state:'ground',air:'fall',lastAir:null,landT:9,coyote:0,jumpBuf:0,t:0,
  wallN:new V3(),squash:0,runPhase:0,lean:0,hp:6,invuln:0,combo:0,punchT:9,kickT:9,noGrab:0,ledgeTop:0,safe:new V3(),box:null};
const cam={fwd:new V3(0,0,-1),pitch:0.36,dist:8.5,pos:new V3(),look:new V3(),manualT:0,snap:true,zoom:1,lock:false};
let mode='title', time=0, shake=0;

const nova=(function(){
  const root=new T.Group(), body=new T.Group(); root.add(body); scene.add(root);
  const skin=lam(0x7a4a2b), jacket=lam(0xf4b731), pants=lam(0x1d2a5c), hair=lam(0x1a1210), white=lam(0xf5f5f5);
  mesh(new T.BoxGeometry(0.56,0.62,0.34),jacket,body,0,0.18,0);
  mesh(new T.BoxGeometry(0.58,0.14,0.36),pants,body,0,-0.17,0);
  mesh(flat(new T.IcosahedronGeometry(0.25,1)),skin,body,0,0.72,0.03);
  mesh(flat(new T.IcosahedronGeometry(0.33,1)),hair,body,0,0.9,-0.06);
  for(const sx of [-1,1]){
    mesh(new T.BoxGeometry(0.07,0.09,0.03),white,body,sx*0.09,0.73,0.275);
    mesh(new T.BoxGeometry(0.035,0.05,0.03),hair,body,sx*0.09,0.725,0.285);
  }
  const pack=new T.Group(); body.add(pack);
  mesh(new T.BoxGeometry(0.36,0.42,0.12),lam(0x8d95a3),pack,0,0.2,-0.23);      // the cartridge on her back
  mesh(new T.BoxGeometry(0.26,0.16,0.02),lam(0xd7263d),pack,0,0.26,-0.295);
  function limb(x,y,w,h,d,m,endM,endGeo,endY,endZ){
    const gr=new T.Group(); gr.position.set(x,y,0); body.add(gr);
    mesh(new T.BoxGeometry(w,h,d),m,gr,0,-h/2,0); mesh(endGeo,endM,gr,0,endY,endZ||0); return gr;
  }
  const hand=new T.BoxGeometry(0.14,0.14,0.14), shoe=new T.BoxGeometry(0.22,0.14,0.36);
  const armL=limb(0.37,0.44,0.15,0.46,0.15,jacket,skin,hand,-0.52), armR=limb(-0.37,0.44,0.15,0.46,0.15,jacket,skin,hand,-0.52);
  const legL=limb(0.15,-0.2,0.2,0.5,0.22,pants,white,shoe,-0.55,0.06), legR=limb(-0.15,-0.2,0.2,0.5,0.22,pants,white,shoe,-0.55,0.06);
  return {root,body,armL,armR,legL,legR,pack};
})();
const shadow=mesh(new T.CircleGeometry(0.5,14),bas(0x000000,{transparent:true,opacity:0.34,depthWrite:false}),scene);

// dust puffs
const puffs=[]; let puffI=0;
for(let i=0;i<14;i++){ const m=mesh(new T.IcosahedronGeometry(0.16,0),bas(0xffffff,{transparent:true,opacity:0,depthWrite:false}),scene); m.visible=false; puffs.push({m:m,life:0,v:new V3()}); }
function dust(n,speed,at){
  const o=at||P.p; world.up(o,up);
  for(let i=0;i<n;i++){ const p=puffs[puffI++%puffs.length]; _a.copy(P.face).applyAxisAngle(up,i/n*Math.PI*2+0.4);
    p.m.position.copy(o).addScaledVector(up,0.15); p.v.copy(_a).multiplyScalar(speed).addScaledVector(up,0.9); p.life=0.4; p.m.visible=true; }
}
function updateFx(dt){
  for(const p of puffs){ if(p.life<=0) continue; p.life-=dt; p.m.position.addScaledVector(p.v,dt); const k=Math.max(0,p.life/0.4);
    p.m.material.opacity=0.7*k; p.m.scale.setScalar(1+(1-k)*1.7); if(p.life<=0) p.m.visible=false; }
  shake=Math.max(0,shake-dt*1.4);
}

