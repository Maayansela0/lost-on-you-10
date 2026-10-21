// Character scenes use the user's design sheets and original fan dialogue.
const partyCast=[
 {name:'Mike',row:0,x:363,y:496,h:236,phase:0,face:1},
 {name:'Nate',row:1,x:495,y:503,h:237,phase:1.6,face:-1},
 {name:'Brian',row:2,x:755,y:520,h:249,phase:3.4,face:1},
 {name:'Friend',row:3,x:882,y:530,h:252,phase:4.5,face:-1},
 {name:'Titttty',row:4,h:248,phase:6.2,roamOffset:32,vintage:true}
];
function guestPose(t){const p=((t%18)+18)%18;return p<10?(Math.floor(p*1.6)%2):p<13?2:3}
const partyRoute=[[240,555],[510,500],[850,535],[730,585],[360,585]];
function partyGuestPosition(t,g){
 const clock=((t+(g.roamOffset??g.row*9))%40+40)%40,leg=Math.floor(clock/8),u=(clock%8)/8,p=Math.min(1,u/.75),ease=p*p*(3-2*p),a=partyRoute[leg],b=partyRoute[(leg+1)%5];
 return {x:a[0]+(b[0]-a[0])*ease,y:a[1]+(b[1]-a[1])*ease,moving:u<.75,face:b[0]>=a[0]?1:-1,pose:u<.75?Math.floor(t*3+g.phase)%2:u<.88?2:3};
}
function drawPartyGuests(){
 if(!guestsArt.complete||!guestsArt.naturalWidth){drawPlayer(true);return}
 const rows=[[0,400,393],[400,394,784],[794,378,1166],[1172,364,1524]],xs=[40,290,535,795],centers=[167,404,650,907];
 const cast=partyCast.map((g,i)=>({...g,...(partyMoment?.kind==='toast'?{x:230+i*157,y:560,face:i<3?1:-1,pose:2}:partyGuestPosition(time-sceneEnteredAt,g))}));cast.push({lp:true,y:player.y});cast.sort((a,b)=>a.y-b.y);
 for(const g of cast){if(g.lp){drawPlayer(true);continue}if(g.vintage){if(partyMoment?.kind==='toast')drawVintageToast(g);else drawVintageDancer(g);continue}const p=g.pose,[ry,rh,baseline]=rows[g.row],sw=p===3?229:240,s=partyHeight(g.y)*(g.row===0?1.1:1)/(baseline-ry),w=sw*s,h=rh*s;
 ctx.save();ctx.translate(g.x,g.y);ctx.scale(g.face,1);ellipse(0,1,22,4,'#15161e55');
 // Small hip sway keeps poses alive; drinks remain attached to the drawn hands.
 ctx.rotate(p<2?Math.sin(time*2+g.phase)*.018:0);
 if(partyMoment?.kind==='toast')drawGuestToast(g,ry,rh,baseline,s);else ctx.drawImage(guestsArt,xs[p],ry,sw,rh,-(centers[p]-xs[p])*s,-(baseline-ry)*s,w,h);ctx.restore()}
}
function vintageDanceFrame(t){return Math.floor(t*2)%4}
function drawVintageDancer(g){
 if(!vintageDancerArt.complete||!vintageDancerArt.naturalWidth)return;
 const t=time+g.phase,sw=vintageDancerArt.naturalWidth/4,sh=vintageDancerArt.naturalHeight,frame=partyMoment?.kind==='toast'?1:vintageDanceFrame(t),h=partyHeight(g.y)*(g.row===0?1.1:1),s=h/(sh*.96);
 const phase=t*2-Math.floor(t*2),u=Math.max(0,(phase-.72)/.28),blend=partyMoment?.kind==='toast'?0:u*u*(3-2*u);
 ctx.save();ctx.translate(g.x,g.y);ctx.scale(g.face,1);ellipse(0,2,25,5,'#15161e55');ctx.rotate(partyMoment?.kind==='toast'?0:Math.sin(t*Math.PI)*.007);
 for(const [f,alpha] of [[frame,1-blend],[(frame+1)%4,blend]]){if(alpha<=0)continue;ctx.globalAlpha=alpha;const anchor=[390,835,1350,1810][f]/2172*vintageDancerArt.naturalWidth-f*sw;ctx.drawImage(vintageDancerArt,f*sw,0,sw,sh,-anchor*s,-sh*.98*s,sw*s,sh*s)}ctx.restore();
}
function openPartyLights(){
 makeMission('lights','Light up this Lost On You night.','Click a colour to switch it on or off. Watch the bulbs above and the reflections on the floor.');
 ['Amber','Rose','Teal'].forEach((c,i)=>{const b=missionButton(c,()=>{
  if(partyChannels.has(i))partyChannels.delete(i);else partyChannels.add(i);
  b.setAttribute('aria-pressed',String(partyChannels.has(i)));soundEffects.play('switchOn');
  $('#mission-status').textContent=c+(partyChannels.has(i)?' lights on.':' lights off.');
  if(partyChannels.size===3&&!allObjects.find(o=>o.id==='party-lights').found){partyLights=true;allObjects.find(o=>o.id==='party-lights').found=true;updateUI();$('#mission-status').textContent='All three colours are dancing. Memory found · A Lost On You night.'}
 });b.setAttribute('aria-pressed',String(partyChannels.has(i)))})
}
function drawPartyLighting(){
 const colors=['#ffd17e','#f58bb4','#71dbd0'],bulbs=[[105,29],[225,54],[347,65],[470,74],[660,79],[784,68],[902,41],[1024,18]];
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const i of partyChannels){const color=colors[i];for(let j=0;j<bulbs.length;j++)if(j%3===i){const [x,y]=bulbs[j];const g=ctx.createRadialGradient(x,y,1,x,y,105);g.addColorStop(0,color+'c0');g.addColorStop(1,color+'00');rect(x-105,y-105,210,210,g);ellipse(x,y,7,9,color)}
  const x=300+i*230+Math.sin(time*.5+i)*120,y=440+Math.cos(time*.6+i)*35;
  const glow=ctx.createRadialGradient(x,y,10,x,y,300);glow.addColorStop(0,color+'55');glow.addColorStop(1,color+'00');rect(x-300,y-230,600,450,glow);
  ctx.globalAlpha=.22;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,535,190,42,Math.sin(time*.2)*.1,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }ctx.restore();
}
const mikeLines=[
 ['Mike','Lost On You still feels close, even after all these years.'],
 ['LP','A song can hold a whole room of memories. Some sweet, some a little bruised.'],
 ['Mike','And then people sing it back, and it becomes theirs too.'],
 ['LP','That’s the beautiful part. Pick up the guitar. Let’s leave a little space for that feeling.']
];
function openMikeConversation(){
 makeMission('conversation','A moment with Mike.','An imagined conversation for this fan tribute.');mission.line=0;
 const advance=()=>{const [who,line]=mikeLines[mission.line];$('#mission-panel').setAttribute('data-speaker',who);$('#mission-title').textContent=who;$('#mission-status').textContent=line;$('#mission-options').replaceChildren();const lastLine=mission.line===mikeLines.length-1;const next=missionButton(lastLine?'✓':'→',()=>{if(lastLine){closeMission();return}mission.line++;advance()});next.setAttribute('aria-label',lastLine?'Finish conversation':'Next line');};advance();
}
function startDuet(){
 if(duet)return;keys.clear();target=null;waypoints=[];player.x=574;player.y=563;player.moving=false;player.direction='front';
 duet={age:0,awarded:false};$('#stop-duet').hidden=false;updateUI();
}
function stopDuet(){
 if(!duet)return;const earned=duet.age>=5,pose=duetPose(duet.age,0);Object.assign(player,{x:pose.x,y:pose.y,moving:false});duet=null;$('#stop-duet').hidden=true;
 if(earned&&!allObjects.find(o=>o.id==='attic-guitar').found)markMemory('attic-guitar','Memory found · LP and Mike, a little Lost On You session together.');updateUI();
}
function drawElectricPlayer(){
 if(duetArt.complete&&duetArt.naturalWidth){drawRoamingDuet();return}
 if(!electricArt.complete||!electricArt.naturalWidth)return;
 const sw=electricArt.naturalWidth/2,sh=electricArt.naturalHeight,frame=Math.floor((duet.age*3.5)%2),s=characterHeight(player.y)/(sh*.98);
 const center=frame?1125:430;
 ctx.drawImage(electricArt,frame*sw,0,sw,sh,player.x-(center-frame*sw)*s,player.y-sh*.98*s,sw*s,sh*s);
}
// Feet follow the room's open floor, with smooth acceleration at each turn.
const duetRoute=[
 [0,574,563,946,533],[2,540,565,825,550],[6,300,540,580,555],
 [10,430,505,710,520],[14,590,540,850,555],[18,450,570,710,550],[22,574,563,825,550]
];
function duetPose(age,row){
 let i=0;while(i<duetRoute.length-2&&age>duetRoute[i+1][0])i++;
 const a=duetRoute[i],b=duetRoute[i+1],u=Math.max(0,Math.min(1,(age-a[0])/(b[0]-a[0]))),p=u*u*(3-2*u),j=row?3:1;
 return {x:a[j]+(b[j]-a[j])*p,y:a[j+1]+(b[j+1]-a[j+1])*p,face:age>=9&&age<13?(row?-1:1):age>=16?(row?1:-1):1};
}
function drawRoamingDuet(){
 const age=duet.age,actors=[{row:0,...duetPose(age,0)}];if(age>=.45)actors.push({row:1,...duetPose(age,1)});
 actors.sort((a,b)=>a.y-b.y);
 const cells=[[60,360,214],[438,340,590],[805,340,970],[1165,350,1350]];
 for(const a of actors){
  const f=Math.floor(Math.max(0,age-(a.row?.45:0))*5)%4,[sx,sw,cx]=cells[f],sy=a.row?512:0,base=a.row?1004:502,top=a.row?513:8;
  const h=perspectiveHeight(a.x,a.y,'attic')*(a.row?1.07:1),s=h/(base-top),rise=a.row?Math.min(1,(age-.45)/1.2):1;
  ellipse(a.x,a.y+2,h*.105,5,'#201c2840');ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.face,1);
  // The initial knee compression unfolds as Mike rises from his chair.
  ctx.scale(1,.72+.28*rise);ctx.rotate(Math.sin(age*3.5+a.row)*.012);
  ctx.drawImage(duetArt,sx,sy,sw,512,-(cx-sx)*s,-(base-sy)*s,sw*s,512*s);ctx.restore();
  if(Math.floor(age*2+a.row)%3===0){ctx.fillStyle='#ffe4a0';ctx.font='19px Georgia';ctx.fillText('♪',a.x+45,a.y-h-10-(age*15)%25)}
 }
}
function bridgeRunnerAge(age){return ((age%16)+16)%16}
function atBridgeExit(){return state.scene==='bridge'&&player.x>=970&&player.y<=447}
function runnerPose(age){
 if(age<2){const p=Math.max(0,age/2);return {x:-130+690*p,y:592-6*p,h:260,alpha:1,look:false,gone:false}}
 const p=Math.max(0,Math.min(1,(age-2)/13)),ease=1-Math.pow(1-p,1.4);
 return {x:560+(1010-560)*ease,y:586+(407-586)*ease,h:260*Math.pow(1-p,1.3)+7,alpha:p>.87?(1-p)/.13:1,look:(p>.25&&p<.33)||(p>.59&&p<.68),gone:p>=1};
}
function drawBridgeRunner(){
 const a=bridgeRunnerAge(time-sceneEnteredAt);if(!state.started||!overlay.hidden||!runnerArt.complete||!runnerArt.naturalWidth)return;const p=runnerPose(a);if(p.gone)return;
 if(!runnerFrames)runnerFrames=buildRunnerFrames();
 const frame=p.look?4+Math.floor(a*7)%2:Math.floor(a*9)%4,f=runnerFrames[frame],s=p.h/(f.base-f.top);
 ctx.save();ctx.globalAlpha=p.alpha;ellipse(p.x,p.y+1,p.h*.1,Math.max(1,p.h*.018),'#15363844');ctx.drawImage(f.canvas,p.x-f.anchor*s,p.y-f.base*s,f.canvas.width*s,f.canvas.height*s);ctx.restore();
}
let runnerFrames=null;
function buildRunnerFrames(){
 // Frames have unequal widths. Keep only each connected character silhouette;
 // uniform columns were including a strip of the neighbouring coat.
 const bounds=[[26,394,680,48,250],[417,754,683,53,610],[752,1097,692,32,965],[1089,1427,677,60,1315],[1450,1785,688,53,1660],[1815,2150,684,48,2020]];
 return bounds.map(([left,right,base,top,anchor])=>{
  const c=document.createElement('canvas');c.width=right-left+1;c.height=runnerArt.naturalHeight;const x=c.getContext('2d');x.drawImage(runnerArt,left,0,c.width,c.height,0,0,c.width,c.height);
  isolateSpriteSilhouette(c);
  return {canvas:c,base,top,anchor:anchor-left};
 });
}
function isolateSpriteSilhouette(c){
 const x=c.getContext('2d');
  const im=x.getImageData(0,0,c.width,c.height),d=im.data,n=c.width*c.height,visited=new Uint8Array(n);let largest=[];
  for(let k=0;k<n;k++){if(visited[k]||d[k*4+3]<100)continue;const stack=[k],component=[];visited[k]=1;while(stack.length){const j=stack.pop();component.push(j);const xx=j%c.width;for(const v of [xx?j-1:-1,xx<c.width-1?j+1:-1,j-c.width,j+c.width])if(v>=0&&v<n&&!visited[v]&&d[v*4+3]>=100){visited[v]=1;stack.push(v)}}if(component.length>largest.length)largest=component}
  const keep=new Uint8Array(n);for(const j of largest){keep[j]=1;for(const v of [j-1,j+1,j-c.width,j+c.width])if(v>=0&&v<n)keep[v]=1}for(let j=0;j<n;j++)if(!keep[j])d[j*4+3]=0;x.putImageData(im,0,0);
}
function beginSleep(){
 sleepState={age:0};keys.clear();target=null;waypoints=[];player.moving=false;$('#wake-up').hidden=false;updateUI();
}
function wakeUp(){sleepState=null;$('#wake-up').hidden=true;Object.assign(player,nearestFloor(930,540));updateUI();canvas.focus()}
function drawSleepingLP(){
 if(!sleepingArt.complete||!sleepingArt.naturalWidth)return;
 ctx.drawImage(sleepingArt,847,202,245,290);
}
function drawSleepShade(){
 if(!sleepState)return;const p=Math.min(1,sleepState.age/2.2);rect(0,0,1100,620,'rgba(5,15,35,'+(p*.66)+')');
 ctx.save();ctx.globalAlpha=p*.65;ctx.fillStyle='#ecddb4';ctx.font='16px Georgia';for(let i=0;i<3;i++){const u=(time*.35+i*.3)%1;ctx.fillText('z',1006+u*26,208-u*42)}ctx.restore();
}
let foregroundPlantLayer=null;
function drawForegroundPlant(){
 if(state.scene!=='living'||!room.complete||!room.naturalWidth)return;
 const shapes=[
 [[1100,337],[1085,338],[1060,355],[1046,382],[1055,408],[1082,399],[1100,381]],
 [[1073,387],[1036,382],[1004,387],[984,409],[1010,407],[1030,415],[1050,408]],
 [[1100,411],[1071,407],[1046,424],[1029,454],[1055,448],[1073,459],[1100,451]],
 [[1053,436],[1018,432],[988,445],[968,474],[999,461],[1029,468],[1055,457]],
 [[1100,464],[1080,463],[1064,488],[1040,498],[1043,521],[1058,544],[1100,550]],
 [[1047,527],[1029,562],[1014,620],[1100,620],[1100,539]]
 ];
 if(!foregroundPlantLayer){
  const layer=document.createElement('canvas');layer.width=1100;layer.height=620;const c=layer.getContext('2d');c.beginPath();for(const p of shapes){c.moveTo(...p[0]);for(const v of p.slice(1))c.lineTo(...v);c.closePath()}c.clip();c.drawImage(room,0,0,1100,620);
  // Remove the chair-colored gaps between leaves from this foreground cutout.
  const pixels=c.getImageData(0,0,1100,620),v=pixels.data;
  for(let y=330;y<530;y++)for(let x=940;x<1100;x++){const i=(y*1100+x)*4;if(y>493&&x>1035)continue;if(!(v[i+1]>v[i]*1.08&&v[i+1]>v[i+2]*.84))v[i+3]=0}
  c.putImageData(pixels,0,0);foregroundPlantLayer=layer;
 }
 ctx.drawImage(foregroundPlantLayer,0,0);

}
function tickRoomCharacters(dt){
 tickPartyMoment(dt);tickBarOrson(dt);syncPartyButtons();
 if(duet){duet.age+=dt;if(duet.age>=22)stopDuet();else if($('#objective').textContent!==objective())$('#objective').textContent=objective()}
 if(sleepState)sleepState.age+=dt;
 if(state.scene==='stage')tickStage(dt);
 if(typeof backgroundMusic!=='undefined')backgroundMusic.sync({started:state.started,sound:state.sound,visible:!document.hidden,foreground:state.playing||mission?.kind==='jukebox'||!!albumState.video,boost:!!duet,sleeping:!!sleepState});
}
$('#stop-duet').onclick=stopDuet;$('#wake-up').onclick=wakeUp;

