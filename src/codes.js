// Geradores de código de barras (Code 128-B) e QR Code (byte, ECC M) — sem dependências.
(function (global) {
  'use strict';

  // ================= CODE 128 (B) =================
  const C128 = ['212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];

  function code128Modules(text) {
    const vals = [104];
    for (const ch of String(text)) {
      const c = ch.charCodeAt(0);
      vals.push(c >= 32 && c <= 126 ? c - 32 : 0);
    }
    let sum = vals[0];
    for (let i = 1; i < vals.length; i++) sum += vals[i] * i;
    vals.push(sum % 103);
    let pattern = vals.map(v => C128[v]).join('') + C128[106];
    const bars = []; // [isBar, width]
    for (let i = 0; i < pattern.length; i++) bars.push([i % 2 === 0, +pattern[i]]);
    return bars;
  }

  function code128SVG(text, { height = 50, module = 2, quiet = 10 } = {}) {
    const bars = code128Modules(text);
    const total = bars.reduce((a, b) => a + b[1], 0) + quiet * 2;
    let x = quiet, rects = '';
    for (const [isBar, w] of bars) {
      if (isBar) rects += `<rect x="${x}" y="0" width="${w}" height="${height}"/>`;
      x += w;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${height}" width="${total * module}" height="${height}" preserveAspectRatio="none" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
  }

  // ================= QR CODE =================
  const ECC_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  const BLK_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];

  const getBit = (x, i) => ((x >>> i) & 1) !== 0;
  function rawModules(v) {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  const dataCodewords = v => Math.floor(rawModules(v) / 8) - ECC_M[v] * BLK_M[v];

  function gfMul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function rsDivisor(deg) {
    const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1;
    for (let i = 0; i < deg; i++) {
      for (let j = 0; j < r.length; j++) { r[j] = gfMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gfMul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, div) {
    const r = div.map(() => 0);
    for (const b of data) {
      const f = b ^ r.shift(); r.push(0);
      div.forEach((c, i) => { r[i] ^= gfMul(c, f); });
    }
    return r;
  }

  function qrMatrix(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));
    let ver = 1;
    for (; ver <= 20; ver++) {
      const ccBits = ver <= 9 ? 8 : 16;
      if (4 + ccBits + bytes.length * 8 <= dataCodewords(ver) * 8) break;
    }
    if (ver > 20) throw new Error('Texto longo demais para QR');
    const cap = dataCodewords(ver) * 8;
    const bits = [];
    const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

    // ECC + intercalação
    const nb = BLK_M[ver], eccLen = ECC_M[ver], raw = Math.floor(rawModules(ver) / 8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    const div = rsDivisor(eccLen), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1)); k += dat.length;
      const ecc = rsRemainder(dat, div);
      if (i < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++)
      blocks.forEach((b, j) => { if (i !== shortLen - eccLen || j >= nShort) all.push(b[i]); });

    // Matriz
    const size = ver * 4 + 17;
    const M = Array.from({ length: size }, () => new Array(size).fill(false));
    const F = Array.from({ length: size }, () => new Array(size).fill(false));
    const setF = (x, y, d) => { M[y][x] = d; F[y][x] = true; };

    for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    const finder = (x, y) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (ver > 1) {
      const n = Math.floor(ver / 7) + 2;
      const step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
      const pos = [6];
      for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
          setF(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
    const drawFormat = mask => {
      const d = (0 << 3) | mask; // ECC M = 00
      let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412;
      for (let i = 0; i <= 5; i++) setF(8, i, getBit(b, i));
      setF(8, 7, getBit(b, 6)); setF(8, 8, getBit(b, 7)); setF(7, 8, getBit(b, 8));
      for (let i = 9; i < 15; i++) setF(14 - i, 8, getBit(b, i));
      for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, getBit(b, i));
      for (let i = 8; i < 15; i++) setF(8, size - 15 + i, getBit(b, i));
      setF(8, size - 8, true);
    };
    drawFormat(0);
    if (ver >= 7) {
      let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const bit = getBit(b, i), a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, bit); setF(c, a, bit); }
    }
    // dados
    let bi = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v;
        if (!F[y][x] && bi < all.length * 8) { M[y][x] = getBit(all[bi >>> 3], 7 - (bi & 7)); bi++; }
      }
    }
    const maskFn = [
      (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
    ];
    const applyMask = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && maskFn[m](x, y)) M[y][x] = !M[y][x]; };
    const penalty = () => {
      let p = 0, dark = 0;
      for (let y = 0; y < size; y++) {
        let rx = 1, ry = 1;
        for (let x = 0; x < size; x++) {
          if (M[y][x]) dark++;
          if (x > 0) {
            if (M[y][x] === M[y][x - 1]) { rx++; if (rx === 5) p += 3; else if (rx > 5) p++; } else rx = 1;
            if (M[x][y] === M[x - 1][y]) { ry++; if (ry === 5) p += 3; else if (ry > 5) p++; } else ry = 1;
          }
          if (x > 0 && y > 0) { const c = M[y][x]; if (c === M[y][x - 1] && c === M[y - 1][x] && c === M[y - 1][x - 1]) p += 3; }
        }
      }
      const total = size * size;
      p += Math.ceil(Math.abs(dark * 20 - total * 10) / total - 1) * 10;
      return p;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) {
      applyMask(m); drawFormat(m);
      const p = penalty(); if (p < bestP) { bestP = p; best = m; }
      applyMask(m);
    }
    applyMask(best); drawFormat(best);
    return M;
  }

  function qrSVG(text, { size = 120, border = 2 } = {}) {
    const M = qrMatrix(text), n = M.length, dim = n + border * 2;
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (M[y][x]) d += `M${x + border},${y + border}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }

  global.Codes = { code128SVG, qrSVG, qrMatrix };
})(typeof window !== 'undefined' ? window : globalThis);
