'use strict';
const $=id=>document.getElementById(id);
if(!window.THREE){ $('loadErr').hidden=false; throw new Error('3D library missing'); }
const T=THREE, V3=T.Vector3;
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const approach=(v,t,d)=>v<t?Math.min(t,v+d):Math.max(t,v-d);
function rng(seed){ return function(){ seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch=matchMedia('(pointer:coarse)').matches;
if(isTouch) document.body.classList.add('touch');

/* ---------- renderer ---------- */
const canvas=$('view');
let renderer;
try{ renderer=new T.WebGLRenderer({canvas:canvas,antialias:false}); }
catch(e){ $('loadErr').textContent='This browser could not start 3D graphics. Try Chrome, Safari or Edge with hardware acceleration turned on.'; $('loadErr').hidden=false; throw e; }
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(58,1,0.1,700);
const amb=new T.AmbientLight(0xffffff,0.6); scene.add(amb);
const sun=new T.DirectionalLight(0xffffff,0.6); scene.add(sun); scene.add(sun.target);
function resize(){
  const W=Math.max(1,innerWidth), H=Math.max(1,innerHeight);
  const s=Math.min(1,520/Math.min(W,H));           // chunky 64-era resolution, scaled up
  renderer.setSize(Math.round(W*s),Math.round(H*s),false);
  camera.aspect=W/H; camera.fov=clamp(2*Math.atan(0.62/camera.aspect)*180/Math.PI,58,96); camera.updateProjectionMatrix();
}
addEventListener('resize',resize); resize();

const lam=(c,o)=>new T.MeshLambertMaterial(Object.assign({color:c},o||{}));
const bas=(c,o)=>new T.MeshBasicMaterial(Object.assign({color:c},o||{}));
function flat(g){ const n=g.index?g.toNonIndexed():g; n.computeVertexNormals(); return n; }
function mesh(g,m,parent,x,y,z){ const o=new T.Mesh(g,m); o.position.set(x||0,y||0,z||0); parent.add(o); return o; }
function tex(w,h,draw,smooth){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new T.CanvasTexture(c); if(!smooth) t.magFilter=T.NearestFilter; return t; }

/* ---------- constants and scratch ---------- */
const STEP_UP=0.45, R_PLAYER=0.38, HEIGHT=1.6, MAXRUN=9.6;
const Y=new V3(0,1,0), Z=new V3(0,0,1);
const up=new V3(), right=new V3(), pright=new V3(), want=new V3(), wallN=new V3();
const _a=new V3(), _b=new V3(), _c=new V3(), _d=new V3(), _l=new V3(), _x=new V3(), _m=new T.Matrix4();
function tangent(v,u){
  v.addScaledVector(u,-v.dot(u)); let l=v.length();
  if(l<1e-5){ v.set(1,0,0).addScaledVector(u,-u.x); l=v.length(); if(l<1e-5){ v.set(0,0,1).addScaledVector(u,-u.z); l=v.length(); } }
  return v.multiplyScalar(1/l);
}
function signedAngle(a,b,u){ _c.crossVectors(a,b); return Math.atan2(_c.dot(u),a.dot(b)); }

/* ---------- input ---------- */
const keys={}, keySeen={}, keyUpLater={}, tSeen={}, tLater={};
const inp={x:0,y:0,jump:false,crouch:false,jumpPressed:false,crouchPressed:false,divePressed:false,pausePressed:false,zoomPressed:false,camX:0,camY:0};
const drag={x:0,y:0};
const touch={x:0,y:0,jump:false,crouch:false,dive:false};
let prevJump=false,prevCrouch=false,prevDive=false,prevPause=false,prevZoom=false;
addEventListener('keydown',e=>{
  keys[e.code]=true; if(!e.repeat) keySeen[e.code]=false;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0) e.preventDefault();
  if(e.code==='Enter'&&mode==='title') startGame();
});
addEventListener('keyup',e=>{ if(keySeen[e.code]===false) keyUpLater[e.code]=true; else keys[e.code]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });
function readInput(){
  let x=(keys.KeyD?1:0)-(keys.KeyA?1:0)+touch.x, y=(keys.KeyW?1:0)-(keys.KeyS?1:0)+touch.y;
  let cx=((keys.ArrowRight||keys.KeyE)?1:0)-((keys.ArrowLeft||keys.KeyQ)?1:0), cy=(keys.ArrowUp?1:0)-(keys.ArrowDown?1:0);
  let jump=!!keys.Space||touch.jump, crouch=!!(keys.ShiftLeft||keys.ShiftRight||keys.KeyC)||touch.crouch;
  let dive=!!(keys.KeyF||keys.KeyJ)||touch.dive, pause=!!(keys.Escape||keys.KeyP), zoom=!!keys.KeyX;
  let gp=null;
  try{ const pads=navigator.getGamepads?navigator.getGamepads():[]; for(let i=0;i<pads.length;i++){ if(pads[i]&&pads[i].connected){ gp=pads[i]; break; } } }catch(e){}
  if(gp){
    const dz=v=>Math.abs(v)<0.2?0:v, b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
    x+=dz(gp.axes[0]||0); y-=dz(gp.axes[1]||0); cx+=dz(gp.axes[2]||0); cy-=dz(gp.axes[3]||0);
    jump=jump||b(0); dive=dive||b(2)||b(1); crouch=crouch||b(6)||b(7)||b(4)||b(5); pause=pause||b(9); zoom=zoom||b(11);
  }
  const l=Math.hypot(x,y); if(l>1){ x/=l; y/=l; }
  inp.x=x; inp.y=y; inp.camX=clamp(cx,-1,1); inp.camY=clamp(cy,-1,1); inp.jump=jump; inp.crouch=crouch;
  if(jump&&!prevJump) inp.jumpPressed=true;
  if(crouch&&!prevCrouch) inp.crouchPressed=true;
  if(dive&&!prevDive) inp.divePressed=true;
  if(pause&&!prevPause) inp.pausePressed=true;
  if(zoom&&!prevZoom) inp.zoomPressed=true;
  prevJump=jump; prevCrouch=crouch; prevDive=dive; prevPause=pause; prevZoom=zoom;
  for(const k in keys) if(keys[k]) keySeen[k]=true;
  for(const k in keyUpLater){ keys[k]=false; delete keyUpLater[k]; }
  for(const k in touch) if(touch[k]===true) tSeen[k]=true;
  for(const k in tLater){ touch[k]=false; delete tLater[k]; }
}
function clearEdges(){ inp.jumpPressed=inp.crouchPressed=inp.divePressed=inp.pausePressed=inp.zoomPressed=false; }

// touch stick, buttons, camera drag
(function(){
  const zone=$('stickZone'), base=$('stickBase'), knob=$('stickKnob'); let sid=null,sx0=0,sy0=0;
  function moveStick(e){ let dx=(e.clientX-sx0)/50, dy=(e.clientY-sy0)/50; const l=Math.hypot(dx,dy); if(l>1){dx/=l;dy/=l;} touch.x=dx; touch.y=-dy; knob.style.transform='translate('+(dx*38)+'px,'+(dy*38)+'px)'; }
  zone.addEventListener('pointerdown',e=>{ sid=e.pointerId; sx0=e.clientX; sy0=e.clientY; try{zone.setPointerCapture(sid);}catch(_){} base.style.left=(sx0-55)+'px'; base.style.top=(sy0-55)+'px'; base.style.bottom='auto'; moveStick(e); });
  zone.addEventListener('pointermove',e=>{ if(e.pointerId===sid) moveStick(e); });
  const end=e=>{ if(e.pointerId!==sid) return; sid=null; touch.x=touch.y=0; knob.style.transform='translate(0,0)'; };
  zone.addEventListener('pointerup',end); zone.addEventListener('pointercancel',end);
  function hold(id,key){ const b=$(id); const off=()=>{ if(tSeen[key]===false) tLater[key]=true; else touch[key]=false; b.classList.remove('down'); };
    b.addEventListener('pointerdown',e=>{ e.preventDefault(); touch[key]=true; tSeen[key]=false; b.classList.add('down'); });
    b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); b.addEventListener('pointerleave',off); }
  hold('bJump','jump'); hold('bCrouch','crouch'); hold('bDive','dive');
  let did=null,lx=0,ly=0;
  canvas.addEventListener('pointerdown',e=>{ did=e.pointerId; lx=e.clientX; ly=e.clientY; try{canvas.setPointerCapture(did);}catch(_){} });
  canvas.addEventListener('pointermove',e=>{ if(e.pointerId!==did) return; drag.x+=e.clientX-lx; drag.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; });
  const endDrag=e=>{ if(e.pointerId===did) did=null; };
  canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',endDrag);
})();

