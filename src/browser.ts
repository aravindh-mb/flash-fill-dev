// Browser-only entry point — no React, fully self-contained bundle
import { create_ui } from './ui/flash_ui';
import { scan_form_fields } from './core/dom_scanner';
import { fill_fields } from './core/autofill_engine';

export { scan_form_fields, fill_fields };

export function init_flash_fill() {
    if (typeof window === 'undefined') return;
    create_ui();
}

// Auto-run on import
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init_flash_fill);
    } else {
        init_flash_fill();
    }
}
