// Original fan-game writing and interactions; imagined keepsakes are not historical artifacts.
const eatingArt=new Image();eatingArt.src='lp-eating-v2.webp';
const militaryArt=new Image();militaryArt.src='lp-military-v1.webp';
const mikeArt=new Image();mikeArt.src='mike-seated-v1.webp';
let mission=null,boxOpen=false,partyLights=false;
let duet=null,sleepState=null,sceneEnteredAt=0;
const partyChannels=new Set();
const electricArt=new Image();electricArt.src='lp-electric-v1.webp';
const guestsArt=new Image();guestsArt.src='party-guests-v1.webp';
const runnerArt=new Image();runnerArt.src='woman-run-v1.webp';
const sleepingArt=new Image();sleepingArt.src='lp-sleep-v1.webp';
const duetArt=new Image();duetArt.src='attic-duet-v1.webp';
const vintageDancerArt=new Image();vintageDancerArt.src='titttty-twist-v1.webp';
const roomCopy={
 living:'Rain at the window. A pick under the cushion. Find two Lost On You memories, then take a sip and play the guitar.',
 bar:'Choose the Lost On You record, find the coaster and pour a toast. The steaming eggplant Parmesan is worth a taste, too.',
 attic:'A black jacket, a box marked 2016, and Mike at the desk. Open the box, talk with Mike, then pick up the electric guitar for a shared session.',
 bridge:'Outside, the city keeps moving. Catch three memories in the wind, then run toward the far end and collect wine.',
 party:'Make the lights dance, choose an LP song at the jukebox, and prepare a ten-year toast.',
 orson:'Find Orson ten times among the owls and birds. Tap each face on the wallpaper. Gold rings mark your finds.'
};
function showOrsonGuide(){show('Ten faces. One very good friend.',roomCopy.orson+' LP can move along the floor beneath the wallpaper.','FIND ORSON · '+orsonFound.size+' / '+orsonHeads.length)}
$('#orson-help').onclick=showOrsonGuide;

