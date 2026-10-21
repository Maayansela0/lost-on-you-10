// Instrumental separated locally from the recording supplied for this playtest.
const backgroundMusic=(()=>{
 const track=new Audio('lost-on-you-instrumental.mp3');track.loop=true;track.preload='none';track.volume=.075;
 let ready=false,unlocked=false,wanted=false;
 track.addEventListener('canplay',()=>{ready=true});
 track.addEventListener('error',()=>{const el=document.querySelector('#music-note');if(el){el.hidden=false;el.textContent='Background music is unavailable. You can keep playing.'}});
 function unlock(){unlocked=true;track.load?.();if(wanted)track.play().catch(()=>{})}
 function sync({started,sound,visible,foreground,boost,sleeping}){
  wanted=!!(started&&sound&&visible&&!foreground);track.volume=sleeping?.03:boost?.10:.075;
  if(!wanted){if(!track.paused)track.pause();return}
  if(unlocked&&track.paused)track.play().catch(()=>{});
 }
 return {sync,unlock,get currentTime(){return track.currentTime||0}};
})();
document.addEventListener('pointerdown',()=>backgroundMusic.unlock(),{once:true});
document.addEventListener('keydown',()=>backgroundMusic.unlock(),{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundMusic.sync({started:false})});