let partyMoment=null;
function startPartyMoment(kind){
 if(state.scene!=='party'||!state.started||action||mission||!dialog.hidden)return;
 keys.clear();target=null;waypoints=[];player.moving=false;partyMoment={kind,age:0};
 if(kind==='toast'){player.x=610;player.y=590;partyMoment.clinked=false;}
 syncPartyButtons();
}
function tickPartyMoment(dt){
 if(!partyMoment)return;if(state.scene!=='party'){partyMoment=null;return}
 partyMoment.age+=dt;
 if(partyMoment.kind==='toast'&&partyMoment.age>=1.4&&!partyMoment.clinked){partyMoment.clinked=true;soundEffects.play('cheer',{cooldown:0,volume:.42});soundEffects.play('glassClink',{cooldown:0,volume:.48});}
 if(partyMoment.age> (partyMoment.kind==='toast'?5:8)){
  const kind=partyMoment.kind;partyMoment=null;const id=kind==='toast'?'party-toast':'party-dance';
  if(!allObjects.find(o=>o.id===id)?.found)markMemory(id,kind==='toast'?'Memory found · Here’s to ten years of Lost On You!':'Memory found · A little dance for a song that stayed with us.');
 }
}
function partyRaise(){const t=partyMoment?.age||0;const u=Math.max(0,Math.min(1,(t-.25)/1.15));return u*u*(3-2*u)}
function drawPartyArm(x,y,side,angle,bend,glass=false){
 const src=side<0?1200:695;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 ctx.drawImage(rigParts,src,0,150,240,-17,-8,34,55);
 ctx.translate(0,44);ctx.rotate(bend);
 ctx.drawImage(rigParts,src,230,150,282,-16,-5,32,64);
 if(glass){ctx.translate(0,54);ctx.rotate(-angle-bend);drawWineAt(0,-18,.85)}
 ctx.restore();
}
function drawPartyLP(){
 const toast=partyMoment.kind==='toast',t=partyMoment.age,beat=t*Math.PI*1.15,s=characterHeight(player.y)/370;
 const sway=toast?0:Math.sin(beat)*3,bob=toast?0:(1-Math.cos(beat*2))*1.5;
 ctx.save();ctx.translate(player.x,player.y);ctx.scale(s,s);ellipse(0,2,24,5,'#17272844');
 if(toast){ctx.save();ctx.beginPath();ctx.rect(-20,-172,40,125);ctx.rect(-50,-50,100,55);ctx.clip();ctx.drawImage(character,167,200,220,170,-110,-170,220,170);ctx.restore();}
 else for(const side of [-1,1]){
  const lift=toast?0:Math.max(0,Math.sin(beat+(side<0?0:Math.PI)))*5;
  const hip={x:side*9+sway,y:-171+bob},foot={x:side*14+(toast?0:Math.sin(beat+side)*3),y:-15-lift};
  drawRigLeg(solveLeg(hip,foot),false,false);
 }
 ctx.save();ctx.translate(sway,bob);ctx.rotate(toast?0:Math.sin(beat)*.02);
 // Original head and torso remain a single undistorted cutout.
 ctx.save();ctx.beginPath();ctx.moveTo(-57,-372);ctx.lineTo(57,-372);ctx.lineTo(57,-277);ctx.lineTo(30,-265);ctx.lineTo(22,-173);ctx.lineTo(-22,-173);ctx.lineTo(-30,-265);ctx.lineTo(-57,-277);ctx.closePath();ctx.clip();ctx.drawImage(character,167,0,220,200,-110,-370,220,200);ctx.restore();
 for(const side of [-1,1]){const raise=partyRaise();const angle=toast?-side*(.18+raise*1.95):-side*(.26+Math.sin(beat+side*.7)*.17);const bend=toast?-side*.3:-side*(.35+.16*Math.cos(beat));drawPartyArm(side*28,-258,side,angle,bend,toast&&side>0)}
 ctx.restore();ctx.restore();
}
function drawPartyCelebration(){
 if(partyMoment?.kind!=='toast')return;const t=partyMoment.age,raise=partyRaise();ctx.save();
 ctx.restore();
 for(let i=0;i<64;i++){const x=(i*137.3+Math.sin(t+i)*24)%1100,y=((t*70+i*43)%620)-30;ctx.save();ctx.translate(x,y);ctx.rotate(t*(i%2?1:-1)+i);ctx.fillStyle=['#e9be68','#ee91a6','#83c7bd','#fff0cf'][i%4];ctx.globalAlpha=.85;ctx.fillRect(-3,-5,6,10);ctx.restore();}
}
function syncPartyButtons(){
 const show=state.scene==='party'&&state.started&&dialog.hidden&&overlay.hidden&&!mission&&!action;
 $('#party-actions').hidden=!show;
 $('#party-dance-button').textContent=partyMoment?.kind==='dance'?'Stop dancing ■':'Dance with LP ♫';
 $('#party-cheers-button').disabled=!!partyMoment;
 $('#bridge-play').hidden=state.scene!=='bridge'||!state.started||!dialog.hidden||!overlay.hidden||!!mission||bridgeRun.active||!!action;
}
$('#party-dance-button').onclick=()=>{if(partyMoment){partyMoment=null;syncPartyButtons()}else startPartyMoment('dance')};
$('#party-cheers-button').onclick=()=>startPartyMoment('toast');
$('#bridge-play').onclick=()=>openBridgeRun();

