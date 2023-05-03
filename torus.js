import { hsva } from "./hsva.js";

export const torus = (row, column, irad, orad) => {
  const pos = [];
  const nor = [];
  const col = [];
  const idx = [];
  for (let i = 0; i <= row; i++) {
    const r = Math.PI * 2 / row * i;
    const rr = Math.cos(r);
    const ry = Math.sin(r);
    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii;
      const tx = (rr * irad + orad) * Math.cos(tr);
      const ty = ry * irad;
      const tz = (rr * irad + orad) * Math.sin(tr);
      pos.push(tx, ty, tz);
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);
      nor.push(rx, ry, rz);
      const tc = hsva(360 / column * ii, 1, 1, 1);
      col.push(tc[0], tc[1], tc[2], tc[3]);
    }
  }
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < column; ii++) {
      const r = (column + 1) * i + ii;
      idx.push(r, r + column + 1, r + 1);
      idx.push(r + column + 1, r + column + 2, r + 1);
    }
  }
  return { position: pos, normal: nor, color: col, index: idx };
};
