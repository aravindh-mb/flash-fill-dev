import { useEffect, useRef } from 'react';
import { scan_form_fields } from '../core/dom_scanner';
import { fill_fields } from '../core/autofill_engine';

export interface UseFlashFillOptions {
    auto_fill?: boolean;
}

export function use_flash_fill(options: UseFlashFillOptions = {}) {
    const has_auto_filled = useRef(false);

    useEffect(() => {
        const is_dev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true;
        if (!is_dev) return;

        if (options.auto_fill && !has_auto_filled.current) {
            const fields = scan_form_fields();
            fill_fields(fields);
            has_auto_filled.current = true;
        }
    }, [options.auto_fill]);

    const trigger_fill = () => {
        const fields = scan_form_fields();
        fill_fields(fields);
    };

    return { trigger_fill };
}
