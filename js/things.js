'use strict';
/* ---------- flat worlds made of boxes (the Hall, Sound Check) ---------- */
function makeBoxWorld(o){
  const g=new T.Group(); scene.add(g);
  const boxes=[], tt=[0,1];
  function slab(a,d,lo,hi){
    if(Math.abs(d)<1e-8) return a>=lo&&a<=hi;
    let t0=(lo-a)/d, t1=(hi-a)/d; if(t0>t1){ const s=t0; t0=t1; t1=s; }
    if(t0>tt[0]) tt[0]=t0; if(t1<tt[1]) tt[1]=t1; return tt[0]<=tt[1];
  }
  const w={
    group:g, boxes:boxes, hitTop:Infinity, gBox:null, things:{coins:[],blots:[]}, coinCount:0,
    // a box from y0 (default: the floor) up to y1
    solid(x0,x1,z0,z1,y1,m,y0){
      const b={x0:x0,x1:x1,z0:z0,z1:z1,y1:y1,y0:(y0===undefined?o.floorY:y0),on:true,safe:true,vx:0,mesh:null};
      boxes.push(b);
      if(m) b.mesh=mesh(new T.BoxGeometry(x1-x0,y1-b.y0,z1-z0),m,g,(x0+x1)/2,(y1+b.y0)/2,(z0+z1)/2);
      return b;
    },
    up(p,out){ return out.set(0,1,0); },
    alt(p){ return p.y; }, setAlt(p,a){ p.y=a; },
    ground(p,feet){
      let gy=o.floorY, gb=null;
      for(const b of boxes){ if(b.on&&p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1&&b.y1<=feet+STEP_UP&&b.y1>gy){ gy=b.y1; gb=b; } }
      w.gBox=gb; return gy;
    },
    walls(p,r,feet,n){
      let hit=false;
      for(const b of boxes){
        if(!b.on||feet>=b.y1-STEP_UP||feet+HEIGHT<=b.y0) continue;
        const cx=clamp(p.x,b.x0,b.x1), cz=clamp(p.z,b.z0,b.z1), dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
        if(d2>=r*r) continue;
        if(d2>1e-10){ const d=Math.sqrt(d2); p.x=cx+dx/d*r; p.z=cz+dz/d*r; n.set(dx/d,0,dz/d); }
        else { const l=p.x-b.x0, rr=b.x1-p.x, nn=p.z-b.z0, ff=b.z1-p.z, m=Math.min(l,rr,nn,ff);
          if(m===l){ p.x=b.x0-r; n.set(-1,0,0); } else if(m===rr){ p.x=b.x1+r; n.set(1,0,0); } else if(m===nn){ p.z=b.z0-r; n.set(0,0,-1); } else { p.z=b.z1+r; n.set(0,0,1); } }
        w.hitTop=b.y1; hit=true;
      }
      const B=o.bounds;
      if(B){
        if(p.x<B.x0+r){ p.x=B.x0+r; n.set(1,0,0); w.hitTop=Infinity; hit=true; } if(p.x>B.x1-r){ p.x=B.x1-r; n.set(-1,0,0); w.hitTop=Infinity; hit=true; }
        if(p.z<B.z0+r){ p.z=B.z0+r; n.set(0,0,1); w.hitTop=Infinity; hit=true; } if(p.z>B.z1-r){ p.z=B.z1-r; n.set(0,0,-1); w.hitTop=Infinity; hit=true; }
      }
      return hit;
    },
    // how far along a→b the camera can go before a box is in the way (1 = all the way)
    camRay(a,b){
      let best=1; const dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z, pad=0.3;
      for(const bx of boxes){
        if(!bx.on) continue; tt[0]=0; tt[1]=1;
        if(slab(a.x,dx,bx.x0-pad,bx.x1+pad)&&slab(a.y,dy,bx.y0-pad,bx.y1+pad)&&slab(a.z,dz,bx.z0-pad,bx.z1+pad)&&tt[0]>0.02&&tt[0]<best) best=tt[0];
      }
      return best;
    },
    clampCam(c){
      const B=o.bounds; if(B){ c.x=clamp(c.x,B.x0+0.7,B.x1-0.7); c.z=clamp(c.z,B.z0+0.7,B.z1-0.7); }
      if(o.ceil) c.y=Math.min(c.y,o.ceil-0.7);
      c.y=Math.max(c.y,o.camFloor===undefined?0.6:o.camFloor);
    }
  };
  if(o.ceil) w.ceil=o.ceil;
  return w;
}

/* ---------- Royalties, Blots and the Seal ---------- */
const coinGeo=flat(new T.CylinderGeometry(0.36,0.36,0.08,10)); coinGeo.rotateX(Math.PI/2);
const coinM=lam(0xf4b731,{emissive:0x3a2600});
const blotGeo=flat(new T.IcosahedronGeometry(0.6,1)), blotM=lam(0xffffff,{emissive:0x9a9a9a}), eyeM=bas(0x1b2440);
const atk={on:false,c:new V3(),r:0};         // where Nova's current attack lands, if any
const _q=new T.Quaternion(), _u2=new V3(), _n2=new V3(), _e=new V3(), _f=new V3(), wallN2=new V3();

