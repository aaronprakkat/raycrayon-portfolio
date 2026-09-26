/* Gumizoo title: live gummy-candy lettering, drawn with raw WebGL (no library) from the heading's own text.

   The word is set in Bagel Fat One on an offscreen canvas and turned into a signed distance field (exact
   Euclidean distance transform). From that, a pillow-shaped height field (domed strokes, soft bevels) and its
   normals are packed into one texture. A single fragment shader then shades the candy live:
   - a solid side wall stepped back along a fixed down-right direction, so the letters are thick, not shadowed;
   - gelatin translucency: the distance to the edge doubles as thickness, so thin rims come out lighter and more
     luminous and the thick core deeper (Beer–Lambert-style), plus light coming through the lower edges;
   - a sharp and a broad highlight from a fixed upper-left light, and a thin darker silhouette line.

   The colour comes from the same --title-accent that main.js's setActive() sets on #gumizoo (this file only
   watches it; the hover logic is untouched). Every accent is lifted in OKLCH — same hue, lightness raised to at
   least .68, chroma ×1.35 within sRGB — the same formula the CSS fallback uses, so hover states read bright and
   saturated against the pearl-gray rest colour (--title-rest). Nothing renders at rest: a frame is drawn only on
   a colour change (a .3s tween, instant under reduced motion) or a resize. No WebGL, a lost context, a failed
   shader, forced colours, or a font that didn't load all leave the CSS fallback: the real text, styled. */
