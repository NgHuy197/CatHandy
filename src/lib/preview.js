// Saves what a preview box shows (its background colour plus every chibi SVG layer and layer image) as a PNG.
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function downloadPreview(el, filename, background = '#ffffff') {
  const box = el.getBoundingClientRect();
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(box.width * scale);
  canvas.height = Math.round(box.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, box.width, box.height);

  // Layers paint in document order, the same order the browser stacks them.
  for (const node of el.querySelectorAll('svg, img')) {
    const r = node.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let src = node.currentSrc || node.src;
    if (node.tagName.toLowerCase() === 'svg') {
      const copy = node.cloneNode(true);
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      copy.setAttribute('width', r.width);
      copy.setAttribute('height', r.height);
      src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
    }
    try {
      ctx.drawImage(await loadImage(src), r.left - box.left, r.top - box.top, r.width, r.height);
    } catch {
      // A layer that fails to load is left out rather than failing the whole download.
    }
  }

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
}
