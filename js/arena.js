'use strict';
/* ---------- the Ghost Writer: two fights in the Hall's story, and the finale inside the cartridge ---------- */
const arena=(function(){
  const w=makeBoxWorld({floorY:-30,bounds:{x0:-46,x1:16,z0:-16,z1:16}});
  w.group.visible=false;
  Object.assign(w,{name:'arena',showTag:true,killAlt:-6,bg:new T.Color(0x0c1638),amb:0.6,sun:0.5,fight:'gw1',won:false,
    intro:{eyebrow:'',title:'',mission:''}});
  const g=w.group, solid=w.solid;
  const bp=tex(64,64,(c,W,H)=>{ c.fillStyle='#0e3a8c'; c.fillRect(0,0,W,H); c.strokeStyle='rgba(220,233,255,.45)'; c.lineWidth=1; c.strokeRect(0,0,W,H); c.beginPath(); c.moveTo(32,0); c.lineTo(32,64); c.moveTo(0,32); c.lineTo(64,32); c.stroke(); });
  bp.wrapS=bp.wrapT=T.RepeatWrapping; bp.repeat.set(6,6);
  const bpM=lam(0xffffff,{map:bp}), edge=lam(0xdce9ff);
  solid(-12,12,-12,12,8,bpM,6);
  for(const sx of [-1,1]) for(const sz of [-1,1]){ solid(sx*11-0.6,sx*11+0.6,sz*11-0.6,sz*11+0.6,14,edge,8); }
  // the climb inside the cartridge (finale only)
  const climb=[[-44,-36,-5,5,0],[-34,-31,-2,2,1.6],[-29,-26,2,6,3.2],[-24,-21,-3,1,4.8],[-19,-16,-7,-3,6.4],[-15,-12.5,-2,2,7.4]];
  const climbBoxes=climb.map(c=>solid(c[0],c[1],c[2],c[3],c[4],bpM,c[4]-1));
  sign(g,'THE CARTRIDGE',-40,4,-5.05,6,1.4,0,'#0e3a8c','#f4b731');
  const stars=new T.Points(new T.BufferGeometry().setFromPoints(Array.from({length:300},()=>new V3((Math.random()-0.5)*200,(Math.random()-0.2)*120,(Math.random()-0.5)*200))),new T.PointsMaterial({color:0xf4b731,size:2,sizeAttenuation:false})); g.add(stars);
  const boss=makeBoss(w,{name:'The Ghost Writer',hp:3,speed:3.6,r:1.2,height:3.4,chaseTime:1.6,build(){},
    onHit(b){ if(w.fight==='final'&&b.hp>0){ for(let i=0;i<2;i++) addBlot(w,new V3(b.p.x+(i?3:-3),8,b.p.z+(i?-3:3))); }
      const lines=['You think a name changes anything?','I signed it first. That makes it mine.','They will forget again. They always do.'];
      toast(lines[(b.max-b.hp)%lines.length],2.2); },
    onDead(){ win(); }});
  function dress(){
    boss.g.clear();
    if(MODELS.ghost){ boss.g.add(MODELS.ghost.clone(true)); }
    else { const f=makeFigure({skin:0xf1f1f1,top:0xd8c9a6,bottom:0xb8323a,hair:0xffffff},false,false); f.scale.setScalar(1.8); boss.g.add(f); }
  }
  function win(){
    w.won=true;
    w.winT=1.2;
    if(w.fight==='final'){ save.seals.final=true; persist(); updateHud(); hub.refresh(); return; }
    save.seals[w.fight]=true; persist(); updateHud(); hub.refresh(); sfx.seal();
  }
  function winCard(){
    if(w.fight==='final'){ endingScene(); return; }
    { mode='card'; cardT=0;
      $('cardEyebrow').textContent='Bonus Seal of Record'; $('cardNum').textContent='★'; $('cardName').textContent='The Ghost Writer ran';
      $('cardYears').textContent=w.fight==='gw1'?'First fight':'Second fight';
      $('cardP1').textContent=w.fight==='gw1'?'He backed off the stage, still smiling. He will be back.':'He is weaker every time a name goes back on the wall.';
      $('cardP2').textContent=w.fight==='gw1'?'Three names are back. Keep going.':'Two paintings left. Then the stage painting opens.';
      $('card').classList.add('on'); }
  }
  Object.assign(w,{
    boss:boss,
    spawn(){
      resetThings(w); w.won=false; dress();
      const final=w.fight==='final'; boss.max=final?6:(w.fight==='gw1'?3:4); boss.stop();
      climbBoxes.forEach(b=>{ b.on=final; b.mesh.visible=final; });
      if(final){ P.p.set(-40,6,0); P.state='air'; P.air='fall'; P.safe.set(-40,0,0); setHint('Climb up to the Ghost Writer. Every inventor you freed is cheering you on.'); }
      else { P.p.set(-8,14,0); P.state='air'; P.air='fall'; P.safe.set(-8,8,0); boss.start(6,8,0); setHint('Dodge his charge, then hit or stomp him while he is dazed.'); }
      P.fwd=P.side=P.vy=0; P.face.set(1,0,0); cam.fwd.set(1,0,0); cam.pitch=0.4; cam.dist=10; w.tag();
    },
    respawn(){ const final=w.fight==='final'; P.p.set(final?-40:-8,final?0:8,0); P.fwd=P.side=P.vy=0; P.state='ground'; P.face.set(1,0,0); cam.fwd.set(1,0,0); },
    tag(){ const el=$('missionTag'); el.textContent=boss.st==='off'&&w.fight==='final'?'Climb to the top':boss.tag(); el.classList.toggle('done',w.won); },
    logic(dt){
      if(w.won){ if(w.winT>0){ w.winT-=dt; if(w.winT<=0) winCard(); } return; }
      if(w.fight==='final'&&boss.st==='off'&&!w.won&&P.p.x>-12&&P.p.y>7){ boss.start(6,8,0); toast('The Ghost Writer',2); w.tag(); }
      boss.update(dt);
    },
    animate(dt,t){ stars.rotation.y=t*0.01; }
  });
  return w;
})();

