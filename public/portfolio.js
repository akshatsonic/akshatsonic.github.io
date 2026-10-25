(() => {
  const root = document.getElementById('ak-refined');
  const posts = JSON.parse(document.getElementById('ak-post-data').textContent);
  const photos = ['Quiet corners', 'Chasing light', 'Between places', 'Lines & layers', 'Slow afternoons', 'Out for a walk'];
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
    const button = el('button', 'ak-photo');
    button.type = 'button';
    button.dataset.kind = kind;
    button.dataset.index = String(index);
    button.dataset.preview = String(preview);
    const art = el('span', `ak-art ak-art-${['a', 'b', 'c', 'd'][index % 4]}`);
    art.setAttribute('aria-hidden', 'true');
    button.append(art, el('span', 'ak-photo-label', `${photos[index]} ↗`));
    return button;
  }

  function openCollection(kind) {
    activeView = 'collection';
    collection = kind;
    back.hidden = true;
    const writing = kind === 'writing';
    kicker.textContent = writing ? 'THE NOTEBOOK / PUBLISHED ARTICLES' : 'CAMERA ROLL / PLACEHOLDER COMPOSITIONS';
    title.textContent = writing ? 'Pick a rabbit hole.' : 'Find a frame.';
    const grid = el('div', writing ? 'ak-collection-grid ak-writing-grid' : 'ak-collection-grid');
    (writing ? posts : photos).forEach((_, index) => grid.append(card(kind, index, false)));
    content.replaceChildren(grid);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function openPhoto(index) {
    activeView = 'photo';
    currentPhotoIndex = (index + photos.length) % photos.length;
    back.hidden = false;
    kicker.textContent = 'PHOTOGRAPHY / COMPOSITION PLACEHOLDER';
    title.textContent = photos[currentPhotoIndex];
    const frame = el('div', 'ak-large-photo');
    frame.dataset.photoFrame = '';
    frame.append(el('span', `ak-art ak-art-${['a', 'b', 'c', 'd'][currentPhotoIndex % 4]}`));

    const previous = el('button', 'ak-photo-nav ak-photo-nav-prev', '‹');
    previous.type = 'button';
    previous.dataset.photoStep = '-1';
    previous.setAttribute('aria-label', 'Previous photograph');
    const next = el('button', 'ak-photo-nav ak-photo-nav-next', '›');
    next.type = 'button';
    next.dataset.photoStep = '1';
    next.setAttribute('aria-label', 'Next photograph');
    frame.append(previous, next);

    content.replaceChildren(frame, el('p', 'ak-copy', 'A full-size photograph and caption will appear here. This abstract composition is a layout placeholder.'));
    dialog.scrollTop = 0;
  }

  function movePhoto(step) {
    if (activeView === 'photo') openPhoto(currentPhotoIndex + step);
  }

  root.addEventListener('click', (event) => {
    const library = event.target.closest('[data-library]');
    if (library) return openCollection(library.dataset.library);
    const photoStep = event.target.closest('[data-photo-step]');
    if (photoStep) return movePhoto(Number(photoStep.dataset.photoStep));
    const selected = event.target.closest('[data-kind][data-index]');
    if (!selected) return;
    const index = Number(selected.dataset.index);
    if (selected.dataset.preview === 'true') openCollection('photos');
    else openPhoto(index);
  });

  back.addEventListener('click', () => openCollection(collection));
  document.getElementById('ak-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (activeView !== 'photo') return;
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
  });
})();
