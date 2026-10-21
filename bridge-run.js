// Three-lane perspective bridge runner; original game character stays back-facing.
const bridgeRun={active:false,age:0,hits:0,wine:0,lane:1,x:600,jump:0,jumpAge:0,jumpRequested:false,objects:[],spawnAt:.6,spawned:0,cooldown:0,hitFlash:0,leftHeld:false,rightHeld:false,upHeld:false};
function openBridgeRun(){makeMission('run-intro','A little wine. A little quick thinking.','Run to the far end of the bridge. Use ← / → or A / D to change lanes. Jump with ↑ / W / Space or the Jump button. Avoid guitar cases, amplifiers and wine barrels. Collect as many wine glasses as you can. Three collisions end the run.');missionButton('Start running →',startBridgeRun)}
function startBridgeRun(){closeMission();keys.clear();target=null;waypoints=[];Object.assign(bridgeRun,{active:true,age:0,hits:0,wine:0,lane:1,x:600,jump:0,jumpAge:0,jumpRequested:false,objects:[],spawnAt:.6,spawned:0,cooldown:0,hitFlash:0,leftHeld:false,rightHeld:false,upHeld:false});mission={kind:'bridge-run',instructions:'Run to the end · Change lanes, jump over equipment, collect wine.'};$('#run-hud').hidden=false;Object.assign(player,{x:600,y:560,moving:true,direction:'back'});updateUI();syncRunHUD();canvas.focus()}
function stopBridgeRun(){bridgeRun.active=false;bridgeRun.objects=[];bridgeRun.jump=0;keys.clear();$('#run-hud').hidden=true;closeMission();Object.assign(player,nearestFloor(600,560,'bridge'))}
function finishBridgeRun(){const win=bridgeRun.hits<3,wine=bridgeRun.wine;stopBridgeRun();if(win)markMemory('bridge-run','Memory found · A Lost On You run, with '+wine+' glasses along the way.');show(win?'Made it to the other side.':'One more run?',win?'You reached the end of the bridge and collected '+wine+' wine glasses. Here’s to keeping the music moving.':'Three bumps in the road. Try changing lanes earlier, or jump over the equipment. You collected '+wine+' wine glasses.','LOST ON YOU · BRIDGE RUN')}
function requestBridgeJump(){if(bridgeRun.active&&bridgeRun.jumpAge===0){bridgeRun.jumpAge=.001;soundEffects.play('paper',{volume:.15})}}
function bridgeRunPointer(x,y){if(y<440){requestBridgeJump();return}bridgeRun.lane=Math.max(0,Math.min(2,Math.round((x-430)/170)))}
function bridgeRunKey(e){e.preventDefault();const k=bindings[e.key]||bindings[e.key.toLowerCase()];if(k)keys.add(k);if(e.code==='Space'||e.key===' ')requestBridgeJump();if(e.key==='Escape')stopBridgeRun()}
function runProjection(lane,p){return {x:1010+(600-1010)*p+(lane-1)*170*p,y:407+(560-407)*p,s:.02+.98*p}}
function spawnRunRow(){const n=bridgeRun.spawned++,lane=n%3,type=['case','barrel','amp'][n%3];bridgeRun.objects.push({type,lane,p:0,done:false});bridgeRun.objects.push({type:'wine',lane:(lane+1)%3,p:-.2,done:false});if(n%3===1)bridgeRun.objects.push({type:'wine',lane:(lane+2)%3,p:-.4,done:false})}
function syncRunHUD(){$('#run-wine').textContent='Wine: '+bridgeRun.wine;$('#run-hits').textContent='Hits: '+bridgeRun.hits+' / 3';$('#run-distance').textContent=Math.min(100,Math.floor(bridgeRun.age/28*100))+'%'}
function tickBridgeRun(dt){
 if(!bridgeRun.active||!dialog.hidden||!overlay.hidden)return;
 bridgeRun.age+=dt;bridgeRun.cooldown=Math.max(0,bridgeRun.cooldown-dt);bridgeRun.hitFlash=Math.max(0,bridgeRun.hitFlash-dt);
 const left=keys.has('left'),right=keys.has('right'),up=keys.has('up');if(left&&!bridgeRun.leftHeld)bridgeRun.lane=Math.max(0,bridgeRun.lane-1);if(right&&!bridgeRun.rightHeld)bridgeRun.lane=Math.min(2,bridgeRun.lane+1);if(up&&!bridgeRun.upHeld)requestBridgeJump();bridgeRun.leftHeld=left;bridgeRun.rightHeld=right;bridgeRun.upHeld=up;
 bridgeRun.x+=(430+bridgeRun.lane*170-bridgeRun.x)*Math.min(1,dt*13);if(bridgeRun.jumpAge>0){bridgeRun.jumpAge+=dt;if(bridgeRun.jumpAge>=.85){bridgeRun.jumpAge=0;bridgeRun.jump=0}else bridgeRun.jump=Math.sin(bridgeRun.jumpAge/.85*Math.PI)*87}
 Object.assign(player,{x:bridgeRun.x,y:560,direction:'back',moving:true});player.walkTime+=dt;player.travel+=dt*320;
 if(bridgeRun.age<24&&bridgeRun.age>=bridgeRun.spawnAt){spawnRunRow();bridgeRun.spawnAt+=1.15}
 for(const o of bridgeRun.objects){o.p+=dt*.29;if(o.done)continue;const p=runProjection(o.lane,o.p);if(o.p>=.94&&o.p<=1.08&&Math.abs(p.x-bridgeRun.x)<57){if(o.type==='wine'){bridgeRun.wine++;o.done=true;soundEffects.play('glassClink',{volume:.25})}else if(bridgeRun.jump>45){o.done=true}else if(bridgeRun.cooldown===0){bridgeRun.hits++;bridgeRun.cooldown=1.2;bridgeRun.hitFlash=.45;o.done=true;soundEffects.play('splat')}}if(o.p>1.16)o.done=true}
 bridgeRun.objects=bridgeRun.objects.filter(o=>!o.done);syncRunHUD();if(bridgeRun.hits>=3||bridgeRun.age>=28)finishBridgeRun();
}
function drawRunProp(type,x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=3;ctx.strokeStyle='#263d3e';
 ellipse(0,2,39,8,'#173a3c55');if(type==='wine'){ctx.strokeStyle='#f6dfaa';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-35,19,29,0,0,Math.PI*2);ctx.stroke();drawWineAt(0,-15,1.3);ctx.restore();return}
 if(type==='barrel'){ellipse(0,-40,34,44,'#996641');rect(-31,-50,62,28,'#a97647');for(const yy of [-67,-25]){ctx.strokeStyle='#33484b';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(0,yy,31,8,0,0,Math.PI*2);ctx.stroke()}ctx.strokeStyle='#6f482f';ctx.lineWidth=2;ellipse(-9,-48,18,28,'#bb8b54');for(const xx of [-16,0,16]){ctx.beginPath();ctx.moveTo(xx,-75);ctx.lineTo(xx,-6);ctx.stroke()}}
 if(type==='amp'){rect(-40,-80,80,80,'#273536');ctx.fillStyle='#448781';ctx.beginPath();ctx.moveTo(40,-80);ctx.lineTo(52,-89);ctx.lineTo(52,-9);ctx.lineTo(40,0);ctx.fill();rect(-30,-87,60,7,'#d5b77e');rect(-33,-65,66,57,'#b29464');ctx.strokeRect(-40,-80,80,80);for(let yy=-59;yy< -8;yy+=7){ctx.strokeStyle='#675c4b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-30,yy);ctx.lineTo(30,yy);ctx.stroke()}for(let xx=-25;xx<30;xx+=12)ellipse(xx,-73,2.5,2.5,'#e9c27f')}
 if(type==='case'){rect(-43,-63,86,63,'#24313b');ctx.fillStyle='#487b77';ctx.beginPath();ctx.moveTo(-43,-63);ctx.lineTo(-29,-74);ctx.lineTo(53,-74);ctx.lineTo(43,-63);ctx.fill();rect(-32,-58,64,4,'#678c87');ctx.strokeStyle='#c2ba9f';ctx.strokeRect(-43,-63,86,63);rect(-46,-51,6,14,'#d4c9ae');rect(40,-51,6,14,'#d4c9ae');rect(-12,-68,24,5,'#161f24');ctx.fillStyle='#e4cf99';ctx.font='bold 19px Arial';ctx.textAlign='center';ctx.fillText('LP',0,-25)}
 // Reuse the painted equipment from the concert scene for a consistent finish.
 if((type==='case'||type==='amp')&&stagePainting.complete&&stagePainting.naturalWidth){
  const kx=stagePainting.naturalWidth/1100,ky=stagePainting.naturalHeight/620;
  const crop=type==='case'?[143,209,65,108]:[287,270,64,52];
  ctx.save();ctx.beginPath();ctx.roundRect(type==='case'?-43:-40,type==='case'?-67:-80,type==='case'?86:80,type==='case'?67:80,4);ctx.clip();
  ctx.drawImage(stagePainting,crop[0]*kx,crop[1]*ky,crop[2]*kx,crop[3]*ky,type==='case'?-43:-40,type==='case'?-67:-80,type==='case'?86:80,type==='case'?67:80);ctx.restore();
 }
 ctx.restore()}
function drawBridgeRunObjects(front=false){if(!bridgeRun.active)return;
 const lanes=[0,1,2];if(!front){ctx.save();ctx.strokeStyle='#ffe0a537';ctx.setLineDash([10,15]);for(const lane of lanes){const a=runProjection(lane-.5,.05),b=runProjection(lane-.5,1.15);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore();}
 for(const o of [...bridgeRun.objects].sort((a,b)=>a.p-b.p)){if(o.p<0||(o.p>1)!==front)continue;const p=runProjection(o.lane,o.p);drawRunProp(o.type,p.x,p.y,p.s)}
}
function drawBridgeRunnerPlayer(){if(!character.complete||!character.naturalWidth)return;const h=characterHeight(560),frame=Math.floor(bridgeRun.age*9)%4,center=[277,567,872,1174][frame],s=h/361;ellipse(player.x,562,23-bridgeRun.jump*.08,5,'#15363855');ctx.save();if(bridgeRun.hitFlash>0)ctx.globalAlpha=.55+.45*Math.sin(bridgeRun.age*35)**2;ctx.drawImage(character,center-110,725,220,361,player.x-110*s,560-h-bridgeRun.jump,220*s,h);ctx.restore()}
function drawBridgeRunInvitation(){if(!bridgeRun.active){drawRunProp('case',912,315,.5);ctx.fillStyle='#fbe2a8';ctx.font='bold 12px Arial';ctx.fillText('RUN →',886,274)}}
$('#run-stop').onclick=stopBridgeRun;$('#run-jump').onclick=requestBridgeJump;