function startArena(kind){
  arena.fight=kind;
  arena.intro={eyebrow:kind==='final'?'The Cartridge · a tribute to Jerry Lawson':'The Ghost Writer',
    title:kind==='final'?'Every Name on the Wall':(kind==='gw1'?'First Fight':'Second Fight'),
    mission:kind==='final'?'Give it all back':'Make him run'};
  mode='warp'; warp={t:0,to:arena,slot:{side:0,z:-30},swapped:false}; sfx.warp(); sfx.laugh();
}

/* The ending: the documents go back, the Curator steps out, and the player signs the wall */
function endingScene(){
  runScene([
    {talk:['The Ghost Writer','You cannot un-write history.','ghost']},
    {talk:['The Curator','Nobody is un-writing anything. We are putting the names back where they were.']},
    {fn(){ sfx.seal(); shake=0.6; dust(20,7,new V3(6,8,0)); }},
    {talk:['The Curator','Every original document goes back to the person who made it.']},
    {talk:['The Curator','And this cartridge he locked me in? Jerry Lawson led the team that built the first home console with swappable game cartridges.']},
    {talk:['The Curator','One name is still missing from the wall. The last plaque was always meant for you.']}
  ],()=>{ mode='card'; cardT=-1e9; $('ending').classList.add('on'); setTimeout(()=>{ try{ $('endName').focus(); }catch(e){} },50); });
}
function finishEnding(){
  const n=($('endName').value||'').trim().slice(0,24)||'Nova';
  save.name=n; persist(); hub.setFinalName(n); $('ending').classList.remove('on');
  cardT=0; $('cardEyebrow').textContent='The Hall of Record is whole'; $('cardNum').textContent='9'; $('cardName').textContent='Gerald A. “Jerry” Lawson';
  $('cardYears').textContent='1940 – 2011 · Engineer · Silicon Valley';
  $('cardP1').textContent='At Fairchild he led the team behind the Channel F, released in 1976, the first home console with interchangeable game cartridges. One machine could finally play many games.';
  $('cardP2').textContent='He was one of the first Black engineers in Silicon Valley and later started his own game company, Videosoft. Every cartridge in this game is a nod to him. And your name, '+n+', is on the wall.';
  $('card').classList.add('on');
}
