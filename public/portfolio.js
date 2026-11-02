(() => {
  // Lightbox: only on pages that have the photo list and the dialog.
  const photoData = document.getElementById('ak-photo-data');
  const dialog = document.getElementById('dr-lightbox');
  if (photoData && dialog) {
  const photos = JSON.parse(photoData.textContent);
  const img = dialog.querySelector('img');
  const cap = dialog.querySelector('figcaption');
  let current = 0;
  let opener = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    const p = photos[current];
    img.src = p.src;
    img.alt = p.caption;
    cap.textContent = `${p.title}. ${p.caption}`;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-photo]');
    if (t) {
      opener = t;
      show(Number(t.dataset.photo));
      dialog.showModal();
      return;
    }
    if (!dialog.open) return;
    if (e.target.closest('[data-close]') || e.target === dialog) dialog.close();
    const step = e.target.closest('[data-step]');
    if (step) show(current + Number(step.dataset.step));
  });
  dialog.addEventListener('close', () => opener?.focus());
  document.addEventListener('keydown', (e) => {
    if (!dialog.open) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  let x0 = null;
  dialog.addEventListener('touchstart', (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  }

  // Entrances: one observer, staggered by data-delay, once.
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Footage: play only while on screen, never under reduced motion.
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.dr-bgvideo');
  if (hero && still) hero.pause();
  const clips = document.querySelectorAll('video[data-autoplay]');
  if (still || !('IntersectionObserver' in window)) { clips.forEach((v) => v.controls = true); }
  else {
    const vo = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.preload = 'auto'; en.target.play().catch(() => {}); } else en.target.pause();
    }), { threshold: 0.35 });
    clips.forEach((v) => vo.observe(v));
  }
})();
