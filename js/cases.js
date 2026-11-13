'use strict';
/* ---------- the inventors, their glass cases and wax seals ---------- */
// Figures are placeholders until the families' reference photos go through Higgsfield. Lines are drafts for family review.
const INV={
  w1:{name:'Dr. Gladys West',woman:true,fig:{skin:0x6b4226,top:0x2e7d6b,bottom:0x3b3b5c,hair:0x2a1d17},
    seals:['Her name left out of the GPS story','Even her own children did not know what she had done','Unknown to the public until 2018'],
    talk:['I grew up on a farm in Dinwiddie County, Virginia. School was my way out.',
          'In 1956 I started at Dahlgren as a mathematician. I stayed 42 years.',
          'I programmed the computers that worked out the true shape of the Earth. That model is part of how GPS finds you.',
          'Me? I still like a paper map.']},
  w2:{name:'James E. West',fig:{skin:0x5a3820,top:0xe8e8e8,bottom:0x2b2b38,hair:0x1a1210},
    seals:['His name missing from the mics in our pockets','Black engineers held back from promotion','Hardly anyone knows who he is'],
    talk:['I was born in 1931, in Prince Edward County, Virginia.',
          'I started at Bell Labs as a summer intern while I studied physics at Temple.',
          'In 1962 Gerhard Sessler and I made the electret microphone. Most microphones made today work that way.',
          'At Bell Labs I helped start ABLE, so Black engineers would get placed and promoted fairly.']},
  w3:{name:'Garrett A. Morgan',fig:{skin:0x5e3b22,top:0x5b4636,bottom:0x2b2620},
    seals:['Early news reports played down his part in the rescue','He did not get proper credit for the hood because of his race','The government honored him only near the end of his life'],
    talk:['I patented my safety hood in 1914 and showed it at safety exhibitions.','In 1916 a tunnel under Lake Erie exploded. My brother Frank and I went down in our hoods and brought men out.','After I saw a bad crash at an intersection, I patented a traffic signal in 1923. General Electric bought the rights for $40,000.','That same year as the rescue, I started a newspaper, the Cleveland Call.']},
  w4:{name:'Lewis H. Latimer',fig:{skin:0x6b4428,top:0x2d2a3a,bottom:0x23212b},
    seals:['His drawings went out under other men\u2019s names','The light bulb story told with one name','Paid less than the draftsman before him'],
    talk:['I taught myself mechanical drawing while I worked as an office boy at a patent law firm.','In 1876 I drew the patent drawings for Alexander Graham Bell\u2019s telephone, working late into the night.','In 1882 I patented a better way to make carbon filaments, so electric light could last.','Edison\u2019s company hired me in 1884. I was the only Black member of the Edison Pioneers.']},
  w5:{name:'Granville T. Woods',fig:{skin:0x4e301c,top:0x3a2d22,bottom:0x24201b},
    seals:['Edison claimed his telegraph as his own','Taken to court twice over his own patent','Remembered as \u201cthe Black Edison\u201d instead of by his own name'],
    talk:['I was born in Columbus, Ohio, in 1856, and learned my trade on the job.','In 1887 I patented a telegraph that let moving trains send messages, so they could avoid collisions.','Thomas Edison took me to court over it. I won, and I won again.','Then he offered me a job. I said no. I wanted to keep control of my own inventions.']},
  w6:{name:'Henrietta Lacks',speaker:'The Curator',woman:true,fig:{skin:0x6b4428,top:0x8a3b52,bottom:0x4a2a36},
    seals:['Cells taken without asking her','Her name cut down to four letters: HeLa','Her family kept in the dark for more than twenty years'],
    talk:['Henrietta Lacks was a mother of five. In 1951 doctors at Johns Hopkins took cells from her tumor without asking her.','Her cells kept dividing. Scientists used them for the polio vaccine, gene mapping and COVID-19 vaccines.','In 2023, on what would have been her 103rd birthday, her family reached a settlement with a company that profited from her cells.','Her name is Henrietta Lacks. Say it whole.']},
  w7:{name:'Dr. David Blackwell',fig:{skin:0x5e3b22,top:0x3d4a5c,bottom:0x262b33},
    seals:['Kept out of Princeton\u2019s lectures because of his race','Turned away by Berkeley the first time','Had to write to 104 Black colleges to find work'],
    talk:['I was born in 1919 in Centralia, Illinois, and fell in love with mathematics.','At the Institute for Advanced Study, I was kept out of Princeton\u2019s lectures because I was Black.','I wrote to 104 Black colleges looking for work. Later I became the first Black tenured professor at Berkeley.','I studied probability and game theory, and I was the first Black member of the National Academy of Sciences.']},
  w8:{name:'Mother Viola Ford Fletcher',woman:true,fig:{skin:0x6b4428,top:0x6a4a8a,bottom:0x3e2f52},
    seals:['For decades they called it a riot','Greenwood paved over and left out of the story','No justice from the city in her lifetime'],
    talk:['I was seven years old, living in Greenwood with my family, when it began on May 31, 1921.','My mother woke us up and we ran. We lost everything but the clothes we had on.','At 107, I told my story to Congress.','In 2023 I wrote my memoir, so they could not bury my story.']}
};
const MISSIONS={
  w1:['Bring GPS back online','Map the true shape','Race the satellite'],
  w2:['Turn the mic back on','Find the lost frequencies','The live show'],
  w3:['Through the smoke','Three signals','The Smokestack'],
  w4:['Light the street','Draw the bridge','Testify'],
  w5:['Signal ahead','The first case','The second case'],
  w6:['Gather the vials','Write her name','Home for her birthday'],
  w7:['Read the odds','Collect the data','Light the chip'],
  w8:['Uncover Greenwood Avenue','Above the flood','Her testimony']
};
const CURATOR_TIPS=['Each painting holds three seals. Melt all three and the glass breaks.',
  'A Blot Trooper splatters when you hit it. Hit the puddle again before it stands back up.',
  'Every name you free makes this Hall a little brighter.'];
