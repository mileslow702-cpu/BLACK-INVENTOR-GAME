'use strict';
/* ---------- worlds ---------- */
let world=null;
function setWorld(w){
  if(world) world.group.visible=false;
  world=w; w.group.visible=true; scene.background=w.bg; stars.visible=!!w.stars; amb.intensity=w.amb; sun.intensity=w.sun;
  if(!w.stars){ sun.position.set(8,20,12); sun.target.position.set(0,0,0); }
  $('missionTag').hidden=!(w.key||w.showTag); updateHud();
}

/* ---------- talk boxes and cutscenes ---------- */
// A scene is a list of steps: {letter}, {cam:{p0,l0,p1,l1,dur}}, {talk:[who,text,style],sfx}, {wait}, {fn}.
let sc=null, advance=false;
function runScene(steps,done){
  sc={steps:steps,i:-1,t:0,done:done||null,p0:new V3(),l0:new V3()};
  mode='scene'; document.body.classList.add('scene'); nextStep();
}
function nextStep(){
  sc.i++; sc.t=0;
  const s=sc.steps[sc.i];
  if(!s){ endScene(); return; }
  if(s.fn){ s.fn(); if(sc) nextStep(); return; }
  $('talk').className='';
  if(s.talk){ $('talk').className='on'+(s.talk[2]?' '+s.talk[2]:''); $('talkWho').textContent=s.talk[0]; $('talkText').textContent=''; if(s.sfx) s.sfx(); }
  else if(s.letter) $('letter').classList.add('on');
  else if(s.cam){
    if(s.cam.p0){ cam.pos.fromArray(s.cam.p0); cam.look.fromArray(s.cam.l0); }
    sc.p0.copy(cam.pos); sc.l0.copy(cam.look); cam.lock=true;
  }
}
function endScene(){
  const d=sc.done; sc=null;
  $('talk').className=''; $('letter').classList.remove('on'); document.body.classList.remove('scene');
  cam.lock=false; cam.snap=true; mode='play'; if(d) d();
}
function skipScene(){                 // apply every remaining state change, drop the talking
  for(let i=sc.i+1;i<sc.steps.length;i++){ const s=sc.steps[i]; if(s.fn) s.fn(); }
  sc.i=sc.steps.length; endScene();
}
function updateScene(dt){
  if(inp.pausePressed){ skipScene(); return; }
  const s=sc.steps[sc.i], go=inp.jumpPressed||advance; advance=false; sc.t+=dt;
  if(s.talk){
    const full=s.talk[1], n=Math.min(full.length,Math.floor(sc.t*48)), el=$('talkText');
    if(el.textContent.length!==n) el.textContent=full.slice(0,n);
    if(go){ if(n<full.length) sc.t=999; else nextStep(); }
  }
  else if(s.letter){ if(go&&sc.t>0.4){ $('letter').classList.remove('on'); nextStep(); } }
  else if(s.cam){
    const k=Math.min(1,sc.t/s.cam.dur), e=k*k*(3-2*k);
    cam.pos.copy(sc.p0).lerp(_a.fromArray(s.cam.p1),e); cam.look.copy(sc.l0).lerp(_a.fromArray(s.cam.l1),e);
    if(k>=1) nextStep();
  }
  else if(sc.t>=(s.wait||0)) nextStep();
}

// The opening: the letter, the empty Hall, the Ghost Writer, and a voice from the floor.
function playIntro(){
  runScene([
    {letter:true},
    {fn(){ sfx.door(); }},
    {cam:{p0:[0,9.5,-21],l0:[0,3,10],p1:[0,5,6],l1:[0,2,25],dur:4.2}},
    {fn(){ ghostG.visible=true; }},
    {cam:{p1:[0,4.4,-15.5],l1:[0,3.4,-27],dur:1.8}},
    {talk:['The Ghost Writer','History belongs to whoever signs it. And I signed all of it.','ghost'],sfx:sfx.laugh},
    {fn(){ ghostG.visible=false; sfx.door(); }},
    {cam:{p1:[2.4,1.7,22.6],l1:[0,0.6,19],dur:1.4}},
    {talk:['A voice from the floor','Nova. Down here. Pick me up.']},
    {fn(){ setHint(HINT_CART); }}
  ]);
}
function curatorScene(){
  runScene([
    {fn(){ hub.cart.visible=false; nova.pack.visible=!nova.model; P.fwd=0; sfx.lock(); curatorG.visible=true; }},
    {cam:{p0:[P.p.x+3.5,2.4,P.p.z+5.5],l0:[3.4,1.3,21],p1:[P.p.x+3,2.2,P.p.z+5],l1:[3.6,1.2,21.2],dur:0.6}},
    {talk:['The Curator','I am the Curator of this Hall. He locked me inside that cartridge and painted over every name on these walls. What you see is only my light.']},
    {talk:['The Curator','Each painting is a door to the moment the work was done. Go in, win back the Seal of Record, and the name returns.']},
    {talk:['The Curator','Start with Dr. Gladys West. Hers is the painting still glowing. If you meet a Blot, punch it or stomp it.']},
    {fn(){ save.intro=true; persist(); hub.refresh(); setHint(hubHint()); }}
  ]);
}

