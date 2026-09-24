(() => {
  const PALETTE = ['#FF3DAC', '#3154FF', '#B8FF38', '#FF5C2B', '#26E1DD'];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  let lastPointer = 'mouse';
  document.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; }, true);

  // url() inside a custom property resolves against the stylesheet, so hand CSS absolute URLs.
  const cssUrl = (path) => `url("${new URL(path, document.baseURI).href}")`;

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
      'data-tile': p.tile,
      'aria-haspopup': 'dialog',
      'aria-label': p.meta ? `${p.title}, ${p.meta}` : p.title,
    });
    setAccent(card, p.accent);

    const media = h('span', { class: 'card__media' });
    media.style.aspectRatio = p.ratio;
    card.style.setProperty('--ratio', p.ratio);
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

  /* Multi-clip cards: the card shows its active clip; Previous/Next (siblings of the card button, since
     buttons can't nest) swap it with a crossfade and wrap at both ends. */

  const activeClip = new Map();
  const withClip = (p) => (p.clips ? { ...p, ...p.clips[activeClip.get(p.slug) || 0] } : p);
  const ICON_PREV = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M12.5 4.5 7 10l5.5 5.5"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7.5 4.5 13 10l-5.5 5.5"/></svg>';

  function swapClip(card, p, step, count, live) {
    const i = ((activeClip.get(p.slug) || 0) + step + p.clips.length) % p.clips.length;
    activeClip.set(p.slug, i);
    const c = withClip(p);
    const media = card.querySelector('.card__media');
    const img = media.querySelector('img');
    const video = media.querySelector('video');
    const wasPlaying = card.classList.contains('is-playing');

    if (!reduceMotion.matches && img) {
      const ghost = img.cloneNode();
      ghost.className = 'card__ghost';
      ghost.removeAttribute('loading');
      media.append(ghost);
      requestAnimationFrame(() => requestAnimationFrame(() => ghost.classList.add('is-leaving')));
      ghost.addEventListener('transitionend', () => ghost.remove(), { once: true });
      setTimeout(() => ghost.remove(), 700);
    }
    stopLoop(card);
    img.src = c.poster || c.still;
    img.alt = c.alt;
    if (video) {
      if (c.loop) {
        video.poster = c.poster;
        video.src = c.loop;
        video.hidden = false;
      } else {
        video.removeAttribute('src');
        video.hidden = true;
      }
    }
    if (wasPlaying && c.loop) playLoop(card);
    card.setAttribute('aria-label', `${p.title}, ${c.label}`);
    count.textContent = `${i + 1} / ${p.clips.length}`;
    live.textContent = `Clip ${i + 1} of ${p.clips.length}: ${c.label}`;
  }

  function mountCard(list, p) {
    const multi = p.clips && p.clips.length > 1;
    const card = renderCard(withClip(p));
    if (p.clips) card.setAttribute('aria-label', `${p.title}, ${p.clips[0].label}`);
    let host = card;

    if (multi) {
      const count = h('span', { class: 'clip-nav__count', 'aria-hidden': 'true' }, `1 / ${p.clips.length}`);
      const live = h('span', { class: 'visually-hidden', 'aria-live': 'polite' });
      const prev = h('button', { type: 'button', class: 'clip-nav__btn', 'aria-label': `Previous clip, ${p.title}` });
      const next = h('button', { type: 'button', class: 'clip-nav__btn', 'aria-label': `Next clip, ${p.title}` });
      prev.innerHTML = ICON_PREV;
      next.innerHTML = ICON_NEXT;
      [prev, next].forEach((btn, n) => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        swapClip(card, p, n ? 1 : -1, count, live);
      }));
      host = h('div', { class: 'clip-card' }, [card, h('div', { class: 'clip-nav' }, [prev, count, next]), live]);
      setAccent(host, p.accent);
      host.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && finePointer.matches) playLoop(card);
      });
      host.addEventListener('pointerleave', () => stopLoop(card));
    } else {
      card.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && finePointer.matches) playLoop(card);
      });
      card.addEventListener('pointerleave', () => stopLoop(card));
    }
    list.append(list.tagName === 'UL' ? h('li', {}, host) : host);
  }

  document.querySelectorAll('[data-group]').forEach((list) => {
    PROJECTS.filter((p) => p.group === list.dataset.group).forEach((p) => mountCard(list, p));
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

  /* Hero: RAYCRAYON as a window onto Ryan's work. Hover, keyboard focus or a press moves on to the next piece;
     it never reverts, like the button accent cycling. */

  const heroWord = document.querySelector('.hero__word');
  if (heroWord && typeof HERO_FILLS !== 'undefined') {
    const back = heroWord.querySelector('.hero__fill--back');
    const front = heroWord.querySelector('.hero__fill--front');
    const swatchImg = heroWord.querySelector('.hero__swatch-img');
    const swatchLabel = heroWord.querySelector('.hero__swatch-label');
    const note = document.getElementById('hero-piece');
    let index = 0;
    let fadeTimer = null;

    // One duotone filter per accent: luminance 0 → accent, 1 → off-white (#FAF8F2), alpha untouched.
    const defs = document.querySelector('.hero__filters defs');
    const filterId = {};
    for (const accent of new Set(HERO_FILLS.map((p) => p.accent))) {
      const id = `duo-${accent.slice(1).toLowerCase()}`;
      const dark = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16) / 255);
      const light = [0xFA, 0xF8, 0xF2].map((v) => v / 255);
      const rows = dark.map((d, i) => {
        const k = light[i] - d;
        return `${(0.2126 * k).toFixed(4)} ${(0.7152 * k).toFixed(4)} ${(0.0722 * k).toFixed(4)} 0 ${d.toFixed(4)}`;
      });
      defs.insertAdjacentHTML('beforeend',
        `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${rows.join(' ')} 0 0 0 1 0"/></filter>`);
      filterId[accent] = id;
    }

    const paint = (el, piece, src) => {
      el.style.setProperty('--img', cssUrl(src));
      el.style.setProperty('--tint', piece.accent);
      el.style.setProperty('--duo', `url(#${filterId[piece.accent]})`);
    };
    const showPiece = (piece, animate) => {
      paint(swatchImg, piece, piece.small);
      swatchLabel.textContent = piece.title;
      note.textContent = `Inside the letters: a still from ${piece.title}. Hover, focus or press the name to see the next piece.`;
      clearTimeout(fadeTimer);
      if (!animate || reduceMotion.matches) {
        paint(back, piece, piece.src);
        front.classList.remove('is-shown');
        return;
      }
      paint(front, piece, piece.src);
      front.classList.remove('is-shown');
      void front.offsetWidth;
      front.classList.add('is-shown');
      fadeTimer = setTimeout(() => {
        paint(back, piece, piece.src);
        front.classList.remove('is-shown');
      }, 520);
    };
    const next = () => {
      index = (index + 1) % HERO_FILLS.length;
      showPiece(HERO_FILLS[index], true);
    };

    if (CSS.supports('(-webkit-background-clip: text) or (background-clip: text)')) heroWord.classList.add('has-fill');
    showPiece(HERO_FILLS[0], false);
    // Phones only show the small still block (the letters are solid type there), so warm up those instead.
    const narrow = matchMedia('(max-width: 699px)');
    addEventListener('load', () => HERO_FILLS.forEach((p) => { new Image().src = narrow.matches ? p.small : p.src; }), { once: true });

    heroWord.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') next(); });
    heroWord.addEventListener('focus', () => { if (heroWord.matches(':focus-visible')) next(); });
    heroWord.addEventListener('click', (e) => { if (e.detail === 0 || lastPointer !== 'mouse') next(); });
  }

  /* Experience roadmap: each entry lights its node and the segment leading to it, once, as it scrolls in.
     Accents follow the crayon-box order top to bottom. Reduced motion: everything is lit from the start. */

  const roadmap = document.querySelector('.roadmap');
  if (roadmap) {
    const track = roadmap.querySelector('.roadmap__track');
    const parts = [...roadmap.querySelectorAll('.xp li')].map((li, i) => {
      const seg = h('span', { class: 'roadmap__seg' });
      const node = h('span', { class: 'roadmap__node' });
      seg.style.setProperty('--node', PALETTE[i % PALETTE.length]);
      node.style.setProperty('--node', PALETTE[i % PALETTE.length]);
      track.append(seg, node);
      return { li, seg, node, title: li.querySelector('.xp__role') };
    });

    // Offsets ignore the entries' reveal translate, so nodes sit where titles end up, not where they start.
    const offsetWithin = (el) => {
      let y = 0;
      for (let n = el; n && n !== roadmap; n = n.offsetParent) y += n.offsetTop;
      return y;
    };
    const layout = () => {
      let prev = 0;
      for (const p of parts) {
        const y = offsetWithin(p.title) + p.title.offsetHeight / 2;
        p.node.style.top = `${y}px`;
        p.seg.style.top = `${prev}px`;
        p.seg.style.height = `${y - prev}px`;
        prev = y;
      }
    };
    layout();
    new ResizeObserver(layout).observe(roadmap);
    document.fonts.ready.then(layout);

    const light = (p) => [p.li, p.seg, p.node].forEach((el) => el.classList.add('is-lit'));
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      parts.forEach(light);
    } else {
      roadmap.classList.add('is-armed');
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          light(parts.find((p) => p.li === entry.target));
          io.unobserve(entry.target);
        }
      }, { rootMargin: '0px 0px -18% 0px', threshold: 0.25 });
      parts.forEach((p) => io.observe(p.li));
    }
  }

  /* Selected work: the sira_cow loop plays while its window is in view; reduced motion keeps the poster */

  const spotVideo = document.querySelector('.spotlight__video');
  if (spotVideo && !reduceMotion.matches && 'IntersectionObserver' in window) {
    spotVideo.muted = true;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduceMotion.matches) spotVideo.play().catch(() => {});
      else spotVideo.pause();
    }, { threshold: 0.25 }).observe(spotVideo.parentElement);
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
    const base = PROJECTS.find((x) => x.slug === card.dataset.slug);
    if (!base) return;
    const p = withClip(base);
    trigger = card;
    stopLoop(card);
    setAccent(player, p.accent);
    stage.replaceChildren(playerMedia(p));
    player.querySelector('.player__title').textContent = p.title;
    player.querySelector('.player__meta').textContent = [p.clips && p.clips.length > 1 ? p.label : null, p.meta, p.year, p.role].filter(Boolean)
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

  /* Gumizoo: roster rows preview each character in the display window; clicking opens a detail panel */

  const gumizoo = document.getElementById('gumizoo');
  const gumiPanel = document.getElementById('gumi-panel');
  let openGumi = () => {};

  if (gumizoo && gumiPanel && typeof GUMIZOO !== 'undefined') {
    const display = gumizoo.querySelector('.gumizoo__display');
    const layers = gumizoo.querySelector('.gumizoo__layers');
    const caption = gumizoo.querySelector('.gumizoo__caption');
    const list = gumizoo.querySelector('.gumizoo__list');
    const portrait = gumiPanel.querySelector('.gumi-panel__portrait');
    const portraitImg = portrait.querySelector('img');
    const layerFor = {};
    const bySlug = (slug) => GUMIZOO.characters.find((c) => c.slug === slug);
    const srcset = (c) => `media/stills/gumizoo-${c.slug}-640.webp 640w, media/stills/gumizoo-${c.slug}.webp 1280w`;

    const previewFrags = gumizoo.querySelector('.gumi-frags--preview');
    const panelFrags = gumiPanel.querySelector('.gumi-frags--panel');
    const more = gumiPanel.querySelector('.gumi-panel__more');

    // A fragment is either a real cut-out ({ src }) or a placeholder crop of the portrait ({ at, zoom, shape }).
    const fragment = (c, f) => {
      const el = h('span', { class: 'gumi-frag', 'data-shape': f.src ? null : f.shape });
      if (f.src) {
        el.style.setProperty('--frag-img', cssUrl(f.src));
        return el;
      }
      const zx = f.zoom;
      const zy = f.zoom * 0.75;
      const pos = (v, z) => `${((v - 1 / (2 * z)) / (1 - 1 / z)) * 100}%`;
      el.style.setProperty('--frag-img', cssUrl(`media/stills/gumizoo-${c.slug}-640.webp`));
      el.style.setProperty('--frag-size', `${zx * 100}% auto`);
      el.style.setProperty('--frag-pos', `${pos(f.at[0], zx)} ${pos(f.at[1], zy)}`);
      return el;
    };
    const scatter = (container, c, count) => {
      const list = c.fragments || [];
      container.replaceChildren(...Array.from({ length: list.length ? count : 0 }, (_, i) => fragment(c, list[i % list.length])));
    };

    const posterLayer = h('div', { class: 'gumizoo__layer gumizoo__layer--poster is-active' },
      h('img', { src: GUMIZOO.poster.src, alt: GUMIZOO.poster.alt, loading: 'lazy', decoding: 'async' }));
    layers.append(posterLayer);

    for (const c of GUMIZOO.characters) {
      const layer = h('div', { class: 'gumizoo__layer', 'aria-hidden': 'true' }, h('img', {
        src: `media/stills/gumizoo-${c.slug}-640.webp`, srcset: srcset(c), sizes: '(min-width: 900px) 460px, 100vw',
        alt: c.alt, loading: 'lazy', decoding: 'async',
      }));
      layer.style.setProperty('--layer-bg', c.bg);
      layers.append(layer);
      layerFor[c.slug] = layer;

      const chip = h('span', { class: 'gumizoo__chip', 'aria-hidden': 'true' },
        h('img', { src: `media/stills/gumizoo-${c.slug}-chip.webp`, alt: '', width: '56', height: '56', loading: 'lazy' }));
      if (c.video) {
        chip.insertAdjacentHTML('beforeend',
          '<svg class="gumizoo__play" viewBox="0 0 22 22" focusable="false"><circle cx="11" cy="11" r="10"/><path d="M9 7.2v7.6l6-3.8z"/></svg>');
      }
      const row = h('button', {
        type: 'button', class: 'gumizoo__row', 'data-slug': c.slug, 'aria-haspopup': 'dialog',
        'aria-label': `${c.name} ${c.surname}: ${c.trait}${c.video ? ` Includes the video ${c.video.title}.` : ''}`,
      }, [
        chip,
        h('span', { class: 'gumizoo__row-name' }, [c.name, ' ', h('span', { class: 'gumizoo__row-surname' }, c.surname)]),
        h('span', { class: 'gumizoo__row-trait', 'aria-hidden': 'true' }, c.trait),
      ]);
      setAccent(row, c.accent);
      list.append(h('li', {}, row));
    }

    let shown = null;
    const show = (c) => {
      const active = c ? layerFor[c.slug] : posterLayer;
      for (const layer of layers.children) {
        const on = layer === active;
        layer.classList.toggle('is-active', on);
        if (on) layer.removeAttribute('aria-hidden');
        else layer.setAttribute('aria-hidden', 'true');
      }
      display.classList.toggle('is-previewing', Boolean(c));
      gumizoo.classList.toggle('is-flooded', Boolean(c));
      if (c && c !== shown) {
        setAccent(caption, c.accent);
        caption.querySelector('.gumizoo__caption-name').textContent = `${c.name} ${c.surname}`;
        caption.querySelector('.gumizoo__caption-trait').textContent = c.trait;
        gumizoo.style.setProperty('--flood', c.accent);
        gumizoo.style.setProperty('--on-flood', onColor(c.accent));
        scatter(previewFrags, c, 4);
      }
      shown = c;
    };
    list.addEventListener('pointerover', (e) => {
      const row = e.target.closest('.gumizoo__row');
      if (row && e.pointerType === 'mouse') show(bySlug(row.dataset.slug));
    });
    list.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !list.contains(document.activeElement)) show(null);
    });
    list.addEventListener('focusin', (e) => {
      const row = e.target.closest('.gumizoo__row');
      if (row) show(bySlug(row.dataset.slug));
    });
    list.addEventListener('focusout', (e) => {
      if (!list.contains(e.relatedTarget) && !gumiPanel.open) show(null);
    });

    let gumiRow = null;
    let gumiSource = null;
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    };

    openGumi = (row) => {
      const c = bySlug(row.dataset.slug);
      gumiRow = row;
      gumiSource = shown === c && inView(display) ? layerFor[c.slug] : row.querySelector('.gumizoo__chip');
      gumiSource.style.viewTransitionName = 'gumi-portrait';
      morph(() => {
        gumiSource.style.viewTransitionName = '';
        show(c);
        setAccent(gumiPanel, c.accent);
        portraitImg.src = `media/stills/gumizoo-${c.slug}.webp`;
        portraitImg.srcset = srcset(c);
        portraitImg.sizes = '(min-width: 900px) 560px, 100vw';
        portraitImg.alt = c.alt;
        gumiPanel.querySelector('.gumi-panel__stamp').textContent = `${c.name} ${c.surname}`;
        gumiPanel.querySelector('.gumi-panel__trait').textContent = c.trait;
        gumiPanel.querySelector('.gumi-panel__bio p').textContent = c.bio;
        scatter(panelFrags, c, 8);
        more.replaceChildren();
        if (c.video) {
          const video = h('video', {
            src: c.video.src, poster: c.video.poster, muted: true, loop: true, playsinline: true, controls: true,
            autoplay: !reduceMotion.matches, 'aria-label': c.video.label,
          });
          video.muted = true;
          more.append(video);
        }
        portrait.style.viewTransitionName = 'gumi-portrait';
        document.documentElement.classList.add('is-locked');
        gumiPanel.showModal();
        gumiPanel.scrollTop = 0;
      }).finally(() => { portrait.style.viewTransitionName = ''; });
    };

    const closeGumi = () => {
      if (!gumiPanel.open) return;
      portrait.style.viewTransitionName = 'gumi-portrait';
      morph(() => {
        portrait.style.viewTransitionName = '';
        if (gumiSource) gumiSource.style.viewTransitionName = 'gumi-portrait';
        gumiPanel.close();
      }).finally(() => { if (gumiSource) gumiSource.style.viewTransitionName = ''; });
    };

    gumiPanel.querySelector('.board__close').addEventListener('click', closeGumi);
    gumiPanel.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeGumi();
    });
    gumiPanel.addEventListener('click', (e) => {
      if (!e.target.closest('.gumi-panel__sheet > *, .board__close')) closeGumi();
    });
    gumiPanel.addEventListener('close', () => {
      more.replaceChildren();
      document.documentElement.classList.remove('is-locked');
      if (gumiRow) gumiRow.focus();
    });
  }

  document.addEventListener('click', (e) => {
    const row = e.target.closest('.gumizoo__row');
    if (row) {
      openGumi(row);
      return;
    }
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
