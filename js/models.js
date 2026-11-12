'use strict';
/* ---------- Higgsfield models: load, size, place ---------- */
// Each model is sized to a height in meters, feet on the ground, facing +z. If a file fails to load, the block figure stays.
const MODELS=window.MODELS||{};
function prepModel(o,height){
  o.traverse(m=>{
    if(!m.isMesh) return;
    const old=m.material, map=old&&old.map;
    m.material=new T.MeshLambertMaterial({map:map||null,color:map?0xffffff:(old&&old.color?old.color.getHex():0xcccccc),skinning:!!m.isSkinnedMesh});
    if(map) map.encoding=T.LinearEncoding;
    m.frustumCulled=false;
  });
  const g=new T.Group(); g.add(o);
  let skin=null; o.traverse(m=>{ if(m.isSkinnedMesh&&!skin) skin=m; });
  if(skin){
    // a rigged model renders through its bones, so leave its own transforms alone and scale the wrapper
    skin.geometry.computeBoundingBox(); const bb=skin.geometry.boundingBox;
    g.scale.setScalar(height/Math.max(1e-6,bb.max.y-bb.min.y)); return g;
  }
  const b=new T.Box3().setFromObject(o), s=height/Math.max(1e-6,b.max.y-b.min.y); o.scale.multiplyScalar(s);
  o.updateMatrixWorld(true); b.setFromObject(o); const c=b.getCenter(new V3());
  o.position.x-=c.x; o.position.y-=b.min.y; o.position.z-=c.z;
  return g;
}
// Models ship as small script files (base64 GLB), so they work on any host that serves .js.
function loadModel(name,file,height,done){
  if(!T.GLTFLoader) return;
  const sc=document.createElement('script'); sc.src='models/'+file.replace('.glb','.js');
  sc.onload=()=>{
    const b64=window.GLB&&window.GLB[file]; if(!b64) return;
    const bin=atob(b64), buf=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
    delete window.GLB[file];
    new T.GLTFLoader().parse(buf.buffer,'',gl=>{ const g=prepModel(gl.scene,height); MODELS[name]=g; done(g,gl); },()=>{});
  };
  document.head.appendChild(sc);
}

/* Nova: the rigged model rides the block figure's body, so flips, squash and lean still apply.
   Her arm and leg bones copy the swing the block limbs would have had. */
const novaBones=[];
const _qa=new T.Quaternion(), _qb=new T.Quaternion(), _ax=new V3();
function findBone(root,re,not){ let f=null; root.traverse(o=>{ if(!f&&o.isBone&&re.test(o.name)&&!(not&&not.test(o.name))) f=o; }); return f; }
loadModel('nova','nova.glb',1.62,(g)=>{
  nova.body.children.forEach(c=>{ c.visible=c===nova.pack&&false; });
  nova.pack.visible=false;
  const holder=new T.Group(); holder.position.y=-0.85; holder.add(g); nova.body.add(holder);
  const pairs=[[/left.*(arm|shoulder)/i,nova.armL],[/right.*(arm|shoulder)/i,nova.armR],[/left.*(up.*leg|thigh)/i,nova.legL],[/right.*(up.*leg|thigh)/i,nova.legR]];
  for(const p of pairs){ const b=findBone(g,p[0],/fore|hand|lower|shoulder/i)||findBone(g,p[0]); if(b) novaBones.push({b:b,src:p[1],rest:b.quaternion.clone()}); }
  nova.model=g;
});
function driveNovaBones(){
  if(!novaBones.length) return;
  nova.root.updateMatrixWorld(true);
  nova.body.getWorldQuaternion(_qa);
  for(const nb of novaBones){
    nb.b.parent.getWorldQuaternion(_qb);
    _ax.set(1,0,0).applyQuaternion(_qa).applyQuaternion(_qb.invert());            // the body's side-to-side axis, in the bone's parent space
    nb.b.quaternion.setFromAxisAngle(_ax,nb.src.rotation.x*0.85).multiply(nb.rest);
  }
}

/* Blot Troopers get the model; until it loads they show a tall white block */
loadModel('trooper','trooper.glb',2.0,(g)=>{ for(const b of TROOPERS) attachTrooper(b); });

/* The Curator stands in the Hall once you have the cartridge; the Ghost Writer appears in the opening */
const curatorG=new T.Group(); curatorG.visible=false; hub.group.add(curatorG); curatorG.position.set(4.2,0,21.5); curatorG.rotation.y=-0.5;
loadModel('curator','curator.glb',1.75,(g)=>{ curatorG.add(g); curatorG.remove(curatorStand); });
const curatorStand=makeFigure({skin:0x5a3820,top:0xa8461f,bottom:0x6b6b2a,hair:0xd98a1a},false,true); curatorG.add(curatorStand);
const ghostG=new T.Group(); ghostG.visible=false; hub.group.add(ghostG); ghostG.position.set(0,1.6,-27);
loadModel('ghost','ghostwriter.glb',3.4,(g)=>{ ghostG.add(g); });