/* ---------- flow ---------- */
let warp=null, cardT=0, fadeT=0;
function flash(){ $('fade').classList.add('on'); fadeT=0.16; }
function startGame(){
  if(mode!=='title') return;
  initAudio(); document.body.classList.add('playing'); $('title').classList.add('off');
  if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();
  if(save.intro) mode='play'; else playIntro();
}
// mission select: the three seals of the painting you touched
let selSlot=null, selI=0, selPrevY=0;
function enterPainting(s){
  mode='select'; selSlot=s; P.fwd=0; selI=0;
  const names=MISSIONS[s.key], box=$('selList'); box.innerHTML=''; let picked=false;
  $('selName').textContent=INV[s.key].name; $('selWorld').textContent=s.to().intro.title;
  names.forEach((n,i)=>{
    const done=!!save.seals[s.key+'m'+(i+1)], open=i===0||!!save.seals[s.key+'m'+i];
    if(open&&!done&&!picked){ selI=i; picked=true; }
    const b=document.createElement('button'); b.type='button'; b.className='btn selbtn'+(done?' done':''); b.disabled=!open;
    b.textContent=(i+1)+' \u00b7 '+n+(done?'  \u2713':(open?'':'  (locked)'));
    b.addEventListener('click',()=>{ if(mode==='select') chooseMission(i); }); box.appendChild(b);
  });
  markSel(); $('select').classList.add('on');
}
function markSel(){ const bs=$('selList').children; for(let i=0;i<bs.length;i++) bs[i].classList.toggle('cur',i===selI); }
function chooseMission(i){
  $('select').classList.remove('on'); const s=selSlot, w=s.to(); w.mission=i;
  w.intro.mission='Mission '+(i+1)+' \u00b7 '+MISSIONS[s.key][i];
  mode='warp'; warp={t:0,to:w,slot:s,swapped:false}; hub.ripple(s); sfx.warp();
}
function cancelSelect(){ $('select').classList.remove('on'); mode='play'; P.p.x=selSlot.side*(HX-2.6); P.face.set(-selSlot.side,0,0); }
function updateSelect(){
  if(inp.pausePressed){ cancelSelect(); return; }
  const bs=$('selList').children, dy=inp.y>0.5?1:(inp.y<-0.5?-1:0);
  if(dy&&dy!==selPrevY){ let j=selI; do{ j=(j-dy+bs.length)%bs.length; }while(bs[j].disabled&&j!==selI); selI=j; markSel(); }
  selPrevY=dy;
  if(inp.jumpPressed&&!bs[selI].disabled) chooseMission(selI);
}
function leaveForHall(){ mode='warp'; warp={t:0.5,to:hub,slot:world.slot||null,swapped:false}; }
function whiteOut(){ mode='warp'; warp={t:0.4,to:world,again:true,swapped:false}; toast('Whited out',2); }
function updateWarp(dt){
  warp.t+=dt;
  if(!warp.swapped){
    if(warp.to!==hub&&!warp.again){ P.p.x+=warp.slot.side*1.3*dt; nova.root.scale.setScalar(Math.max(0.05,1-warp.t*1.2)); }   // pulled into the painting
    if(warp.t>0.55) $('fade').classList.add('on');
    if(warp.t>0.95){
      warp.swapped=true; nova.root.scale.setScalar(1); P.hp=6; P.invuln=0; P.box=null;
      if(warp.again) world.respawn();
      else if(warp.to===hub){ setWorld(hub); hub.spawn(warp.slot); }
      else { setWorld(warp.to); world.slot=warp.slot; world.spawn(); showIntro(world.intro); }
      updateHud(); cam.snap=true; $('fade').classList.remove('on');
    }
  } else if(warp.t>1.3){ mode='play'; warp=null; }
}
function collectSeal(key){
  if(mode!=='play') return;
  save.seals[key]=true; persist(); updateHud(); hub.refresh(); sfx.seal();
  const n=sealsFor(world.key); world.case.set(n);
  if(n===3){ freeScene(world); return; }
  mode='card'; cardT=0; sealCard(world,n);
}
function awardBonus(w){ save.seals[w.key+'r']=true; persist(); updateHud(); hub.refresh(); sfx.seal(); toast('100 Royalties. Seal of Record earned.',3.5); }
function closeCard(){ if(mode!=='card') return; $('card').classList.remove('on'); leaveForHall(); }
function setPause(on){
  if(on&&mode!=='play') return; if(!on&&mode!=='pause') return;
  mode=on?'pause':'play'; $('help').classList.toggle('on',on); $('hallBtn').hidden=world===hub;
}
$('startBtn').addEventListener('click',startGame);
$('cardBtn').addEventListener('click',closeCard);
$('endBtn').addEventListener('click',finishEnding);
$('endName').addEventListener('keydown',e=>{ if(e.key==='Enter') finishEnding(); e.stopPropagation(); });
$('resumeBtn').addEventListener('click',()=>setPause(false));
$('hallBtn').addEventListener('click',()=>{ if(mode!=='pause') return; $('help').classList.remove('on'); leaveForHall(); });
$('bPause').addEventListener('click',()=>setPause(true));
$('talk').addEventListener('pointerdown',()=>{ advance=true; });
$('letterBtn').addEventListener('click',()=>{ advance=true; });
$('skipBtn').addEventListener('click',()=>{ if(sc) skipScene(); });
$('helpControls').innerHTML=$('controls').innerHTML;

