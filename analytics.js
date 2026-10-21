// Public counting endpoint only. Dashboard access remains with the owner.
(() => {
  if (location.hostname !== 'maayansela0.github.io') return;
  let started = false;
  let pendingStart = false;
  const sendStart = () => {
    if (!pendingStart || typeof window.goatcounter?.count !== 'function') return;
    try {
      window.goatcounter.count({path:'game-started',title:'Started playing',event:true});
      pendingStart = false;
    } catch (_) { /* Analytics must never interrupt the game. */ }
  };
  document.querySelector('#start').addEventListener('click', () => {
    if (started) return;
    started = true;
    pendingStart = true;
    sendStart();
  });
  window.goatcounter = {path:'/lost-on-you-10/',title:'Lost in the Moment',no_events:true};
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.setAttribute('data-goatcounter','https://maayansela.goatcounter.com/count');
  script.addEventListener('load',sendStart);
  document.head.appendChild(script);
})();
