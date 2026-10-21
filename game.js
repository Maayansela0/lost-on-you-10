const canvas = document.querySelector('#scene'), ctx = canvas.getContext('2d');
const $ = s => document.querySelector(s);
const overlay = $('#overlay'), dialog = $('#dialog'), keys = new Set();
const room = new Image(); room.src = '01-living-room-clean-window-v4.webp';
const character = new Image(); character.src = 'lp-walk-v1.webp';
const seatedCharacter = new Image(); seatedCharacter.src = 'lp-seated-v1.webp';
const performanceArt = new Image(); performanceArt.src = 'lp-performance-v2.webp';
const drinking = new Image(); drinking.src = 'lp-drink-v1.webp';
const cues=typeof SESSION_CUES!=='undefined'?SESSION_CUES:{beats:[],whistles:[]};
const rigParts = new Image(); rigParts.src = 'lp-cutout-parts-v1.webp';
const pouring = new Image(); pouring.src = 'lp-pour-v1.webp';
const pickLogo = new Image(); pickLogo.src = 'LP_LOGO.jpg';
const WALK_SPEED=360;
const player = {x:480,y:520,facing:1,moving:false,direction:'front',walkTime:0,travel:0};
const SESSION_SECONDS=88;
let sessionSeconds=SESSION_SECONDS;
let songClip=new Audio('living-room-session.mp3'), songURL=null;
songClip.volume=.22; songClip.preload='auto';
let songFailed=false;
songClip.addEventListener('error',()=>{songFailed=true;$('#song-status').textContent='Audio could not load. Choose a local file or continue with sound off.'});
const state = {scene:'living',started:false,pick:false,blinds:false,tag:false,wine:false,glassLevel:1,blindAmount:.5,playing:false,complete:false,sound:true};
let action=null,feedback=null,customTrack=false;
let time=0,last=0,target=null,afterWalk=null,playTime=0,audio=null;
const livingObjects = [
 {id:'armchair',label:'Sit in the armchair and rest',x:984,y:346,standX:935,standY:540,size:[145,165],repeatable:true},
 {id:'bottle',label:'Refill the wine glass',x:803,y:280,standX:810,standY:465},
 {id:'wine',label:'Drink the red wine',x:771,y:303,standX:775,standY:465},
 {id:'cushion',label:'Collect the guitar pick',x:310,y:300,standX:310,standY:465},
 {id:'window',label:'Open the blinds',x:820,y:160,standX:845,standY:465},
 {id:'instrument',label:'Inspect the instrument',x:620,y:370,standX:640,standY:470},
 {id:'exit',label:'To the home bar',x:1030,y:390,standX:1000,standY:480}
];
const barRoom = new Image(); barRoom.src='03-home-bar.webp';
const wallpaper=new Image();wallpaper.src='wallpaper-dense-v2.webp';
const orsonHead=new Image();orsonHead.src='orson-head-v1.webp';
const orsonHeads=[{x:128,y:173,w:35,a:-.24},{x:407,y:91,w:33,a:.3},{x:764,y:213,w:37,a:-.2},{x:293,y:405,w:34,a:.17},{x:993,y:445,w:34,a:-.3},{x:579,y:304,w:36,a:.25},{x:899,y:122,w:32,a:-.18},{x:461,y:487,w:35,a:.28},{x:91,y:475,w:37,a:.14},{x:696,y:469,w:33,a:-.32}];
const orsonFound=new Set();
const barState={cork:false,coaster:false,level:0,complete:false};
const barObjects=[
 {id:'bar-dog-bed',repeatable:true,label:'Call Orson to his bed',x:250,y:530,standX:350,standY:550,size:[130,58]},
 {id:'bar-food',label:'Try the eggplant Parmesan',x:837,y:331,standX:831,standY:594,size:[120,45]},
 {id:'bar-bottle',label:'Pour a glass of wine',x:177,y:286,standX:200,standY:490,size:[35,65]},
 {id:'bar-glass',label:'Raise a toast',x:214,y:300,standX:230,standY:495,size:[30,45]},
 {id:'bar-record',label:'Look beneath the record sleeves',x:277,y:305,standX:280,standY:485,size:[100,62]},
 {id:'bar-select',label:'Choose the record for your toast',x:184,y:297,standX:260,standY:485,size:[90,55]},
 {id:'bar-window',label:'Look through the window',x:310,y:175,standX:360,standY:480,size:[210,170]},
 {id:'bar-back',label:'Return to the living room',x:68,y:444,standX:95,standY:500,size:[100,48]}
];
for(const o of livingObjects)o.scene='living';for(const o of barObjects)o.scene='bar';
const extraScenes={
 attic:{image:'02-attic.webp',title:'A song packed away.',items:[{id:'attic-box',repeatable:true,label:'Open the 2016 memory box',x:751,y:291,standX:720,standY:485,memory:'A box of Lost On You memories'},{id:'attic-guitar',repeatable:true,label:'Play the electric guitar',x:548,y:345,standX:570,standY:520,memory:'A Lost On You jam with Mike'},{id:'attic-mike',repeatable:true,label:'Talk with Mike',x:925,y:324,standX:824,standY:506,memory:null}]},
 bridge:{image:'04-bridge.webp',title:'Let the city breathe.',items:[{id:'bridge-run',repeatable:true,label:'Run across the bridge',x:912,y:300,standX:700,standY:550,memory:'A wine run across the bridge'}]},
 party:{image:'05-party.webp',title:'Here’s to the memories.',items:[{id:'party-lights',repeatable:true,label:'Change the string lights above',x:550,y:74,standX:650,standY:510,memory:'The lights of a Lost On You night'},{id:'party-dance',repeatable:true,label:'Dance with LP',x:450,y:550,standX:450,standY:550,memory:'A little anniversary dance'},{id:'party-toast',repeatable:true,label:'Everyone · Cheers to 10 years',x:974,y:291,standX:893,standY:510,memory:'Ten years of Lost On You'},{id:'party-jukebox',label:'Choose an LP song',x:824,y:304,standX:800,standY:510,memory:null}]}
};
for(const [scene,data] of Object.entries(extraScenes)){data.art=new Image();data.art.src=data.image;for(const o of data.items){o.scene=scene;o.size=o.id==='party-lights'?[880,105]:[70,70];o.found=false}}
const extraObjects=Object.values(extraScenes).flatMap(d=>d.items);
const allObjects=[...livingObjects,...barObjects,...extraObjects];
let objects=livingObjects;
const roomPositions={living:{x:480,y:520},bar:{x:400,y:540}};
const roomInfo={living:{eyebrow:'01 / THE LIVING ROOM',title:'Find the first note.',bounds:{left:60,right:1190,top:455,bottom:585}},bar:{eyebrow:'02 / THE HOME BAR',title:'A quiet little interlude.',bounds:{left:-90,right:1190,top:465,bottom:585}}};
roomPositions.orson={x:480,y:520};roomInfo.orson={eyebrow:'BONUS / ORSON’S HIDEAWAY',title:'Ten familiar little faces.',bounds:{left:60,right:1040,top:455,bottom:585}};
for(const [scene,data] of Object.entries(extraScenes)){roomPositions[scene]={x:90,y:530};roomInfo[scene]={eyebrow:scene==='attic'?'03 / THE ATTIC':scene==='bridge'?'04 / THE BRIDGE':'06 / THE PARTY',title:data.title,bounds:{left:-90,right:1190,top:475,bottom:585}}}
let roomFade=0;
function changeScene(scene,entry){
 if(!roomInfo[scene]||state.playing||action||mission||duet||sleepState||stageGame.active)return;
 roomPositions[state.scene]={x:player.x,y:player.y};stopSong();clearAlbumMedia();keys.clear();target=null;afterWalk=null;feedback=null;
 $('#game').setAttribute('data-scene',scene);state.scene=scene;objects=extraScenes[scene]?.items||(['orson','stage'].includes(scene)?[]:scene==='bar'?barObjects:livingObjects);
 Object.assign(player,roomPositions[scene],{moving:false,direction:'front',walkTime:0,travel:0});
 if(entry){player.x=entry==='left'?70:1030;player.y=scene==='bar'?590:scene==='bridge'?590:550;}
 Object.assign(player,nearestFloor(player.x,player.y,scene));waypoints=[];
 for(const id of ['attic','bridge','party','orson','stage'])$('#nav-'+id).setAttribute('aria-pressed',String(scene===id));
 document.querySelector('.touch-controls').hidden=false;
 $('#orson-guide').hidden=scene!=='orson';
 if(scene==='orson'&&state.started)show('Ten faces. One very good friend.','Orson is hiding ten times among the owls and birds. Tap each of his faces on the wallpaper. A gold ring marks every one you find. Move LP along the floor to see behind her.','FIND ORSON · 0 / 10');
 $('#room-label').textContent=roomInfo[scene].eyebrow;$('#room-title').textContent=roomInfo[scene].title;
 $('#game').setAttribute('aria-label',scene==='orson'?'Find ten hidden Orson faces':roomInfo[scene].eyebrow+' exploration game');
 $('#intro-text').textContent=roomCopy[scene];
 $('#audio-picker').hidden=scene!=='living';
 $('#nav-living').setAttribute('aria-pressed',String(scene==='living'));$('#nav-bar').setAttribute('aria-pressed',String(scene==='bar'));
 if(scene==='stage'){player.x=550;player.y=495}$('#stage-hud').hidden=scene!=='stage';
 sceneEnteredAt=time;roomFade=.32;updateUI();if(state.started)canvas.focus();
}
function walkBounds(){return roomInfo[state.scene].bounds}
function drawEggplant(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ellipse(0,0,39,11,'#d6e7d8');ellipse(0,-2,32,8,'#f1e8ca');for(let i=0;i<3;i++){ellipse(-17+i*17,-5,13,7,'#502c39');ellipse(-17+i*17,-7,10,5,'#ac4930');ellipse(-17+i*17,-8,8,3,'#e5ba65')}for(let i=0;i<12;i++)rect(-24+(i*17)%47,-11+(i*7)%7,3,2,'#fff0bd');ellipse(12,-11,5,2,'#4f843f');ctx.restore()}
function drawHomeBar(){
 rect(0,0,1100,620,'#286f6b');if(barRoom.complete&&barRoom.naturalWidth)ctx.drawImage(barRoom,0,0,1100,620);
 drawHotEggplant();drawOrsonBed();
 ctx.save();ctx.fillStyle='#f0d39f';ctx.font='12px Arial';ctx.fillText('← Living room',48,444);ctx.restore();
 if(barState.coaster){ellipse(214,319,15,5,'#b58d59');ellipse(214,319,12,3,'#d4b383')}
 if(action?.type!=='bar-pour'&&action?.type!=='bar-toast')drawWineAt(214,313,barState.level);
 if(barState.cork){ellipse(184,299,17,5,'#262929');ellipse(184,299,5,2,'#e7b472')}

}
function exploreBar(o){
 if(o.id==='bar-dog-bed'){callBarOrson();return}
 if(o.id==='bar-food'){beginAction('eat',6,()=>toast('A little comfort before another Lost On You toast. Delicious… excuse me!',player.x,player.y-280));return}
 if(o.id==='bar-back'){changeScene('living');return}
 if(o.id==='bar-record'&&!barState.coaster){beginAction('bar-coaster',1.5,()=>{barState.coaster=true;toast('Memory found · A place for a Lost On You toast',277,275)});return}
 if(o.id==='bar-select'){openRecordChoice();return}
 if(o.id==='bar-bottle'){
  
  if(barState.level>.95){toast('Your glass is full. Click it to raise a toast.',214,275);return}
  beginAction('bar-pour',3,()=>{barState.level=1;toast('A glass ready for a little celebration.',214,275)});return;
 }
 if(o.id==='bar-glass'){
  if(barState.level<.05){toast('Fill the glass first. Click the wine bottle to pour.',214,275);return}
  beginAction('bar-toast',3,()=>{barState.level=0;barState.complete=true;show('A toast to the memories.','Two more memories, and a little moment worth keeping. Walk out of the right edge to visit the attic, or keep exploring.','HOME BAR COMPLETE')});return;
 }
 if(o.id==='bar-window')toast('Plants reach toward the window. A quiet moment between songs.',310,175);
}
function drawBarReward(){
 if(!action||!['bar-cork','bar-coaster'].includes(action.type))return;
 const p=Math.min(1,action.age/action.duration),x=550,y=245-Math.sin(p*Math.PI)*18;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.min(1,p*5,(1-p)*5);
 if(action.type==='bar-coaster'){
  ellipse(0,0,42,42,'#b48b56');ellipse(0,0,36,36,'#d7b77e');
  ctx.strokeStyle='#9f7743';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.stroke();
 }else{ctx.rotate(.25);ctx.fillStyle='#bc955e';ctx.beginPath();ctx.roundRect(-15,-32,30,64,8);ctx.fill();for(let i=0;i<5;i++)rect(-10,-24+i*11,20,2,'#8d6c40')}
 ctx.restore();
}
function show(title,text,tag='A SMALL DISCOVERY') {clearAlbumMedia();keys.clear();target=null;afterWalk=null;$('#dialog-title').textContent=title;$('#dialog-text').textContent=text;$('#dialog-tag').textContent=tag;dialog.hidden=false;$('#close-dialog').focus()}
function closeDialog(){clearAlbumMedia();dialog.hidden=true;canvas.focus()}
function toast(text,x=player.x,y=player.y-140){if(text.startsWith('Memory found'))soundEffects.play('collect');feedback={text,x,y,age:0};$('#toast-text').textContent=text;$('#toast').hidden=false}
function objective(){
 if(state.scene==='album')return 'Open the ten memories, then celebrate ten years of Lost On You.';
 if(state.scene==='stage')return stageGame.active?'Catch flowers, bras and red ribbons. Dodge water bottles and footballs.':'The last encore · Catch 6 gifts. Six hits end the game.';
 if(extraScenes[state.scene])return locationObjective();
 if(state.scene==='orson')return orsonFound.size===orsonHeads.length?'All ten Orsons found! Return to the home bar whenever you like.':'Find ten Orson faces hidden among the owls, birds and leaves. Tap each face.';
 if(state.scene==='bar'){
  if(action)return {'bar-cork':'Opening the cupboard…','bar-coaster':'Looking beneath the record sleeves…','bar-pour':'Preparing a glass for the toast…','bar-toast':'A toast to the memories…',eat:action.age<3?'A little bite of eggplant Parmesan…':action.age<4?'Oops…':'Well, that was embarrassing…'}[action.type];
  if(barState.complete)return 'A little toast, two more memories. Explore or return to the living room.';
  if(!barState.cork&&!barState.coaster)return 'Choose the Lost On You record, find a coaster, then pour a toast.';
  if(!barState.cork)return 'Click the record player and choose the soundtrack for your toast.';
  if(!barState.coaster)return 'A coaster is tucked near the record player.';
  return barState.level>.05?'Click the glass to raise a toast.':'Click the bottle to pour a glass of wine.';
 }
 if(action)return {drink:'Taking a quiet sip…',blinds:'Letting the rainy view in…',refill:'Pouring another glass…',cushion:'Looking under the cushion…',pick:'A little piece of the music…'}[action.type];
 if(state.playing)return isWhistling(playTime)?'A little whistle, while the rain falls.':'Listen to the song · Stop playing whenever you like.';
 if(state.pick&&state.tag)return state.wine?'Click the guitar to sit down & play.':'Drink the red wine, then click the guitar to play.';
 if(!state.pick)return 'Look around the sofa. What is hiding under the cushion?';
 if(!state.blinds)return 'Raise the blinds and listen to the rain.';
 return 'Inspect the guitar for the second memory.';
}
function updateUI(){
 syncStageUI();syncAlbum();
 syncExitCue();
 $('#count-label').textContent=state.scene==='orson'?'Orsons found':'Memories found';
 if(state.scene==='orson')$('#count').textContent=orsonFound.size+' / '+orsonHeads.length;else $('#count').textContent=`${Number(state.pick)+Number(state.tag)+Number(barState.cork)+Number(barState.coaster)+extraObjects.filter(o=>o.memory&&o.found).length} / 10`;
 $('#playback-time').hidden=!state.playing;
 $('#song-file').disabled=state.playing||!!action||!!mission||!!duet||!!sleepState||stageGame.active;$('#help').disabled=state.playing||!!action||!!mission||!!duet||!!sleepState||stageGame.active;
 if($('#objective').textContent!==objective())$('#objective').textContent=objective();
 for(const id of ['living','bar','attic','bridge','party','orson','stage'])$('#nav-'+id).disabled=state.playing||!!action||!!mission||!!duet||!!sleepState||stageGame.active;
 for(const o of allObjects){
  const b=o.button;
  b.hidden=o.scene!==state.scene||(o.found&&!o.repeatable)||(o.id==='bar-record'&&barState.coaster)||(o.id==='bar-select')||(o.id==='cushion'&&state.pick)||(o.id==='window'&&state.blinds)||(o.id==='exit'&&!state.complete);
  b.disabled=state.playing||!!action||!!mission||!!duet||!!sleepState||stageGame.active;
  if(o.id==='instrument')o.label=state.pick&&state.tag&&state.wine?'Sit & play the guitar':'Explore the guitar';
  if(o.id==='wine')o.label=state.glassLevel>.05?'Drink the red wine':'Empty glass · refill from the bottle';
  b.textContent='';
  b.setAttribute('aria-label',o.label);b.title=o.label;
 }
}
function beginAction(type,duration,done){keys.clear();waypoints=[];target=null;afterWalk=null;player.moving=false;player.direction='front';action={type,age:0,duration,done,fromBlind:state.blindAmount};soundEffects.action(type);updateUI()}
function tickAction(dt){
 if(!action)return;action.age+=dt;const p=Math.min(1,action.age/action.duration),ease=p*p*(3-2*p);
 if(action.type==='blinds')state.blindAmount=action.fromBlind+(1-action.fromBlind)*ease;
 if(action.type==='drink')state.glassLevel=1-Math.max(0,Math.min(1,(p-.4)/.35));
 if(action.type==='bar-pour')barState.level=Math.max(0,Math.min(1,(p-.25)/.65));
 if(action.type==='bar-toast')barState.level=1-Math.max(0,Math.min(1,(p-.4)/.35));
 if(action.type==='refill')state.glassLevel=Math.max(0,Math.min(1,(p-.25)/.65));
 if(['drink','bar-toast'].includes(action.type)&&action.age>=.7&&!action.sipped){action.sipped=true;soundEffects.play('sip')}
 if(action.type==='eat'&&action.age>=1.25&&!action.bitten){action.bitten=true;soundEffects.play('bite')}
 if(action.type==='eat'&&action.age>=3.7&&!action.burped){action.burped=true;playBurp()}
 if(p>=1){const done=action.done;action=null;done();updateUI()}
}
function distance(o){const p=nearestFloor(o.standX,o.standY);return Math.hypot(player.x-p.x,player.y-p.y)}
function nearest(){return objects.filter(o=>!o.button.hidden).sort((a,b)=>distance(a)-distance(b)).find(o=>distance(o)<110)}
function interact(o=nearest()){
 if(bridgeRun.active)return;
 if(duet||sleepState)return;
 if(!state.started||!dialog.hidden||!overlay.hidden||state.playing||action||!o||distance(o)>110)return;
 if(extraScenes[state.scene]){exploreExtra(o);return}
 if(state.scene==='bar'){exploreBar(o);return}
 if(o.id==='armchair'){beginSleep();return}
 if(o.id==='wine'){
  if(state.glassLevel<.05){toast('The glass is empty. Click the bottle to refill it.',771,285);return}
  beginAction('drink',3,()=>{state.wine=true;state.glassLevel=0;toast('A quiet Lost On You toast. The guitar is waiting.',771,285)});
 }else if(o.id==='bottle'){
  if(state.glassLevel>.95){toast('Your glass is already full.',803,260);return}
  beginAction('refill',3,()=>{state.glassLevel=1;toast('Refilled — another little toast.',771,285)});
 }else if(o.id==='cushion'&&!state.pick){
  beginAction('pick',3.2,()=>{state.pick=true;toast('Memory found · Your LP pick, ready for Lost On You',rightHandAnchor().x,rightHandAnchor().y)});
 }else if(o.id==='window'&&!state.blinds){
  beginAction('blinds',1.8,()=>{state.blinds=true;state.blindAmount=1;toast('Rain outside. Lost On You waiting in the room.',820,180)});
 }else if(o.id==='instrument'){
  if(!state.blinds){toast('Raise the blinds to see what is tucked beside the guitar.',620,340);return}
  if(!state.tag){state.tag=true;toast('Memory found · A tag for the Lost On You road',620,340);if(!state.pick||!state.wine){updateUI();return}}
  if(!state.pick){toast('A little pick is hiding by the sofa.',310,300);return}
  if(!state.wine){toast('Take a sip of wine before the session.',771,285);return}
  state.playing=true;playTime=0;target=null;player.x=465;player.y=480;startSessionAudio();toast('A room, a guitar, and Lost On You. Stay for a little while.');
 }else if(o.id==='exit'&&state.complete){changeScene('bar');return}
 updateUI();
}
function goTo(o){if(duet||sleepState)return;if(!state.started||!dialog.hidden||!overlay.hidden||state.playing||action)return;routeTo(o.standX,o.standY,o);canvas.focus()}
for(const o of allObjects){const b=document.createElement('button');b.className='hotspot';const size=o.size||{bottle:[30,64],wine:[28,42],cushion:[82,58],window:[300,220],instrument:[100,180],exit:[60,90]}[o.id];b.style.width=`${size[0]/11}%`;b.style.height=`${size[1]/6.2}%`;b.style.left=`${o.x/11}%`;b.style.top=`${o.y/6.2}%`;b.onclick=()=>goTo(o);$('#hotspots').appendChild(b);o.button=b}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function drawExtraRoom(){drawLocationDetails()}
function drawOrson(){
 rect(0,0,1100,620,'#24423b');if(wallpaper.complete&&wallpaper.naturalWidth)ctx.drawImage(wallpaper,0,0,1100,620);
 orsonHeads.forEach((h,i)=>{ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a);ctx.save();if(!orsonFound.has(i)){ctx.filter='saturate(.38) sepia(.38) brightness(.82)';ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(-h.w*.5,-h.w*.08);ctx.lineTo(-h.w*.17,-h.w*.5);ctx.lineTo(h.w*.5,-h.w*.5);ctx.lineTo(h.w*.5,h.w*.28);ctx.lineTo(h.w*.25,h.w*.5);ctx.lineTo(-h.w*.5,h.w*.5);ctx.closePath();ctx.clip();}if(orsonHead.complete&&orsonHead.naturalWidth)ctx.drawImage(orsonHead,-h.w/2,-h.w/2,h.w,h.w);ctx.restore();ctx.filter='none';if(orsonFound.has(i)){ctx.strokeStyle='#ffdc81';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,h.w*.63,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe6a5';ctx.font='bold 16px Arial';ctx.fillText('✓',h.w*.35,-h.w*.4)}ctx.restore()});
}
function findOrson(x,y){const i=orsonHeads.findIndex((h,j)=>!orsonFound.has(j)&&Math.hypot(x-h.x,y-h.y)<Math.max(28,h.w*.65));if(i<0||orsonFound.has(i))return;orsonFound.add(i);soundEffects.play('collect');updateUI();if(orsonFound.size===orsonHeads.length)show('You found every Orson!','Ten little faces, hiding in plain sight. A little celebration for our favourite companion.','ORSON’S HIDEAWAY COMPLETE');}
function drawRoom(){
 if(state.scene==='stage'){drawStage();return}if(state.scene==='album'){drawAlbumRoom();return}
 if(state.scene==='orson'){drawOrson();return}
 if(extraScenes[state.scene]){drawExtraRoom();return}
 if(state.scene==='bar'){drawHomeBar();return}
 rect(0,0,1100,620,'#267778');if(room.complete&&room.naturalWidth)ctx.drawImage(room,0,0,1100,620);
 drawRain();
 drawFittedBlind();
 if(state.blinds){const light=ctx.createLinearGradient(840,180,440,620);light.addColorStop(0,'#d1e8ef12');light.addColorStop(1,'#ffe6a500');rect(250,150,850,470,light);for(let i=0;i<12;i++)ellipse(760+Math.sin(time*.4+i)*70,180+(i*29+time*8)%310,1.5,1.5,'#fff2bd80')}
 if(!state.pick&&action?.type!=='pick')drawGuitarPick(310,321,15,0);
 if(state.blinds&&!state.tag){ellipse(620,365,15+Math.sin(time*3)*3,15,'#ffd06b35');rect(615,357,10,15,'#ffe6a5')}
 if(action?.type!=='refill')drawBottle();
 if(action?.type!=='drink'&&action?.type!=='refill')drawWine();
 if(state.playing){rect(0,0,1100,620,`rgba(255,205,115,${.035+Math.sin(playTime*2)*.025})`);for(let i=0;i<5;i++){ctx.fillStyle='#ffe7a5';ctx.font='24px Georgia';ctx.fillText('♪',490+i*22,300-((playTime*35+i*25)%120))}}
}
// Atlas calibrated to generated figure bounds: front, profile, back.
function characterHeight(y){return perspectiveHeight(player.x,y,state.scene)}
function updateDirection(dx,dy){
 if(!dx&&!dy){player.direction='front';return}
 player.direction=Math.abs(dy)>Math.abs(dx)?(dy<0?'back':'front'):(dx<0?'left':'right');
}
function drawPlayer(skipParty=false,skipGulls=false){
 if(state.scene==='album')return;
 if(state.scene==='bridge'&&bridgeRun.active){drawBridgeRunnerPlayer();return}
 if(state.scene==='party'&&!skipParty){drawPartyGuests();return}if(state.scene==='party'&&partyMoment){drawPartyLP();return}
 if(state.scene==='stage'&&drawStagePlayer())return;
 if(state.scene==='living'&&sleepState){drawSleepingLP();return}
 if(state.scene==='attic'&&duet){drawElectricPlayer();return}
 if(state.scene==='attic'){drawMilitaryPlayer();return}
 if(action?.type==='eat'){drawEating();return}
 if(state.playing&&performanceArt.complete&&performanceArt.naturalWidth){drawPerformance();return}
 if((action?.type==='drink'||action?.type==='bar-toast')&&drinking.complete&&drinking.naturalWidth){drawDrinking();return}
 if((action?.type==='refill'||action?.type==='bar-pour')&&pouring.complete&&pouring.naturalWidth){drawPouring();return}
 if(player.moving&&rigParts.complete&&rigParts.naturalWidth){drawWalking();return}
 const height=characterHeight(player.y), bob=player.moving?Math.sin(player.walkTime*12)*1.2:0;
 ellipse(player.x,player.y+2,20*(height/240),5,'#17272844');
 if(!character.complete||!character.naturalWidth)return;
 const sw=220;
 const direction=player.moving?player.direction:'front';
 const row=direction==='back'?2:(direction==='left'||direction==='right'?1:0);
 const column=player.moving?Math.floor(player.walkTime*8)%4:0;
 const centers=[[277,567,880,1178],[277,577,888,1195],[277,567,872,1174]];
 const tops=[0,370,725],heights=[370,355,361],sh=heights[row];
 const sx=centers[row][column]-sw/2,sy=tops[row];
 const width=height*sw/sh;
 ctx.save();ctx.translate(player.x,player.y+bob);if(direction==='left')ctx.scale(-1,1);
 ctx.drawImage(character,sx,sy,sw,sh,-width/2,-height,width,height);
 ctx.restore();
 if(action?.type==='eat')drawEating();
 if(state.pick&&!action){const hand=rightHandAnchor();drawGuitarPick(hand.x,hand.y,10,0)}

}

function drawEating(){drawEatingAtlas()}
function playBurp(){if(state.sound)soundEffects.play('burp')}

function performancePhase(t){
 let start=0,end=.7;
 for(let i=0;i<cues.beats.length-1;i++){if(t>=cues.beats[i]&&t<cues.beats[i+1]){start=cues.beats[i];end=cues.beats[i+1];break}}
 return ((t-start)/Math.max(.1,end-start))%1;
}
function isWhistling(t){return !customTrack&&cues.whistles.some(c=>t>=c.start&&t<c.end)}
function performanceFrame(t){return isWhistling(t)?4:[2,1,0,1][Math.floor(performancePhase(t)*4)%4]}
const SEATED={x:465,y:331,scale:280/512,hipX:574,hipY:337,elbowX:463,elbowY:252};
function strumAngle(t){return isWhistling(t)?0:Math.sin(performancePhase(t)*Math.PI*2)*.19}
function traceStrummingArm(){
 ctx.beginPath();ctx.moveTo(454,246);ctx.lineTo(474,240);ctx.lineTo(532,246);ctx.lineTo(557,250);ctx.lineTo(582,264);ctx.lineTo(580,278);ctx.lineTo(568,287);ctx.lineTo(548,279);ctx.lineTo(529,268);ctx.lineTo(471,268);ctx.lineTo(452,261);ctx.closePath();
}
function drawPerformance(){
 // One immutable body/instrument pose. Only the isolated forearm rotates.
 const {x,y,scale,hipX,hipY,elbowX,elbowY}=SEATED,whistle=isWhistling(playTime);
 ctx.save();ctx.translate(x-hipX*scale,y-hipY*scale);ctx.scale(scale,scale);
 ctx.save();
 if(whistle){ctx.beginPath();ctx.rect(384,145,384,367);ctx.clip()}
 ctx.drawImage(performanceArt,384,0,384,512,384,0,384,512);ctx.restore();
 // Static clean guitar/chest patch removes the original forearm under its pivot.
 ctx.save();traceStrummingArm();ctx.clip();ctx.drawImage(performanceArt,768,0,384,512,406,-1,384,512);ctx.restore();
 ctx.save();ctx.translate(elbowX,elbowY);ctx.rotate(strumAngle(playTime));ctx.translate(-elbowX,-elbowY);
 traceStrummingArm();ctx.clip();ctx.drawImage(performanceArt,384,0,384,512,384,0,384,512);ctx.restore();
 if(whistle){
  // Only the head changes for the whistle; seated torso and boots stay registered.
  ctx.drawImage(performanceArt,140,512,170,145,493,7,170,145);
  const mx=555,my=110;
  ellipse(mx,my,3.7,5,'#733f37');ctx.strokeStyle='#d59181';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(mx,my,4.2,5.6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#fce4aa99';ctx.lineWidth=1.5;for(let i=0;i<2;i++){const d=16+((playTime*20+i*14)%32);ctx.beginPath();ctx.arc(mx-d,my-2,7+i,-.8,.8);ctx.stroke()}
 }
 ctx.restore();
}
function drawDrinking(){
 const p=action.age/action.duration;
 const frame=p<.2?0:p<.38?1:p<.73?2:3;
 const sw=drinking.naturalWidth/4,sh=drinking.naturalHeight,h=characterHeight(player.y),scale=h/1004;
 const hip=[224,571,946,1308][frame]-frame*sw;
 ctx.drawImage(drinking,frame*sw,0,sw,sh,player.x-hip*scale,player.y-1004*scale,sw*scale,sh*scale);
}
// Cutout hierarchy: shoulder -> full arm; hip -> thigh -> shin -> boot.
// Feet follow a support phase on the floor, then a lifted return arc.
const WALK={stance:.62,stride:76,lift:24,upper:78,lower:84,ankleY:-15};
function footPath(phase){
 const p=((phase%1)+1)%1;
 if(p<WALK.stance)return {x:WALK.stride/2-WALK.stride*p/WALK.stance,y:WALK.ankleY,grounded:true};
 const u=(p-WALK.stance)/(1-WALK.stance),v=1-u;
 const x=v*v*v*(-38)+3*v*v*u*(-48)+3*v*u*u*48+u*u*u*38;
 return {x,y:WALK.ankleY-WALK.lift*Math.sin(Math.PI*u),grounded:false};
}
function solveLeg(hip,foot){
 const dx=foot.x-hip.x,dy=foot.y-hip.y,a=WALK.upper,b=WALK.lower;
 const d=Math.max(.1,Math.min(Math.hypot(dx,dy),a+b-.01));
 const base=Math.atan2(dx,dy),angle=base+Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))));
 const knee={x:hip.x+Math.sin(angle)*a,y:hip.y+Math.cos(angle)*a};
 return {hip,knee,foot,upper:angle,lower:Math.atan2(foot.x-knee.x,foot.y-knee.y)};
}
function walkPose(phase,side){const foot=footPath(phase+side*.5);return solveLeg({x:0,y:-171},foot)}
function rigSegment(source,x,y,w,h,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(-angle);ctx.drawImage(rigParts,...source,-w/2,-4,w,h+8);ctx.restore()}
function drawRigLeg(pose,far,profile){
 ctx.save();if(far)ctx.globalAlpha=.8;
 ellipse(pose.hip.x,pose.hip.y,9,7,'#202122');ellipse(pose.knee.x,pose.knee.y,8,8,'#202122');
 rigSegment([205,545,145,270],pose.hip.x,pose.hip.y,profile?19:18,Math.hypot(pose.knee.x-pose.hip.x,pose.knee.y-pose.hip.y),pose.upper);
 rigSegment([706,530,126,478],pose.knee.x,pose.knee.y,profile?17:16,Math.hypot(pose.foot.x-pose.knee.x,pose.foot.y-pose.knee.y),pose.lower);
 if(profile)ctx.drawImage(rigParts,1068,638,435,294,pose.foot.x-8,pose.foot.y-14,44,29);
 else ctx.drawImage(character,far?278:233,340,44,28,pose.foot.x-22,pose.foot.y-13,44,28);
 ctx.restore();
}
function drawRigArm(shoulder,phase,far,profile){
 const angle=Math.sin(phase*Math.PI*2)*(far?-.18:.18)-.13;
 ctx.save();ctx.translate(shoulder.x,shoulder.y);ctx.rotate(angle);
 if(far)ctx.globalAlpha=.8;
 if(profile){
  // Bare arm starts inside the fixed original sleeve. Never draw a second sleeve.
  ctx.drawImage(rigParts,far?1212:707,112,126,400,-14.28,17.375,28.56,90.625);
 }else ctx.drawImage(rigParts,far?1200:695,0,150,512,-17,-8,34,116);
 ctx.restore();
}
function drawWalking(){
 const scale=characterHeight(player.y)/370,phase=(player.travel/(WALK.stride/WALK.stance))%1;
 const profile=player.direction==='left'||player.direction==='right',back=player.direction==='back';
 const bob=Math.cos(phase*Math.PI*4)*1.8,hip={x:0,y:-171+bob};
 ctx.save();ctx.translate(player.x,player.y);ctx.scale(player.direction==='left'?-scale:scale,scale);
 ellipse(0,2,24,5,'#17272844');
 const legs=[0,1].map(side=>{
  const pose=solveLeg({x:0,y:hip.y},footPath(phase+side*.5));
  if(profile)return pose;
  for(const key of ['hip','knee','foot'])pose[key]={x:(side?9:-9)+pose[key].x*.14,y:pose[key].y};
  pose.upper=Math.atan2(pose.knee.x-pose.hip.x,pose.knee.y-pose.hip.y);
  pose.lower=Math.atan2(pose.foot.x-pose.knee.x,pose.foot.y-pose.knee.y);return pose;
 });
 drawRigArm({x:profile?-8:-28,y:-257.5+bob},phase,true,profile);
 drawRigLeg(legs[1],true,profile);drawRigLeg(legs[0],false,profile);
 if(profile){
  // Use the exact original profile artwork at a uniform scale: no torso morphing.
  const artScale=370/355;
  ctx.save();ctx.translate(-265*artScale,-548*artScale+hip.y);ctx.scale(artScale,artScale);
  ctx.beginPath();ctx.moveTo(230,370);ctx.lineTo(330,370);ctx.lineTo(330,450);ctx.lineTo(287,463);ctx.lineTo(283,489);ctx.lineTo(288,535);ctx.lineTo(280,552);ctx.lineTo(246,552);ctx.lineTo(250,535);ctx.lineTo(247,505);ctx.lineTo(240,501);ctx.lineTo(232,490);ctx.lineTo(234,477);ctx.lineTo(245,461);ctx.lineTo(230,450);ctx.closePath();ctx.clip();
  ctx.drawImage(character,0,0);ctx.restore();
 }else{
  // Restrict the old atlas to head and torso; arms are separate complete layers.
  const sy=back?725:0,sh=back?361:370,sw=220;
  ctx.save();ctx.beginPath();ctx.moveTo(-57,-372+bob);ctx.lineTo(57,-372+bob);ctx.lineTo(57,-277+bob);ctx.lineTo(30,-265+bob);ctx.lineTo(22,-173+bob);ctx.lineTo(-22,-173+bob);ctx.lineTo(-30,-265+bob);ctx.lineTo(-57,-277+bob);ctx.closePath();ctx.clip();
  ctx.drawImage(character,167,sy,sw,200,-sw/2,-370+bob,sw,200*370/sh);ctx.restore();
 }
 // The near arm is always the final body layer, on both mirrored profiles.
 drawRigArm({x:profile?-15.6:28,y:profile?-257.5+bob:-258+bob},phase,false,profile);
 ctx.restore();
}
function drawPouring(){
 const p=action.age/action.duration,frame=p<.22?0:p<.8?1:2;
 const sw=pouring.naturalWidth/3,sh=pouring.naturalHeight,h=characterHeight(player.y),scale=h/sh;
 const anchor=[358,756,1172][frame]-sw*frame;
 ctx.drawImage(pouring,sw*frame,0,sw,sh,player.x-anchor*scale,player.y-h,sw*scale,h);
}
function rightHandAnchor(){const s=characterHeight(player.y)/370;return {x:player.x-30*s,y:player.y-154*s}}
function pickAnimation(t){
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>1-Math.pow(1-n,3),hand=rightHandAnchor();
 if(t<.6){const p=ease(clamp(t/.6));return {x:310+(550-310)*p,y:321+(260-321)*p-Math.sin(p*Math.PI)*45,size:15+185*p,angle:0,dim:p*.56}}
 if(t<2){const p=(t-.6)/1.4;return {x:550,y:260,size:200,angle:p*Math.PI*2,dim:.56}}
 const p=ease(clamp((t-2)/.85)),q=1-p;
 return {x:q*q*550+2*q*p*520+p*p*hand.x,y:q*q*260+2*q*p*100+p*p*hand.y,size:200+(10-200)*p,angle:Math.PI*2,dim:.56*(1-p)};
}
function tracePick(){
 ctx.beginPath();ctx.moveTo(0,.55);ctx.bezierCurveTo(-.13,.55,-.61,-.12,-.49,-.39);ctx.bezierCurveTo(-.39,-.61,.39,-.61,.49,-.39);ctx.bezierCurveTo(.61,-.12,.13,.55,0,.55);ctx.closePath();
}
function drawGuitarPick(x,y,size,angle){
 const face=Math.cos(angle),width=Math.max(.025,Math.abs(face));
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.scale(width,1);
 tracePick();ctx.shadowColor='#0008';ctx.shadowBlur=.08;ctx.shadowOffsetY=.025;
 const material=ctx.createLinearGradient(-.5,-.5,.5,.55);material.addColorStop(0,'#353637');material.addColorStop(.28,'#141516');material.addColorStop(.7,'#050607');material.addColorStop(1,'#252728');ctx.fillStyle=material;ctx.fill();ctx.shadowColor='transparent';
 ctx.strokeStyle='#64686b';ctx.lineWidth=.012;ctx.stroke();ctx.save();tracePick();ctx.clip();
 if(face>0&&pickLogo.complete&&pickLogo.naturalWidth){ctx.globalCompositeOperation='screen';ctx.drawImage(pickLogo,-.29,-.36,.58,.58)}
 ctx.globalCompositeOperation='source-over';const shine=ctx.createLinearGradient(-.5,-.5,.4,.4);shine.addColorStop(0,'#ffffff30');shine.addColorStop(.22,'#ffffff05');shine.addColorStop(.4,'#ffffff00');ctx.fillStyle=shine;ctx.fillRect(-.6,-.6,1.2,1.2);ctx.restore();
 ctx.beginPath();ctx.moveTo(-.4,-.36);ctx.bezierCurveTo(-.3,-.48,.15,-.49,.32,-.43);ctx.strokeStyle='#ffffff3b';ctx.lineWidth=.012;ctx.stroke();ctx.restore();
}
function drawPickup(){
 if(action?.type!=='pick')return;const pose=pickAnimation(action.age);
 rect(0,0,1100,620,`rgba(7,14,20,${pose.dim})`);
 if(action.age<2){ctx.save();ctx.textAlign='center';ctx.fillStyle='#ecd7ac';ctx.font='12px Arial';ctx.fillText('A MEMORY TO KEEP',550,420);ctx.restore()}
 drawGuitarPick(pose.x,pose.y,pose.size,pose.angle);
}
function drawFeedback(){
 if(!feedback)return;const p=Math.min(1,feedback.age/2.6);ctx.save();ctx.globalAlpha=1-p;
 ctx.strokeStyle='#ffe09b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(feedback.x,feedback.y,18+p*45,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function rainDrop(i,t){
 const wrap=(n,m)=>((n%m)+m)%m;
 return {x:700+wrap(i*53.71-t*32,325),y:wrap(i*37.29+t*245,282)};
}
function drawRain(){
 ctx.save();ctx.beginPath();
 ctx.rect(727,26,123,127);ctx.rect(861,17,126,136);ctx.rect(722,169,128,102);ctx.rect(861,169,107,102);ctx.clip();
 rect(686,0,343,290,'#385d7738');ctx.strokeStyle='#c7e5f0b0';ctx.lineWidth=1.2;
 for(let i=0;i<100;i++){const p=rainDrop(i,time);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-4,p.y+17);ctx.stroke()}
 ctx.restore();
}
function drawWine(){drawWineAt(771,313,state.glassLevel)}
function drawWineAt(x,y,level){
 ctx.save();ctx.strokeStyle='#f4eee7';ctx.lineWidth=1.4;ctx.fillStyle='#eef7f52a';ctx.beginPath();ctx.moveTo(x-9,y-24);ctx.bezierCurveTo(x-13,y-4,x+13,y-4,x+9,y-24);ctx.closePath();ctx.fill();ctx.stroke();
 if(level>.02){const top=y-8-level*8;ctx.fillStyle='#811c39';ctx.beginPath();ctx.moveTo(x-9,top);ctx.bezierCurveTo(x-10,y-5,x+10,y-5,x+9,top);ctx.closePath();ctx.fill();ellipse(x,top,8,2,'#b23b54')}
 ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x,y+4);ctx.moveTo(x-7,y+5);ctx.lineTo(x+7,y+5);ctx.stroke();ctx.restore();
}
function drawBottle(){
 const pouring=action?.type==='refill',p=pouring?action.age/action.duration:0;
 const tilt=pouring?Math.sin(p*Math.PI)*-1.05:0;
 ctx.save();ctx.translate(801,314);ctx.rotate(tilt);ctx.fillStyle='#48292b';ctx.strokeStyle='#ce9860';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.roundRect(-9,-39,18,39,4);ctx.fill();ctx.stroke();rect(-4,-58,8,23,'#563a2d');rect(-5,-60,10,7,'#b88a54');rect(-7,-26,14,16,'#ebd6a2');ctx.restore();
 if(pouring&&p>.25&&p<.9){ctx.strokeStyle='#a52e4b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(773,285);ctx.quadraticCurveTo(766,291,771,302);ctx.stroke()}
}
function stopSong(){if(songClip){songClip.pause();songClip.currentTime=0}}
function startSessionAudio(){
 $('#finish-session').hidden=false;
 if(songClip&&!songFailed){songClip.muted=!state.sound;songClip.currentTime=0;songClip.play().catch(()=>{$('#song-status').textContent='Tap Resume song to allow audio playback.';$('#resume-song').hidden=false})}else playNotes();
}
function finishSession(){
 stopSong();state.playing=false;state.complete=true;player.x=465;player.y=480;
 $('#finish-session').hidden=true;$('#resume-song').hidden=true;
 show('Some memories begin with a single note.','Two memories, a quiet toast, and a song while the rain falls. The way to the home bar is ready.','LIVING ROOM COMPLETE');updateUI();
}
$('#finish-session').onclick=()=>{if(state.playing){keys.clear();stopSong();state.playing=false;player.x=465;player.y=480;$('#finish-session').hidden=true;$('#resume-song').hidden=true;toast('Music stopped. Click the guitar whenever you want to play again.');updateUI()}};
$('#resume-song').onclick=()=>{if(songClip&&state.playing){songClip.play().then(()=>{$('#resume-song').hidden=true}).catch(()=>{$('#song-status').textContent='Audio is unavailable. You can still finish the session.'})}};

function playNotes(){if(!state.sound)return;if(!audio){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;audio=new AudioContext()}audio.resume();[220,277.18,329.63,440].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.26;o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.085,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+1.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+1.3)})}
$('#sound').onclick=()=>{state.sound=!state.sound;if(songClip)songClip.muted=!state.sound;if(state.sound){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio??=new Audio();audio.resume()}if(state.playing&&songClip)songClip.play().catch(()=>{$('#resume-song').hidden=false})}$('#sound').textContent=`Sound: ${state.sound?'on':'off'}`;$('#sound').setAttribute('aria-pressed',String(state.sound))};
function frame(stamp){let dt=Math.min((stamp-last)/1000||0,.1);last=stamp;if(document.hidden)dt=0;time+=dt;roomFade=Math.max(0,roomFade-dt);player.moving=false;
 if(state.started&&dialog.hidden&&overlay.hidden&&!state.playing&&!action&&!mission&&!bridgeRun.active&&!duet&&!sleepState&&!stageGame.active&&state.scene!=='album'&&!(state.scene==='party'&&partyMoment)){let dx=Number(keys.has('right'))-Number(keys.has('left')),dy=Number(keys.has('down'))-Number(keys.has('up'));
 if(dx||dy){target=null;afterWalk=null;waypoints=[]}else if(target){dx=target.x-player.x;dy=target.y-player.y;if(Math.hypot(dx,dy)<6){if(waypoints.length){target=waypoints.shift();dx=target.x-player.x;dy=target.y-player.y}else{const o=afterWalk;target=null;afterWalk=null;if(o)interact(o);dx=dy=0}}}
 if(dx||dy){player.moving=true;updateDirection(dx,dy);player.walkTime+=dt;if(dx)player.facing=dx>0?1:-1;const len=Math.hypot(dx,dy),speed=target?Math.min(WALK_SPEED*dt,len):WALK_SPEED*dt;const oldX=player.x,oldY=player.y;moveOnFloor(dx/len*speed,dy/len*speed);player.moving=Math.hypot(player.x-oldX,player.y-oldY)>.01;player.travel+=Math.hypot(player.x-oldX,player.y-oldY)/(characterHeight(player.y)/370)}}
 if(!player.moving&&!bridgeRun.active&&!stageGame.active){updateDirection(0,0);player.walkTime=0;player.travel=0}
 if(!action&&!state.playing&&player.moving){if(player.x>1150){if(state.scene==='living')changeScene('bar','left');else if(state.scene==='bar')changeScene('attic','left');else if(state.scene==='attic')changeScene('bridge','left');else if(state.scene==='bridge')changeScene('stage','left');else if(state.scene==='stage')changeScene('party','left');else if(state.scene==='orson')changeScene('bar')}else if(player.x< -50){const previous={bar:'living',attic:'bar',bridge:'attic',party:'stage',orson:'bar',stage:'bridge'}[state.scene];if(previous)changeScene(previous,'right')}}
 if(state.started&&dialog.hidden&&overlay.hidden&&!action&&!mission&&atBridgeExit())changeScene('stage','left');
 tickAction(dt);tickRoomCharacters(dt);tickBridgeRun(dt);
 if(feedback){feedback.age+=dt;if(feedback.age>3)feedback=null}
 if(state.playing){
  if(songClip&&songClip.paused===false&&Number.isFinite(songClip.currentTime))playTime=songClip.currentTime;
  else if(songFailed||!state.sound)playTime+=dt;
  if(songClip?.ended||playTime>=sessionSeconds)finishSession();
  const seconds=Math.floor(playTime),stamp=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');if($('#playback-time').textContent!==stamp)$('#playback-time').textContent=stamp;
  if($('#objective').textContent!==objective())$('#objective').textContent=objective();
 }

 soundEffects.sync({scene:state.scene,moving:player.moving,travel:player.travel,sound:state.sound,playing:state.playing,visible:!document.hidden,started:state.started});
 syncExitCue();
 if(state.scene==='party')player.x=Math.min(1040,player.x);drawRoom();drawPlayer();drawBarOrson();drawPartyAnniversaryBanner();drawStageMemories();drawForegroundPlant();drawMissionOverlay();drawSleepShade();drawStageObjects();drawFeedback();drawPickup();drawBarReward();if(roomFade>0)rect(0,0,1100,620,`rgba(12,21,25,${roomFade/.32})`);const n=nearest();const message=state.scene==='orson'?'Look closely · Tap the ten hidden Orson faces.':action?'Watch the moment unfold…':state.playing?'Press Escape or Stop playing to end the session.':target?'Walking over…':n?`${n.label} · E / Space / tap`:'Move with arrows / WASD, or tap an object to walk there.';if($('#hint').textContent!==message)$('#hint').textContent=message;requestAnimationFrame(frame)
}
const bindings={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden){e.preventDefault();return}if(e.key==='Escape'&&stageGame.active){e.preventDefault();exitStageEarly();return}if(e.key==='Escape'&&state.playing){e.preventDefault();$('#finish-session').onclick();return}if(duet||sleepState){if(e.key==='Escape'){e.preventDefault();if(duet)stopDuet();else wakeUp()}return}if(bridgeRun.active){bridgeRunKey(e);return}if(mission)return;if(!state.started||!dialog.hidden||!overlay.hidden||action||state.playing)return;const k=bindings[e.key]||bindings[e.key.toLowerCase()];if(k){e.preventDefault();keys.add(k)}if((e.key.toLowerCase()==='e'||e.code==='Space')&&e.target===canvas){e.preventDefault();if(!e.repeat)interact()}});
window.addEventListener('keyup',e=>keys.delete(bindings[e.key]||bindings[e.key.toLowerCase()]));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&songClip){songClip.pause()}else if(state.playing&&state.sound&&songClip){songClip.play().catch(()=>{$('#resume-song').hidden=false})}});
$('#start').onclick=()=>{state.started=true;soundEffects.unlock();backgroundMusic.unlock();overlay.hidden=true;sceneEnteredAt=time;canvas.focus();updateUI();if(state.scene==='orson')showOrsonGuide()};
$('#help').onclick=()=>{if(state.scene==='album'){show('Ten moments. One song.','Open each archive card to discover a documented moment from the Lost On You era. Use Open original source to visit its publisher. Video cards can be watched here. Close the card when you are ready; after all ten are open, bring them together for the anniversary celebration.','THE ANNIVERSARY ALBUM');return}if(state.scene==='stage'){showStageInstructions();return}if(extraScenes[state.scene]||state.scene==='orson'){show('Look a little closer.',state.scene==='orson'?'Tap ten hidden Orson faces among the birds. Every found face receives a gold ring.':'Tap a keepsake to walk over and explore it. Walk off the right edge to continue, or off the left edge to return.','HOW TO PLAY');return}if(state.scene==='bar'){show('A room, a guitar, and Lost On You. Stay for a little while.','Explore the home bar with arrows, WASD, touch controls, or by tapping objects. Choose the Lost On You record on the player and find the coaster by the record sleeves. Then click the bottle to pour, and the glass to raise a toast. Use Living room to return — your collected memories stay with you.','HOW TO PLAY');return}show('Find the first note.','Look under the sofa cushion, let light through the window, then check beside the instrument. Find both memories, drink the red wine on the side table, then click the guitar to sit down and play. Click the bottle to refill an empty glass. Stop playing at any time with the Stop playing button or Escape. Use arrows / WASD or touch controls to move. Tap a glimmer to walk to an object automatically. Sound is optional.','HOW TO PLAY')};
$('#close-dialog').onclick=closeDialog;$('#toast-close').onclick=()=>{$('#toast').hidden=true;canvas.focus()};$('#interact').onclick=()=>interact();
for(const b of document.querySelectorAll('[data-move]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.move))}
canvas.addEventListener('pointerdown',handleScenePointer);
$('#room-exit-cue').onclick=walkToRoomExit;

room.onerror=()=>{$('#hint').textContent='The room artwork could not load. Please reload the page.'};
$('#song-file').addEventListener('change',e=>{
 const file=e.target.files[0];if(!file)return;
 if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)){$('#song-status').textContent='Please choose an audio file.';return}
 stopSong();if(songURL)URL.revokeObjectURL(songURL);songURL=URL.createObjectURL(file);songClip=new Audio(songURL);songClip.volume=.65;customTrack=true;songFailed=false;sessionSeconds=SESSION_SECONDS;songClip.addEventListener('loadedmetadata',()=>{if(Number.isFinite(songClip.duration))sessionSeconds=songClip.duration});state.sound=true;
 $('#sound').textContent='Sound: on';$('#sound').setAttribute('aria-pressed','true');$('#song-status').textContent='Local clip ready · plays during the sofa session.';
 songClip.addEventListener('error',()=>{$('#song-status').textContent='This audio format could not be played. Try MP3 or WAV.';songClip=null});
});
for(const scene of Object.keys(extraScenes))$('#nav-'+scene).onclick=()=>changeScene(scene);
$('#nav-orson').onclick=null;
$('#nav-living').onclick=()=>changeScene('living');$('#nav-bar').onclick=()=>changeScene('bar');
barRoom.onerror=()=>toast('The home bar artwork could not load. Please reload.');
