// Customizer rules shared by the browser (live price while choosing) and the Worker (the price an order is saved with).
//
// config = { boxes: [option], groups: { [grp]: [option] }, secondPrice }, as served by GET /api/customizer.
// option = { code, label, price, boxes, color, layerUrl, ... }; `boxes` limits it to some box codes, null means all.

export const CHIBI_DEFAULTS = {
  skin: '#f7d9c4',
  hairColor: '#2f2430',
  outfitColor: '#fd9999',
  hair: 'short',
  face: 'smile',
  outfit: 'aodai',
  accessory: 'none',
  glasses: false,
  beard: false,
};

// Character field -> option group. glasses and beard are on/off and live in group 'gl'.
export const CHAR_FIELDS = [
  ['skin', 'skin'],
  ['hair', 'hair'],
  ['hairColor', 'hairColor'],
  ['face', 'face'],
  ['outfit', 'outfit'],
  ['outfitColor', 'outfitColor'],
  ['accessory', 'acc'],
];
const TOGGLES = ['glasses', 'beard'];

export const OPTION_GROUPS = [
  ['box', 'Loại hộp'],
  ['skin', 'Tông da'],
  ['hair', 'Kiểu tóc'],
  ['hairColor', 'Màu tóc'],
  ['face', 'Biểu cảm'],
  ['gl', 'Kính và râu'],
  ['outfit', 'Trang phục'],
  ['outfitColor', 'Màu trang phục'],
  ['acc', 'Phụ kiện'],
];

// Layer images stack bottom to top in this order over the built-in drawing.
const LAYER_ORDER = ['skin', 'outfit', 'outfitColor', 'face', 'hair', 'hairColor', 'glasses', 'beard', 'accessory'];

export const allowedIn = (opt, box) => !opt.boxes || opt.boxes.includes(box);

export const findOption = (config, grp, code) =>
  (grp === 'box' ? config.boxes : config.groups[grp] || []).find((o) => o.code === code);

// Keeps only known fields, filling gaps with the defaults.
export function normalizeChar(raw) {
  const c = { ...CHIBI_DEFAULTS };
  for (const key of Object.keys(CHIBI_DEFAULTS)) {
    if (raw && raw[key] !== undefined) c[key] = TOGGLES.includes(key) ? raw[key] === true : String(raw[key]);
  }
  return c;
}

// Every option a character uses, as [field, option], in layer order. Missing or disallowed choices come back as null.
function chosen(config, box, c) {
  return LAYER_ORDER.flatMap((field) => {
    if (TOGGLES.includes(field)) return c[field] ? [[field, findOption(config, 'gl', field)]] : [];
    if (field === 'accessory' && c.accessory === 'none') return [];
    const grp = CHAR_FIELDS.find((f) => f[0] === field)[1];
    const opt = findOption(config, grp, c[field]);
    return [[field, opt && allowedIn(opt, box) ? opt : null]];
  });
}

export const layersFor = (config, box, c) =>
  chosen(config, box, c)
    .map(([, opt]) => opt?.layerUrl)
    .filter(Boolean);

const lower = (opt) => (opt ? opt.label.toLowerCase() : '?');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "Tóc dài đen, da be, cười nhẹ, kính tròn, áo dài đỏ, bó hoa"
export function describeChar(config, c) {
  const f = (grp, code) => findOption(config, grp, code);
  const parts = [
    lower(f('hair', c.hair)) + ' ' + lower(f('hairColor', c.hairColor)),
    'da ' + lower(f('skin', c.skin)),
    lower(f('face', c.face)),
    ...TOGGLES.filter((t) => c[t]).map((t) => lower(f('gl', t))),
    lower(f('outfit', c.outfit)) + ' ' + lower(f('outfitColor', c.outfitColor)),
  ];
  if (c.accessory !== 'none') parts.push(lower(f('acc', c.accessory)));
  return cap(parts.join(', '));
}

// Price and summary of a custom design { box, count, chars }.
// Returns { error } when the design uses a box or option that is no longer offered.
export function quoteDesign(config, design) {
  const box = findOption(config, 'box', design?.box);
  if (!box) return { error: 'Loại hộp này hiện không còn nhận làm.' };
  const count = Number(design.count) === 2 ? 2 : 1;
  const chars = [0, 1].slice(0, count).map((i) => normalizeChar(design.chars?.[i]));

  const lines = [{ label: box.label, price: box.price }];
  if (count === 2) lines.push({ label: 'Nhân vật thứ hai', price: config.secondPrice, extra: true });

  for (const [i, c] of chars.entries()) {
    const prefix = count === 2 ? 'Nhân vật ' + (i + 1) + ': ' : '';
    for (const [field, opt] of chosen(config, box.code, c)) {
      if (!opt) {
        const who = prefix ? prefix.slice(0, -2) : 'Thiết kế';
        return { error: `${who} có tùy chọn không còn dùng được cho ${box.label}.` };
      }
      if (opt.price) lines.push({ label: prefix + opt.label, price: opt.price, extra: true, field });
    }
  }

  return {
    box,
    count,
    chars,
    lines,
    total: lines.reduce((s, l) => s + l.price, 0),
    descriptions: chars.map((c, i) => (count === 2 ? 'Nhân vật ' + (i + 1) + ': ' : '') + describeChar(config, c)),
  };
}
