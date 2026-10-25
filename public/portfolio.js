(() => {
  const root = document.getElementById('ak-refined');
  const posts = JSON.parse(document.getElementById('ak-post-data').textContent);
  const photos = JSON.parse(document.getElementById('ak-photo-data').textContent);
  const dialog = document.getElementById('ak-collection-dialog');
  const title = document.getElementById('ak-dialog-title');
  const kicker = document.getElementById('ak-dialog-kicker');
  const content = document.getElementById('ak-dialog-content');
  const back = document.getElementById('ak-dialog-back');
  let collection = 'photos';
  let activeView = 'collection';
  let currentPhotoIndex = 0;
  let touchStart = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function card(kind, index, preview) {
    if (kind === 'writing') {
      const post = posts[index];
      const link = el('a', 'ak-blog');
      link.href = post.url;
      link.append(el('small', '', `${post.tag.toUpperCase()} / ${post.date.toUpperCase()}`), el('h3', '', post.title), el('span', '', 'Read article ↗'));
      return link;
    }
    const photo = photos[index];
    const button = el('button', 'ak-photo');
    button.type = 'button';
    button.dataset.kind = kind;
    button.dataset.index = String(index);
    button.dataset.preview = String(preview);
    button.setAttribute('aria-label', `Open photograph: ${photo.title}. ${photo.caption}`);
    const image = el('img', 'ak-photo-image');
    image.src = photo.src;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image, el('span', 'ak-photo-label', `${photo.title} ↗`));
    return button;
  }

  function openCollection(kind) {
    activeView = 'collection';
    dialog.dataset.view = 'collection';
    dialog.style.width = '';
    dialog.style.height = '';
    collection = kind;
    back.hidden = true;
    const writing = kind === 'writing';
    kicker.textContent = writing ? 'THE NOTEBOOK / PUBLISHED ARTICLES' : 'CAMERA ROLL / SELECTED PHOTOGRAPHS';
    title.textContent = writing ? 'Pick a rabbit hole.' : 'Find a frame.';
    const grid = el('div', writing ? 'ak-collection-grid ak-writing-grid' : 'ak-collection-grid');
    (writing ? posts : photos).forEach((_, index) => grid.append(card(kind, index, false)));
    content.replaceChildren(grid);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function openPhoto(index) {
    activeView = 'photo';
    dialog.dataset.view = 'photo';
    currentPhotoIndex = (index + photos.length) % photos.length;
    const photo = photos[currentPhotoIndex];
    back.hidden = false;
    kicker.textContent = 'PHOTOGRAPHY / THROUGH MY LENS';
    title.textContent = photo.title;
    const frame = el('div', 'ak-large-photo');
    frame.dataset.photoFrame = '';
    const image = el('img', 'ak-large-photo-image');
    image.src = photo.src;
    image.alt = photo.caption;
    image.decoding = 'async';
    const sizePhotoViewer = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const style = getComputedStyle(dialog);
      const horizontalPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const maxWidth = Math.max(180, Math.min(1000, window.innerWidth - horizontalPadding - 24));
      const minWidth = Math.min(560, maxWidth);
      dialog.style.width = `${minWidth + horizontalPadding}px`;
      dialog.style.height = '';
      requestAnimationFrame(() => {
        const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const barStyle = getComputedStyle(dialog.querySelector('.ak-dialog-bar'));
        const titleStyle = getComputedStyle(title);
        const frameStyle = getComputedStyle(frame);
        const caption = content.querySelector('.ak-photo-caption');
        const verticalMargins = (elementStyle) => parseFloat(elementStyle.marginTop) + parseFloat(elementStyle.marginBottom);
        const chromeHeight = verticalPadding + 2 +
          dialog.querySelector('.ak-dialog-bar').getBoundingClientRect().height + verticalMargins(barStyle) +
          kicker.getBoundingClientRect().height + verticalMargins(getComputedStyle(kicker)) +
          title.getBoundingClientRect().height + verticalMargins(titleStyle) +
          caption.getBoundingClientRect().height + verticalMargins(getComputedStyle(caption)) +
          verticalMargins(frameStyle);
        const maxHeight = Math.max(120, Math.min(680, window.innerHeight * 0.88 - chromeHeight - 8));
        const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
        const width = Math.round(image.naturalWidth * scale);
        const height = Math.round(image.naturalHeight * scale);
        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;
        dialog.style.width = `${Math.max(width, minWidth) + horizontalPadding}px`;
        dialog.style.height = `${Math.ceil(chromeHeight + height)}px`;
      });
    };
    image.classList.add('ak-photo-enter');
    image.addEventListener('load', sizePhotoViewer, { once: true });
    frame.append(image);

    const previous = el('button', 'ak-photo-nav ak-photo-nav-prev', '‹');
    previous.type = 'button';
    previous.dataset.photoStep = '-1';
    previous.setAttribute('aria-label', 'Previous photograph');
    const next = el('button', 'ak-photo-nav ak-photo-nav-next', '›');
    next.type = 'button';
    next.dataset.photoStep = '1';
    next.setAttribute('aria-label', 'Next photograph');
    frame.append(previous, next);

    content.replaceChildren(frame, el('p', 'ak-copy ak-photo-caption', photo.caption));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (image.complete) sizePhotoViewer();
  }

  function movePhoto(step) {
    if (activeView === 'photo') openPhoto(currentPhotoIndex + step);
  }

  root.addEventListener('click', (event) => {
    const motionToggle = event.target.closest('[data-motion-toggle]');
    if (motionToggle) {
      const track = document.getElementById(motionToggle.dataset.motionToggle);
      const paused = motionToggle.getAttribute('aria-pressed') !== 'true';
      track.dataset.userPaused = String(paused);
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.textContent = paused ? 'Resume previews' : 'Pause previews';
      motionToggle.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} moving ${motionToggle.dataset.motionLabel} previews`);
      return;
    }
    const library = event.target.closest('[data-library]');
    if (library) return openCollection(library.dataset.library);
    const photoStep = event.target.closest('[data-photo-step]');
    if (photoStep) return movePhoto(Number(photoStep.dataset.photoStep));
    const selected = event.target.closest('[data-kind][data-index]');
    if (!selected) return;
    const index = Number(selected.dataset.index);
    openPhoto(index);
  });

  back.addEventListener('click', () => openCollection(collection));
  document.getElementById('ak-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
  document.addEventListener('keydown', (event) => {
    if (!dialog.open || activeView !== 'photo' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePhoto(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      movePhoto(1);
    }
  });
  dialog.addEventListener('touchstart', (event) => {
    if (activeView !== 'photo' || !event.target.closest('[data-photo-frame]')) return;
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    movePhoto(dx < 0 ? 1 : -1);
  }, { passive: true });

  [['ak-blog-track', 'writing'], ['ak-photo-track', 'photos']].forEach(([id, kind]) => {
    const track = document.getElementById(id);
    const group = el('div', 'ak-group');
    (kind === 'writing' ? posts : photos).forEach((_, index) => group.append(card(kind, index, true)));
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.querySelectorAll('a, button').forEach((control) => control.tabIndex = -1);
    track.append(group, duplicate);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        track.dataset.outside = String(!entry.isIntersecting);
      }, { rootMargin: '100px 0px' });
      observer.observe(track.closest('.ak-window'));
    }
  });
})();
