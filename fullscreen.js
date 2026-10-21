// Keep a fitted game view even when the browser cannot grant native fullscreen.
(() => {
  const enter = document.querySelector('#fullscreen-toggle');
  const exit = document.querySelector('#exit-fullscreen');
  const scene = document.querySelector('#scene');
  let active = false;
  let usedNative = false;
  let previousFocus;
  let scrollY = 0;
  const nativeElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  function setActive(value) {
    active = value;
    document.body.classList.toggle('game-focus', value);
    enter.setAttribute('aria-pressed', String(value));
    exit.hidden = !value;
    if (value) exit.focus({preventScroll:true});
    else {
      window.scrollTo(0, scrollY);
      (previousFocus || scene).focus({preventScroll:true});
    }
  }
  enter.addEventListener('click', async () => {
    if (active) return;
    previousFocus = document.activeElement;
    scrollY = window.scrollY;
    setActive(true);
    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (request) {
      try {
        await request.call(root);
        usedNative = !!nativeElement();
      } catch (_) {
        // The fitted view remains usable on Safari or when fullscreen is denied.
        usedNative = false;
      }
    }
  });
  async function leave() {
    if (!active) return;
    usedNative = false;
    setActive(false);
    if (nativeElement()) {
      const finish = document.exitFullscreen || document.webkitExitFullscreen;
      try { await finish?.call(document); } catch (_) {}
    }
  }
  exit.addEventListener('click', leave);
  function nativeChanged() {
    if (nativeElement()) usedNative = true;
    else if (usedNative && active) { usedNative = false; setActive(false); }
  }
  document.addEventListener('fullscreenchange', nativeChanged);
  document.addEventListener('webkitfullscreenchange', nativeChanged);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) leave();
  });
})();
