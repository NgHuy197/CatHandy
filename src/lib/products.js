import { chibi } from './chibi';

// A product from the API in the shape the product cards and filters use.
export const toCard = (p) => ({
  ...p,
  cat: p.category,
  mat: p.material,
  a: chibi(p.chibiA),
  b: p.chibiB ? chibi(p.chibiB) : null,
  hasVariants: !!(p.variants?.colors?.length || p.variants?.sizes?.length),
  // Sizes change the price; cards show the cheapest one.
  fromPrice: p.variants?.sizes?.length ? Math.min(...p.variants.sizes.map((s) => s.price)) : p.price,
});

export const CATEGORY_LABELS = {
  go: 'Hộp gỗ chibi',
  mica: 'Hộp mica chibi',
  cuoi: 'Quà cưới cao cấp',
  nam: 'Quà tặng cho nam',
  phukien: 'Phụ kiện quà tặng',
};
