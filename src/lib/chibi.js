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

export const chibi = (overrides) => ({ ...CHIBI_DEFAULTS, ...overrides });

export const formatPrice = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