function sealsFor(key){ return (save.seals[key+'m1']?1:0)+(save.seals[key+'m2']?1:0)+(save.seals[key+'m3']?1:0); }

const statueM=lam(0xf3efe6);
function makeFigure(c,statue,woman){
  const root=new T.Group(), M=x=>statue?statueM:lam(x);
  const skin=M(c.skin), top=M(c.top), bot=M(c.bottom), hair=M(c.hair||0x1a1210), shoe=M(0x1f1f24);
  mesh(new T.BoxGeometry(0.56,0.62,0.34),top,root,0,1.03,0);
  mesh(flat(new T.IcosahedronGeometry(0.25,1)),skin,root,0,1.57,0.03);
  mesh(flat(new T.IcosahedronGeometry(0.27,1)),hair,root,0,1.68,-0.05);
  if(woman) mesh(flat(new T.CylinderGeometry(0.3,0.42,0.5,8)),bot,root,0,0.52,0);
  else mesh(new T.BoxGeometry(0.58,0.14,0.36),bot,root,0,0.68,0);
  for(const sx of [-1,1]){
    mesh(new T.BoxGeometry(0.15,0.48,0.15),top,root,sx*0.37,1.06,0); mesh(new T.BoxGeometry(0.14,0.14,0.14),skin,root,sx*0.37,0.76,0);
    mesh(new T.BoxGeometry(0.2,woman?0.3:0.55,0.22),woman?skin:bot,root,sx*0.15,woman?0.2:0.36,0); mesh(new T.BoxGeometry(0.22,0.12,0.34),shoe,root,sx*0.15,0.06,0.06);
  }
  return root;
}
const caseCardT=tex(256,64,(c,W,H)=>{ c.fillStyle='#f1e8d4'; c.fillRect(0,0,W,H); c.fillStyle='#1b2440'; c.font='bold 26px Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('ARTIST UNKNOWN',W/2,H/2+1); },true);
const glassM=new T.MeshLambertMaterial({color:0xcfe8ff,transparent:true,opacity:0.3,depthWrite:false});
const waxM=lam(0xb3122e,{emissive:0x3a0610}), caseBaseM=lam(0x2a2f38), caseTrimM=lam(0xc9a24a);
// A statue in a glass case with three wax seals. Front is +z.
function makeCase(parent,inv){
  const g=new T.Group(); parent.add(g);
  mesh(new T.BoxGeometry(1.7,0.3,1.7),caseBaseM,g,0,0.15,0);
  const statue=makeFigure(inv.fig,true,inv.woman); statue.position.y=0.3; g.add(statue);
  const live=makeFigure(inv.fig,false,inv.woman); live.position.y=0.3; live.visible=false; g.add(live);
  const shell=new T.Group(); g.add(shell);
  mesh(new T.BoxGeometry(1.5,2.3,1.5),glassM.clone(),shell,0,1.45,0);
  mesh(new T.BoxGeometry(1.6,0.12,1.6),caseTrimM,shell,0,2.66,0);
  for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(new T.BoxGeometry(0.08,2.3,0.08),caseTrimM,shell,sx*0.75,1.45,sz*0.75);
  const card=mesh(new T.PlaneGeometry(1.2,0.3),bas(0xffffff,{map:caseCardT}),shell,0,0.15,0.86);
  const seals=[-0.42,0,0.42].map(x=>{ const m=mesh(new T.CylinderGeometry(0.17,0.17,0.06,10),waxM,shell,x,1.95,0.78); m.rotation.x=Math.PI/2; return m; });
  const c={g:g,statue:statue,live:live,shell:shell,open:false,
    set(n){ seals.forEach((m,i)=>{ m.visible=i>=n; }); shell.children[0].material.opacity=0.3+0.1*n; },
    free(){ c.open=true; shell.visible=false; statue.visible=false; live.visible=true; },
    lock(){ c.open=false; shell.visible=true; statue.visible=true; live.visible=false; }
  };
  return c;
}
function fullCard(w){
  const c=w.card;
  $('cardEyebrow').textContent='Free at last'; $('cardNum').textContent=c.n; $('cardName').textContent=c.name; $('cardYears').textContent=c.years; $('cardP1').textContent=c.p1; $('cardP2').textContent=c.p2;
  $('card').classList.add('on');
}
function sealCard(w,n){
  const inv=INV[w.key];
  $('cardEyebrow').textContent='Seal '+n+' of 3 melted'; $('cardNum').textContent=n; $('cardName').textContent=inv.name;
  $('cardYears').textContent='The seal read:'; $('cardP1').textContent='“'+inv.seals[n-1]+'.”';
  $('cardP2').textContent=n===2?'One seal still holds the glass.':'Two seals still hold the glass.';
  $('card').classList.add('on');
}
function freeScene(w){
  const c=w.case.g.getWorldPosition(new V3()); w.up(c,_u2);
  const f=tangent(new V3().copy(P.p).sub(c),_u2);
  const p1=c.clone().addScaledVector(_u2,2.4).addScaledVector(f,4.6), l1=c.clone().addScaledVector(_u2,1.3);
  const inv=INV[w.key];
  runScene([
    {cam:{p0:cam.pos.toArray(),l0:cam.look.toArray(),p1:p1.toArray(),l1:l1.toArray(),dur:1.3}},
    {wait:0.4},
    {fn(){ w.case.free(); sfx.pound(); sfx.seal(); shake=0.4; dust(12,5,c); if(w.restore) w.restore(1); }},
    {wait:1.1},
    {talk:[inv.speaker||inv.name,inv.talk[0]]},
    {talk:['The Curator','Your name is back where it belongs. Come home to the Hall.']}
  ],()=>{ mode='card'; cardT=0; fullCard(w); });
}
function talkTo(key){
  const inv=INV[key];
  runScene(inv.talk.map(t=>({talk:[inv.speaker||inv.name,t]})));
}
