/* BonakVT folder + JSON emote gallery. No API keys or server needed. */
(() => {
  'use strict';
  const targets = [
    { node: document.getElementById('emote-gallery-grid'), limit: Infinity },
    { node: document.getElementById('homepage-emote-gallery'), limit: 6 }
  ].filter(({ node }) => Boolean(node));
  if (!targets.length) return;
  const status = document.getElementById('emote-status');
  const search = document.getElementById('emote-search');
  const format = /\.(?:png|jpe?g|gif|webp|avif)$/i;
  let filenames = [];

  function setStatus(message) { if (status) status.textContent = message; }
  function validFile(value) {
    return typeof value === 'string' && !/[\\/]/.test(value) &&
      value !== '.' && value !== '..' && format.test(value);
  }
  function makeCard(filename) {
    const name = filename.replace(/\.[^.]+$/, '');
    const url = new URL('emotes/' + encodeURIComponent(filename), document.baseURI).href;
    const card = document.createElement('article');
    card.className = 'emote-card gallery-emote-card';

    const frame = document.createElement('div');
    frame.className = 'emote-image-frame';
    const img = document.createElement('img');
    img.src = url;
    img.alt = `${name} emote`;
    img.loading = 'lazy';
    img.decoding = 'async';
    frame.appendChild(img);

    const heading = document.createElement('h3');
    heading.textContent = name;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-emote-btn';
    button.textContent = 'Copy link';
    button.setAttribute('aria-label', `Copy direct link for ${name}`);
    button.addEventListener('click', async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const temp = document.createElement('textarea');
          temp.value = url;
          temp.style.position = 'fixed';
          temp.style.opacity = '0';
          document.body.append(temp);
          temp.select();
          if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
          temp.remove();
        }
        button.textContent = 'Copied!';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => button.textContent = 'Copy link', 1800);
    });
    card.append(frame, heading, button);
    return card;
  }
  function render() {
    const query = (search?.value || '').toLocaleLowerCase().trim();
    const matches = filenames.filter(file => file.toLocaleLowerCase().includes(query));
    for (const target of targets) {
      const visible = matches.slice(0, target.limit);
      target.node.replaceChildren(...visible.map(makeCard));
      if (!visible.length) {
        const empty = document.createElement('p');
        empty.className = 'emote-empty';
        empty.textContent = query ? 'No matching emotes yet.' : 'The emote folder is ready. Add images and update emotes.json to display them here.';
        target.node.appendChild(empty);
      }
    }
    setStatus(filenames.length ? `${matches.length} emote${matches.length === 1 ? '' : 's'} found` : 'Emotes coming soon!');
  }
  async function load() {
    try {
      const response = await fetch(new URL('emotes.json', document.baseURI), { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!Array.isArray(json)) throw new Error('emotes.json must be a list');
      filenames = [...new Set(json.filter(validFile))];
      render();
    } catch (error) {
      console.error('Unable to load BonakVT emotes:', error);
      setStatus('Emotes could not be loaded. Check emotes.json and your image filenames.');
      for (const { node } of targets) node.textContent = 'The gallery is temporarily unavailable.';
    }
  }
  if (search) search.addEventListener('input', render);
  load();
})();
