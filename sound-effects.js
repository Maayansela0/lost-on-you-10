// Separate ambient and action voices. Never autoplay before the first gesture.
const soundEffects=(()=>{
 const manifest=typeof GAME_SFX==='undefined'?{}:GAME_SFX;
 const voices=new Set(),loops=new Map(),cooldowns=new Map(),variants=new Map();
 let unlocked=false,enabled=true,hidden=false,ducked=false,lastTravel=0,lastScene='',stepDistance=0;
 function stopVoice(v){v.pause();v.currentTime=0;voices.delete(v)}
 function stopAll(){for(const v of voices)stopVoice(v);loops.clear()}
 function gain(base){return Math.min(1,base*(ducked?.2:1))}
 function play(name,options={}){
  const config=manifest[name];if(!unlocked||!enabled||hidden||!config)return false;
  const data=typeof config==='string'?{src:config}:config;
  const now=performance.now(),delay=options.cooldown??100;if(now-(cooldowns.get(name)??-Infinity)<delay)return false;
  cooldowns.set(name,now);
  if(options.loop&&loops.has(name))return true;
  const choices=Array.isArray(data.src)?data.src:[data.src],index=variants.get(name)||0;variants.set(name,index+1);const voice=new Audio(choices[index%choices.length]);voice.preload='auto';voice.loop=!!options.loop;voice._gain=options.volume??data.volume??.4;voice.volume=gain(voice._gain);voice.playbackRate=options.rate??1;
  voices.add(voice);if(options.loop)loops.set(name,voice);
  const clean=()=>{voices.delete(voice);if(loops.get(name)===voice)loops.delete(name)};
  voice.addEventListener('ended',clean);voice.addEventListener('error',clean);
  voice.play().catch(clean);return true;
 }
 function unlock(){unlocked=true}
 function sync({scene,moving,travel,sound,playing,visible,started}){
  if(enabled!==sound||hidden===visible){enabled=sound;hidden=!visible;if(!enabled||hidden)stopAll()}
  if(ducked!==playing){ducked=playing;for(const v of voices)v.volume=gain(v._gain)}
  const ambience=scene==='living'?'rain':scene==='bridge'?'wind':null;
  for(const [name,v] of loops)if(name!==ambience||!started){stopVoice(v);loops.delete(name)}
  if(started&&ambience)play(ambience,{loop:true,cooldown:1000});
  if(lastScene!==scene||!moving||travel<lastTravel)stepDistance=0;
  else stepDistance+=travel-lastTravel;
  if(moving&&stepDistance>=61){play(scene==='bridge'?'stepBridge':'stepWood',{rate:1+(Math.random()-.5)*.08,cooldown:200});stepDistance%=61}
  lastTravel=travel;lastScene=scene;
 }
 function action(type){if(type==='drink'||type==='bar-toast')return;const names={drink:'sip',refill:'pour','bar-pour':'pour','bar-toast':'glassClink',blinds:'blinds','memory-box':'boxOpen','bar-coaster':'paper',pick:'paper','photo-flash':'camera','anniversary-toast':'glassClink'};if(names[type])play(names[type])}
 return {play,sync,action,unlock,stopAll};
})();
document.addEventListener('pointerdown',()=>soundEffects.unlock(),{once:true});
document.addEventListener('keydown',()=>soundEffects.unlock(),{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)soundEffects.stopAll()});
window.addEventListener('pagehide',()=>soundEffects.stopAll());
