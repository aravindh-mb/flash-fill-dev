import { create_ui } from './ui/flash_ui';
import { use_flash_fill } from './hooks/use_flash_fill';
import { scan_form_fields } from './core/dom_scanner';
import { fill_fields } from './core/autofill_engine';

export { use_flash_fill, scan_form_fields, fill_fields };

const is_dev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true;

/**
 * Initializes Flash Fill manualy.
 * Usually not needed if imported directly.
 */
export function init_flash_fill() {
    if (typeof window === 'undefined') return;

    // Production environmental check
    if (!is_dev) {
        console.log('[Flash Fill] Disabled in production mode.');
        return;
    }

    create_ui();
}

// Auto-run on import in development
if (typeof window !== 'undefined' && is_dev) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init_flash_fill);
    } else {
        init_flash_fill();
    }
}
