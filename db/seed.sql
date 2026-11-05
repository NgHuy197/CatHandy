-- Starting data from the design: catalog, customizer options and prices, suggested presets.
-- Safe to run again: rows that already exist are left as the admin edited them.

INSERT OR IGNORE INTO products (slug, title, sub, category, material, price, ready, wash, description, variants, box_code, chibi_a, chibi_b) VALUES
  ('cap-doi-ao-dai', 'Cặp đôi áo dài', 'Hộp gỗ chibi, 2 nhân vật', 'go', 'Gỗ', 389000, 1, '#fddede',
    'Hộp gỗ chibi với hai nhân vật mặc áo dài. Làm thủ công, shop gửi ảnh để bạn duyệt trước khi giao.',
    '{"colors":[{"value":"#c9484f","label":"Đỏ"},{"value":"#fd9999","label":"Hồng"},{"value":"#9ccbee","label":"Xanh nhạt"},{"value":"#fffaf0","label":"Kem"}],"sizes":[{"code":"s","label":"Nhỏ","price":349000},{"code":"m","label":"Vừa","price":389000}]}',
    'wood', '{"hair":"long","outfitColor":"#c9484f"}', '{"skin":"#e8b896","outfitColor":"#34405a","face":"wink"}'),
  ('chibi-vest-xanh', 'Chibi vest xanh', 'Hộp mica chibi, 1 nhân vật', 'nam', 'Mica', 289000, 1, '#d6ebfa',
    'Nhân vật vest xanh navy đeo kính trong hộp mica trong suốt, hợp làm quà cho bạn nam.',
    NULL, 'mica', '{"skin":"#e8b896","outfit":"vest","outfitColor":"#34405a","glasses":true}', NULL),
  ('be-hoa-tang-me', 'Bé hoa tặng mẹ', 'Hộp gỗ chibi, 1 nhân vật', 'go', 'Gỗ', 259000, 1, '#e8e0f8',
    'Bé búi tóc ôm bó hoa trong hộp gỗ, món quà nhỏ cho mẹ dịp 8/3, 20/10 hay sinh nhật.',
    NULL, 'wood', '{"hair":"bun","outfit":"shirt","outfitColor":"#cbbdf0","accessory":"bouquet"}', NULL),
  ('bo-co-dau-chu-re-mini', 'Bộ cô dâu chú rể mini', 'Quà cưới, 2 nhân vật', 'cuoi', 'Gỗ', 549000, 1, '#fbeab4',
    'Cô dâu váy trắng và chú rể vest đen, làm sẵn để kịp tặng ngày cưới.',
    NULL, 'wedding', '{"hair":"long","outfit":"wedding","outfitColor":"#fffaf0"}', '{"outfit":"vest","outfitColor":"#3b2f3e"}'),
  ('chibi-mica-ao-dai', 'Chibi mica áo dài', 'Hộp mica chibi, 1 nhân vật', 'mica', 'Mica', 329000, 0, '#d3efe9',
    'Nhân vật tóc bob mặc áo dài xanh nhạt, cài nơ, đặt trong hộp mica. Làm theo đơn.',
    NULL, 'mica', '{"hair":"bob","outfitColor":"#9ccbee","accessory":"bow"}', NULL),
  ('cap-doi-mica-trong', 'Cặp đôi mica trong', 'Hộp mica chibi, 2 nhân vật', 'mica', 'Mica', 449000, 0, '#d6ebfa',
    'Cặp đôi áo sơ mi trong hộp mica trong, nhìn rõ từng chi tiết. Làm theo đơn.',
    NULL, 'mica', '{"hair":"long","outfit":"shirt","outfitColor":"#fd9999"}', '{"skin":"#fde3d0","outfit":"shirt","outfitColor":"#9fd6c4","glasses":true}'),
  ('bo-qua-cuoi-cao-cap', 'Bộ quà cưới cao cấp', 'Hộp quà cưới, 2 nhân vật', 'cuoi', 'Gỗ', 689000, 0, '#fddede',
    'Bộ quà cưới với cô dâu cầm hoa và chú rể vest navy, hộp quà cao cấp. Làm theo đơn.',
    NULL, 'wedding', '{"hair":"bun","outfit":"wedding","outfitColor":"#fffaf0","accessory":"bouquet"}', '{"outfit":"vest","outfitColor":"#34405a"}'),
  ('chibi-rau-kinh', 'Chibi râu kính', 'Hộp gỗ chibi, 1 nhân vật', 'nam', 'Gỗ', 299000, 0, '#e8e0f8',
    'Nhân vật có râu, đeo kính, cười tươi, hợp tặng bố hoặc bạn nam. Làm theo đơn.',
    NULL, 'wood', '{"skin":"#c58c63","outfit":"shirt","outfitColor":"#f2d27a","beard":true,"glasses":true,"face":"laugh"}', NULL),
  ('hoa-cai-toc-chibi', 'Hoa cài tóc chibi', 'Phụ kiện quà tặng', 'phukien', 'Khác', 59000, 1, '#fbeab4',
    'Hoa cài tóc làm tay, tặng kèm hoặc mua riêng.',
    NULL, NULL, '{"hair":"long","hairColor":"#5a3a2a","outfit":"shirt","accessory":"flower"}', NULL);

