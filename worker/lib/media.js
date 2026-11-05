import { fail } from './util';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4' };

// Stores an uploaded file in R2 under a random key and returns the key. SVG is refused: it can carry scripts.
export async function saveUpload(c, file, { allowVideo = false, maxMb = 5 } = {}) {
  if (!file || typeof file === 'string') fail(400, 'Bạn chưa chọn tệp.');
  const ext = TYPES[file.type];
  if (!ext || (ext === 'mp4' && !allowVideo)) {
    fail(415, allowVideo ? 'Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc video MP4.' : 'Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF.');
  }
  if (file.size > maxMb * 1024 * 1024) fail(413, `Tệp lớn quá, tối đa ${maxMb} MB.`);
  const key = `uploads/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  // R2 needs the length up front, which an arrayBuffer gives and a raw stream does not.
  await c.env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return key;
}

export const deleteUpload = (c, key) => (key ? c.env.MEDIA.delete(key) : Promise.resolve());
