'use strict';
/* ---------- the Hall's roster: which painting leads where, when it opens, and what its plaque says ---------- */
(function(){
  function art(draw){ return tex(256,256,(c,W,H)=>{ draw(c,W,H); }); }
  const arts={
    w3:art((c,W,H)=>{ c.fillStyle='#3a4048'; c.fillRect(0,0,W,H); c.fillStyle='#8a8478'; for(let i=0;i<6;i++){ c.globalAlpha=0.35; c.beginPath(); c.arc(40+i*36,200-i*8,40,0,7); c.fill(); } c.globalAlpha=1;
      c.fillStyle='#1d1f24'; c.fillRect(100,40,56,150); c.fillRect(124,190,8,60); ['#ff3344','#f4b731','#35ff7a'].forEach((k,i)=>{ c.fillStyle=k; c.beginPath(); c.arc(128,70+i*45,17,0,7); c.fill(); }); }),
    w4:art((c,W,H)=>{ c.fillStyle='#05070f'; c.fillRect(0,0,W,H); const gr=c.createRadialGradient(128,110,5,128,110,110); gr.addColorStop(0,'rgba(255,225,140,.9)'); gr.addColorStop(1,'rgba(255,225,140,0)'); c.fillStyle=gr; c.fillRect(0,0,W,H);
      c.strokeStyle='#dfe5ee'; c.lineWidth=4; c.beginPath(); c.arc(128,105,48,0,7); c.stroke(); c.fillStyle='#8d95a3'; c.fillRect(108,150,40,34); c.strokeStyle='#f4b731'; c.lineWidth=3; c.beginPath(); c.moveTo(110,120); c.bezierCurveTo(118,80,138,80,146,120); c.stroke();
      c.strokeStyle='rgba(220,233,255,.35)'; c.lineWidth=1; for(let i=0;i<W;i+=16){ c.beginPath(); c.moveTo(i,200); c.lineTo(i,256); c.stroke(); } }),
    w5:art((c,W,H)=>{ c.fillStyle='#8fb4d8'; c.fillRect(0,0,W,H); c.fillStyle='#7a6a58'; c.fillRect(0,170,W,86); c.fillStyle='#9aa3b2'; c.fillRect(0,196,W,4); c.fillRect(0,214,W,4);
      c.fillStyle='#2a2f38'; c.fillRect(20,120,90,64); c.fillRect(30,96,22,30); c.fillStyle='#8a2b2b'; c.fillRect(146,120,90,64); c.fillStyle='#f4b731'; c.beginPath(); c.moveTo(128,80); c.lineTo(118,118); c.lineTo(132,112); c.lineTo(122,150); c.lineTo(146,104); c.lineTo(132,110); c.closePath(); c.fill(); }),
    w6:art((c,W,H)=>{ c.fillStyle='#2a0f24'; c.fillRect(0,0,W,H); [[90,100,50],[160,90,40],[130,170,56],[60,190,30],[200,170,32]].forEach(p=>{ const gr=c.createRadialGradient(p[0],p[1],2,p[0],p[1],p[2]); gr.addColorStop(0,'#ffd1e3'); gr.addColorStop(0.6,'#e88aa8'); gr.addColorStop(1,'rgba(232,138,168,0)'); c.fillStyle=gr; c.beginPath(); c.arc(p[0],p[1],p[2],0,7); c.fill(); c.fillStyle='#8a2b5a'; c.beginPath(); c.arc(p[0],p[1],p[2]*0.25,0,7); c.fill(); }); }),
    w7:art((c,W,H)=>{ c.fillStyle='#02080a'; c.fillRect(0,0,W,H); c.strokeStyle='#1fe39a'; c.lineWidth=2; for(let i=0;i<9;i++){ c.beginPath(); c.moveTo(0,20+i*26); c.lineTo(60+i*8,20+i*26); c.lineTo(80+i*8,40+i*20); c.stroke(); }
      c.fillStyle='#1a1f26'; c.fillRect(70,80,116,96); c.strokeStyle='#35ff7a'; c.lineWidth=3; c.strokeRect(70,80,116,96); for(let i=0;i<6;i++){ c.fillStyle='#9aa3b2'; c.fillRect(78+i*18,72,8,8); c.fillRect(78+i*18,176,8,8); } }),
    w8:art((c,W,H)=>{ const gr=c.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#f2c89a'); gr.addColorStop(1,'#e88a5a'); c.fillStyle=gr; c.fillRect(0,0,W,H);
      c.fillStyle='#f4b731'; c.beginPath(); c.arc(128,150,46,Math.PI,0); c.fill(); [[0,60,110],[60,40,130],[100,56,96],[156,46,124],[202,54,104]].forEach((b,i)=>{ c.fillStyle=['#9a5a3a','#6b3a2a','#2b4a7a','#8a6a3a','#7a2a3a'][i]; c.fillRect(b[0],256-b[2],b[1],b[2]); c.fillStyle='#f4b731'; c.fillRect(b[0]+6,256-b[2]+10,b[1]-12,10); }); c.fillStyle='#8a7a66'; c.fillRect(0,236,W,20); })
  };
  const plaques={w3:['GARRETT A. MORGAN','Safety hood and traffic signal'],w4:['LEWIS H. LATIMER','Carbon filament and patent drawings'],w5:['GRANVILLE T. WOODS','Railway telegraph'],
    w6:['HENRIETTA LACKS','Her cells changed medicine'],w7:['DR. DAVID BLACKWELL','Probability and game theory'],w8:['VIOLA FORD FLETCHER','Survivor and witness, Greenwood']};
  const to={w3:()=>caution,w4:()=>lightsOn,w5:()=>thirdRail,w6:()=>immortal,w7:()=>blackwell,w8:()=>greenwood};
  const need={w3:4,w4:7,w5:10,w6:13,w7:16,w8:19};
  for(const s of hub.slots){ if(!to[s.key]) continue; s.to=to[s.key]; s.need=need[s.key]; s.art=arts[s.key]; s.plaque=hub.plaqueTex(plaques[s.key][0],plaques[s.key][1]); }
})();
