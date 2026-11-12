'use strict';
/* ---------- world 1: the case, missions 2 and 3, color ---------- */
(function(){
  const pl=planet, v=new V3(), t=new V3();
  pl.case=makeCase(pl.caseGroup,INV.w1);
  const top=dir=>{ v.copy(dir).normalize().multiplyScalar(R0+6); return pl.ground(v,1e9); };

  // the seal for missions 2 and 3 appears over the case
  const sealG=new T.Group(); pl.group.add(sealG); const seal=makeSeal(sealG); sealG.visible=false;
  const sealPos=new V3().copy(pl.caseDir).multiplyScalar(pl.caseTop+3.8);
  sealG.position.copy(sealPos); sealG.quaternion.setFromUnitVectors(Y,pl.caseDir);

  // mission 2: markers on the five highest lumps
  const flagM=()=>lam(0xd7263d);
  const peaks=pl.bumps.filter(b=>b.a>0).sort((a,b)=>b.a-a.a).slice(0,5).map(b=>{
    const g=new T.Group(), m=flagM(); const gy=top(b.c);
    mesh(new T.CylinderGeometry(0.06,0.06,2.2,5),lam(0xdfe5ee),g,0,1.1,0);
    mesh(new T.BoxGeometry(0.9,0.55,0.05),m,g,0.45,1.9,0);
    g.position.copy(b.c).multiplyScalar(gy); g.quaternion.setFromUnitVectors(Y,b.c); pl.group.add(g);
    return {g:g,m:m,dir:b.c.clone(),base:g.position.clone(),done:false};
  });

  // mission 3: twelve rings on the circle 90 degrees from the tower
  const td=pl.towerDir, a=tangent(new V3(1,0,0),td), b=new V3().crossVectors(td,a);
  const ringGeo=new T.TorusGeometry(1.5,0.14,6,16);
  const rings=[]; for(let i=0;i<12;i++){
    const th=i/12*Math.PI*2, dir=new V3().copy(a).multiplyScalar(Math.cos(th)).addScaledVector(b,Math.sin(th)).normalize();
    const pos=new V3().copy(dir).multiplyScalar(top(dir)+1.5), m=new T.Mesh(ringGeo,lam(0xf4b731,{emissive:0x5a3c00}));
    t.crossVectors(td,dir).normalize(); m.position.copy(pos); m.quaternion.setFromUnitVectors(Z,t); pl.group.add(m);
    rings.push({m:m,pos:pos,done:false});
  }
  const RACE=50;
  const ms={peaks:0,rings:0,timer:0,running:false,ready:false};

  // washed out until she is free
  const orig=Float32Array.from(pl.colAttr.array);
  pl.restore=function(k){
    const s=0.25+0.75*k, a2=pl.colAttr.array;
    for(let i=0;i<a2.length;i+=3){ const gr=(orig[i]+orig[i+1]+orig[i+2])/3; for(let j=0;j<3;j++) a2[i+j]=gr+(orig[i+j]-gr)*s; }
    pl.colAttr.needsUpdate=true;
  };

  function tag(){
    const el=$('missionTag');
    if(pl.mission===1) el.textContent=ms.ready?'Seal ready':'Markers '+ms.peaks+'/5';
    else if(pl.mission===2) el.textContent=ms.ready?'Seal ready':(ms.running?'Rings '+ms.rings+'/12 · '+Math.ceil(ms.timer)+'s':'Rings 0/12 · '+RACE+'s');
    el.classList.toggle('done',ms.ready);
  }
  function ready(){ ms.ready=true; sealG.visible=true; sfx.crowd(); toast('The Seal of Record is over the glass case',3); setHint('Climb onto the glass case to take the Seal of Record.'); tag(); }
  function resetRace(){ ms.rings=0; ms.running=false; ms.timer=RACE; rings.forEach(r=>{ r.done=false; r.m.visible=true; }); }

  const base={spawn:pl.spawn,logic:pl.logic,animate:pl.animate};
  pl.spawn=function(){
    base.spawn();
    const n=sealsFor('w1'); pl.case.set(n); if(n===3) pl.case.free(); else pl.case.lock(); pl.restore(n/3);
    ms.ready=false; sealG.visible=false; ms.peaks=0;
    peaks.forEach(p=>{ p.done=false; p.m.color.setHex(0xd7263d); p.g.visible=pl.mission===1; });
    resetRace(); rings.forEach(r=>{ r.m.visible=pl.mission===2; });
    if(pl.mission>0){ pl.quietOnline(); tag();
      setHint(pl.mission===1?'Plant a marker on each of the five highest peaks. Touch a red flag to turn it gold.'
        :'Run through all twelve gold rings around the planet in '+RACE+' seconds. The clock starts at the first ring.'); }
  };
  pl.logic=function(dt){
    if(pl.mission===0){ base.logic(dt); return; }
    pl.up(P.p,up); _a.copy(P.p).addScaledVector(up,0.8);
    if(ms.ready){ if(_a.distanceTo(sealPos)<1.6) collectSeal('w1m'+(pl.mission+1)); return; }
    if(pl.mission===1){
      for(const p of peaks){ if(p.done) continue;
        if(_a.distanceTo(p.base)<2){ p.done=true; p.m.color.setHex(0xf4b731); ms.peaks++; sfx.lock(); toast(ms.peaks<5?'Marker '+ms.peaks+' of 5':'The true shape is mapped'); if(ms.peaks===5) ready(); tag(); } }
    } else {
      for(const r of rings){ if(r.done) continue;
        if(_a.distanceTo(r.pos)<1.8){ r.done=true; r.m.visible=false; ms.rings++; sfx.coin(); if(!ms.running){ ms.running=true; ms.timer=RACE; } if(ms.rings===12){ ms.running=false; ready(); } tag(); } }
      if(ms.running){ ms.timer-=dt; if(((ms.timer+dt)|0)!==(ms.timer|0)) tag(); if(ms.timer<=0){ resetRace(); sfx.hurt(); toast('Too slow. The rings are back.'); tag(); } }
    }
  };
  pl.animate=function(dt,t2){ base.animate(dt,t2); seal.spin.rotation.y=t2*3;  };
  pl.ms=ms; pl.peaks=peaks; pl.rings=rings; pl.sealPos2=sealPos;
})();
