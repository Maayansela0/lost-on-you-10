// Walkable foot positions, traced against each painting in 1100 ֳ— 620 space.
const FLOORS={
 stage:[[-90,494],[1190,494],[1190,590],[-90,590]],
 living:[[-90,585],[70,585],[180,493],[240,454],[665,448],[720,480],[855,480],[930,499],[1190,513],[1190,608],[-90,608]],
 bar:[[-90,485],[50,480],[220,454],[440,455],[610,468],[660,553],[760,575],[1190,586],[1190,619],[-90,619]],
 attic:[[-90,595],[160,595],[190,509],[190,470],[310,432],[650,435],[850,474],[970,510],[1190,538],[1190,609],[-90,609]],
 bridge:[[-90,608],[0,604],[300,592],[540,504],[785,465],[990,420],[1190,428],[1190,609],[-90,609]],
 party:[[-90,592],[135,592],[180,534],[260,491],[420,462],[680,462],[810,493],[950,481],[1190,526],[1190,609],[-90,609]],
 orson:[[-90,583],[1190,583],[1190,609],[-90,609]]
};
let waypoints=[];
function inPolygon(x,y,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
function onFloor(x,y,scene=state.scene){if(scene==='bar'&&((x>678&&x<801&&y<608)||(x>862&&x<1017&&y<614)))return false;return inPolygon(x,y,FLOORS[scene])}
function nearestFloor(x,y,scene=state.scene){if(onFloor(x,y,scene))return {x,y};let best={x:550,y:595},dist=Infinity;for(let yy=420;yy<=618;yy+=5)for(let xx=-75;xx<=1180;xx+=8){if(!onFloor(xx,yy,scene))continue;const d=(x-xx)**2+(y-yy)**2;if(d<dist){dist=d;best={x:xx,y:yy}}}return best}
function clearWalk(a,b){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/7);for(let i=0;i<=n;i++){const p=i/Math.max(1,n);if(!onFloor(a.x+(b.x-a.x)*p,a.y+(b.y-a.y)*p))return false}return true}
function routeTo(x,y,o=null){
 const end=nearestFloor(x,y),start={x:player.x,y:player.y};waypoints=[];afterWalk=o;
 if(clearWalk(start,end)){target=end;return}
 // A small visibility graph follows the inset floor boundary around furniture.
 const turns=state.scene==='bar'?[[660,615],[810,615],[840,615],[1025,615]]:[];
 const nodes=[start,end,...FLOORS[state.scene].map(([xx,yy])=>nearestFloor(xx,yy+8)),...turns.map(([x,y])=>({x,y}))];
 const cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),open=new Set(nodes.map((_,i)=>i));cost[0]=0;
 while(open.size){let u=-1;for(const i of open)if(u<0||cost[i]<cost[u])u=i;if(u<0||!Number.isFinite(cost[u]))break;open.delete(u);if(u===1)break;for(const v of open){if(!clearWalk(nodes[u],nodes[v]))continue;const d=cost[u]+Math.hypot(nodes[u].x-nodes[v].x,nodes[u].y-nodes[v].y);if(d<cost[v]){cost[v]=d;prev[v]=u}}}
 if(!Number.isFinite(cost[1])){target=null;afterWalk=null;return}
 let i=1;while(i!==0){waypoints.unshift(nodes[i]);i=prev[i]}target=waypoints.shift();
}
function moveOnFloor(dx,dy){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));for(let i=0;i<steps;i++){
 const x=player.x+dx/steps,y=player.y+dy/steps;
 if(onFloor(x,y)){player.x=x;player.y=y}
 else if(onFloor(x,player.y))player.x=x;
 else if(onFloor(player.x,y))player.y=y;
 else if(Math.abs(dx)>Math.abs(dy)){for(const d of [2,-2,4,-4])if(onFloor(x,player.y+d)){player.x=x;player.y+=d;break}}
 }
}
function partyHeight(y){return (236*1.5*.82*1.2*1.3*.85/.9)*(.94+(y-500)*.0012)/1.06}
function perspectiveHeight(x,y,scene){
 if(scene==='stage')return 300;
 if(scene==='bridge')return Math.max(125,Math.min(365,(y-370)*1.57));
 if(scene==='orson')return (175+(y-583)*1.5)*1.7;
 const near=scene==='living'?390:380,far=scene==='living'?295:245,top=scene==='attic'?430:450;
 const h=far+(near-far)*Math.max(0,Math.min(1,(y-top)/(605-top)));if(scene==='party')return partyHeight(y)*.9;return scene==='attic'?Math.min(h*2,y-22)*.7:scene==='bar'?h*1.2:h;
}
function handleScenePointer(e){
 if(!state.started||!dialog.hidden||!overlay.hidden||state.playing||action)return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*1100,y=(e.clientY-r.top)/r.height*620;
 if(state.scene==='stage'&&stageGame.active){stageGame.target=Math.max(135,Math.min(965,x));return}
 if(bridgeRun.active){bridgeRunPointer(x,y);return}if(mission){missionPointer(x,y);return}
 if(state.scene==='orson'&&y<568){findOrson(x,y);return}
 routeTo(x>1060?1170:x<25?-70:x,y);canvas.focus();
}
const roomExitNames={living:'Home bar',bar:'Attic',attic:'Bridge',bridge:'Encore',stage:'Party',orson:'Home bar'};
function canShowExitCue(){if(state.scene==='stage'&&stageGame.active)return false;return !!roomExitNames[state.scene]&&state.started&&dialog.hidden&&overlay.hidden&&!action&&!mission&&!duet&&!sleepState&&!state.playing}
function syncExitCue(){
 const cue=$('#room-exit-cue');cue.hidden=!canShowExitCue();if(cue.hidden)return;
 cue.setAttribute('data-bridge',String(state.scene==='bridge'));cue.setAttribute('aria-label','Walk to '+roomExitNames[state.scene]);
 $('#exit-cue-label').textContent=roomExitNames[state.scene];$('#exit-cue-help').textContent=state.scene==='bridge'?'Follow the bridge':'Keep walking right';
}
function walkToRoomExit(){if(!canShowExitCue())return;if(state.scene==='stage'){routeTo(1170,495);canvas.focus();return;}if(state.scene==='orson'){changeScene('bar');return}routeTo(state.scene==='bridge'?1000:1170,state.scene==='bridge'?432:595);canvas.focus()}
