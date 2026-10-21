(() => {
  const button = document.querySelector('#share-game');
  const fallback = document.querySelector('#share-fallback');
  const input = document.querySelector('#share-link');
  const copy = document.querySelector('#share-copy');
  const status = document.querySelector('#share-status');
  const url = 'https://maayansela0.github.io/lost-on-you-10/';
  input.value = url;
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link copied — send a little Lost On You to a friend!';
      fallback.hidden = true;
      button.focus({preventScroll:true});
    } catch (_) {
      fallback.hidden = false;
      status.textContent = 'Select and copy the link below to share it.';
      input.focus({preventScroll:true});
      input.select();
    }
  }
  button.addEventListener('click', async () => {
    status.textContent = '';
    if (navigator.share) {
      try {
        await navigator.share({title:'Lost in the Moment',text:'A little adventure celebrating 10 years of LP’s Lost On You. Come play!',url});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    await copyLink();
  });
  copy.addEventListener('click', copyLink);
})();