/* ---------- sound (small synth blips; the real score comes later) ---------- */
let actx=null;
function initAudio(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume().catch(()=>{}); }catch(e){} }
addEventListener('pointerdown',initAudio);
function tone(f0,f1,dur,type,vol,delay){
  if(!actx||actx.state!=='running') return;
  const t=actx.currentTime+(delay||0), o=actx.createOscillator(), g=actx.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(vol||0.06,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+0.03);
}
const sfx={
  jump(){tone(330,560,.13);}, double(){tone(392,700,.15);}, triple(){tone(523,1046,.26); tone(784,1568,.2,'square',.04,.09);},
  flip(){tone(300,820,.24,'triangle',.1);}, long(){tone(260,640,.22,'sawtooth',.04);}, kick(){tone(520,940,.12);},
  dive(){tone(430,210,.18,'sawtooth',.04);}, land(){tone(140,70,.08,'triangle',.12);}, pound(){tone(170,40,.32,'triangle',.25);},
  skid(){tone(880,480,.12,'sawtooth',.02);}, lock(){[523,659,784].forEach((f,i)=>tone(f,f,.15,'square',.06,i*.09));},
  seal(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,f,.24,'square',.07,i*.11));}, warp(){tone(180,1300,.8,'sine',.12);},
  punch(){tone(220,110,.08,'square',.06);}, hurt(){tone(300,90,.3,'sawtooth',.08);}, pop(){tone(500,1200,.1,'triangle',.1);},
  coin(){tone(988,988,.06,'square',.045); tone(1319,1319,.12,'square',.045,.06);},
  laugh(){[220,196,174,155,138].forEach((f,i)=>tone(f,f*.9,.16,'sawtooth',.06,i*.15));}, door(){tone(90,60,.6,'triangle',.2);},
  ring(notes,dur){notes.forEach(f=>tone(f,f,dur,'triangle',.035));},
  crowd(){for(let i=0;i<14;i++) tone(300+Math.random()*900,200+Math.random()*900,.9,'sawtooth',.012,Math.random()*.4);},
  beat(){for(let i=0;i<16;i++){ const t=i*.25; tone(120,45,.14,'sine',.2,t); if(i%2) tone(6000,5000,.03,'square',.02,t); tone([131,131,156,175][i>>2],[131,131,156,175][i>>2],.2,'triangle',.07,t); }}
};

