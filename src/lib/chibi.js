import { CHIBI_DEFAULTS } from '../../shared/customizer';

export { CHIBI_DEFAULTS };
export { formatPrice } from '../../shared/format';

export const chibi = (overrides) => ({ ...CHIBI_DEFAULTS, ...overrides });
