export type HsbColor = { hue: number; saturation: number; brightness: number };

export function hexToHsb(hex: string): HsbColor {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  const saturation = max === 0 ? 0 : delta / max;
  const brightness = max;

  return { hue, saturation, brightness };
}

export function hsbToHex({ hue, saturation, brightness }: HsbColor): string {
  const h = hue / 60;
  const i = Math.floor(h);
  const f = h - i;
  const p = brightness * (1 - saturation);
  const q = brightness * (1 - saturation * f);
  const t = brightness * (1 - saturation * (1 - f));

  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0: [r, g, b] = [brightness, t, p]; break;
    case 1: [r, g, b] = [q, brightness, p]; break;
    case 2: [r, g, b] = [p, brightness, t]; break;
    case 3: [r, g, b] = [p, q, brightness]; break;
    case 4: [r, g, b] = [t, p, brightness]; break;
    default: [r, g, b] = [brightness, p, q]; break;
  }

  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
