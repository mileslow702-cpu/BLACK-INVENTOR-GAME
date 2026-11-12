'use strict';
/* ---------- HUD helpers, save data, hint text ---------- */
const MOVES={jump:'Jump',double:'Double jump',triple:'Triple jump',backflip:'Backflip',sideflip:'Side flip',long:'Long jump',wallkick:'Wall kick',
  rollout:'Rollout',dive:'Dive',pound:'Ground pound',punch:'Punch',kick:'Kick',jumpkick:'Jump kick',ledge:'Ledge grab',stomp:'Stomp'};
let hintBase='',flashT=0,toastT=0,moveT=0,introT=0;
function setHint(t){ hintBase=t; flashT=0; $('hint').textContent=t; }
function flashHint(t){ $('hint').textContent=t; flashT=2.5; }
function toast(t,secs){ $('toast').textContent=t; $('toast').classList.add('on'); toastT=secs||2.4; }
function showMove(k){ $('moveTag').textContent=MOVES[k]||k; $('moveTag').classList.add('on'); moveT=1.3; }
function showIntro(o){ $('introEyebrow').textContent=o.eyebrow; $('introTitle').textContent=o.title; $('introMission').textContent=o.mission; $('intro').classList.add('on'); introT=3.6; }

// seals are keyed per world: w1m1 = world 1 mission 1, w1r = world 1's 100 Royalties
const save={seals:{},intro:false};
function persist(){ try{ localStorage.setItem('blueprint-save',JSON.stringify(save)); }catch(e){} }
function sealCount(){ return Object.keys(save.seals).length; }
function updateHud(){
  $('sealCount').textContent=sealCount();
  const pips=$('hp').children; for(let i=0;i<pips.length;i++) pips[i].className=i<P.hp?'':'off';
  const show=!!(world&&world.key); $('coinTag').hidden=!show; if(show) $('coinCount').textContent=world.coinCount;
}

const HIT=isTouch?'HIT':'F';
const HINT_CART='Walk to the glowing cartridge.';
const HINT_HUB='Jump into the glowing painting. Blots pop when you punch ('+HIT+') or stomp them.';
const HINT_HUB_SOME='Every painting holds three seals. Melt all three to free the inventor. Walk up to a freed inventor and press '+HIT+' to talk.';
const HINT_HUB_DONE='Dr. Gladys West and James E. West are free. Six more are still behind glass.';
const HINT_PLANET=isTouch?'Find the three red buttons. Jump, then tap CROUCH in the air to ground-pound each one.':'Find the three red buttons. Jump, then press Shift in the air to ground-pound each one.';
const HINT_ONLINE='GPS is back. The Seal of Record is on top of the red and white tower. A backflip gets you up the last step.';
const HINT_W2='Punch a speaker ('+HIT+'). Its sound bars turn solid while it rings.';
const HINT_W2_STAGE='The mic is buried in White-Out. Punch or stomp all three gobs.';
const HINT_W2_LIVE='The mic is live. The Seal of Record is on top of the speaker stack. Jump at the edge and she will grab it.';