const BLIND_PLANE={left:716,right:1067,topLeft:-26,topRight:-89,height:382};
function blindBottom(amount){return {left:BLIND_PLANE.topLeft+BLIND_PLANE.height*amount,right:BLIND_PLANE.topRight+BLIND_PLANE.height*amount}}
function drawFittedBlind(){
 const amount=1-state.blindAmount;if(amount<.002)return;const a=BLIND_PLANE,b=blindBottom(amount);
 ctx.save();ctx.beginPath();ctx.moveTo(716,0);ctx.lineTo(1067,0);ctx.lineTo(1067,284);ctx.lineTo(716,290);ctx.closePath();ctx.clip();
 ctx.beginPath();ctx.moveTo(a.left,a.topLeft);ctx.lineTo(a.right,a.topRight);ctx.lineTo(a.right,b.right);ctx.lineTo(a.left,b.left);ctx.closePath();ctx.fillStyle='#b6ad8d';ctx.fill();ctx.clip();
 for(let v=0;v<=a.height;v+=11){ctx.strokeStyle='#74745f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.left,a.topLeft+v);ctx.lineTo(a.right,a.topRight+v);ctx.stroke();ctx.strokeStyle='#e7d8b3';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.left,a.topLeft+v+3);ctx.lineTo(a.right,a.topRight+v+3);ctx.stroke()}
 ctx.strokeStyle='#645e49';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(a.left,b.left);ctx.lineTo(a.right,b.right);ctx.stroke();ctx.restore();
}
function drawHotEggplant(){
 ctx.save();ctx.translate(837,331);ctx.transform(1,.025,-.22,.68,0,0);drawEggplant(0,0,1.38);ctx.restore();
 for(let i=0;i<4;i++){const p=(time*.33+i*.25)%1,x=811+i*17+Math.sin(time*1.5+i)*5,y=324-p*52;ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)*.5;ctx.strokeStyle='#fff3dc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-9,y-8,x+9,y-15,x,y-25);ctx.stroke();ctx.restore()}
}
function eatingFrame(t){return t<.65?0:t<1.25?1:t<2.45?2:t<3.15?1:t<3.7?0:t<4.25?3:t<5.15?4:5}
function drawEatingAtlas(){
 if(!eatingArt.complete||!eatingArt.naturalWidth)return;
 const frame=eatingFrame(action.age),centers=[242,583,919,1254,1585,1920],s=characterHeight(player.y)/700;
 ellipse(player.x,player.y+2,25*s,5,'#17272844');
 // Each tile is registered to the center of its boots, avoiding body jitter.
 ctx.drawImage(eatingArt,centers[frame]-110,0,220,724,player.x-110*s,player.y-711*s,220*s,724*s);
 if(frame===3&&!action.burped){action.burped=true;playBurp()}
}
function militaryTile(column){const centers=[297,778,1241],s=370/1004;return {center:centers[column],s,column}}
function drawMilitaryPlayer(){
 if(!militaryArt.complete||!militaryArt.naturalWidth)return;
 const profile=player.direction==='left'||player.direction==='right',back=player.direction==='back',col=player.moving?(profile?1:back?2:0):0;
 const {center,s}=militaryTile(col),scale=characterHeight(player.y)/370,phase=player.travel/(WALK.stride/WALK.stance),bob=player.moving?Math.cos(phase*Math.PI*4)*1.2:0;
 ctx.save();ctx.translate(player.x,player.y);ctx.scale(player.moving&&player.direction==='left'?-scale:scale,scale);ellipse(0,2,23,5,'#17272844');
 const full=()=>ctx.drawImage(militaryArt,col*512,0,512,1024,(col*512-center)*s,-1004*s,512*s,1024*s);
 if(!player.moving){full();ctx.restore();return}
 // Reuse planted-foot IK, replacing the torso and sleeves with the black jacket.
 const legs=[0,1].map(side=>{const p=walkPose(phase,side);if(!profile){for(const k of ['hip','knee','foot'])p[k]={x:(side?9:-9)+p[k].x*.14,y:p[k].y};p.upper=Math.atan2(p.knee.x-p.hip.x,p.knee.y-p.hip.y);p.lower=Math.atan2(p.foot.x-p.knee.x,p.foot.y-p.knee.y)}return p});
 drawRigLeg(legs[1],true,profile);drawRigLeg(legs[0],false,profile);
 const arm=(far)=>{const side=far?-1:1,ax=profile?-17:side*30,ay=-292+bob;ctx.save();ctx.translate(ax,ay);ctx.rotate(Math.sin((phase+(far?.5:0))*Math.PI*2)*.22-.1);ctx.translate(-ax,-ay);ctx.beginPath();if(profile){ctx.rect(-42,-305+bob,43,160)}else ctx.rect(side<0?-60:27,-298+bob,34,153);ctx.clip();ctx.translate(0,bob);full();ctx.restore()};
 arm(true);ctx.save();ctx.beginPath();ctx.moveTo(-64,-376+bob);ctx.lineTo(64,-376+bob);ctx.lineTo(64,-306+bob);ctx.lineTo(profile?25:29,-286+bob);ctx.lineTo(profile?20:25,-171+bob);ctx.lineTo(-27,-171+bob);ctx.lineTo(-30,-288+bob);ctx.lineTo(-64,-306+bob);ctx.closePath();ctx.clip();ctx.translate(0,bob);full();ctx.restore();arm(false);ctx.restore();
}
function drawMike(){
 if(duet&&duet.age>=.45)return;
 if(!mikeArt.complete||!mikeArt.naturalWidth)return;
 ctx.drawImage(mikeArt,858,252,187,281);
 if(duet&&duet.age>2){ctx.fillStyle='#ffe2a5';ctx.font='22px Georgia';ctx.fillText('♪',909+Math.sin(time*3)*4,292-(time*18)%35)}
}
function drawLocationDetails(){
 const d=extraScenes[state.scene];rect(0,0,1100,620,'#234650');if(d.art.complete&&d.art.naturalWidth)ctx.drawImage(d.art,0,0,1100,620);
 if(state.scene==='attic'){
  drawMike();const p=action?.type==='memory-box'?Math.min(1,action.age/1.2):boxOpen?1:0;
  ctx.save();ctx.translate(752,293);ctx.transform(1,.02,-.15,.6,0,0);rect(-45,-20,90,40,'#986443');ctx.strokeStyle='#edc17b';ctx.lineWidth=2;ctx.strokeRect(-45,-20,90,40);rect(-44,-22-45*p,88,14,'#75472e');ctx.fillStyle='#f1d7a6';ctx.font='12px Georgia';ctx.fillText('2016',-16,-4);ctx.restore();

 }

 if(state.scene==='bridge'){
  // Slow wind trails and original paper keepsakes make the exterior feel alive.
  ctx.save();ctx.strokeStyle='#fff3cc38';ctx.lineWidth=1.5;for(let i=0;i<5;i++){const x=((time*45+i*267)%1400)-170,y=210+i*57;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+70,y-20,x+130,y+15,x+200,y-9);ctx.stroke()}ctx.restore();

  drawBridgeRunInvitation();
  if(!bridgeRun.active)drawBridgeRunner();else drawBridgeRunObjects(false);
 }
 if(state.scene==='party'){drawDisco();drawPartyLighting();drawPartyCelebration()}
}
function drawMemoryCard(x,y,i,scale=1){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(time*.7+i)*.12);ctx.scale(scale,scale);rect(-20,-14,40,29,'#e8d0a0');rect(-17,-11,34,15,['#45817d','#b57860','#ccab64'][i]);ctx.fillStyle='#443b34';ctx.font='7px Arial';ctx.fillText(['2016','LOST ON YOU','LP'][i],-15,10);ctx.restore()}
function drawDisco(){
 const cx=584,cy=41,r=48,angle=time*.12;
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
 const g=ctx.createRadialGradient(cx-12,cy-15,2,cx,cy,45);g.addColorStop(0,'#f6dcc9');g.addColorStop(.6,'#a786a9');g.addColorStop(1,'#403b65');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
 for(let row=-5;row<=5;row++)for(let j=0;j<16;j++){const phi=j/16*Math.PI*2+angle;if(Math.cos(phi)<0)continue;const yy=row*8,rr=Math.sqrt(Math.max(0,r*r-yy*yy)),xx=Math.sin(phi)*rr;ctx.fillStyle=(row+j)%3===0?'#fce7ce':'#967fa1';ctx.globalAlpha=.25+.6*Math.max(0,Math.cos(phi-1));ctx.fillRect(cx+xx,cy+yy,Math.max(1,Math.cos(phi)*7),6)}ctx.restore();
 ctx.save();for(let i=0;i<32;i++){const a=angle*1.9+i*2.399,x=550+Math.cos(a)*(170+i*12),y=405+Math.sin(a*.8)*(35+i*3);ctx.globalAlpha=partyLights?.32:.13;ctx.fillStyle=['#ffe3a2','#ec8fb5','#8cd2cb'][i%3];ctx.beginPath();ctx.ellipse(x,y,5+i%4,2+i%3,.15,0,Math.PI*2);ctx.fill()}ctx.restore();
}
function locationObjective(){
 if(duet)return duet.age<2?'Mike gets up to join LP…':'LP & Mike · Singing, playing, and chasing that Lost On You feeling.';
 if(mission)return mission.instructions;
 const d=extraScenes[state.scene],n=d.items.filter(o=>o.memory&&o.found).length;
 if(action)return 'A Lost On You memory is unfolding…';
 if(n===2)return state.scene==='bridge'?'Walk to the far end of the bridge to continue.':'Two memories to keep. Walk out of the right edge to continue.';
 return {attic:'Talk with Mike. Click the electric guitar to play together; explore the 2016 box.',bridge:'Click PLAY BRIDGE RUN. Dodge the equipment, jump, and collect wine.',party:'Click the string lights above to change the room, choose a song, then make a toast.'}[state.scene];
}
function markMemory(id,text){const o=allObjects.find(o=>o.id===id);if(o)o.found=true;updateUI();toast(text||'Memory found · '+o.memory);checkFinale()}
function checkFinale(){if(extraObjects.filter(o=>o.memory).every(o=>o.found)&&state.pick&&state.tag&&barState.cork&&barState.coaster)show('Ten years. Still a feeling.','Ten memories, a city, a room full of music. Thanks for spending this little Lost On You night with us. Orson is waiting in the last room.','LOST ON YOU · TEN MEMORIES')}