INSERT OR IGNORE INTO options (grp, code, label, color, price, boxes, sort, description, wash) VALUES
  ('box', 'wood', 'Hộp gỗ chibi', NULL, 289000, NULL, 1, 'Hộp gỗ, nét mộc và ấm.', '#fbeab4'),
  ('box', 'mica', 'Hộp mica chibi', NULL, 349000, NULL, 2, 'Hộp mica trong, nhìn rõ nhân vật.', '#d6ebfa'),
  ('box', 'wedding', 'Bộ quà cưới', NULL, 489000, NULL, 3, 'Bộ quà dành cho ngày cưới.', '#fddede');

INSERT OR IGNORE INTO options (grp, code, label, color, price, boxes, sort) VALUES
  ('skin', '#fde3d0', 'Sáng', '#fde3d0', 0, NULL, 1),
  ('skin', '#f7d9c4', 'Be', '#f7d9c4', 0, NULL, 2),
  ('skin', '#e8b896', 'Nâu sáng', '#e8b896', 0, NULL, 3),
  ('skin', '#c58c63', 'Nâu', '#c58c63', 0, NULL, 4),
  ('hair', 'short', 'Tóc ngắn', NULL, 0, NULL, 1),
  ('hair', 'long', 'Tóc dài', NULL, 0, NULL, 2),
  ('hair', 'bob', 'Tóc bob', NULL, 0, NULL, 3),
  ('hair', 'bun', 'Búi cao', NULL, 0, NULL, 4),
  ('hairColor', '#2f2430', 'Đen', '#2f2430', 0, NULL, 1),
  ('hairColor', '#5a3a2a', 'Nâu', '#5a3a2a', 0, NULL, 2),
  ('hairColor', '#d9b06a', 'Vàng', '#d9b06a', 0, NULL, 3),
  ('hairColor', '#e88fa0', 'Hồng', '#e88fa0', 0, NULL, 4),
  ('hairColor', '#8a8290', 'Xám tro', '#8a8290', 0, NULL, 5),
  ('face', 'smile', 'Cười nhẹ', NULL, 0, NULL, 1),
  ('face', 'laugh', 'Cười tươi', NULL, 0, NULL, 2),
  ('face', 'wink', 'Nháy mắt', NULL, 0, NULL, 3),
  ('face', 'calm', 'Điềm đạm', NULL, 0, NULL, 4),
  ('gl', 'glasses', 'Kính tròn', NULL, 10000, NULL, 1),
  ('gl', 'beard', 'Râu', NULL, 10000, NULL, 2),
  ('outfit', 'shirt', 'Áo sơ mi', NULL, 0, NULL, 1),
  ('outfit', 'aodai', 'Áo dài', NULL, 20000, NULL, 2),
  ('outfit', 'vest', 'Vest', NULL, 20000, NULL, 3),
  ('outfit', 'wedding', 'Váy cưới', NULL, 30000, '["wedding"]', 4),
  ('outfitColor', '#fd9999', 'Hồng', '#fd9999', 0, NULL, 1),
  ('outfitColor', '#c9484f', 'Đỏ', '#c9484f', 0, NULL, 2),
  ('outfitColor', '#fffaf0', 'Kem', '#fffaf0', 0, NULL, 3),
  ('outfitColor', '#cbbdf0', 'Tím nhạt', '#cbbdf0', 0, NULL, 4),
  ('outfitColor', '#9ccbee', 'Xanh nhạt', '#9ccbee', 0, NULL, 5),
  ('outfitColor', '#34405a', 'Xanh navy', '#34405a', 0, NULL, 6),
  ('outfitColor', '#3b2f3e', 'Đen', '#3b2f3e', 0, NULL, 7),
  ('outfitColor', '#f2d27a', 'Vàng bơ', '#f2d27a', 0, NULL, 8),
  ('outfitColor', '#9fd6c4', 'Bạc hà', '#9fd6c4', 0, NULL, 9),
  ('acc', 'bouquet', 'Bó hoa', NULL, 25000, NULL, 1),
  ('acc', 'bow', 'Nơ cổ', NULL, 10000, NULL, 2),
  ('acc', 'flower', 'Hoa cài tóc', NULL, 10000, NULL, 3);

INSERT OR IGNORE INTO settings (key, value) VALUES ('secondCharacterPrice', '120000');

INSERT INTO presets (name, box, count, chars, sort)
SELECT * FROM (VALUES
  ('Cặp đôi áo dài đỏ', 'wood', 2,
    '[{"hair":"long","outfitColor":"#c9484f","accessory":"bouquet"},{"skin":"#e8b896","hair":"short","outfit":"vest","outfitColor":"#34405a","face":"wink"}]', 1),
  ('Cô dâu và chú rể', 'wedding', 2,
    '[{"hair":"bun","outfit":"wedding","outfitColor":"#fffaf0","accessory":"bouquet"},{"outfit":"vest","outfitColor":"#3b2f3e"}]', 2),
  ('Quà sinh nhật bạn thân', 'mica', 1,
    '[{"hair":"bob","hairColor":"#5a3a2a","outfit":"shirt","outfitColor":"#9fd6c4","face":"laugh","glasses":true}]', 3),
  ('Quà tặng cho nam', 'wood', 1,
    '[{"skin":"#e8b896","outfit":"vest","outfitColor":"#34405a","beard":true,"glasses":true,"face":"calm"}]', 4)
)
WHERE NOT EXISTS (SELECT 1 FROM presets);
