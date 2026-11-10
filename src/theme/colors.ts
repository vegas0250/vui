/** Portable, strict CSS color parsing. No CSS evaluation or DOM is required. */
export function normalizeColor(input: string): string {
  const value = input.trim().toLowerCase();
  if (/^#[\da-f]{3,4}$/.test(value))
    return '#' + [...value.slice(1)].map((c) => c + c).join('');
  if (/^#[\da-f]{6}([\da-f]{2})?$/.test(value)) return value;
  const match = /^(rgb|rgba|hsl|hsla)\(([^()]+)\)$/.exec(value);
  if (!match) throw new Error('Invalid color');
  const parts = match[2].trim().split(/[\s,/]+/);
  if (
    parts.length < 3 ||
    parts.length > 4 ||
    parts.some((p) => !/^-?(?:\d+\.?\d*|\.\d+)%?$/.test(p))
  )
    throw new Error('Invalid color');
  const bounded = (s: string, max: number) => {
    const n = Number(s.replace('%', ''));
    if (!Number.isFinite(n) || n < 0 || n > max)
      throw new Error('Invalid color');
    return n;
  };
  const alpha =
    parts[3] === undefined
      ? 1
      : bounded(parts[3], parts[3].endsWith('%') ? 100 : 1) /
        (parts[3].endsWith('%') ? 100 : 1);
  let rgb: number[];
  if (match[1].startsWith('rgb'))
    rgb = parts
      .slice(0, 3)
      .map((p) =>
        p.endsWith('%') ? (bounded(p, 100) / 100) * 255 : bounded(p, 255),
      );
  else {
    const h = Number(parts[0]);
    if (
      !Number.isFinite(h) ||
      parts[0].endsWith('%') ||
      !parts[1].endsWith('%') ||
      !parts[2].endsWith('%')
    )
      throw new Error('Invalid color');
    const s = bounded(parts[1], 100) / 100,
      l = bounded(parts[2], 100) / 100;
    const a = s * Math.min(l, 1 - l),
      hue = ((h % 360) + 360) % 360;
    rgb = [0, 8, 4].map((n) => {
      const k = (n + hue / 30) % 12;
      return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
    });
  }
  return (
    '#' +
    [...rgb, ...(alpha < 1 ? [alpha * 255] : [])]
      .map((n) => Math.round(n).toString(16).padStart(2, '0'))
      .join('')
  );
}
export function channels(value: string): [number, number, number] {
  const c = normalizeColor(value);
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}
export function mix(a: string, b: string, ratio: number): string {
  const x = channels(a),
    y = channels(b);
  return (
    '#' +
    x
      .map((c, i) =>
        Math.round(c * (1 - ratio) + y[i] * ratio)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
type RGB = [number,number,number];
const luminance=(rgb:RGB)=>rgb.reduce((sum,channel,index)=>{
 const value=channel/255;
 return sum+(value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4)*[0.2126,0.7152,0.0722][index];
},0);
// Theme derivation compares the same surfaces thousands of times. Cache only
// validated colors, with a fixed bound for long-running user theme sessions.
const contrastColors=new Map<string,{rgb:RGB;alpha:number;luminance:number}>();
function contrastColor(input:string){
 const cached=contrastColors.get(input);if(cached)return cached;
 const hex=normalizeColor(input),rgb=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)) as RGB;
 const value={rgb,alpha:hex.length===9?parseInt(hex.slice(7),16)/255:1,luminance:luminance(rgb)};
 if(contrastColors.size>=2048)contrastColors.clear();contrastColors.set(input,value);return value;
}
export function contrast(a:string,b:string):number{
 const top=contrastColor(a),bottom=contrastColor(b);
 let x:number,y:number;
 if(top.alpha===1&&bottom.alpha===1){x=top.luminance;y=bottom.luminance;}
 else{
  const bg=bottom.rgb.map(channel=>channel*bottom.alpha+255*(1-bottom.alpha)) as RGB;
  const fg=top.rgb.map((channel,index)=>channel*top.alpha+bg[index]*(1-top.alpha)) as RGB;
  x=luminance(fg);y=luminance(bg);
 }
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function readable(color: string, against: string, target = 4.5): string {
  if (contrast(color, against) >= target) return normalizeColor(color);
  const end =
    contrast('#000000', against) > contrast('#ffffff', against)
      ? '#000000'
      : '#ffffff';
  for (let i = 1; i <= 100; i++) {
    const next = mix(color, end, i / 100);
    if (contrast(next, against) >= target) return next;
  }
  return end;
}
export function colorFormats(value: string): {
  hex: string;
  rgb: string;
  hsl: string;
} {
  const hex = normalizeColor(value),
    rgb = channels(hex),
    [r, g, b] = rgb.map((n) => n / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2;
  const hue =
    d === 0
      ? 0
      : (max === r
          ? (g - b) / d + (g < b ? 6 : 0)
          : max === g
            ? (b - r) / d + 2
            : (r - g) / d + 4) * 60;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const alpha = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1;
  return {
    hex,
    rgb: `rgb(${rgb.join(' ')}${alpha < 1 ? ` / ${Math.round(alpha * 100)}%` : ''})`,
    hsl: `hsl(${Math.round(hue)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha < 1 ? ` / ${Math.round(alpha * 100)}%` : ''})`,
  };
}