function makeMission(kind,title,instructions){
 keys.clear();target=null;waypoints=[];afterWalk=null;mission={kind,instructions,start:time};
 $('#mission-panel').hidden=false;$('#mission-panel').setAttribute('data-kind',kind);$('#mission-title').textContent=title;$('#mission-instructions').textContent=instructions;$('#mission-options').replaceChildren();$('#mission-status').textContent='';$('#mission-video').replaceChildren();updateUI();
}
function missionButton(text,fn){const b=document.createElement('button');b.textContent=text;b.className='quiet';b.onclick=fn;$('#mission-options').appendChild(b);return b}
function closeMission(){mission=null;$('#mission-panel').hidden=true;$('#mission-video').replaceChildren();updateUI();canvas.focus()}
$('#mission-close').onclick=closeMission;
function openRecordChoice(){makeMission('record','A soundtrack for the toast.','Choose the record that brought us here.');for(const title of ['Lost On You','Other People','Muddy Waters'])missionButton(title,()=>{if(title!=='Lost On You'){$('#mission-status').textContent='A good choice for later. Tonight starts with Lost On You.';return}barState.cork=true;soundEffects.play('record');closeMission();toast('Memory found · Lost On You on the turntable. Now set out the coaster and pour.');updateUI()})}
const boxNotes=[
 ['The little instrument','A small instrument, a big feeling. A ukulele keepsake for the intimate performance at the heart of this fan tribute.'],
 ['2016 · The first chapter','An imagined ticket from the Lost On You era. Keep it for the nights when a song can make the whole room feel close.'],
 ['A note for the road','An imagined postcard: “Take the song with you. Leave room for the people who sing it back.”']
];
function openMemoryBox(){makeMission('box','2016, kept in a box.','Open all three keepsakes. These are imagined fan-game memories from the Lost On You era.');mission.seen=new Set();boxNotes.forEach(([title,body],i)=>missionButton(title,()=>{mission.seen.add(i);$('#mission-status').textContent=body;if(mission.seen.size===3&&!allObjects.find(o=>o.id==='attic-box').found){allObjects.find(o=>o.id==='attic-box').found=true;updateUI();$('#mission-status').textContent+=' Memory found · The 2016 box is yours to keep.'}}))}
function exploreExtra(o){

 if(o.id==='party-dance'){startPartyMoment('dance');return}if(o.id==='party-toast'){startPartyMoment('toast');return}
 if(o.id==='party-jukebox'){openJukebox();return}
 if(o.id==='attic-mike'){openMikeConversation();return}
 if(o.id==='attic-guitar'){startDuet();return}
 if(o.id==='party-lights'){openPartyLights();return}
 if(o.id==='bridge-run'){openBridgeRun();return}
 if(o.id==='attic-box'){startStageMemories();return}
 if(o.found){toast('A Lost On You memory, already safe in your collection.');return}
 if(o.id==='attic-box'){beginAction('memory-box',3.5,()=>{boxOpen=true;openMemoryBox()});return}
 if(o.id==='bridge-wind'){makeMission('wind','Don’t let the memories drift away.','Tap the three moving paper keepsakes on the bridge. There is no time limit.');mission.caught=new Set();return}

 if(o.id==='party-toast'){if(!partyLights){toast('First, bring the dance-floor lights to life. Then we’ll make this a Lost On You toast.');return}makeMission('toast','Here’s to the years we keep.','Set three glasses for the anniversary toast.');mission.glasses=0;missionButton('Set another glass',()=>{mission.glasses++;$('#mission-status').textContent=mission.glasses+' / 3 glasses ready';if(mission.glasses===3){closeMission();beginAction('anniversary-toast',2.5,()=>markMemory(o.id,'Ten years of Lost On You. Here’s to every voice singing along.'))}})}
}
function windPaper(i){return {x:250+i*270+Math.sin(time*.65+i*2)*88,y:280+Math.sin(time*.9+i)*65+i*35}}
function missionPointer(x,y){if(mission?.kind==='wind'){for(let i=0;i<3;i++){const p=windPaper(i);if(!mission.caught.has(i)&&Math.hypot(x-p.x,y-p.y)<38){mission.caught.add(i);soundEffects.play('paper');$('#mission-status').textContent=mission.caught.size+' / 3 memories caught';if(mission.caught.size===3){closeMission();markMemory('bridge-wind','Memory found · Three little pieces of the Lost On You night, saved from the wind.')}break}}}}
function drawMissionOverlay(){
 if(action?.type==='photo-flash')rect(0,0,1100,620,'rgba(255,246,220,'+(1-action.age/action.duration)+')');
 if(action?.type==='anniversary-toast'){for(let i=0;i<3;i++)drawWineAt(500+i*50,300-Math.sin(action.age/action.duration*Math.PI)*30,1)}
 if(!mission)return;
 if(mission.kind==='wind')for(let i=0;i<3;i++)if(!mission.caught.has(i)){const p=windPaper(i);drawMemoryCard(p.x,p.y,i,1.4)}
 if(mission.kind==='bridge-run')drawBridgeRunObjects(true);

}
const jukeboxSongs=[['Lost On You','hn3wJ1_1Zsg'],['shaken','IHOGHkiFmfU'],['Other People','Lv8VKCz3Cdg'],['Muddy Waters','Ss8t7a8n0U4']];
function openJukebox(){makeMission('jukebox','LP, on the jukebox.','Choose a song. Watch and listen here; close this panel to stop.');for(const [name,id] of jukeboxSongs)missionButton(name,()=>{const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id+'?playsinline=1';frame.title='LP — '+name;frame.allow='encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';$('#mission-video').replaceChildren(frame);const link=document.createElement('a');link.href='https://www.youtube.com/watch?v='+id;link.target='_blank';link.rel='noopener noreferrer';link.textContent=id==='IHOGHkiFmfU'?'Watch shaken on YouTube':'Open '+name+' on LP’s official YouTube';$('#mission-video').appendChild(link)})}

