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

  /* Contact: copy the email for visitors with no mail app. Only shown where the clipboard API exists. */

  const copyBtn = document.querySelector('.contact__copy');
  if (copyBtn && navigator.clipboard && window.isSecureContext) {
    const status = copyBtn.nextElementSibling;
    let reset;
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(() => {
        copyBtn.textContent = 'Copied';
        status.textContent = 'Email address copied';
        clearTimeout(reset);
        reset = setTimeout(() => {
          copyBtn.textContent = 'Copy email';
          status.textContent = '';
        }, 2000);
      });
    });
  }

  /* Hero: RAYCRAYON as a window onto Ryan's work. Hover, keyboard focus or a press moves on to the next piece;
     it never reverts, like the button accent cycling. On desktop with WebGL (and no reduced motion) the letters
     are a WebGL canvas (js/hero-ripple.js) that ripples under the cursor and melts into the next piece; otherwise
     they're the CSS background-clip version, swapping instantly. */

  const heroWord = document.querySelector('.hero__word');
  if (heroWord && typeof HERO_FILLS !== 'undefined') {
    const back = heroWord.querySelector('.hero__fill');
    const swatchImg = heroWord.querySelector('.hero__swatch-img');
    const swatchLabel = heroWord.querySelector('.hero__swatch-label');
    const note = document.getElementById('hero-piece');
    let index = 0;
    let ripple = null;
    const wide = matchMedia('(min-width: 700px)');
    const rippleOn = () => Boolean(ripple) && wide.matches && !reduceMotion.matches;

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
    // The CSS layer always tracks the current piece, so switching to the fallback at any point is seamless.
    const showPiece = (piece, origin) => {
      paint(swatchImg, piece, piece.small);
      swatchLabel.textContent = piece.title;
      note.textContent = `Inside the letters: a still from ${piece.title}. Hover, focus or press the name to see the next piece.`;
      paint(back, piece, piece.src);
      if (rippleOn()) ripple.show(piece, origin).catch(() => {});
    };
    const next = (origin = null) => {
      index = (index + 1) % HERO_FILLS.length;
      showPiece(HERO_FILLS[index], origin);
    };

    if (CSS.supports('(-webkit-background-clip: text) or (background-clip: text)')) heroWord.classList.add('has-fill');
    showPiece(HERO_FILLS[0], null);

    const syncRipple = () => {
      if (!ripple) return;
      const on = rippleOn();
      heroWord.classList.toggle('is-gl', on);
      ripple.setActive(on);
      if (on) ripple.set(HERO_FILLS[index]).catch(() => {});
    };
    const canWebGL = (() => {
      try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
      } catch { return false; }
    })();

    addEventListener('load', () => {
      if (canWebGL && wide.matches && !reduceMotion.matches) {
        const clipText = document.querySelector('#wordmark-clip text');
        import(new URL('js/hero-ripple.js', document.baseURI).href)
          .then((m) => m.createRipple({ word: heroWord, text: back, clipText, first: HERO_FILLS[index] }))
          .then((r) => {
            ripple = r;
            ripple.preload(HERO_FILLS);
            syncRipple();
          })
          .catch(() => heroWord.querySelector('.hero__gl')?.remove());
      } else {
        // Warm up whichever stills this device will show: the small block on phones, the letter fill otherwise.
        HERO_FILLS.forEach((p) => { new Image().src = wide.matches ? p.src : p.small; });
      }
    }, { once: true });
    wide.addEventListener('change', syncRipple);
    reduceMotion.addEventListener('change', syncRipple);

    heroWord.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') next([e.clientX, e.clientY]); });
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
  const boardCount = board.querySelector('.board__count');
  const boardLive = board.querySelector('[aria-live]');
  const BOARD_CYCLE = PROJECTS.filter((p) => p.board);
  const renderSrc = (p) => p.board.render || p.poster || p.still;
  let boardCard = null;
  let boardIndex = 0;

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

    boardIndex = BOARD_CYCLE.indexOf(p);
    boardCount.textContent = `${boardIndex + 1} / ${BOARD_CYCLE.length}`;
    // Warm the neighbours' renders so a cycle never waits on the network mid-transition.
    [-1, 1].forEach((step) => { new Image().src = renderSrc(BOARD_CYCLE[wrapIndex(boardIndex + step)]); });

    const img = boardRender.querySelector('img');
    img.src = renderSrc(p);
    img.alt = b.renderAlt || p.alt;

    // Same hover loop as the strip card, so the render stays responsive once the board is open.
    stopLoop(boardRender);
    const video = boardRender.querySelector('video');
    video.poster = img.src;
    if (p.loop && !b.render) video.src = p.loop;
    else video.removeAttribute('src');

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

  /* Cycling: Prev/Next, the arrow keys and a horizontal trackpad swipe move through the Felines in place,
     wrapping at both ends. Two beats, transform (translate/rotate) and opacity only: the pinned pieces scatter
     outward from the board's centre (drifting against the direction of travel), the content swaps, then the
     new pieces fly back in from the same directions with the open animation's 60ms stagger, drifting in from
     the far side. The main render doesn't fly: it flips on its vertical axis on its own track, timed to the same
     beats, and its image swaps while it's edge-on. Reduced motion: a straight swap, everything already pinned. */

  const wrapIndex = (i) => (i + BOARD_CYCLE.length) % BOARD_CYCLE.length;
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  const EASE_OUT = 'cubic-bezier(.2, .7, .2, 1)';
  let cycling = false;

  // Where each visible piece flies to (and back in from): out along the line from the viewport centre,
  // plus a sideways drift against the direction of travel. The title gets its own, bigger spin.
  function flights(step) {
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    const reach = Math.max(innerWidth, innerHeight) * .6;
    return [...board.querySelectorAll('.board__sheet > :not([hidden])')].map((el) => {
      const r = el.getBoundingClientRect();
      const vx = r.left + r.width / 2 - cx;
      const vy = r.top + r.height / 2 - cy;
      const len = Math.hypot(vx, vy);
      const ux = len > 40 ? vx / len : 0;
      const uy = len > 40 ? vy / len : 0;
      const spin = el.classList.contains('board__title') ? -step * 28 : (ux || -step) * 12;
      return { el, x: ux * reach, y: uy * reach, drift: innerWidth * .25, spin };
    });
  }
  // Each flying piece keeps its stagger slot from the full reading order (the render's slot just stays empty).
  const flying = (list) => list.map((f, i) => ({ ...f, i })).filter((f) => f.el !== boardRender);

  // The render's card-flip, around its own vertical centre line (perspective from the sheet).
  function flipOrigin() {
    const sheet = boardRender.parentElement;
    const s = sheet.getBoundingClientRect();
    const r = boardRender.getBoundingClientRect();
    sheet.style.perspectiveOrigin = `${r.left + r.width / 2 - s.left}px ${r.top + r.height / 2 - s.top}px`;
  }

  async function cycleBoard(step) {
    if (!board.open || cycling) return;
    cycling = true;
    const next = BOARD_CYCLE[wrapIndex(boardIndex + step)];
    boardCard = document.querySelector(`.card[data-slug="${next.slug}"]`) || boardCard;
    boardLive.textContent = `${next.title}, ${next.meta}. ${wrapIndex(boardIndex + step) + 1} of ${BOARD_CYCLE.length}`;

    if (reduceMotion.matches || !Element.prototype.animate) {
      fillBoard(next);
      board.scrollTop = 0;
      cycling = false;
      return;
    }

    const out = flying(flights(step));
    const exits = out.map(({ el, x, y, drift, spin, i }) => el.animate(
      [{}, { translate: `${x - step * drift}px ${y}px`, rotate: `${spin}deg`, opacity: 0 }],
      { duration: 340, delay: i * 25, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' },
    ));
    // Render: turns to edge-on over the whole exit beat, so it's invisible exactly when the content swaps.
    const exitBeat = 340 + Math.max(0, ...out.map((f) => f.i)) * 25;
    flipOrigin();
    const flipOut = boardRender.animate(
      [{}, { rotate: `y ${-step * 90}deg` }],
      { duration: exitBeat, easing: 'cubic-bezier(.45, 0, .8, .4)', fill: 'forwards' },
    );
    await Promise.all([...exits, flipOut].map((a) => a.finished.catch(() => {})));

    fillBoard(next);
    board.scrollTop = 0;
    const img = boardRender.querySelector('img');
    await Promise.race([img.decode().catch(() => {}), wait(250)]);

    // Drop the exits, measure the new layout's resting positions and start the entries in the same task, so
    // nothing paints in between.
    exits.forEach((a) => a.cancel());
    flipOut.cancel();
    const back = flying(flights(step));
    const entries = back.map(({ el, x, y, drift, spin, i }) => el.animate(
      [{ translate: `${x + step * drift}px ${y}px`, rotate: `${-spin}deg`, opacity: 0 }, {}],
      { duration: 480, delay: i * 60, easing: EASE_OUT, fill: 'backwards' },
    ));
    // Render: continues the same turn from the other edge, landing with the middle of the card stagger.
    flipOrigin();
    const flipIn = boardRender.animate(
      [{ rotate: `y ${step * 90}deg` }, {}],
      { duration: 620, easing: EASE_OUT },
    );
    await Promise.all([...entries, flipIn].map((a) => a.finished.catch(() => {})));
    cycling = false;
  }

  board.querySelectorAll('.board__arrow').forEach((btn) => {
    btn.addEventListener('click', () => cycleBoard(Number(btn.dataset.step)));
  });
  board.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    cycleBoard(e.key === 'ArrowRight' ? 1 : -1);
  });

  // Trackpad two-finger swipe: horizontal wheel deltas add up to a threshold; one gesture fires once, and the
  // next can only fire after the wheel has been quiet for a moment (trackpads keep sending inertia events).
  let swipeSum = 0;
  let swipeSpent = false;
  let swipeQuiet = 0;
  board.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(swipeQuiet);
    swipeQuiet = setTimeout(() => { swipeSum = 0; swipeSpent = false; }, 220);
    if (swipeSpent) return;
    swipeSum += e.deltaX;
    if (Math.abs(swipeSum) > 80) {
      swipeSpent = true;
      cycleBoard(swipeSum > 0 ? 1 : -1);
    }
  }, { passive: false });

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

  boardRender.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' && finePointer.matches && boardRender.querySelector('video[src]')) playLoop(boardRender);
  });
  boardRender.addEventListener('pointerleave', () => stopLoop(boardRender));

  board.querySelector('.board__close').addEventListener('click', closeBoard);
  board.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeBoard();
  });
  board.addEventListener('click', (e) => {
    if (!e.target.closest('.board__sheet > *, .board__close, .board__arrow')) closeBoard();
  });
  board.addEventListener('close', () => {
    stopLoop(boardRender);
    boardLive.textContent = '';
    document.documentElement.classList.remove('is-locked');
    if (boardCard) boardCard.focus();
  });

  /* Gumizoo: a 2×2 grid of the four heads, rendered in Blender (a still plus a 36-frame, 10°-a-step turntable
     sprite each; no WebGL). Hover/focus lifts the head out of its frame, shows its name, floods that tile with
     its accent and colours the section heading to match. Clicking plays one full turn of the head as the morph into the detail panel, where dragging
     (or the arrow keys) turns it. Reduced motion: no lift, no spin, the panel opens with the head in place. */

  const gumizoo = document.getElementById('gumizoo');
  const gumiPanel = document.getElementById('gumi-panel');
  let openGumi = () => {};

  const SPIN_FRAMES = 36;
  const SPIN_COLS = 6;
  // Phones get the 480px-a-frame sprite (2880px sheet): the 720px one decodes to ~75 MB, too much for a phone.
  const spriteSrc = (c) => `media/stills/gumizoo-${c.slug}-turn${matchMedia('(max-width: 699px)').matches ? '-480' : ''}.webp`;
  const spriteLoads = {};
  const loadSprite = (c) => {
    if (!spriteLoads[c.slug]) {
      spriteLoads[c.slug] = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = spriteSrc(c);
      });
    }
    return spriteLoads[c.slug];
  };

  // A turnable head: the still sits underneath; once the sprite is in, the sprite shows the current frame.
  function spinner(el) {
    const turn = el.querySelector('.gumi-spin__turn');
    let frame = 0;
    let run = 0;
    const api = {
      get frame() { return frame; },
      set(f) {
        frame = ((Math.round(f) % SPIN_FRAMES) + SPIN_FRAMES) % SPIN_FRAMES;
        const col = frame % SPIN_COLS;
        const row = Math.floor(frame / SPIN_COLS);
        const last = SPIN_FRAMES / SPIN_COLS - 1;
        turn.style.backgroundPosition = `${(col / (SPIN_COLS - 1)) * 100}% ${(row / last) * 100}%`;
        const deg = frame * (360 / SPIN_FRAMES);
        el.setAttribute('aria-valuenow', String(deg));
        el.setAttribute('aria-valuetext', deg ? `Turned ${deg} degrees` : 'Facing front');
      },
      use(c, ready) {
        el.classList.toggle('is-ready', ready);
        turn.style.backgroundImage = ready ? cssUrl(spriteSrc(c)) : '';
        api.set(0);
      },
      // Tween to a frame (past 36 for a full turn), easing in and out.
      turnTo(target, ms) {
        const id = ++run;
        const from = frame;
        const start = performance.now();
        return new Promise((resolve) => {
          const tick = (now) => {
            if (id !== run) return resolve();
            const t = Math.min(1, (now - start) / ms);
            const e = t < .5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
            api.set(from + (target - from) * e);
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
      },
      stop() { run += 1; },
    };
    return api;
  }

  if (gumizoo && gumiPanel && typeof GUMIZOO !== 'undefined') {
    const tiles = gumizoo.querySelector('.gumizoo__tiles');
    const model = gumiPanel.querySelector('.gumi-panel__model');
    const modelStill = model.querySelector('.gumi-spin__still');
    const spin = spinner(model);
    const panelFrags = gumiPanel.querySelector('.gumi-frags--panel');
    const more = gumiPanel.querySelector('.gumi-panel__more');
    const bySlug = (slug) => GUMIZOO.characters.find((c) => c.slug === slug);
    const still = (c) => `media/stills/gumizoo-${c.slug}-3d.webp`;

    gumizoo.querySelector('.gumizoo__poster').append(h('img', {
      src: GUMIZOO.poster.src, alt: GUMIZOO.poster.alt, width: '1080', height: '1920', loading: 'lazy', decoding: 'async',
    }));

    // Panel fragments: a real cut-out ({ src }) or a placeholder crop of the 2D portrait ({ at, zoom, shape }).
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

    for (const c of GUMIZOO.characters) {
      const tile = h('button', {
        type: 'button', class: 'gumi-tile', 'data-slug': c.slug, 'aria-haspopup': 'dialog',
        'aria-label': `${c.name} ${c.surname}. ${c.alt}${c.video ? ` Includes the video ${c.video.title}.` : ''}`,
      }, [
        h('img', { class: 'gumi-tile__head', src: still(c), alt: '', width: '770', height: '606', loading: 'lazy', decoding: 'async' }),
        h('span', { class: 'gumi-tile__name', 'aria-hidden': 'true' }, [c.name, ' ', h('span', {}, c.surname)]),
      ]);
      setAccent(tile, c.accent);
      tiles.append(h('li', {}, tile));
    }

    // Hover/focus: the tile floods itself (CSS); here the heading takes this head's accent (black again when
    // nothing is hovered), and its turntable starts loading for the click.
    const flood = (c) => {
      if (c) {
        gumizoo.style.setProperty('--title-accent', c.accent);
        loadSprite(c);
      } else {
        gumizoo.style.removeProperty('--title-accent');
      }
    };
    tiles.addEventListener('pointerover', (e) => {
      const tile = e.target.closest('.gumi-tile');
      if (tile && e.pointerType === 'mouse') flood(bySlug(tile.dataset.slug));
    });
    tiles.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !tiles.contains(document.activeElement)) flood(null);
    });
    tiles.addEventListener('focusin', (e) => {
      const tile = e.target.closest('.gumi-tile');
      if (tile) flood(bySlug(tile.dataset.slug));
    });
    tiles.addEventListener('focusout', (e) => {
      if (!tiles.contains(e.relatedTarget) && !gumiPanel.open) flood(null);
    });

    let gumiTile = null;
    const tileHead = (tile) => tile.querySelector('.gumi-tile__head');

    openGumi = async (tile) => {
      const c = bySlug(tile.dataset.slug);
      gumiTile = tile;
      // Give the turntable a moment if it isn't in yet (usually it is: hover already started it).
      const ready = await Promise.race([loadSprite(c), wait(400).then(() => false)]);
      const turn = ready && !reduceMotion.matches;
      tileHead(tile).style.viewTransitionName = 'gumi-portrait';
      morph(() => {
        tileHead(tile).style.viewTransitionName = '';
        flood(c);
        setAccent(gumiPanel, c.accent);
        gumiPanel.dataset.gumi = c.slug; // per-character text treatment (CSS)
        modelStill.src = still(c);
        spin.use(c, ready);
        model.setAttribute('aria-label', `${c.alt} Turn it with the arrow keys or by dragging.`);
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
        model.style.viewTransitionName = 'gumi-portrait';
        document.documentElement.classList.add('is-locked');
        gumiPanel.showModal();
        gumiPanel.scrollTop = 0;
        // The full turn runs inside the morph (the incoming view is live), so the spin is the transition.
        if (turn) spin.turnTo(SPIN_FRAMES, 1100);
      }).finally(() => { model.style.viewTransitionName = ''; });
    };

    const closeGumi = async () => {
      if (!gumiPanel.open) return;
      // Face front again before morphing back to the tile's still.
      if (spin.frame && !reduceMotion.matches) {
        await spin.turnTo(spin.frame > SPIN_FRAMES / 2 ? SPIN_FRAMES : 0, 260);
      }
      spin.stop();
      spin.set(0);
      model.style.viewTransitionName = 'gumi-portrait';
      const head = gumiTile && tileHead(gumiTile);
      morph(() => {
        model.style.viewTransitionName = '';
        if (head) head.style.viewTransitionName = 'gumi-portrait';
        gumiPanel.close();
      }).finally(() => { if (head) head.style.viewTransitionName = ''; });
    };

    // Turning in the panel: drag across (the model's full width is one full turn) or arrow keys, 10° a step.
    let drag = null;
    model.addEventListener('pointerdown', (e) => {
      if (!model.classList.contains('is-ready')) return;
      spin.stop();
      drag = { x: e.clientX, frame: spin.frame, w: model.clientWidth };
      model.setPointerCapture(e.pointerId);
      model.classList.add('is-dragging');
    });
    model.addEventListener('pointermove', (e) => {
      if (drag) spin.set(drag.frame + ((e.clientX - drag.x) / drag.w) * SPIN_FRAMES);
    });
    const endDrag = () => {
      drag = null;
      model.classList.remove('is-dragging');
    };
    model.addEventListener('pointerup', endDrag);
    model.addEventListener('pointercancel', endDrag);
    model.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!step || !model.classList.contains('is-ready')) return;
      e.preventDefault();
      spin.stop();
      spin.set(spin.frame + step);
    });

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
      if (gumiTile) gumiTile.focus();
    });
  }

  document.addEventListener('click', (e) => {
    const tile = e.target.closest('.gumi-tile');
    if (tile) {
      openGumi(tile);
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