function addRoyalty(w,pos,temp){
  const m=new T.Mesh(coinGeo,coinM); m.position.copy(pos); w.group.add(m);
  w.up(pos,_u2);
  const c={m:m,q:new T.Quaternion().setFromUnitVectors(Y,_u2),alive:true,temp:!!temp,ph:pos.x*1.3+pos.z*0.7+pos.y};
  m.quaternion.copy(c.q); w.things.coins.push(c); return c;
}
function addBlot(w,pos){
  const g=new T.Group(), body=mesh(blotGeo,blotM,g,0,0.5,0); body.scale.set(1,0.82,1);
  mesh(new T.BoxGeometry(0.12,0.2,0.06),eyeM,g,-0.2,0.6,0.52); mesh(new T.BoxGeometry(0.12,0.2,0.06),eyeM,g,0.2,0.6,0.52);
  g.position.copy(pos); w.group.add(g);
  const b={g:g,home:pos.clone(),p:pos.clone(),f:new V3(0,0,1),alive:true,ph:pos.x+pos.z};
  w.things.blots.push(b); return b;
}
function makeSeal(parent){
  const g=new T.Group(), spin=new T.Group(); g.add(spin); parent.add(g);
  mesh(flat(new T.CylinderGeometry(0.8,0.8,0.14,18)),lam(0xf4b731,{emissive:0x7a5200}),spin).rotation.x=Math.PI/2;
  for(let i=0;i<3;i++) mesh(new T.BoxGeometry(1.05,0.17,0.22),lam(0xfff3c4,{emissive:0x8a7a40}),spin).rotation.z=i*Math.PI/3;
  return {g:g,spin:spin};
}
// every visit starts fresh, like the coins in a Mario 64 course
function resetThings(w){
  const t=w.things;
  for(let i=t.coins.length-1;i>=0;i--){ const c=t.coins[i]; if(c.temp){ w.group.remove(c.m); t.coins.splice(i,1); } else { c.alive=true; c.m.visible=true; } }
  for(const b of t.blots){ b.alive=true; b.g.visible=true; b.p.copy(b.home); b.g.position.copy(b.home); }
  w.coinCount=0;
}
function popBlot(w,b){
  b.alive=false; b.g.visible=false; sfx.pop(); dust(7,3.5,b.p);
  w.up(b.p,_u2);
  for(let i=0;i<3;i++){ _f.copy(b.f).applyAxisAngle(_u2,i*2.1+0.5); addRoyalty(w,new V3().copy(b.p).addScaledVector(_f,0.9).addScaledVector(_u2,0.9),true); }
}
function updateThings(dt){
  const w=world, t=w.things;
  w.up(P.p,up); _e.copy(P.p).addScaledVector(up,0.8);
  for(const c of t.coins){
    if(!c.alive) continue;
    _q.setFromAxisAngle(Y,time*4+c.ph); c.m.quaternion.copy(c.q).multiply(_q);
    if(c.m.position.distanceToSquared(_e)<1.3){
      c.alive=false; c.m.visible=false; w.coinCount++; if(P.hp<6) P.hp++; sfx.coin(); updateHud();
      if(w.key&&w.coinCount===100&&!save.seals[w.key+'r']) awardBonus(w);
    }
  }
  const airborne=P.state==='air'||P.state==='dive'||P.state==='pound';
  for(const b of t.blots){
    if(!b.alive) continue;
    w.up(b.p,_u2); const a=w.alt(b.p);
    _f.copy(P.p).sub(b.p); const dist=_f.length(), away=_n2.copy(b.p).sub(b.home).length();
    let sp=0;
    if(dist<8&&away<11&&P.invuln<=0){ tangent(_f,_u2); sp=2.9; }             // chase
    else if(away>1){ _f.copy(b.home).sub(b.p); tangent(_f,_u2); sp=1.6; }       // drift home
    if(sp>0){
      b.f.lerp(_f,Math.min(1,6*dt));
      tangent(b.f,_u2);
      _n2.copy(b.p).addScaledVector(b.f,sp*dt); w.walls(_n2,0.5,a,wallN2);
      const gy=w.ground(_n2,a+0.35);
      if(gy>a-1.2){ b.p.copy(_n2); w.setAlt(b.p,gy); }                          // never walks off into a drop
    } else tangent(b.f,_u2);
    const hop=Math.abs(Math.sin(time*7+b.ph))*(sp>0?0.35:0.08);
    b.g.position.copy(b.p).addScaledVector(_u2,hop);
    _x.crossVectors(_u2,b.f).normalize(); _m.makeBasis(_x,_u2,b.f); b.g.quaternion.setFromRotationMatrix(_m);
    b.g.scale.set(1+hop*0.2,1-hop*0.25,1+hop*0.2);
    _n2.copy(b.p).addScaledVector(_u2,0.5);
    if(atk.on&&atk.c.distanceTo(_n2)<atk.r+0.55){ popBlot(w,b); continue; }
    if(_e.distanceTo(_n2)<1.2){
      if(airborne&&P.vy<0&&w.alt(P.p)>a+0.4){ popBlot(w,b); if(P.state!=='pound') bounce(); }
      else hurt(b.p);
    }
  }
}
