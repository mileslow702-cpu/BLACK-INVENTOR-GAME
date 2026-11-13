'use strict';
/* ---------- world 7: Blackwell (Dr. David Blackwell) ---------- */
const blackwell=(function(){
  const w=makeLevel({key:'w7',floorY:-30,killAlt:-6,bounds:{x0:-32,x1:38,z0:-14,z1:14},bg:0x02080a,amb:0.55,sun:0.35,
    caseAt:[32,0,8],spawn:[-27,0,0,1,0],
    intro:{eyebrow:'World 07 · Inside the chip',title:'Blackwell',mission:''},
    card:{n:7,name:'Dr. David Blackwell',years:'1919 – 2010 · Mathematician · Howard and Berkeley',
      p1:'Born in Centralia, Illinois, he became only the seventh African American to earn a PhD in mathematics. At the Institute for Advanced Study he was kept out of Princeton University’s lectures because of his race, and Berkeley first turned him away for the same reason.',
      p2:'He wrote to 104 Black colleges looking for work, then led Howard’s math department. In 1954 he joined Berkeley and became its first Black tenured professor, and he was the first Black member of the National Academy of Sciences. His work in probability and game theory now sits under modern AI, and in 2024 Nvidia named its Blackwell chip after him.'},
    missions:[
      {hint:'Three gaps, three tiles each. Read the odds over each tile. Only the best odds will hold you.',
       setup(w){}, tag(){ return 'Cross the three gaps'; },
       logic(w){ if(P.p.x>17&&P.state==='ground'&&!w.ready) w.sealReady('You read the odds. The Seal of Record is over the glass case.'); }},
      {hint:'Collect the five chips of data. Odds Bots guard them.',
       setup(w){ w.ms.n=0; showPickups(chips,true); },
       tag(w){ return 'Chips '+w.ms.n+'/5'; },
       logic(w){ for(const c of chips){ if(c.done) continue; if(touching(c.pos,1.4)){ c.done=true; c.m.visible=false; w.ms.n++; sfx.coin(); w.tag(); if(w.ms.n===5) w.sealReady(); } } }},
      {hint:'Beat the Bad Odds, then ground-pound the four power nodes to light the chip.',
       setup(w){ boss.start(26,0,-2); w.ms.n=0; nodes.forEach(n=>{ n.done=false; n.m.material.color.setHex(0x2a2f38); }); setChip(false); },
       tag(w){ return boss.dead?'Nodes '+w.ms.n+'/4':boss.tag(); },
       logic(w,dt){ boss.update(dt); if(!boss.dead) return;
         for(const n of nodes){ if(n.done) continue; if(P.state==='poundland'&&P.t<0.05&&Math.hypot(P.p.x-n.pos.x,P.p.z-n.pos.z)<1.4){ n.done=true; n.m.material.color.setHex(0x35ff7a); w.ms.n++; sfx.lock(); w.tag();
           if(w.ms.n===4){ setChip(true); w.sealReady('His name is lit. The Seal of Record is over the glass case.'); } } } }}
    ],
    reset(w){ boss.stop(); tiles.forEach(t=>{ t.b.on=true; t.b.mesh.visible=true; t.st=0; }); setChip(sealsFor('w7')===3); showPickups(chips,false); nodes.forEach(n=>n.m.visible=w.mission===2); },
    animate(w,dt,t){
      for(const tl of tiles){
        if(tl.safe) continue;
        const on=P.box===tl.b;
        if(tl.st===0&&on){ tl.st=1; tl.t=0; }
        if(tl.st===1){ tl.t+=dt; tl.b.mesh.position.y=-0.25+Math.sin(t*60)*0.04; if(tl.t>0.35){ tl.st=2; tl.t=0; tl.b.on=false; tl.b.mesh.visible=false; sfx.skid(); } }
        else if(tl.st===2){ tl.t+=dt; if(tl.t>3){ tl.st=0; tl.b.on=true; tl.b.mesh.visible=true; tl.b.mesh.position.y=-0.25; } }
      }
      spinPickups(chips,t); chipM.emissive.setHex(chipLit?0x2a6a3a:0x000000);
    }
  });
  const g=w.group, solid=w.solid;
  const circ=t=>{ const tx=tex(64,64,(c,W,H)=>{ c.fillStyle='#061412'; c.fillRect(0,0,W,H); c.strokeStyle='#1fe39a'; c.lineWidth=2; c.beginPath(); c.moveTo(0,16); c.lineTo(28,16); c.lineTo(36,40); c.lineTo(64,40); c.moveTo(16,0); c.lineTo(16,64); c.stroke(); c.fillStyle='#1fe39a'; c.fillRect(26,14,5,5); c.fillRect(34,38,5,5); }); tx.wrapS=tx.wrapT=T.RepeatWrapping; tx.repeat.set(t,t); return tx; };
  const padM=lam(0xffffff,{map:circ(6)});
  [[-32,-18],[-12,-4],[2,10],[16,38]].forEach(p=>solid(p[0],p[1],-12,12,0,padM,-1.5));
  // odds tiles: one safe tile per gap, the others drop
  const tiles=[];
  const odds=[['1 in 4','3 in 4','1 in 2'],['3 in 4','1 in 3','1 in 2'],['1 in 2','1 in 4','3 in 4']];
  [[-18,-12],[-4,2],[10,16]].forEach((gx,gi)=>{
    [-6,0,6].forEach((z,ti)=>{
      const label=odds[gi][ti], safe=label==='3 in 4';
      const b=solid(gx[0],gx[1],z-2.6,z+2.6,0,lam(safe?0x1a5a4a:0x1a4a5a,{emissive:0x0a2a2a}),-0.5);
      tiles.push({b:b,safe:safe,st:0,t:0});
      sign(g,label,gx[0]-0.4,3,z,3,1,-Math.PI/2,'#061412',safe?'#35ff7a':'#1fe39a','bold 72px "IBM Plex Mono", monospace');
    });
  });
  // the chip and its four power nodes
  const chipM=lam(0x1a1f26,{emissive:0x000000}); solid(22,30,-10,-2,0.6,chipM,0);
  const chipSign=sign(g,'',26,0.62,-6,7,2,0,'#1a1f26','#35ff7a','bold 80px "IBM Plex Mono", monospace'); chipSign.rotation.x=-Math.PI/2;
  let chipLit=false; function setChip(on){ chipLit=on; chipSign.setText(on?'BLACKWELL':'',  '#1a1f26','#35ff7a'); }
  const nodes=[[20,-12],[32,-12],[20,0],[32,0]].map(p=>{ const m=mesh(flat(new T.CylinderGeometry(0.8,0.8,0.2,8)),lam(0x2a2f38),g,p[0],0.1,p[1]+1); return {m:m,pos:new V3(p[0],0,p[1]+1),done:false}; });
  solid(-30,-27,8,11,3,lam(0x1a3a3a)); solid(4,7,-11,-8,3.5,lam(0x1a3a3a)); solid(34,37,-11,-8,4,lam(0x1a3a3a));
  w.collectTints();
  const chips=[[-28.5,4,9.5],[5.5,4.5,-9.5],[35.5,5,-9.5],[-8,1,9],[20,1,9]].map(p=>pickup(w,p[0],p[1],p[2],0x1fe39a,new T.BoxGeometry(0.7,0.15,0.7)));
  const boss=makeBoss(w,{name:'The Bad Odds',hp:3,speed:4,r:1.4,height:2.8,build(bg){
    mesh(new T.BoxGeometry(2.6,2.6,2.6),lam(0xdfe5ee),bg,0,1.3,0);
    [[0,1.3,1.31,0],[1.31,1.3,0,Math.PI/2],[-1.31,1.3,0,-Math.PI/2]].forEach(f=>{ for(let i=-1;i<=1;i+=2) mesh(new T.CircleGeometry(0.22,8),bas(0x1b2440),bg,f[0]+(f[3]?0:i*0.6),f[1]+i*0.6,f[2]+(f[3]?i*0.6:0)).rotation.y=f[3]; }); }});
  for(let x=-30;x<-18;x+=2) addRoyalty(w,new V3(x,0.9,-6));
  for(let x=-11;x<-4;x+=1.6) addRoyalty(w,new V3(x,0.9,6));
  for(let x=3;x<10;x+=1.6) addRoyalty(w,new V3(x,0.9,-2));
  for(let x=17;x<37;x+=2) addRoyalty(w,new V3(x,0.9,11));
  [[-8,-6],[6,6],[20,6]].forEach(p=>tintBlot(addBlot(w,new V3(p[0],0,p[1])),0x1fe39a));
  Object.assign(w,{boss:boss,chips:chips,nodes:nodes,tiles:tiles});
  return w;
})();
