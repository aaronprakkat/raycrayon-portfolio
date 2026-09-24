// WebGL ripple for the hero wordmark. Loaded on demand by main.js (desktop, WebGL available, no reduced
// motion); anything that fails leaves the CSS background-clip version in place.
import { Renderer, Program, Mesh, Texture, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Same duotone as the CSS feColorMatrix: luminance 0 → accent, 1 → #FAF8F2, computed on the sRGB values.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap0;
  uniform sampler2D tMap1;
  uniform vec2 uCover0;
  uniform vec2 uCover1;
  uniform vec3 uDark0;
  uniform vec3 uDark1;
  uniform vec2 uMouse;
  uniform vec2 uOrigin;
  uniform float uAspect;
  uniform float uTime;
  uniform float uHover;
  uniform float uProgress;
  uniform float uBurst;
  uniform float uReach;
  varying vec2 vUv;

  const vec3 LIGHT = vec3(250.0, 248.0, 242.0) / 255.0;
  const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

  vec3 duo(sampler2D map, vec2 uv, vec2 cover, vec3 dark) {
    float l = dot(texture2D(map, (uv - 0.5) * cover + 0.5).rgb, LUMA);
    return dark + (LIGHT - dark) * l;
  }

  vec2 bend(vec2 uv, vec2 centre, float amount, float r, float wave) {
    vec2 d = vec2((uv.x - centre.x) * uAspect, uv.y - centre.y);
    vec2 dir = r > 1e-4 ? d / r : vec2(0.0);
    return uv + vec2(dir.x / uAspect, dir.y) * amount * wave;
  }

  void main() {
    vec2 uv = vUv;

    // Cursor ripple: rings travelling out from the pointer, fading with distance.
    float rm = length(vec2((vUv.x - uMouse.x) * uAspect, vUv.y - uMouse.y));
    float rings = sin(rm * 30.0 - uTime * 6.0) * exp(-rm * 3.6);
    uv = bend(uv, uMouse, 0.024 * uHover, rm, rings);

    // Swap: one stronger wave front sweeps out from where it was triggered, and the next image melts in behind it.
    float ro = length(vec2((vUv.x - uOrigin.x) * uAspect, vUv.y - uOrigin.y));
    float front = uProgress * uReach;
    float edge = ro - front;
    float wave = sin(edge * 26.0) * exp(-abs(edge) * 7.0);
    uv = bend(uv, uOrigin, 0.045 * uBurst, ro, wave);

    vec3 a = duo(tMap0, uv, uCover0, uDark0);
    vec3 b = duo(tMap1, uv, uCover1, uDark1);
    float reveal = uProgress <= 0.0 ? 0.0 : 1.0 - smoothstep(-0.18, 0.18, edge + 0.18 * (1.0 - uProgress));
    gl_FragColor = vec4(mix(a, b, reveal), 1.0);
  }
`;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export async function createRipple({ word, text, clipText, first }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  word.prepend(canvas);

  const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, antialias: false });
  const { gl } = renderer;

  const images = new Map();
  const textures = new Map();
  const texture = async (piece) => {
    if (!textures.has(piece.src)) {
      const img = images.get(piece.src) || await loadImage(piece.src);
      images.set(piece.src, img);
      textures.set(piece.src, { tex: new Texture(gl, { image: img }), ratio: img.naturalWidth / img.naturalHeight });
    }
    return textures.get(piece.src);
  };

  const firstTex = await texture(first);
  const uniforms = {
    tMap0: { value: firstTex.tex }, tMap1: { value: firstTex.tex },
    uCover0: { value: [1, 1] }, uCover1: { value: [1, 1] },
    uDark0: { value: hexToRgb(first.accent) }, uDark1: { value: hexToRgb(first.accent) },
    uMouse: { value: [0.5, 0.5] }, uOrigin: { value: [0.5, 0.5] },
    uAspect: { value: 1 }, uTime: { value: 0 }, uHover: { value: 0 },
    uProgress: { value: 0 }, uBurst: { value: 0 }, uReach: { value: 1 },
  };
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) });

  let current = { piece: first, t: firstTex };
  let incoming = null;
  let w = 1;
  let h = 1;

  // CSS background-size: cover, background-position: center, expressed as a UV scale around the centre.
  const cover = (ratio) => {
    const a = w / h;
    return ratio > a ? [a / ratio, 1] : [1, ratio / a];
  };

  // The canvas sits over the text's own line box, and the clip path redraws the word at the same size and
  // baseline, so at rest the letters match the CSS version exactly.
  const layout = () => {
    w = Math.max(1, text.clientWidth);
    h = Math.max(1, text.clientHeight);
    canvas.style.height = `${h}px`;
    renderer.setSize(w, h);
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    text.append(probe);
    const baseline = probe.getBoundingClientRect().top - text.getBoundingClientRect().top;
    probe.remove();
    const cs = getComputedStyle(text);
    clipText.setAttribute('x', w / 2);
    clipText.setAttribute('y', baseline);
    clipText.setAttribute('font-size', cs.fontSize);
    clipText.setAttribute('font-family', cs.fontFamily);
    clipText.setAttribute('font-weight', cs.fontWeight);
    uniforms.uAspect.value = w / h;
    uniforms.uCover0.value = cover(current.t.ratio);
    uniforms.uCover1.value = cover((incoming || current).t.ratio);
  };

  // Pointer state, in canvas UV space (origin bottom-left, as WebGL samples it). Read from the live rect on
  // every move, since the wordmark resizes with its container.
  const toUv = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    return [(clientX - r.left) / r.width, 1 - (clientY - r.top) / r.height];
  };
  const pointer = { x: 0.5, y: 0.5, last: -1e9, proximity: 0 };
  let hover = 0;
  let visible = true;
  let active = true;
  let raf = 0;
  let prev = 0;
  let swapStart = 0;
  const SWAP_MS = 750;

  const render = () => renderer.render({ scene: mesh });

  const frame = (now) => {
    raf = 0;
    const dt = prev ? Math.min(now - prev, 64) : 16;
    prev = now;
    // Full strength while the cursor moves, easing off over ~1s once it stops, then a hard zero so the
    // loop can actually end instead of chasing an exponential tail.
    const since = now - pointer.last;
    const target = since > 1100 ? 0 : Math.exp(-since / 450) * pointer.proximity;
    hover += (target - hover) * (1 - Math.exp(-dt / 110));
    uniforms.uHover.value = hover;
    uniforms.uMouse.value = [pointer.x, pointer.y];
    uniforms.uTime.value = now / 1000;

    if (incoming) {
      const t = Math.min(1, (now - swapStart) / SWAP_MS);
      uniforms.uProgress.value = easeInOut(t);
      uniforms.uBurst.value = Math.sin(Math.PI * t);
      if (t >= 1) finishSwap();
    }
    render();

    if (incoming || hover > 0.002 || target > 0.002) schedule();
    else { hover = 0; uniforms.uHover.value = 0; prev = 0; render(); }
  };
  const schedule = () => { if (!raf && visible && active) raf = requestAnimationFrame(frame); };

  const finishSwap = () => {
    current = incoming;
    incoming = null;
    uniforms.tMap0.value = current.t.tex;
    uniforms.uDark0.value = hexToRgb(current.piece.accent);
    uniforms.uCover0.value = cover(current.t.ratio);
    uniforms.uProgress.value = 0;
    uniforms.uBurst.value = 0;
  };

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    pointer.proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 140);
    [pointer.x, pointer.y] = toUv(e.clientX, e.clientY);
    pointer.last = performance.now();
    schedule();
  };
  const hero = word.closest('.hero') || word;
  hero.addEventListener('pointermove', onMove, { passive: true });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; prev = 0; }
    if (visible && incoming) schedule();
  }).observe(word);

  new ResizeObserver(() => { layout(); if (!raf) render(); }).observe(text);
  layout();
  render();

  return {
    // origin: [clientX, clientY] of the pointer that triggered it, or null to ripple from the centre.
    async show(piece, origin) {
      const t = await texture(piece);
      if (incoming) finishSwap();
      incoming = { piece, t };
      const o = origin ? toUv(origin[0], origin[1]) : [0.5, 0.5];
      uniforms.uOrigin.value = o;
      const a = w / h;
      uniforms.uReach.value = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => Math.hypot((x - o[0]) * a, y - o[1]))) + 0.2;
      uniforms.tMap1.value = t.tex;
      uniforms.uDark1.value = hexToRgb(piece.accent);
      uniforms.uCover1.value = cover(t.ratio);
      swapStart = performance.now();
      if (!visible || !active) { finishSwap(); render(); return; }
      schedule();
    },
    // Instantly show a piece with no transition (used when re-enabling after a breakpoint change).
    async set(piece) {
      const t = await texture(piece);
      incoming = { piece, t };
      finishSwap();
      render();
    },
    preload(pieces) { pieces.forEach((p) => texture(p).catch(() => {})); },
    setActive(on) {
      active = on;
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; prev = 0; }
      if (!on && incoming) finishSwap();
      if (on) { layout(); render(); }
    },
    isRunning: () => Boolean(raf),
  };
}
