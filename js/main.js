(() => {
  const PALETTE = ['#FF3DAC', '#3154FF', '#B8FF38', '#FF5C2B', '#26E1DD'];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  let paletteIndex = 0;
  const nextAccent = () => PALETTE[paletteIndex++ % PALETTE.length];

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function onColor(hex) {
    const l = luminance(hex);
    const againstDark = (l + 0.05) / (luminance('#111111') + 0.05);
    const againstLight = 1.05 / (l + 0.05);
    return againstDark >= againstLight ? '#111111' : '#FFFFFF';
  }

  function h(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value == null) continue;
      node.setAttribute(key, value === true ? '' : value);
    }
    node.append(...[].concat(children));
    return node;
  }

  function setAccent(node, accent) {
    node.style.setProperty('--accent', accent);
    node.style.setProperty('--on-accent', onColor(accent));
  }

  /* Cards */

  function renderCard(p) {
    const card = h('button', {
      type: 'button',
      class: 'card',
      'data-slug': p.slug,
      'aria-haspopup': 'dialog',
      'aria-label': p.meta ? `${p.title}, ${p.meta}` : p.title,
    });
    setAccent(card, p.accent);

    const media = h('span', { class: 'card__media' });
    media.style.aspectRatio = p.ratio;
    const image = p.poster || p.still;
    if (image) {
      media.append(h('img', { src: image, alt: p.alt, loading: 'lazy', decoding: 'async' }));
      if (p.loop) {
        media.append(h('video', {
          muted: true, playsinline: true, loop: true, preload: 'none',
          poster: image, src: p.loop, 'aria-hidden': 'true', tabindex: '-1',
        }));
      }
    } else {
      media.classList.add('card__media--block');
      media.append(h('span', { class: 'card__block-title', 'aria-hidden': 'true' }, p.title));
    }

    const label = h('span', { class: 'card__label' }, [h('span', { class: 'card__title' }, p.title)]);
    if (p.meta) label.append(h('span', { class: 'card__meta' }, p.meta));

    card.append(media, label);
    return card;
  }

  function playLoop(card) {
    const video = card.querySelector('video');
    if (!video || reduceMotion.matches) return;
    card.hovered = true;
    video.muted = true;
    video.play().then(() => {
      if (card.hovered) card.classList.add('is-playing');
      else video.pause();
    }).catch(() => {});
  }

  function stopLoop(card) {
    card.hovered = false;
    card.classList.remove('is-playing');
    const video = card.querySelector('video');
    if (video) video.pause();
  }

  document.querySelectorAll('[data-group]').forEach((list) => {
    PROJECTS.filter((p) => p.group === list.dataset.group).forEach((p) => {
      const card = renderCard(p);
      list.append(list.tagName === 'UL' ? h('li', {}, card) : card);
      card.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && finePointer.matches) playLoop(card);
      });
      card.addEventListener('pointerleave', () => stopLoop(card));
    });
  });

  /* Accent cycling: each hover/focus takes the next crayon-box colour.
     .js-fill fills the element's background (buttons, nav links, email); .js-accent only sets --fill for CSS to use. */

  const ACCENT_TARGETS = '.js-fill, .js-accent';

  function fill(node) {
    const accent = nextAccent();
    node.style.setProperty('--fill', accent);
    node.style.setProperty('--on-fill', onColor(accent));
  }

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest(ACCENT_TARGETS);
    if (target && !target.contains(e.relatedTarget)) fill(target);
  });
  document.addEventListener('focusin', (e) => {
    const target = e.target.closest(ACCENT_TARGETS);
    if (target) fill(target);
  });

  /* Hero model: no auto-rotate under reduced motion */

  const heroModel = document.querySelector('.hero__model');
  if (heroModel) {
    const syncMotion = () => heroModel.toggleAttribute('auto-rotate', !reduceMotion.matches);
    syncMotion();
    reduceMotion.addEventListener('change', syncMotion);
  }

  /* Hero model pops out of the bottom comic panel: hover on mouse, tap on touch, Enter/Space on keyboard */

  const heroStage = document.querySelector('.hero__stage');
  const heroPanel = heroStage && heroStage.querySelector('.comic-panel--6');
  if (heroPanel && heroModel) {
    const rise = (on) => heroStage.classList.toggle('is-risen', on);
    const risen = () => heroStage.classList.contains('is-risen');
    let tapStart = null;

    heroPanel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') rise(true); });
    heroPanel.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') rise(false); });
    heroPanel.addEventListener('pointerdown', (e) => {
      tapStart = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
    });
    heroPanel.addEventListener('pointerup', (e) => {
      if (!tapStart) return;
      const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
      tapStart = null;
      if (moved < 10) rise(!risen());
    });
    heroPanel.addEventListener('pointercancel', () => { tapStart = null; });

    heroModel.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      rise(!risen());
    });
    heroModel.addEventListener('blur', () => rise(false));
  }

  /* Felines: the band takes the colour of the hovered or focused piece */

  const felines = document.getElementById('felines');
  const strip = felines && felines.querySelector('.strip');
  if (strip) {
    const light = (card) => {
      felines.style.setProperty('--band', card.style.getPropertyValue('--accent'));
      felines.classList.add('is-lit');
    };
    const unlight = () => {
      felines.style.removeProperty('--band');
      felines.classList.remove('is-lit');
    };
    strip.addEventListener('pointerover', (e) => {
      const card = e.target.closest('.card');
      if (card) light(card);
    });
    strip.addEventListener('pointerleave', unlight);
    strip.addEventListener('focusin', (e) => {
      const card = e.target.closest('.card');
      if (card) light(card);
    });
    strip.addEventListener('focusout', (e) => {
      if (!strip.contains(e.relatedTarget)) unlight();
    });
  }

  /* Pangeo: the page dims to dark while the section crosses the middle of the screen */

  const pangeo = document.getElementById('pangeo');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (pangeo) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('is-dark', entry.isIntersecting);
      themeColor.content = entry.isIntersecting ? '#0B0B0E' : '#FAF8F2';
    }, { rootMargin: '-45% 0px -45% 0px' }).observe(pangeo);
  }

  /* Player */

  const player = document.getElementById('player');
  const stage = player.querySelector('.player__stage');
  let trigger = null;

  function embedUrl(url) {
    let m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
    return null;
  }

  function playerMedia(p) {
    const embed = p.film && embedUrl(p.film);
    if (embed) {
      return h('iframe', {
        src: embed, title: p.title, allowfullscreen: true,
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
      });
    }
    if (p.loop) {
      const video = h('video', {
        src: p.loop, poster: p.poster, controls: true, muted: true, loop: true, playsinline: true,
        autoplay: !reduceMotion.matches, 'aria-label': p.alt,
      });
      video.muted = true;
      return video;
    }
    if (p.still || p.poster) return h('img', { src: p.still || p.poster, alt: p.alt });
    return h('div', { class: 'player__block', 'aria-hidden': 'true' }, p.title);
  }

  function openPlayer(card) {
    const p = PROJECTS.find((x) => x.slug === card.dataset.slug);
    if (!p) return;
    trigger = card;
    stopLoop(card);
    setAccent(player, p.accent);
    stage.replaceChildren(playerMedia(p));
    player.querySelector('.player__title').textContent = p.title;
    player.querySelector('.player__meta').textContent = [p.meta, p.year, p.role].filter(Boolean)
      .filter((v, i, all) => all.indexOf(v) === i).join(' · ');
    player.querySelector('.player__context').textContent = p.context;
    document.documentElement.classList.add('is-locked');
    player.showModal();
  }

  /* Felines board: the card's image morphs into the board's main render */

  const board = document.getElementById('board');
  const boardRender = board.querySelector('.board__render');
  let boardCard = null;

  const morph = (update) => {
    if (!document.startViewTransition || reduceMotion.matches) {
      update();
      return Promise.resolve();
    }
    return document.startViewTransition(update).finished;
  };

  function fillBoard(p) {
    const b = p.board;
    const field = (sel, show) => { board.querySelector(sel).hidden = !show; };
    setAccent(board, p.accent);

    const title = board.querySelector('.board__title');
    title.replaceChildren(p.title, ' ', h('span', {}, p.meta));

    const img = boardRender.querySelector('img');
    img.src = b.render || p.poster || p.still;
    img.alt = b.renderAlt || p.alt;

    board.querySelector('.swatches').replaceChildren(...b.palette.map((hex) => {
      const swatch = h('span', { 'aria-hidden': 'true' });
      swatch.style.background = hex;
      return h('li', {}, [swatch, h('code', {}, hex)]);
    }));

    field('.board__style', b.style);
    board.querySelector('.board__style p').textContent = b.style || '';

    field('.board__elements', b.elements && b.elements.length);
    board.querySelector('.board__tags').replaceChildren(...(b.elements || []).map((t) => h('li', {}, t)));

    field('.board__note', b.caption || b.note);
    field('.board__caption', b.caption);
    board.querySelector('.board__caption p').textContent = b.caption || '';
    field('.board__observation', b.note);
    board.querySelector('.board__observation').textContent = b.note || '';
  }

  function openBoard(card, p) {
    boardCard = card;
    stopLoop(card);
    const media = card.querySelector('.card__media');
    media.style.viewTransitionName = 'feline-render';
    morph(() => {
      media.style.viewTransitionName = '';
      fillBoard(p);
      boardRender.style.viewTransitionName = 'feline-render';
      document.documentElement.classList.add('is-locked');
      board.showModal();
      board.scrollTop = 0;
    }).finally(() => { boardRender.style.viewTransitionName = ''; });
  }

  function closeBoard() {
    if (!board.open) return;
    const media = boardCard && boardCard.querySelector('.card__media');
    boardRender.style.viewTransitionName = 'feline-render';
    morph(() => {
      boardRender.style.viewTransitionName = '';
      if (media) media.style.viewTransitionName = 'feline-render';
      board.close();
    }).finally(() => { if (media) media.style.viewTransitionName = ''; });
  }

  board.querySelector('.board__close').addEventListener('click', closeBoard);
  board.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeBoard();
  });
  board.addEventListener('click', (e) => {
    if (!e.target.closest('.board__sheet > *, .board__close')) closeBoard();
  });
  board.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
    if (boardCard) boardCard.focus();
  });

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-slug]');
    if (!card) return;
    const p = PROJECTS.find((x) => x.slug === card.dataset.slug);
    if (p && p.board) openBoard(card, p);
    else openPlayer(card);
  });

  player.querySelector('.player__close').addEventListener('click', () => player.close());
  player.addEventListener('click', (e) => {
    if (!e.target.closest('.player__stage > *, .player__info > *, .player__close')) player.close();
  });
  player.addEventListener('close', () => {
    stage.replaceChildren();
    document.documentElement.classList.remove('is-locked');
    if (trigger) trigger.focus();
  });
})();
