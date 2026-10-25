(() => {
  const root = document.getElementById('ak-refined');
  const posts = JSON.parse(document.getElementById('ak-post-data').textContent);
  const photos = ['Quiet corners', 'Chasing light', 'Between places', 'Lines & layers', 'Slow afternoons', 'Out for a walk'];
  const dialog = document.getElementById('ak-collection-dialog');
  const title = document.getElementById('ak-dialog-title');
  const kicker = document.getElementById('ak-dialog-kicker');
  const content = document.getElementById('ak-dialog-content');
  const back = document.getElementById('ak-dialog-back');
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

  function openCollection() {
    back.hidden = true;
    kicker.textContent = 'CAMERA ROLL / PLACEHOLDER COMPOSITIONS';
    title.textContent = 'Find a frame.';
    const grid = el('div', 'ak-collection-grid');
    photos.forEach((_, index) => grid.append(card('photos', index, false)));
    content.replaceChildren(grid);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function openItem(index) {
    back.hidden = false;
    content.replaceChildren();
    kicker.textContent = 'PHOTOGRAPHY / COMPOSITION PLACEHOLDER';
    title.textContent = photos[index];
    const frame = el('div', 'ak-large-photo');
    frame.append(el('span', `ak-art ak-art-${['a', 'b', 'c', 'd'][index % 4]}`));
    content.append(frame, el('p', 'ak-copy', 'A full-size photograph and caption will appear here. This abstract composition is a layout placeholder.'));
    dialog.scrollTop = 0;
  }

  root.addEventListener('click', (event) => {
    const library = event.target.closest('[data-library]');
    if (library) return openCollection();
    const selected = event.target.closest('[data-kind][data-index]');
    if (!selected) return;
    const index = Number(selected.dataset.index);
    if (selected.dataset.preview === 'true') openCollection();
    else openItem(index);
  });
  back.addEventListener('click', openCollection);
  document.getElementById('ak-dialog-close').addEventListener('click', () => dialog.close());

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
