const stagePainting=new Image();stagePainting.src='07-encore-stage-palette-v3.webp';
const stageReactionArt=new Image();stageReactionArt.src='lp-stage-costume-v2.webp';
const originalStageHeads=new Image();originalStageHeads.src='lp-stage-reactions-v1.webp';
const stageGame={active:false,played:false,age:0,spawned:0,score:0,lives:6,caught:{flowers:0,bra:0,ribbon:0},items:[],cooldown:0,target:null,flash:0,reaction:null};
let stageHUDStamp='';
roomPositions.stage={x:550,y:495};roomInfo.stage={eyebrow:'05 / ON STAGE',title:'Catch a little love.',bounds:{left:135,right:965,top:495,bottom:495}};
roomCopy.stage='Catch flowers, bras and red gift ribbons. Dodge the small water bottles and footballs. Move left and right with arrows, A/D, touch arrows or by tapping the stage.';
function showStageInstructions(){show('One last encore.',roomCopy.stage+' Catch at least six gifts. Six hits end the game.','CATCH THE LOVE · DODGE THE REST')}
function syncStageUI(){
 $('#stage-intro').hidden=state.scene!=='stage'||stageGame.active||stageGame.played||!state.started;
 $('#stage-replay').hidden=state.scene!=='stage'||stageGame.active||!stageGame.played;
 $('#stage-hud').hidden=state.scene!=='stage';
 const stamp=[stageGame.score,stageGame.lives,...Object.values(stageGame.caught)].join(':');if(stamp===stageHUDStamp)return;stageHUDStamp=stamp;
 $('#stage-score').textContent='Gifts: '+stageGame.score;
 for(const type of ['flowers','bra','ribbon'])$('#stage-count-'+type).textContent=String(stageGame.caught[type]);
 const hits=6-stageGame.lives;$('#stage-hit-count').textContent='Hits: '+hits+' / 6';
 $('#stage-hits').setAttribute('aria-valuenow',String(hits));
 $('#stage-hits').replaceChildren();for(let i=0;i<6;i++){const pip=document.createElement('span');pip.className=i<hits?'hit used':'hit';$('#stage-hits').appendChild(pip)}
}
function startStage(){
 if(!state.started||state.scene!=='stage')return;
 Object.assign(stageGame,{active:true,age:0,spawned:0,score:0,lives:6,caught:{flowers:0,bra:0,ribbon:0},items:[],cooldown:0,target:null,flash:0,reaction:null,finishing:false});player.x=550;player.y=495;keys.clear();
 $('#stage-stop').hidden=false;updateUI();canvas.focus();
}
function stopStage(){stageGame.active=false;stageGame.played=true;stageGame.target=null;player.moving=false;target=null;waypoints=[];stageGame.items=[];stageGame.reaction=null;keys.clear();$('#stage-stop').hidden=true;updateUI()}
function finishStage(){const win=stageGame.score>=6&&stageGame.lives>0,score=stageGame.score;stopStage();show(win?'What a night.':'One more encore?',win?'You caught '+score+' gifts and kept the music going. Ten years of Lost On You, and a little love thrown back from the crowd. Thanks for playing.':'You caught '+score+' gifts. Try again: stand under the flowers, bras and red ribbons, and move away from bottles and footballs.','LOST ON YOU · '+(win?'ENCORE COMPLETE':'TRY AGAIN'))}
function spawnStageItem(){
 const types=['flowers','bottle','bra','ribbon','football'],type=types[stageGame.spawned%5],source=100+Math.random()*900,destination=155+Math.random()*790;
 stageGame.items.push({type,x:source,y:640,vx:(destination-source)/2.2,vy:-555,age:0,angle:(Math.random()-.5)*.5,good:['flowers','bra','ribbon'].includes(type)});stageGame.spawned++;
}
function stageCollision(item){return item.vy>0&&Math.abs(item.x-player.x)<49&&item.y>player.y-255&&item.y<player.y-95}
function tickStage(dt){
 if(!stageGame.active||!dialog.hidden||!overlay.hidden)return;stageGame.age+=dt;stageGame.cooldown=Math.max(0,stageGame.cooldown-dt);stageGame.flash=Math.max(0,stageGame.flash-dt);
 if(stageGame.reaction){stageGame.reaction.age+=dt;if(stageGame.reaction.age>=.85)stageGame.reaction=null}
 if(stageGame.finishing){if(!stageGame.reaction)finishStage();return}
 let dx=Number(keys.has('right'))-Number(keys.has('left'));if(dx)stageGame.target=null;else if(stageGame.target!==null){const d=stageGame.target-player.x;dx=Math.abs(d)<6?0:Math.sign(d)}
 const old=player.x;player.x=Math.max(135,Math.min(965,player.x+dx*420*dt));player.moving=Math.abs(old-player.x)>.01;player.direction=player.moving?(dx>0?'right':'left'):'front';if(player.moving){player.travel+=Math.abs(player.x-old)/(300/370);player.walkTime+=dt}
 if(stageGame.spawned<20&&stageGame.age>=stageGame.spawned*1.35)spawnStageItem();
 for(const item of stageGame.items){item.age+=dt;item.vy+=390*dt;item.x+=item.vx*dt;item.y+=item.vy*dt;
  if(stageCollision(item)){if(item.good){stageGame.score++;stageGame.caught[item.type]++;soundEffects.play('collect');item.done=true;stageGame.flash=.4;if(stageGame.reaction?.kind!=='hurt')stageGame.reaction={kind:'happy',age:0,type:item.type}}else if(stageGame.cooldown===0){stageGame.lives--;stageGame.cooldown=1;item.done=true;stageGame.reaction={kind:'hurt',age:0}}}
  if(item.y>675||item.x< -80||item.x>1180)item.done=true;
 }
 stageGame.items=stageGame.items.filter(i=>!i.done);syncStageUI();
 if(stageGame.lives<=0||(stageGame.spawned===20&&stageGame.items.length===0)){stageGame.items=[];if(stageGame.reaction)stageGame.finishing=true;else finishStage();}
}
function stageReactionPose(reaction){const p=Math.min(1,reaction.age/.85);return {jump:reaction.kind==='happy'?Math.sin(p*Math.PI)*58:0,lean:reaction.kind==='hurt'?Math.sin(p*Math.PI)*.1:0}}
function stageMovementFrame(){return player.moving?[1,3,2,3][Math.floor(player.walkTime*8)%4]:0}
let stageCostumeFrames=null;
function buildStageCostumeFrames(){
 const sw=stageReactionArt.naturalWidth/3,sh=stageReactionArt.naturalHeight/2;
 const headMasks=[
 [[235,0],[390,0],[390,112],[337,126],[327,145],[293,145],[286,124],[235,112]],
 [[685,0],[830,0],[830,112],[788,128],[780,145],[750,145],[743,125],[685,112]],
 [[1150,0],[1305,0],[1305,112],[1265,128],[1255,145],[1225,145],[1218,125],[1150,112]],
 [[245,500],[400,500],[400,617],[356,632],[348,653],[318,653],[312,631],[245,617]],
 [[685,505],[835,505],[835,605],[808,640],[795,675],[745,675],[725,640],[695,605]],
 [[1210,528],[1375,528],[1375,640],[1310,677],[1260,677],[1250,632],[1210,625]]];
 return Array.from({length:6},(_,i)=>{const c=document.createElement('canvas'),sy=i<3?0:sh-12;c.width=sw;c.height=i<3?sh:sh+12;const cx=c.getContext('2d');cx.drawImage(stageReactionArt,(i%3)*sw,sy,sw,c.height,0,0,sw,c.height);isolateSpriteSilhouette(c);
  // Keep the authored clothes and hands; replace only the new head with
  // exact pixels from the original game character / original reactions.
  cx.save();cx.globalCompositeOperation='destination-out';cx.fillStyle='#000';cx.beginPath();headMasks[i].forEach(([x,y],j)=>{const p=[x/1536*stageReactionArt.naturalWidth-(i%3)*sw,y/1024*stageReactionArt.naturalHeight-sy];if(j)cx.lineTo(...p);else cx.moveTo(...p)});cx.closePath();cx.fill();cx.restore();return {canvas:c,sy}});
}
function drawOriginalStageHead(frame,anchorX,base,sy,s){
 const necks=[[310,145],[760,145],[1240,145],[328,653],[765,675],[1280,683]],neck=necks[frame],col=frame%3,sw=stageReactionArt.naturalWidth/3;
 let art=character,sx=195,yy=0,w=160,h=112,nx=82,ny=108,scale=1.225;
 if(frame>0&&frame<4)yy=370;
 if(frame===4){art=originalStageHeads;sx=375;yy=75;w=240;h=245;nx=105;ny=225;scale=.6}
 if(frame===5){art=originalStageHeads;sx=1080;yy=145;w=290;h=250;nx=120;ny=215;scale=.63}
 const x=neck[0]/1536*stageReactionArt.naturalWidth-col*sw-anchorX,y=neck[1]/1024*stageReactionArt.naturalHeight-sy-base;
 ctx.save();
 const outline=frame<4?[[0,0],[160,0],[160,85],[102,85],[97,108],[69,108],[65,85],[0,85]]:frame===4?[[0,0],[240,0],[240,185],[130,215],[130,245],[90,245],[88,212],[0,185]]:[[10,0],[280,0],[280,160],[160,190],[155,245],[105,245],[100,190],[10,160]];
 ctx.beginPath();outline.forEach(([xx,yy],i)=>{const p=[(x+(xx-nx)*scale)*s,(y+(yy-ny)*scale)*s];if(i)ctx.lineTo(...p);else ctx.moveTo(...p)});ctx.closePath();ctx.clip();
 ctx.drawImage(art,sx,yy,w,h,(x-nx*scale)*s,(y-ny*scale)*s,w*scale*s,h*scale*s);ctx.restore();
}
function drawStageCostumeFrame(frame,jump=0,lean=0){
 if(!stageCostumeFrames)stageCostumeFrames=buildStageCostumeFrames();const f=stageCostumeFrames[frame];
 const sw=stageReactionArt.naturalWidth/3,col=frame%3,s=300/(stageReactionArt.naturalHeight*490/1024);
 const anchors=[[310,509],[760,507],[1240,507],[319,1004],[765,1012],[1250,1009]],anchorX=anchors[frame][0]/1536*stageReactionArt.naturalWidth-col*sw,base=anchors[frame][1]/1024*stageReactionArt.naturalHeight-f.sy;
 ctx.save();ctx.translate(player.x,player.y-jump);ctx.rotate(lean);if(frame!==0&&frame<4&&player.direction==='left')ctx.scale(-1,1);
 drawOriginalStageHead(frame,anchorX,base,f.sy,s);
 ctx.drawImage(f.canvas,-anchorX*s,-base*s,f.canvas.width*s,f.canvas.height*s);ctx.restore();
}
function drawStagePlayer(){
 if(!stageReactionArt.complete||!stageReactionArt.naturalWidth||!character.complete||!originalStageHeads.complete)return false;
 if(stageGame.reaction)return drawStageReaction();
 ellipse(player.x,player.y+2,27,5,'#0c111a66');drawStageCostumeFrame(stageMovementFrame());return true;
}
function drawStageReaction(){
 const r=stageGame.reaction;if(!r||!stageReactionArt.complete||!stageReactionArt.naturalWidth)return false;
 const pose=stageReactionPose(r);
 ellipse(player.x,player.y+2,27-pose.jump*.1,5,'#17272855');drawStageCostumeFrame(r.kind==='happy'?4:5,pose.jump,pose.lean);
 if(r.kind==='happy'){drawThrownItem({type:r.type,x:player.x+78,y:player.y-pose.jump-290,age:r.age,angle:0});}
 else{ctx.fillStyle='#ffb2a0';ctx.font='bold 22px Arial';ctx.fillText('!',player.x+48,player.y-260)}
 return true;
}
function drawStage(){rect(0,0,1100,620,'#183f43');if(stagePainting.complete&&stagePainting.naturalWidth)ctx.drawImage(stagePainting,0,0,1100,620)}
// Each authored hand is a rigid cutout, rotating around its wrist.
let crowdCutouts=null,crowdClean=null;
function buildAudienceCutouts(){
 const c=document.createElement('canvas');c.width=1100;c.height=620;const a=c.getContext('2d');a.drawImage(stagePainting,0,0,1100,620);
 const original=a.getImageData(0,0,1100,620),clean=a.getImageData(0,0,1100,620),v=original.data;
 const boxes=[[27,492,49,71],[153,500,43,67],[263,524,43,53],[421,519,43,66],[551,548,36,42],[612,537,44,48],[734,530,52,53],[898,508,48,69],[1018,500,47,64]];
 crowdCutouts=boxes.map(([x,y,w,h],i)=>{const tile=document.createElement('canvas');tile.width=w;tile.height=h;const tc=tile.getContext('2d'),pixels=tc.createImageData(w,h);
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const j=((y+yy)*1100+x+xx)*4,k=(yy*w+xx)*4;
   if(v[j]<100&&v[j+1]<108&&v[j+2]<122){for(let n=0;n<4;n++)pixels.data[k+n]=v[j+n];const floor=(Math.floor(460+yy*.18)*1100+x+xx)*4;for(let n=0;n<3;n++)clean.data[j+n]=v[floor+n];}
  }
  // Keep the connected hand silhouette, discarding dark floor grain.
  const seen=new Uint8Array(w*h);let largest=[];
  for(let k=0;k<w*h;k++){if(seen[k]||!pixels.data[k*4+3])continue;const group=[],queue=[k];seen[k]=1;while(queue.length){const q=queue.pop();group.push(q);for(const n of [q-1,q+1,q-w,q+w]){if(n<0||n>=w*h||seen[n]||!pixels.data[n*4+3]||(Math.abs(n-q)===1&&Math.floor(n/w)!==Math.floor(q/w)))continue;seen[n]=1;queue.push(n)}}if(group.length>largest.length)largest=group;}
  const keep=new Set(largest);for(let k=0;k<w*h;k++)if(!keep.has(k)){pixels.data[k*4+3]=0;const j=((y+Math.floor(k/w))*1100+x+k%w)*4;for(let n=0;n<4;n++)clean.data[j+n]=v[j+n];}
  tc.putImageData(pixels,0,0);return {tile,x,y,w,h,phase:i*1.37};});a.putImageData(clean,0,0);crowdClean=c;
}
function drawStageAudience(){
 if(!stagePainting.complete||!stagePainting.naturalWidth)return;if(!crowdCutouts)buildAudienceCutouts();
 ctx.drawImage(crowdClean,0,490,1100,130,0,490,1100,130);
 for(const hand of crowdCutouts){ctx.save();ctx.translate(hand.x+hand.w*.5,hand.y+hand.h);ctx.rotate(Math.sin(time*(1.25+(hand.phase%3)*.12)+hand.phase)*.17);ctx.drawImage(hand.tile,-hand.w*.5,-hand.h);ctx.restore();}
}
function drawThrownItem(item){
 ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.angle+Math.sin(item.age*2)*.25);ctx.lineWidth=2;ctx.strokeStyle='#342c3b';
 if(item.type==='flowers'){ctx.strokeStyle='#507c46';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(-15+i*15,-10);ctx.stroke();for(let j=0;j<5;j++)ellipse(-15+i*15+Math.cos(j*1.26)*7,-10+Math.sin(j*1.26)*7,6,6,['#ef8caf','#f3d183','#f8b7c8'][i]);ellipse(-15+i*15,-10,4,4,'#edbb55')}}
 if(item.type==='bra'){ctx.strokeStyle='#f2a6bf';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(-20,-15);ctx.lineTo(-11,0);ctx.moveTo(11,0);ctx.lineTo(20,-15);ctx.lineTo(25,0);ctx.stroke();ctx.fillStyle='#cf6f9a';ctx.beginPath();ctx.arc(-12,0,12,0,Math.PI);ctx.arc(12,0,12,0,Math.PI);ctx.fill();rect(-2,0,4,6,'#e9b4ca')}
 if(item.type==='ribbon'){ctx.strokeStyle='#db304a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-30,-26,-30,18,0,0);ctx.bezierCurveTo(30,-26,30,18,0,0);ctx.moveTo(0,0);ctx.lineTo(-10,27);ctx.moveTo(0,0);ctx.lineTo(14,24);ctx.stroke()}
 if(item.type==='bottle'){ctx.fillStyle='#9bcbdedd';ctx.beginPath();ctx.roundRect(-10,-13,20,39,5);ctx.fill();rect(-6,-23,12,12,'#72a7ca');rect(-6,-26,12,5,'#3273ad');rect(-10,0,20,12,'#f4e9c6')}
 if(item.type==='football'){ellipse(0,0,22,22,'#eeeee2');ellipse(0,0,8,8,'#24282b');for(let i=0;i<5;i++)ellipse(Math.cos(i*1.26)*17,Math.sin(i*1.26)*17,4,6,'#24282b')}
 ctx.restore();
}
function drawStageObjects(){if(state.scene!=='stage')return;drawStageAudience();for(const item of stageGame.items)drawThrownItem(item);if(stageGame.flash>0){ctx.save();ctx.globalAlpha=stageGame.flash*3;ctx.fillStyle='#ffe2a4';ctx.font='28px Georgia';ctx.fillText('♥',player.x+45,player.y-240);ctx.restore()}}
$('#stage-start').onclick=startStage;$('#stage-stop').onclick=exitStageEarly;$('#nav-stage').onclick=()=>changeScene('stage');


function exitStageEarly(){stopStage();canvas.focus()}

$('#stage-replay').onclick=startStage;
