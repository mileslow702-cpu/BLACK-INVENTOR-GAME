'use strict';
/* ---------- world 2: the case, missions 2 and 3, color ---------- */
(function(){
  const sw=soundcheck, g=sw.group;
  // the glass case on the stage
  const cg=new T.Group(); cg.position.set(41.8,3,-7.4); cg.rotation.y=Math.PI/4; g.add(cg);
  sw.case=makeCase(cg,INV.w2); sw.solid(41,42.6,-8.2,-6.6,5.7,null,3);
  const sealG=new T.Group(); g.add(sealG); const seal=makeSeal(sealG); sealG.visible=false;
  const sealPos=new V3(41.8,7,-7.4); sealG.position.copy(sealPos);

  // mission 2: five lost frequencies
  const noteGeo=flat(new T.OctahedronGeometry(0.45,0));
  const notes=[[0,2.4,-12.8],[-21.2,3.2,-3.2],[26.6,6.2,4.4],[16.3,4.6,0],[53.5,4.2,8]].map((p,i)=>{
    const m=new T.Mesh(noteGeo,lam(0x2ec4b6,{emissive:0x0d4a44})); m.position.set(p[0],p[1],p[2]); g.add(m);
    return {m:m,pos:m.position,done:false,f:[262,294,330,392,440][i]};
  });

  // mission 3: three show speakers that must keep ringing
  const showM=lam(0x2b2118);
  const show=[[42.4,-3.8],[46,7.6],[51.8,3.6]].map(p=>{
    sw.solid(p[0]-0.7,p[0]+0.7,p[1]-0.6,p[1]+0.6,5.2,showM,3);
    const meterBg=mesh(new T.BoxGeometry(1.4,0.18,0.05),bas(0x333333),g,p[0],5.6,p[1]);
    const meter=mesh(new T.BoxGeometry(1.4,0.18,0.06),bas(0x2ec4b6),g,p[0],5.6,p[1]);
    return {c:new V3(p[0],4.1,p[1]),lvl:1,meter:meter,bg:meterBg};
  });
  const SHOW=25;
  const ms={notes:0,ready:false,showOn:false,showT:SHOW,beatT:0};

  sw.restore=function(k){ const c=new T.Color(0x8a8a8a).lerp(new T.Color(0xffffff),k); sw.foam.forEach(m=>m.color.copy(c)); };

  function tag(){
    const el=$('missionTag');
    if(sw.mission===1) el.textContent=ms.ready?'Seal ready':'Frequencies '+ms.notes+'/5';
    else if(sw.mission===2) el.textContent=ms.ready?'Seal ready':(ms.showOn?'Keep it ringing · '+Math.ceil(ms.showT)+'s':'Get to the stage');
    el.classList.toggle('done',ms.ready);
  }
  function ready(){ ms.ready=true; sealG.visible=true; sfx.crowd(); toast('The Seal of Record is over the glass case',3); setHint('Climb onto the glass case on the stage to take the Seal of Record.'); tag(); }
  function showMeters(on){ show.forEach(s=>{ s.meter.visible=s.bg.visible=on; s.lvl=1; s.meter.scale.x=1; }); }

  const base={spawn:sw.spawn,logic:sw.logic,animate:sw.animate};
  sw.spawn=function(){
    base.spawn();
    const n=sealsFor('w2'); sw.case.set(n); if(n===3) sw.case.free(); else sw.case.lock(); sw.restore(n/3);
    ms.ready=false; sealG.visible=false; ms.notes=0; ms.showOn=false; ms.showT=SHOW;
    notes.forEach(o=>{ o.done=false; o.m.visible=sw.mission===1; });
    showMeters(false);
    if(sw.mission>0){
      sw.gobs.forEach(gb=>{ gb.alive=false; gb.m.visible=false; });
      sw.goLive(true); tag();
      setHint(sw.mission===1?'Five lost frequencies are hidden around the room. Punch speakers to make the bars you need.'
        :'Get to the stage. When the show starts, punch each speaker before its meter runs out.');
    }
  };
  sw.logic=function(dt){
    base.logic(dt);
    if(sw.mission===0||mode!=='play') return;
    _a.copy(P.p); _a.y+=0.8;
    if(ms.ready){ if(_a.distanceTo(sealPos)<1.6) collectSeal('w2m'+(sw.mission+1)); return; }
    if(sw.mission===1){
      for(const o of notes){ if(o.done) continue;
        if(_a.distanceTo(o.pos)<1.4){ o.done=true; o.m.visible=false; ms.notes++; tone(o.f,o.f,0.5,'triangle',0.08);
          if(ms.notes===5){ notes.forEach((x,i)=>tone(x.f,x.f,0.35,'triangle',0.07,0.4+i*0.25)); ready(); } else toast('Frequency '+ms.notes+' of 5'); tag(); } }
    } else {
      if(!ms.showOn){ if(P.p.x>39.6&&P.p.y>2.9&&P.state==='ground'){ ms.showOn=true; ms.showT=SHOW; ms.beatT=0; showMeters(true); toast('The show is on'); setHint('Punch each speaker before its meter runs out. Keep the sound going for '+SHOW+' seconds.'); tag(); } return; }
      ms.showT-=dt; ms.beatT-=dt; if(ms.beatT<=0){ sfx.beat(); ms.beatT=4; }
      if(((ms.showT+dt)|0)!==(ms.showT|0)) tag();
      for(const s of show){
        s.lvl-=dt/12;
        if(atk.on&&atk.c.distanceTo(s.c)<atk.r+1.1&&s.lvl<0.97){ s.lvl=1; sfx.ring([392,494,587],0.6); }
        s.meter.scale.x=Math.max(0.01,s.lvl); s.meter.position.x=s.c.x-0.7*(1-Math.max(0.01,s.lvl));
        s.meter.material.color.setHex(s.lvl<0.3?0xff5468:0x2ec4b6);
        if(s.lvl<=0){ ms.showOn=false; showMeters(false); sfx.hurt(); toast('The sound cut out. Starting over.'); tag(); return; }
      }
      if(ms.showT<=0){ ms.showOn=false; showMeters(false); ready(); }
    }
  };
  sw.animate=function(dt,t){ base.animate(dt,t); seal.spin.rotation.y=t*3; notes.forEach((o,i)=>{ o.m.rotation.y=t*2+i; }); };
  sw.ms=ms; sw.notes=notes; sw.show=show; sw.sealPos2=sealPos;
})();
