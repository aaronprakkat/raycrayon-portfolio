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

  /* Buttons, nav links and the email link fill with the next accent */

  function fill(node) {
    const accent = nextAccent();
    node.style.setProperty('--fill', accent);
    node.style.setProperty('--on-fill', onColor(accent));
  }

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('.js-fill');
    if (target && !target.contains(e.relatedTarget)) fill(target);
  });
  document.addEventListener('focusin', (e) => {
    const target = e.target.closest('.js-fill');
    if (target) fill(target);
  });

  /* Hero name: each letter lights up in an accent, then fades back */

  document.querySelectorAll('.hero__name span').forEach((letter) => {
    letter.addEventListener('pointerenter', () => {
      clearTimeout(letter.fadeTimer);
      letter.style.setProperty('--lit', nextAccent());
      letter.classList.add('is-lit');
    });
    letter.addEventListener('pointerleave', () => {
      letter.fadeTimer = setTimeout(() => letter.classList.remove('is-lit'), 150);
    });
  });

  /* Hero turntable: 72 pre-rendered angles, 5° apart */

  const turntable = document.querySelector('.turntable');
  if (turntable) {
    const img = turntable.querySelector('img');
    const handle = turntable.querySelector('.turntable__handle');
    const COUNT = 72;
    const STEP = 360 / COUNT;
    const SPEED = 360 / 12000;
    const frameSrc = (i) => `media/stills/hero/hero-${String(i).padStart(2, '0')}.webp`;

    let angle = 0;
    let shown = 0;
    let ready = false;
    let inView = true;
    let drag = null;
    let resumeAt = 0;
    let lastTime = 0;

    const describe = (deg) => {
      if (deg === 0) return 'Facing front';
      if (deg === 180) return 'Facing away';
      return `Turned ${deg} degrees`;
    };

    function show(nextAngle, announce) {
      angle = ((nextAngle % 360) + 360) % 360;
      const index = Math.round(angle / STEP) % COUNT;
      if (index !== shown) {
        shown = index;
        img.src = frameSrc(index);
      }
      if (announce) {
        const deg = Math.round(index * STEP);
        handle.setAttribute('aria-valuenow', deg);
        handle.setAttribute('aria-valuetext', describe(deg));
      }
    }

    function tick(time) {
      const running = ready && inView && !drag && !document.hidden && !reduceMotion.matches && time > resumeAt;
      if (running && lastTime) show(angle + (time - lastTime) * SPEED, false);
      lastTime = time;
      requestAnimationFrame(tick);
    }

    const preload = () => {
      const frames = Array.from({ length: COUNT }, (_, i) => {
        const frame = new Image();
        frame.src = frameSrc(i);
        return frame.decode().catch(() => {});
      });
      Promise.all(frames).then(() => {
        ready = true;
        requestAnimationFrame(tick);
      });
    };
    if (document.readyState === 'complete') preload();
    else addEventListener('load', preload, { once: true });

    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(turntable);

    handle.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, angle };
      handle.setPointerCapture(e.pointerId);
      turntable.classList.add('is-dragging');
    });
    handle.addEventListener('pointermove', (e) => {
      if (drag) show(drag.angle - (e.clientX - drag.x) * 0.6, true);
    });
    const endDrag = () => {
      if (!drag) return;
      drag = null;
      resumeAt = performance.now() + 1500;
      turntable.classList.remove('is-dragging');
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    handle.addEventListener('keydown', (e) => {
      const moves = { ArrowRight: -15, ArrowUp: -15, ArrowLeft: 15, ArrowDown: 15 };
      if (e.key in moves) show(angle + moves[e.key], true);
      else if (e.key === 'Home') show(0, true);
      else if (e.key === 'End') show(180, true);
      else return;
      e.preventDefault();
      resumeAt = performance.now() + 4000;
    });
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

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-slug]');
    if (card) openPlayer(card);
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