const guestToastParts=new Map();
function drawGuestToast(g,ry,rh,baseline,s){
 let parts=guestToastParts.get(g.row);
 if(!parts){const body=document.createElement('canvas'),arm=document.createElement('canvas');body.width=arm.width=240;body.height=arm.height=rh;
  const polygon=[[28,0],[84,0],[90,69],[83,99],[61,102],[37,78]];
  const path=c=>{c.beginPath();polygon.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()};
  const bc=body.getContext('2d'),ac=arm.getContext('2d');bc.drawImage(guestsArt,535,ry,240,rh,0,0,240,rh);bc.save();path(bc);bc.clip();bc.clearRect(0,0,240,rh);bc.restore();ac.save();path(ac);ac.clip();ac.drawImage(guestsArt,535,ry,240,rh,0,0,240,rh);ac.restore();parts={body,arm};guestToastParts.set(g.row,parts);}
 ctx.save();ctx.translate(-115*s,-(baseline-ry)*s);ctx.scale(s,s);ctx.drawImage(parts.body,0,0);ctx.translate(72,89);ctx.rotate((1-partyRaise())*-.75);ctx.drawImage(parts.arm,-72,-89);ctx.restore();
}

function vintageToastFrame(age){return Math.min(3,Math.max(0,Math.floor(Math.max(0,age-.2)/.38)))}
function drawVintageToast(g){
 if(!vintageToastArt.complete||!vintageToastArt.naturalWidth)return;
 const sw=vintageToastArt.naturalWidth/4,sh=vintageToastArt.naturalHeight,frame=vintageToastFrame(partyMoment.age),scale=partyHeight(g.y)/804;
 // Each keyframe is a complete painted figure: no torso erasure or limb patching.
 ctx.save();ctx.translate(g.x,g.y);ellipse(0,2,25,5,'#15161e55');ctx.drawImage(vintageToastArt,frame*sw,0,sw,sh,-220*scale,-859*scale,sw*scale,sh*scale);ctx.restore();
}