(() => {
  const section = document.getElementById('gumizoo');
  const holder = section && section.querySelector('.gumi-title');
  const canvas = holder && holder.querySelector('.gumi-title__gl');
  if (!canvas || matchMedia('(forced-colors: active)').matches) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const FONT = '"Bagel Fat One"';
  const WORD = holder.textContent.trim().toUpperCase();

  // ---- colour: sRGB <-> OKLab, and the lift -----------------------------------------------------------------
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const hexToLin = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLin(v / 255));
  };
  const linToLab = ([r, g, b]) => {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const labToLin = ([L, a, b]) => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  };
  const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  // Same hue; L at least .68; chroma ×1.35, pulled back only as far as needed to stay inside sRGB.
  const lift = (lin) => {
    const [L0, a, b] = linToLab(lin);
    const C0 = Math.hypot(a, b);
    const h = Math.atan2(b, a);
    const L = Math.max(L0, 0.68);
    let lo = 0;
    let hi = C0 * 1.35;
    const at = (C) => [L, C * Math.cos(h), C * Math.sin(h)];
    if (inGamut(labToLin(at(hi)))) lo = hi;
    else for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (inGamut(labToLin(at(mid)))) lo = mid; else hi = mid; }
    return at(lo);
  };

  // ---- geometry: text -> SDF -> height field + normals, packed into RGBA8 -------------------------------------
  const INF = 1e20;
  function edt1d(f, n, d, v, z) {
    let k = 0;
    v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    for (let q = 0, j = 0; q < n; q++) {
      while (z[j + 1] < q) j++;
      d[q] = (q - v[j]) * (q - v[j]) + f[v[j]];
    }
  }
  // Squared distance from each pixel to the nearest pixel where `seed` is true.
  function edt(seed, w, h) {
    const g = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) g[i] = seed[i] ? 0 : INF;
    const n = Math.max(w, h);
    const f = new Float64Array(n); const d = new Float64Array(n);
    const v = new Int32Array(n); const z = new Float64Array(n + 1);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) f[y] = g[y * w + x];
      edt1d(f, h, d, v, z);
      for (let y = 0; y < h; y++) g[y * w + x] = d[y];
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) f[x] = g[y * w + x];
      edt1d(f, w, d, v, z);
      for (let x = 0; x < w; x++) g[y * w + x] = d[x];
    }
    return g;
  }
  function blur(src, w, h, r) { // two separable box passes ≈ a soft gaussian
    let a = src; let b = new Float32Array(w * h);
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < h; y++) {
        let acc = 0;
        for (let x = -r; x <= r; x++) acc += a[y * w + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
          b[y * w + x] = acc / (2 * r + 1);
          acc += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)];
        }
      }
      [a, b] = [b, a];
      for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += a[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
          b[y * w + x] = acc / (2 * r + 1);
          acc += a[Math.min(h - 1, y + r + 1) * w + x] - a[Math.max(0, y - r) * w + x];
        }
      }
      [a, b] = [b, a];
    }
    return a;
  }

  // Build the packed texture for a canvas of w×h device pixels, the text set at `fontPx` with its baseline at
  // `baseY` and centred on `cx`. Returns the RGBA bytes plus the ranges the shader needs.
  function build(w, h, fontPx, cx, baseY, spacingPx) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.font = `${fontPx}px ${FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    // Letter by letter, so the spacing matches the CSS letter-spacing of the live text exactly.
    const widths = [...WORD].map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((s, x) => s + x, 0) + spacingPx * (WORD.length - 1);
    let x = cx - total / 2;
    [...WORD].forEach((ch, i) => { ctx.fillText(ch, x, baseY); x += widths[i] + spacingPx; });
    const cov = ctx.getImageData(0, 0, w, h).data;

    const n = w * h;
    const a = new Float32Array(n);
    const inside = new Uint8Array(n); const outside = new Uint8Array(n);
    for (let i = 0; i < n; i++) { a[i] = cov[i * 4 + 3] / 255; inside[i] = a[i] >= 0.5; outside[i] = !inside[i]; }
    const dOut = edt(inside, w, h); // to the letters, for outside pixels
    const dIn = edt(outside, w, h); // to the background, for inside pixels
    const sd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // Edge pixels use their own coverage for sub-pixel accuracy; the rest use the exact transform.
      sd[i] = (a[i] > 0 && a[i] < 1) ? a[i] - 0.5 : (inside[i] ? Math.sqrt(dIn[i]) - 0.5 : 0.5 - Math.sqrt(dOut[i]));
    }

    // Pillow profile: a quarter circle of radius R up from the edge, flat beyond it. R is most of the stroke's
    // half-width, so every stroke is domed, not flat-topped. A blur softens the ridge along each stroke's spine.
    let maxIn = 0;
    for (let i = 0; i < n; i++) if (sd[i] > maxIn) maxIn = sd[i];
    const R = Math.max(2, maxIn * 0.92);
    const hgt = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = Math.min(1, Math.max(0, sd[i] / R));
      hgt[i] = Math.sqrt(1 - (1 - t) * (1 - t));
    }
    const hs = blur(hgt, w, h, Math.max(1, Math.round(R * 0.12)));
    const RANGE = Math.max(4, R * 1.1); // signed-distance range stored in the blue channel, ±RANGE px
    const out = new Uint8Array(n * 4);
    const k = R * 0.9; // height scale: how steep the dome reads
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const hx = (hs[y * w + Math.min(w - 1, x + 1)] - hs[y * w + Math.max(0, x - 1)]) / 2 * k;
        const hy = (hs[Math.min(h - 1, y + 1) * w + x] - hs[Math.max(0, y - 1) * w + x]) / 2 * k;
        const inv = 1 / Math.hypot(hx, hy, 1);
        out[i * 4] = Math.round((-hx * inv * 0.5 + 0.5) * 255);
        out[i * 4 + 1] = Math.round((-hy * inv * 0.5 + 0.5) * 255);
        out[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, sd[i] / RANGE * 0.5 + 0.5)) * 255);
        out[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, sd[i] / maxIn)) * 255); // thickness
      }
    }
    return { data: out, range: RANGE };
  }

  // ---- WebGL -------------------------------------------------------------------------------------------------
  const VERT = `attribute vec2 p; varying vec2 uv;
    void main() { uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `precision highp float;
    varying vec2 uv;
    uniform sampler2D tex; uniform vec2 px; uniform float range; uniform vec2 dir; uniform float depth;
    uniform vec3 base;
    const int STEPS = 40;
    float sdAt(vec2 q) { return (texture2D(tex, q).b - .5) * 2. * range; }
    void main() {
      vec4 s = texture2D(tex, uv);
      float d = (s.b - .5) * 2. * range;
      float faceCov = clamp(d + .5, 0., 1.);
      vec3 L = normalize(vec3(-.5, -.62, .6)); // upper left, in front (screen y points down)

      // Side wall: the letters stepped back along dir; keep the nearest (shallowest) hit.
      float wallCov = 0.; float wallT = 1.; vec2 wallN = vec2(0.);
      for (int i = 1; i <= STEPS; i++) {
        float t = float(i) / float(STEPS);
        vec2 q = uv - dir * depth * t * px;
        vec4 sq = texture2D(tex, q);
        float c = clamp((sq.b - .5) * 2. * range + .5, 0., 1.);
        if (c > wallCov) { if (wallCov < .5 && c >= .5) { wallT = t; wallN = sq.rg * 2. - 1.; } wallCov = c; }
      }
      // wall: a darker, denser version of the candy, deepening toward its far edge, lit by its edge normal
      float wl = .62 + .38 * dot(normalize(wallN + vec2(1e-4)), normalize(-L.xy));
      vec3 wall = pow(base, vec3(1.9)) * (.62 - .28 * wallT) * (.8 + .3 * wl);
      // light through the candy at the wall's lower lip
      wall += pow(base, vec3(1.25)) * .16 * smoothstep(.55, 1., wallT);

      vec3 n = vec3(s.rg * 2. - 1., 0.); n.z = sqrt(max(0., 1. - dot(n.xy, n.xy)));
      float thick = s.a;
      // gelatin: thin = lighter / more luminous, thick = deeper
      vec3 body = pow(base, vec3(.5 + .72 * thick));
      float diff = .7 + .34 * dot(n, L);
      vec3 col = body * diff;
      // light passing through and out of the lower edges
      col += pow(base, vec3(.7)) * .22 * (1. - thick) * smoothstep(-.1, .7, n.y);
      // gloss: a crisp highlight and a broad soft sheen, plus a little fresnel at the rims
      vec3 H = normalize(L + vec3(0., 0., 1.));
      float nh = max(dot(n, H), 0.);
      col += vec3(1.) * (pow(nh, 110.) * 1.1 + pow(nh, 14.) * .1);
      col += mix(base, vec3(1.), .6) * pow(1. - n.z, 3.) * .14;
      // thin darker silhouette line so the face edge holds on a light background
      float edge = 1. - smoothstep(.0, 1.6, d);
      col = mix(col, pow(base, vec3(2.1)) * .5, edge * .7 * faceCov);

      vec3 prem = col * faceCov + wall * wallCov * (1. - faceCov);
      float alpha = faceCov + wallCov * (1. - faceCov);
      vec3 rgb = alpha > 0. ? prem / alpha : vec3(0.);
      rgb = pow(clamp(rgb, 0., 1.), vec3(1. / 2.2));
      gl_FragColor = vec4(rgb * alpha, alpha);
    }`;

  let gl = null; let prog = null; let texture = null; let uni = {};
  let cur = null; let target = null; let tween = 0; let size = null;
  const readColor = () => {
    const cs = getComputedStyle(section);
    const hex = cs.getPropertyValue('--title-accent').trim() || cs.getPropertyValue('--title-rest').trim();
    return linToLab(labToLin(lift(hexToLin(hex) || [0.58, 0.57, 0.52])));
  };

  function draw() {
    if (!gl || !size) return;
    const lin = labToLin(cur).map((v) => Math.min(1, Math.max(0, v)));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3f(uni.base, lin[0], lin[1], lin[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function setColor(immediate) {
    target = readColor();
    if (!cur || immediate || reduceMotion.matches) { cur = target; cancelAnimationFrame(tween); draw(); return; }
    const from = cur.slice();
    const start = performance.now();
    cancelAnimationFrame(tween);
    const step = (now) => {
      const t = Math.min(1, (now - start) / 300);
      const e = 1 - (1 - t) ** 3;
      cur = from.map((v, i) => v + (target[i] - v) * e);
      draw();
      if (t < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  }

  function layout() {
    const text = holder.querySelector('.gumi-title__text');
    const cs = getComputedStyle(text);
    const fontPx = parseFloat(cs.fontSize);
    const spacing = parseFloat(cs.letterSpacing) || 0;
    const box = text.getBoundingClientRect();
    const hbox = holder.getBoundingClientRect();
    if (!box.width || !fontPx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const depth = fontPx * 0.11; // extrusion length, CSS px
    const m = Math.ceil(depth + 4);
    const cssW = Math.ceil(box.width + 2 * m); const cssH = Math.ceil(box.height + 2 * m);
    canvas.style.left = `${box.left - hbox.left - m}px`;
    canvas.style.top = `${box.top - hbox.top - m}px`;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const w = Math.round(cssW * dpr); const h = Math.round(cssH * dpr);
    // Baseline inside the text's line box, per the CSS half-leading model.
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${fontPx}px ${FONT}`;
    const mt = ctx.measureText(WORD);
    const lineH = box.height;
    const asc = mt.fontBoundingBoxAscent; const desc = mt.fontBoundingBoxDescent;
    const baseY = (m + (lineH - (asc + desc)) / 2 + asc) * dpr;
    const built = build(w, h, fontPx * dpr, w / 2, baseY, spacing * dpr);
    canvas.width = w; canvas.height = h;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, built.data);
    gl.uniform2f(uni.px, 1 / w, 1 / h);
    gl.uniform1f(uni.range, built.range);
    gl.uniform1f(uni.depth, depth * dpr);
    size = [w, h];
    draw();
  }

  function fail() {
    section.classList.remove('is-gl');
    gl = null;
  }

  function init() {
    gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const sh = (type, src) => {
      const o = gl.createShader(type);
      gl.shaderSource(o, src); gl.compileShader(o);
      return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT); const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return fail();
    prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (const k of ['tex', 'px', 'range', 'dir', 'depth', 'base']) uni[k] = gl.getUniformLocation(prog, k);
    gl.uniform1i(uni.tex, 0);
    const dir = [0.34, 1]; const len = Math.hypot(...dir);
    gl.uniform2f(uni.dir, dir[0] / len, dir[1] / len);

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail(); });

    cur = readColor();
    layout();
    if (!gl) return;
    section.classList.add('is-gl');
    // Follow the hover colour: setActive() writes --title-accent into #gumizoo's inline style.
    new MutationObserver(() => setColor(false)).observe(section, { attributes: true, attributeFilter: ['style'] });
    let t = 0;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => gl && layout(), 120); }).observe(holder);
  }

  // Build only when the section is near the viewport, and only once the display face has actually loaded.
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    // load() resolves with the faces it actually loaded: an empty list means the face never arrived (and
    // fonts.check() would still say true, since no face matches at all), so the canvas would draw a system font.
    document.fonts.load(`100px ${FONT}`, WORD).then((faces) => { if (faces.length) init(); }, () => {});
  }, { rootMargin: '600px 0px' });
  io.observe(section);
})();
