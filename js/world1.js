'use strict';
/* ---------- world 1: the Shape of the Earth (Dr. Gladys West) ---------- */
const R0=22;
const stars=(function(){ const r=rng(11), pts=[]; for(let i=0;i<500;i++){ const v=new V3(r()*2-1,r()*2-1,r()*2-1).normalize().multiplyScalar(420); pts.push(v); }
  const s=new T.Points(new T.BufferGeometry().setFromPoints(pts),new T.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false})); s.visible=false; scene.add(s); return s; })();
const planet=(function(){
  const g=new T.Group(); g.visible=false; scene.add(g);
  const r=rng(1930);                                  // seeded with the year she was born
  const bumps=[];
  for(let i=0;i<18;i++) bumps.push({c:new V3(r()*2-1,r()*2-1,r()*2-1).normalize(),a:-1.4+r()*3.6,w:0.03+r()*0.09});
  const sites=[];
  function rawH(d){ let h=-0.05; for(const b of bumps) h+=b.a*Math.exp(-(1-d.dot(b.c))/b.w); return clamp(h,-0.25,3.2); }
  function hAt(d){ let h=rawH(d); for(const s of sites){ const c=d.dot(s.dir); if(c>s.c0){ const k=clamp((c-s.c0)/(s.c1-s.c0),0,1); h+=(s.h-h)*k*k*(3-2*k); } } return h; }
  function site(dir,flatM,blendM){ sites.push({dir:dir,h:Math.max(0.15,rawH(dir)),c1:Math.cos(flatM/R0),c0:Math.cos(blendM/R0)}); }

  const spawnDir=new V3(0,0.15,1).normalize();
  const towerDir=new V3(0.25,1,0.15).normalize();
  const stationDirs=[new V3(0.6,0.2,0.78),new V3(-0.85,-0.2,-0.45),new V3(0.15,-0.9,0.4)].map(v=>v.normalize());
  site(towerDir,5.6,9.5); stationDirs.forEach(d=>site(d,3.6,6.5)); site(spawnDir,2.5,5);
  const caseDir=new V3(-0.3,0.55,-0.75).normalize(); site(caseDir,3.2,6);

  // the lumpy Earth
  const geo=new T.IcosahedronGeometry(1,16), pos=geo.attributes.position, col=new Float32Array(pos.count*3), v=new V3(), c=new T.Color();
  for(let i=0;i<pos.count;i+=3){
    let hs=0;
    for(let k=0;k<3;k++){ v.fromBufferAttribute(pos,i+k).normalize(); const h=hAt(v); hs+=h; v.multiplyScalar(R0+h); pos.setXYZ(i+k,v.x,v.y,v.z); }
    const h=hs/3, j=(r()-0.5)*0.07;
    if(h<=-0.2) c.setRGB(0.16+j,0.42+j,0.86+j); else if(h<0.1) c.setRGB(0.89+j,0.82+j,0.55+j);
    else if(h<1.5) c.setRGB(0.28+j,0.66+j*2,0.3+j); else if(h<2.3) c.setRGB(0.55+j,0.48+j,0.4+j); else c.setRGB(0.95,0.95,0.97);
    for(let k=0;k<3;k++){ col[(i+k)*3]=c.r; col[(i+k)*3+1]=c.g; col[(i+k)*3+2]=c.b; }
  }
  geo.setAttribute('color',new T.BufferAttribute(col,3)); geo.computeVertexNormals();
  mesh(geo,new T.MeshLambertMaterial({vertexColors:true}),g);

  // solids are upright cylinders standing on the surface
  const solids=[];
  function place(o,dir,alt){ o.position.copy(dir).multiplyScalar(alt); o.quaternion.setFromUnitVectors(Y,dir); g.add(o); return o; }
  function cyl(dir,rad,h,m,seg){ const base=R0+hAt(dir), top=base+h, s={dir:dir.clone(),r:rad,top:top,base:base}; solids.push(s);
    const th=Math.asin(rad/top), rimAx=top*Math.cos(th), sideH=rimAx-(base-2);
    place(new T.Mesh(flat(new T.CylinderGeometry(rad,rad,sideH,seg||12,1,true)),m),dir,base-2+sideH/2);
    place(new T.Mesh(flat(new T.SphereGeometry(top,seg||12,2,0,Math.PI*2,0,th)),m),dir,0); return s; }

  cyl(towerDir,4.2,1.8,lam(0xece6da),16); cyl(towerDir,2.9,4.6,lam(0xd7263d),14); const towerTop=cyl(towerDir,1.5,8.2,lam(0xece6da),12);

  const padM=lam(0x9aa3b2), mastM=lam(0x6f7887);
  const stations=stationDirs.map(dir=>{
    const s=cyl(dir,1.7,0.45,padM,14);
    const btn=place(new T.Mesh(flat(new T.CylinderGeometry(1.15,1.15,0.1,12)),lam(0xd7263d)),dir,s.top+0.05);
    const side=tangent(new V3(0,1,0).cross(dir),dir);
    const mdir=new V3().copy(dir).multiplyScalar(s.base).addScaledVector(side,2.7).normalize();
    const mast=cyl(mdir,0.2,5,mastM,6);
    const lamp=place(new T.Mesh(new T.SphereGeometry(0.4,6,5),bas(0xff3344)),mdir,mast.top+0.3);
    return {dir:dir,s:s,btn:btn,lamp:lamp,active:false};
  });

  const trunkM=lam(0x6b4a2b), leafM=lam(0x2f8f3a);
  for(let i=0,n=0;i<400&&n<26;i++){
    const d=new V3(r()*2-1,r()*2-1,r()*2-1).normalize(), h=hAt(d);
    if(h<0.25||h>1.5||d.dot(towerDir)>0.93||d.dot(spawnDir)>0.96||d.dot(caseDir)>0.95||stationDirs.some(s=>d.dot(s)>0.95)) continue;
    n++; const s=cyl(d,0.28,1.3,trunkM,6);
    place(new T.Mesh(flat(new T.ConeGeometry(1.0,2.2,6)),leafM),d,s.top+0.9); s.top+=1.9; s.r=0.3;
  }

  // the glass case on its plinth
  const casePad=cyl(caseDir,2.2,0.6,lam(0x9aa3b2),14), caseGroup=new T.Group(); place(caseGroup,caseDir,casePad.top);
  solids.push({dir:caseDir.clone(),r:0.95,top:casePad.top+2.7,base:casePad.top});

  // satellites
  const sats=[0,1,2].map(i=>{
    const grp=new T.Group(); g.add(grp);
    mesh(new T.BoxGeometry(0.9,0.9,1.2),lam(0xdfe5ee),grp);
    mesh(new T.BoxGeometry(2,0.06,0.8),lam(0x2b59c3),grp,-1.5,0,0); mesh(new T.BoxGeometry(2,0.06,0.8),lam(0x2b59c3),grp,1.5,0,0);
    const lamp=mesh(new T.SphereGeometry(0.3,6,5),bas(0xff3344),grp,0,0.7,0);
    const n=new V3(Math.sin(i*2.1),0.6,Math.cos(i*2.1)).normalize(), a=tangent(new V3(1,0,0),n), b=new V3().crossVectors(n,a), rad=R0+12+i*1.6;
    const pts=[]; for(let k=0;k<=72;k++){ const th=k/72*Math.PI*2; pts.push(new V3().copy(a).multiplyScalar(Math.cos(th)*rad).addScaledVector(b,Math.sin(th)*rad)); }
    const ring=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xf4b731})); ring.visible=false; g.add(ring);
    const beam=new T.Line(new T.BufferGeometry().setFromPoints([new V3(),new V3()]),new T.LineBasicMaterial({color:0x7dffa0})); beam.visible=false; beam.frustumCulled=false; g.add(beam);
    return {grp:grp,lamp:lamp,a:a,b:b,n:n,rad:rad,th:i*2.1,speed:0.2+i*0.05,ring:ring,beam:beam};
  });

  // the Patent Seal and its beacon
  const seal=new T.Group(); place(seal,towerDir,towerTop.top+1.5);
  const spin=new T.Group(); seal.add(spin);
  mesh(flat(new T.CylinderGeometry(0.8,0.8,0.14,18)),lam(0xf4b731,{emissive:0x7a5200}),spin).rotation.x=Math.PI/2;
  for(let i=0;i<3;i++) mesh(new T.BoxGeometry(1.05,0.17,0.22),lam(0xfff3c4,{emissive:0x8a7a40}),spin).rotation.z=i*Math.PI/3;
  const beacon=place(new T.Mesh(new T.CylinderGeometry(0.35,0.35,44,8,1,true),bas(0xf4b731,{transparent:true,opacity:0.35,depthWrite:false,side:T.DoubleSide})),towerDir,towerTop.top+22);
  const sealPos=new V3().copy(towerDir).multiplyScalar(towerTop.top+1.5);

  const m={count:0,online:false};
  function refresh(){ const tag=$('missionTag'); tag.textContent=m.online?'GPS online':'Satellites '+m.count+'/3'; tag.classList.toggle('done',m.online); }
  function reset(){
    m.count=0; m.online=false; seal.visible=false; beacon.visible=false;
    stations.forEach((st,i)=>{ st.active=false; st.btn.material.color.set(0xd7263d); st.btn.position.copy(st.dir).multiplyScalar(st.s.top+0.05); st.lamp.material.color.set(0xff3344);
      sats[i].lamp.material.color.set(0xff3344); sats[i].ring.visible=false; sats[i].beam.visible=false; });
    refresh();
  }
  function quietOnline(){ stations.forEach((st,i)=>{ st.active=true; st.btn.material.color.set(0x35c96b); st.lamp.material.color.set(0x35ff7a); sats[i].lamp.material.color.set(0x35ff7a); sats[i].ring.visible=true; }); m.count=3; m.online=true; }
  function activate(i){
    const st=stations[i]; st.active=true; m.count++;
    st.btn.material.color.set(0x35c96b); st.btn.position.copy(st.dir).multiplyScalar(st.s.top+0.01); st.lamp.material.color.set(0x35ff7a);
    sats[i].lamp.material.color.set(0x35ff7a); sats[i].ring.visible=true; sfx.lock();
    if(m.count===3){ m.online=true; seal.visible=true; beacon.visible=true; toast('GPS online',3); setHint(HINT_ONLINE); }
    else toast('Satellite '+m.count+' of 3 locked');
    refresh();
  }

  return {
    name:'planet', spawnDir:spawnDir, group:g, bumps:bumps, caseDir:caseDir, caseGroup:caseGroup, caseTop:casePad.top, place:place, quietOnline:quietOnline, colAttr:geo.attributes.color, bg:new T.Color(0x05081c), stars:true, amb:0.62, sun:0.62,
    stations:stations, towerDir:towerDir, towerTop:towerTop, sealPos:sealPos, m:m, solids:solids, hAt:hAt,
    up(p,out){ return out.copy(p).normalize(); },
    alt(p){ return p.length(); }, setAlt(p,a){ p.setLength(a); },
    ground(p,feet){
      _d.copy(p).normalize(); let gy=R0+hAt(_d); const l2=p.lengthSq();
      for(const s of solids){ const ax=p.dot(s.dir); if(ax<R0*0.6||l2-ax*ax>=s.r*s.r) continue;
        if(s.top<=feet+STEP_UP&&s.top>gy) gy=s.top; }
      return gy;
    },
    walls(p,r,feet,n){
      let hit=false;
      for(const s of solids){ if(feet>=s.top-STEP_UP) continue; const ax=p.dot(s.dir); if(ax<R0*0.6) continue;
        _l.copy(p).addScaledVector(s.dir,-ax); const l=_l.length(); if(l>=s.r+r||l<1e-6) continue;
        _l.multiplyScalar(1/l); p.addScaledVector(_l,s.r+r-l); n.copy(_l); planet.hitTop=s.top; hit=true; }
      if(hit){ _d.copy(p).normalize(); n.addScaledVector(_d,-n.dot(_d)).normalize(); }
      return hit;
    },
    clampCam(c){ _d.copy(c).normalize(); const min=R0+hAt(_d)+1.2; if(c.length()<min) c.setLength(min); },
    spawn(){
      reset(); resetThings(planet);
      P.p.copy(spawnDir).multiplyScalar(R0+hAt(spawnDir)+13); P.fwd=P.side=P.vy=0; P.state='air'; P.air='fall'; P.lastAir=null; P.t=0;
      P.face.copy(stationDirs[0]).sub(spawnDir); tangent(P.face,spawnDir); cam.fwd.copy(P.face); cam.pitch=0.42; cam.dist=9.5;
      setHint(HINT_PLANET);
    },
    onPound(p){
      for(let i=0;i<stations.length;i++){ const st=stations[i]; if(st.active) continue; const ax=p.dot(st.dir);
        _l.copy(p).addScaledVector(st.dir,-ax); if(ax>0&&p.length()>st.s.top-0.4&&_l.length()<1.8) activate(i); }
    },
    animate(dt,t){
      sats.forEach((s,i)=>{
        const st=stations[i]; s.th+=s.speed*dt; let rad=s.rad, off=0;
        if(!st.active){ rad+=2.2*Math.sin(t*2.3+i*2); off=3*Math.sin(t*1.7+i); }
        s.grp.position.copy(s.a).multiplyScalar(Math.cos(s.th)*rad).addScaledVector(s.b,Math.sin(s.th)*rad).addScaledVector(s.n,off);
        s.grp.lookAt(0,0,0);
        s.lamp.visible=st.active||((t*4+i)%2<1); st.lamp.visible=st.active||((t*3+i)%2<1);
        if(st.active){ const vis=_d.copy(s.grp.position).normalize().dot(st.dir)>0.2; s.beam.visible=vis;
          if(vis){ const bp=s.beam.geometry.attributes.position; _a.copy(st.dir).multiplyScalar(st.s.top);
            bp.setXYZ(0,_a.x,_a.y,_a.z); bp.setXYZ(1,s.grp.position.x,s.grp.position.y,s.grp.position.z); bp.needsUpdate=true; } }
      });
      spin.rotation.y=t*3;
    },
    logic(){
      if(m.online){ world.up(P.p,up); _a.copy(P.p).addScaledVector(up,0.8); if(_a.distanceTo(sealPos)<1.5) collectSeal('w1m1'); }
    }
  };
})();