const barOrson={mode:'away',age:0,x:-100,y:570};
function callBarOrson(){if(barOrson.mode==='away')Object.assign(barOrson,{mode:'running',age:0,x:-100,y:570});else if(barOrson.mode==='sitting')$('#orson-play').hidden=false;}
function tickBarOrson(dt){
 if(state.scene==='bar'&&barOrson.mode==='running'){barOrson.age+=dt;const u=Math.min(1,barOrson.age/2.8),ease=1-Math.pow(1-u,1.3);barOrson.x=-100+350*ease;barOrson.y=570-40*ease+Math.sin(u*Math.PI*4)*5;if(u===1){barOrson.mode='sitting';barOrson.age=0;}}
 if(state.scene==='bar'&&barOrson.mode==='sitting')barOrson.age+=dt;
 $('#orson-play').hidden=state.scene!=='bar'||barOrson.mode!=='sitting'||!state.started||!dialog.hidden||!!mission||!!duet;
}
function drawOrsonBed(){
 ctx.save();ctx.translate(250,536);
 ellipse(0,10,72,20,'#172f3544');
 // Raised padded back and sides, with a low entrance at the front.
 ellipse(0,-14,69,31,'#254e53');ellipse(0,-19,65,27,'#63a199');ellipse(0,-17,52,19,'#21484b');
 ctx.strokeStyle='#9dc5b0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-20,61,24,0,Math.PI,Math.PI*2);ctx.stroke();
 ellipse(0,-5,51,17,'#cf9b60');ellipse(0,-8,45,13,'#f0d1a0');
 ctx.strokeStyle='#b98755';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-8,39,10,0,0,Math.PI*2);ctx.stroke();
 for(const side of [-1,1]){ctx.save();ctx.translate(side*55,-5);ctx.rotate(side*.3);ellipse(0,0,14,25,'#528e86');ellipse(-side*3,-4,8,20,'#76ada0');ctx.restore();}
 ctx.fillStyle='#3b736e';ctx.beginPath();ctx.moveTo(-55,4);ctx.quadraticCurveTo(-40,25,-22,20);ctx.lineTo(22,20);ctx.quadraticCurveTo(42,24,55,4);ctx.quadraticCurveTo(22,13,0,12);ctx.quadraticCurveTo(-24,13,-55,4);ctx.fill();
 ctx.strokeStyle='#a4c5ad';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-48,13);ctx.quadraticCurveTo(0,33,48,13);ctx.stroke();
 rect(-21,12,42,15,'#e2bb7d');ctx.fillStyle='#264c4b';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('ORSON',0,23);
 ctx.restore();
}
const orsonSprite=new Image();orsonSprite.src='orson-run-sit-v2.webp';
const vintageToastArt=new Image();vintageToastArt.src='titttty-cheers-v2.webp';
const orsonCrops=[[15,75,520,375,290,444],[550,70,465,340,800,405],[1040,110,480,370,1280,475],[35,515,500,440,290,947],[590,505,415,455,800,955],[1095,505,365,460,1280,958]];
let orsonIdleParts=null;
function orsonIdlePose(t){const p=t%16;return p<3?'head':p<5.5?'tongue':p<8.5?'scratch':p<13?'wag':'rest'}
function buildOrsonIdleParts(){
 const parts={};for(const frame of [2,5]){const [sx,sy,w,h,ax,base]=orsonCrops[frame],body=document.createElement('canvas'),piece=document.createElement('canvas');body.width=piece.width=w;body.height=piece.height=h;
  const bc=body.getContext('2d'),pc=piece.getContext('2d');const path=c=>{c.beginPath();if(frame===5)c.ellipse(188,142,151,148,0,0,Math.PI*2);else{c.moveTo(0,0);c.lineTo(179,0);c.lineTo(179,157);c.lineTo(109,190);c.lineTo(0,167);c.closePath()}};
  bc.drawImage(orsonSprite,sx,sy,w,h,0,0,w,h);bc.save();path(bc);bc.clip();bc.clearRect(0,0,w,h);bc.restore();pc.save();path(pc);pc.clip();pc.drawImage(orsonSprite,sx,sy,w,h,0,0,w,h);pc.restore();parts[frame]={body,piece};
 }return parts;
}
function drawBarOrson(){
 if(state.scene!=='bar'||barOrson.mode==='away'||!orsonSprite.complete||!orsonSprite.naturalWidth)return;
 const running=barOrson.mode==='running',t=barOrson.age,phase=t*12,idle=orsonIdlePose(t),bounce=running?Math.pow(Math.max(0,Math.sin(phase)),.7)*14:0;
 const frame=running?[0,1,2,3][Math.floor(t*7)%4]:idle==='wag'?2:5,[sx,sy,w,h,ax,base]=orsonCrops[frame],scale=.15;
 ctx.save();ctx.translate(barOrson.x,barOrson.y);ellipse(0,2,26,5,'#17272844');ctx.translate(0,-bounce);ctx.rotate(running?Math.sin(phase*.5)*.055:0);
 if(running)ctx.drawImage(orsonSprite,sx,sy,w,h,(sx-ax)*scale,(sy-base)*scale,w*scale,h*scale);
 else{
  orsonIdleParts??=buildOrsonIdleParts();const parts=orsonIdleParts[frame];ctx.save();ctx.scale(scale,scale);ctx.translate(sx-ax,sy-base);ctx.drawImage(parts.body,0,0);
  const pivot=frame===5?{x:188,y:260}:{x:147,y:168};ctx.save();ctx.translate(pivot.x,pivot.y);ctx.rotate(frame===2?Math.sin(t*14)*.17:idle==='scratch'?Math.sin(t*18)*.06:Math.sin(t*1.6)*.075);ctx.drawImage(parts.piece,-pivot.x,-pivot.y);ctx.restore();
  if(idle==='tongue'){const out=Math.max(0,Math.sin((t-3)*Math.PI*2));ctx.save();ctx.translate(188,183);ctx.rotate(.12);ctx.fillStyle='#d58387';ctx.strokeStyle='#6f4249';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-7,0,14,5+out*15,6);ctx.fill();ctx.stroke();ctx.restore();}
  if(idle==='scratch'){ctx.save();ctx.translate(92,352);ctx.rotate(-.55+Math.sin(t*23)*.35);ctx.drawImage(orsonSprite,1201,876,60,68,-25,-100,60,110);ctx.restore();}
  ctx.restore();
 }
 ctx.restore();
}
$('#orson-play').onclick=()=>{if(state.scene==='bar'&&barOrson.mode==='sitting')changeScene('orson')};