function bootGame(){
 for(const scene of ['living','bar','attic','bridge','stage','party'])if(window.location?.search?.includes('scene='+scene))changeScene(scene);
 $('#intro-text').textContent=roomCopy[state.scene];updateUI();requestAnimationFrame(frame);
}


const concertMemoryArt=new Image();concertMemoryArt.src='lp-concert-memories-v2.webp';
const fanMemoryArt=new Image();fanMemoryArt.src='lp-fan-memory-v2.webp';
let stageMemories=null;
function startStageMemories(){stageMemories={start:time};beginAction('memory-box',10,()=>{boxOpen=true;stageMemories=null;markMemory('attic-box','Memory found · The stages, the fans, and a song that brings us together.');});}
function drawStageMemories(){
 if(state.scene!=='attic'||!stageMemories)return;
 const age=time-stageMemories.start;ctx.save();ctx.strokeStyle='#f3d8a8';ctx.lineWidth=2.5;for(const base of [46,286]){ctx.beginPath();ctx.moveTo(200,base);ctx.quadraticCurveTo(550,base+28,900,base);ctx.stroke();for(const xx of [200,900]){ellipse(xx,base,4,4,'#d3a567')}}ctx.restore();const labels=['The little club','Festival sunset','Under theatre lights','Above the city','A moment together','After the encore'];
 for(let i=0;i<6;i++){const u=Math.min(1,Math.max(0,(age-i*.35)/1.5));if(!u)continue;const e=1-Math.pow(1-u,3),x=752+([330,545,760][i%3]-752)*e,rope=(i<3?46:286)+56*((([330,545,760][i%3])-200)/700)*(1-((([330,545,760][i%3])-200)/700)),y=290+(rope+100-290)*e-Math.sin(u*Math.PI)*65;
  ctx.save();ctx.translate(x,y-100*e);ctx.rotate((i%2?1:-1)*.04*(1-e)+Math.sin(age*1.3+i)*.025*e);ctx.translate(0,100*e);ctx.scale(.12+.88*e,.12+.88*e);ctx.shadowColor='#142a3077';ctx.shadowBlur=12;rect(-98,-100,196,232,'#fff5e5');ctx.shadowBlur=0;
  ctx.strokeStyle='#dfd4c0';ctx.lineWidth=1;ctx.strokeRect(-98,-100,196,232);
  if(i===4&&fanMemoryArt.complete&&fanMemoryArt.naturalWidth){const w=fanMemoryArt.naturalWidth,h=fanMemoryArt.naturalHeight,side=Math.min(w,h);ctx.drawImage(fanMemoryArt,(w-side)/2,(h-side)*.02,side,side,-91,-93,182,182);}
  else if(concertMemoryArt.complete&&concertMemoryArt.naturalWidth){const sw=concertMemoryArt.naturalWidth/3,sh=concertMemoryArt.naturalHeight/2,side=Math.min(sw,sh)-6;ctx.drawImage(concertMemoryArt,(i%3)*sw+(sw-side)/2,Math.floor(i/3)*sh+3,side,side,-91,-93,182,182);}
  ctx.fillStyle='#5b4638';ctx.font='italic 12px Georgia';ctx.textAlign='center';ctx.fillText(labels[i],0,116);if(u>.9){ctx.fillStyle='#bd854a';ctx.strokeStyle='#724c2f';ctx.lineWidth=1;ctx.save();ctx.translate(0,-100);ctx.rotate(.07);ctx.fillRect(-5,-12,10,25);ctx.strokeRect(-5,-12,10,25);ctx.fillStyle='#f0c994';ctx.fillRect(-3,-11,3,22);ellipse(0,1,2.5,2.5,'#71665b');ctx.restore();}ctx.restore();
 }
}
