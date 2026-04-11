/* ============================================================
   topo-separator.js — Procedural topographic line separators
   Energy-landscape inspired: uses 2D potential functions mixed
   with value noise for organic contour lines.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const separators = document.querySelectorAll('.separator-topo');
  if (!separators.length) return;

  // Simple seeded PRNG (mulberry32)
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Value noise with linear interpolation
  function makeNoise(seed) {
    const rng = mulberry32(seed);
    const SIZE = 64;
    const grid = Array.from({ length: SIZE * SIZE }, () => rng());

    function sample(x, y) {
      const xi = ((Math.floor(x) % SIZE) + SIZE) % SIZE;
      const yi = ((Math.floor(y) % SIZE) + SIZE) % SIZE;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);

      const x1 = (xi + 1) % SIZE;
      const y1 = (yi + 1) % SIZE;

      const v00 = grid[yi * SIZE + xi];
      const v10 = grid[yi * SIZE + x1];
      const v01 = grid[y1 * SIZE + xi];
      const v11 = grid[y1 * SIZE + x1];

      const sx = xf * xf * (3 - 2 * xf);
      const sy = yf * yf * (3 - 2 * yf);

      return v00 * (1 - sx) * (1 - sy) + v10 * sx * (1 - sy) +
             v01 * (1 - sx) * sy + v11 * sx * sy;
    }

    return function fbm(x, y) {
      return sample(x, y) * 0.6 +
             sample(x * 2, y * 2) * 0.25 +
             sample(x * 4, y * 4) * 0.15;
    };
  }

  // Energy landscape potentials
  const potentials = [
    // Double-well
    (x, y) => (x * x - 1) * (x * x - 1) + y * y,
    // Saddle
    (x, y) => x * x - y * y,
    // Mexican hat
    (x, y) => { const r2 = x * x + y * y; return (1 - r2) * Math.exp(-r2 / 2); },
    // Rosenbrock-like
    (x, y) => (1 - x) * (1 - x) + 2 * (y - x * x) * (y - x * x),
    // Simple bowl with asymmetry
    (x, y) => x * x + 1.5 * y * y + 0.5 * x * y,
  ];

  // Marching squares to extract iso-lines
  function marchingSquares(field, w, h, threshold) {
    const segments = [];

    function lerp(v1, v2, t) {
      if (Math.abs(v2 - v1) < 1e-10) return 0.5;
      return (t - v1) / (v2 - v1);
    }

    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const v00 = field[y * w + x];
        const v10 = field[y * w + x + 1];
        const v01 = field[(y + 1) * w + x];
        const v11 = field[(y + 1) * w + x + 1];

        let idx = 0;
        if (v00 >= threshold) idx |= 1;
        if (v10 >= threshold) idx |= 2;
        if (v11 >= threshold) idx |= 4;
        if (v01 >= threshold) idx |= 8;

        if (idx === 0 || idx === 15) continue;

        // Interpolation points on edges
        const top    = { x: x + lerp(v00, v10, threshold), y: y };
        const right  = { x: x + 1, y: y + lerp(v10, v11, threshold) };
        const bottom = { x: x + lerp(v01, v11, threshold), y: y + 1 };
        const left   = { x: x, y: y + lerp(v00, v01, threshold) };

        const cases = {
          1:  [[left, top]],
          2:  [[top, right]],
          3:  [[left, right]],
          4:  [[right, bottom]],
          5:  [[left, top], [right, bottom]],
          6:  [[top, bottom]],
          7:  [[left, bottom]],
          8:  [[bottom, left]],
          9:  [[top, bottom]],
          10: [[top, right], [bottom, left]],
          11: [[top, right]],  // actually [right, bottom] complement
          12: [[right, left]],
          13: [[top, right]],
          14: [[top, left]],
        };

        // Simplified: just use the lookup
        const segs = cases[idx];
        if (segs) segments.push(...segs);
      }
    }

    return segments;
  }

  separators.forEach((el, index) => {
    const seed = Date.now() + index * 12345;
    const rng = mulberry32(seed + 999);
    const noise = makeNoise(seed);

    // Pick a potential function
    const potential = potentials[index % potentials.length];

    // Pick two accent colors for gradient
    const colors = [...ACCENT_COLORS];
    const c1 = colors.splice(Math.floor(rng() * colors.length), 1)[0];
    const c2 = colors[Math.floor(rng() * colors.length)];

    const W = 200;
    const H = 40;
    const field = new Float32Array(W * H);

    // Build scalar field: mix potential + noise
    let minV = Infinity, maxV = -Infinity;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // Map to potential domain ~ [-2, 2]
        const px = (x / W) * 4 - 2;
        const py = (y / H) * 4 - 2;
        const pot = potential(px, py);
        const n = noise(x * 0.08, y * 0.15);
        const v = pot * 0.3 + n;
        field[y * W + x] = v;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
    }

    // Extract iso-lines at several levels
    const levels = 7;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    // Gradient definition
    const defs = document.createElementNS(svgNS, 'defs');
    const gradId = 'topo-grad-' + index;
    const grad = document.createElementNS(svgNS, 'linearGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0%');
    grad.setAttribute('x2', '100%');
    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', c1);
    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', c2);
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    for (let i = 1; i <= levels; i++) {
      const t = minV + (maxV - minV) * (i / (levels + 1));
      const segments = marchingSquares(field, W, H, t);

      if (segments.length === 0) continue;

      // Build path from segments
      let d = '';
      for (const [a, b] of segments) {
        d += `M${a.x.toFixed(2)},${a.y.toFixed(2)}L${b.x.toFixed(2)},${b.y.toFixed(2)}`;
      }

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', `url(#${gradId})`);
      path.setAttribute('stroke-width', '0.3');
      path.setAttribute('opacity', (0.25 + (i / levels) * 0.3).toFixed(2));
      svg.appendChild(path);
    }

    el.appendChild(svg);
  });
});
