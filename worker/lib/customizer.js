import { eq } from 'drizzle-orm';
import { options, presets, settings } from '../../db/schema';
import { OPTION_GROUPS } from '../../shared/customizer';
import { mediaUrl } from '../../shared/format';

export const optionOut = (o) => ({ ...o, layerUrl: mediaUrl(o.layerKey) });

// Customizer config in the shape shared/customizer.js expects. Customers only see what is not hidden.
export async function loadConfig(db, { includeHidden = false } = {}) {
  const [rows, [second], presetRows] = await Promise.all([
    db.select().from(options).orderBy(options.sort, options.id),
    db.select().from(settings).where(eq(settings.key, 'secondCharacterPrice')),
    db.select().from(presets).orderBy(presets.sort, presets.id),
  ]);
  const shown = rows.filter((o) => includeHidden || !o.hidden).map(optionOut);
  const groups = {};
  for (const [grp] of OPTION_GROUPS) if (grp !== 'box') groups[grp] = shown.filter((o) => o.grp === grp);
  return {
    boxes: shown.filter((o) => o.grp === 'box'),
    groups,
    secondPrice: Number(second?.value ?? 0),
    presets: presetRows.filter((p) => includeHidden || !p.hidden),
  };
}