function tick(dt){
  if(mode!=='pause') time+=dt;
  if(mode==='title'){ if(inp.jumpPressed) startGame(); else { world.up(P.p,up); cam.fwd.applyAxisAngle(up,0.12*dt); } }
  else if(mode==='play'){
    if(inp.pausePressed) setPause(true);
    else { updatePlayer(dt); if(mode==='play') updateThings(dt); if(mode==='play') world.logic(dt); }
  }
  else if(mode==='scene') updateScene(dt);
  else if(mode==='select') updateSelect();
  else if(mode==='pause'){ if(inp.pausePressed||inp.jumpPressed) setPause(false); }
  else if(mode==='warp') updateWarp(dt);
  else if(mode==='card'){ cardT+=dt; if(cardT>0.7&&inp.jumpPressed) closeCard(); }
  if(mode!=='pause') world.animate(dt,time);
  updateCamera(dt); animatePlayer(dt,time); updateFx(dt);
  if(toastT>0){ toastT-=dt; if(toastT<=0) $('toast').classList.remove('on'); }
  if(moveT>0){ moveT-=dt; if(moveT<=0) $('moveTag').classList.remove('on'); }
  if(flashT>0){ flashT-=dt; if(flashT<=0) $('hint').textContent=hintBase; }
  if(introT>0){ introT-=dt; if(introT<=0) $('intro').classList.remove('on'); }
  if(fadeT>0){ fadeT-=dt; if(fadeT<=0&&!warp) $('fade').classList.remove('on'); }
  clearEdges();
}

// test hooks: lets a script drive the game one frame at a time
const BP=window.BP={arena:arena,startArena:startArena,caution:caution,lightsOn:lightsOn,thirdRail:thirdRail,immortal:immortal,blackwell:blackwell,greenwood:greenwood,chooseMission:chooseMission,sealsFor:sealsFor,P:P,inp:inp,cam:cam,tick:tick,hub:hub,planet:planet,soundcheck:soundcheck,save:save,atk:atk,manual:false,
  get mode(){return mode;},get world(){return world.name;},get w(){return world;},get sc(){return sc;}};
let last=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=clamp((now-last)/1000,0.001,0.033); last=now;
  if(!BP.manual){ readInput(); tick(dt); }
  renderer.render(scene,camera);
}
function boot(data){
  let s=data&&(data.seals||data.seal)?data:null;
  if(!s){ try{ s=JSON.parse(localStorage.getItem('blueprint-save')||'null'); }catch(e){} }
  if(s){
    if(s.seals) Object.assign(save.seals,s.seals);
    if(s.seal) save.seals.w1m1=true;                    // a save from the first build
    if(s.intro||s.seal) save.intro=true;
    if(s.name) save.name=s.name;
  }
  nova.pack.visible=save.intro; curatorG.visible=save.intro; if(s&&s.name){ save.name=s.name; hub.setFinalName(s.name); }
  setWorld(hub); hub.spawn(null); hub.refresh(); updateHud();
  requestAnimationFrame(frame);
}
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot) hot.snapshot(()=>({seals:save.seals,intro:save.intro,name:save.name}));
if(hot&&hot.ready) hot.ready(boot); else boot((hot&&hot.data)||{});
