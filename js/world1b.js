'use strict';
/* ---------- world 1 extras: story, Royalties, Blots ---------- */
Object.assign(planet,{key:'w1',hitTop:Infinity,things:{coins:[],blots:[]},coinCount:0,mission:true,
  intro:{eyebrow:'World 01 · Dahlgren, Virginia',title:'The Shape of the Earth',mission:'Mission 1 · Bring GPS back online'},
  card:{n:1,name:'Dr. Gladys West',years:'1930 – 2026 · Mathematician · Dahlgren, Virginia',
    p1:'She started at the Naval Proving Ground in 1956 and stayed 42 years. She programmed room-sized computers to work out the true shape of the Earth, lumps and all.',
    p2:'That model of the Earth is what lets GPS find you anywhere on the planet. Her name stayed out of the story for decades. In 2018 the Air Force inducted her into its Space and Missile Pioneers Hall of Fame.'},
  // after a white-out she comes back at the landing spot; the mission keeps its progress
  respawn(){ const d=planet.spawnDir; P.p.copy(d).multiplyScalar(R0+planet.hAt(d)); P.fwd=P.side=P.vy=0; P.state='ground'; P.lastAir=null; }
});
(function(){
  const pl=planet, v=new V3(), t=new V3(), s=new V3();
  // highest surface under a direction, so things sit on tiers and pads as well as on the ground
  function top(dir){ v.copy(dir).normalize().multiplyScalar(R0+6); return pl.ground(v,1e9); }
  function put(dir,lift){ const gy=top(dir); addRoyalty(pl,new V3().copy(v).setLength(gy+(lift||0.9))); }
  function off(dir,meters,turn){ tangent(t.set(0.3,0.5,0.8),dir); s.crossVectors(dir,t); const a=turn||0;
    return new V3().copy(dir).multiplyScalar(R0).addScaledVector(t,Math.cos(a)*meters).addScaledVector(s,Math.sin(a)*meters).normalize(); }
  function ring(dir,meters,n){ for(let i=0;i<n;i++) put(off(dir,meters,i/n*Math.PI*2)); }
  function trail(a,b,n){ for(let i=1;i<=n;i++) put(new V3().copy(a).lerp(b,i/(n+1))); }

  ring(pl.towerDir,5.6,12); ring(pl.towerDir,3.55,10); ring(pl.towerDir,2.2,8);
  pl.stations.forEach(st=>ring(st.dir,2.9,8));
  ring(pl.spawnDir,3,8);
  trail(pl.spawnDir,pl.stations[0].dir,6);
  trail(pl.stations[0].dir,pl.stations[1].dir,14);
  trail(pl.stations[1].dir,pl.stations[2].dir,14);
  trail(pl.stations[2].dir,pl.towerDir,14);

  [off(pl.stations[0].dir,6,1),off(pl.stations[1].dir,5.5,2),off(pl.stations[2].dir,5.5,4),off(pl.towerDir,8.5,0.5),off(pl.towerDir,8.5,3.6)]
    .forEach((d,i)=>{ const gy=top(d); addBlot(pl,new V3().copy(v).setLength(gy),i>=3?'trooper':'drip'); });
})();