function drawPartyAnniversaryBanner(){
 if(state.scene!=='party'||partyMoment?.kind!=='toast')return;
 const t=partyMoment.age,enter=Math.min(1,t/1.05),pop=1+2.70158*Math.pow(enter-1,3)+1.70158*Math.pow(enter-1,2);
 ctx.save();ctx.translate(550,458+(1-enter)*65);ctx.scale(.75+.25*pop,.75+.25*pop);ctx.globalAlpha=Math.min(1,t*2);
 const gold=ctx.createLinearGradient(0,-100,0,65);[[0,'#fff5c8'],[.23,'#e8ae3b'],[.45,'#fff8d5'],[.57,'#c78b27'],[.82,'#f8d77a'],[1,'#fff1b2']].forEach(([p,c])=>gold.addColorStop(p,c));
 ctx.textAlign='center';ctx.lineJoin='round';ctx.strokeStyle='#704113';ctx.lineWidth=5;ctx.shadowColor='#f9c75b';ctx.shadowBlur=14;
 const lettering=(text,x,y,font)=>{ctx.font=font;ctx.fillStyle=gold;ctx.strokeText(text,x,y);ctx.fillText(text,x,y);ctx.save();ctx.shadowBlur=0;ctx.globalAlpha*=.2+.35*Math.pow(Math.max(0,Math.sin(t*3+x*.005)),8);ctx.fillStyle='#fffbea';ctx.fillText(text,x,y);ctx.restore()};
 lettering('10',-253,51,'bold 164px Georgia');
 ctx.save();const label=Math.min(1,Math.max(0,(t-.35)/.7));ctx.globalAlpha*=label;ctx.translate((1-label)*50,0);lettering('ANNIVERSARY',92,-3,'bold 42px Georgia');lettering('LOST ON YOU',92,35,'bold 22px Georgia');ctx.restore();
 ctx.shadowBlur=5;ctx.strokeStyle='#f9d884';ctx.lineWidth=1.5;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(90+side*83,51);ctx.quadraticCurveTo(90+side*138,68,90+side*199,48);ctx.stroke();}
 for(let i=0;i<16;i++){const x=-365+i*48,y=-65+Math.sin(i*4.7)*64,a=Math.pow(Math.max(0,Math.sin(t*3+i*1.8)),6),r=3+a*7;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(t*.4);ctx.fillStyle='#fff8d7';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.2,-r*.2);ctx.lineTo(r,0);ctx.lineTo(r*.2,r*.2);ctx.lineTo(0,r);ctx.lineTo(-r*.2,r*.2);ctx.lineTo(-r,0);ctx.lineTo(-r*.2,-r*.2);ctx.closePath();ctx.fill();ctx.restore();}
 ctx.restore();
}

$('#orson-return').onclick=()=>changeScene('bar');
