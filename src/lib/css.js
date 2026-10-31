// Turns a computed "a:b;c:d" style string into a React style object.
export default function css(text) {
  const style = {};
  for (const decl of (text || '').split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const key = decl
      .slice(0, i)
      .trim()
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[key] = decl.slice(i + 1).trim();
  }
  return style;
}
