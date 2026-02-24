import { scan_form_fields } from '../core/dom_scanner';
import { fill_fields } from '../core/autofill_engine';
import { get_config, save_config } from '../utils/storage';

export function create_ui() {
    if (document.getElementById('flash-fill-button')) return;

    const btn = document.createElement('div');
    btn.id = 'flash-fill-button';
    btn.innerHTML = '⚡';
    apply_styles(btn, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        zIndex: '99999',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1) rotate(5deg)';
        btn.style.backgroundColor = '#4f46e5';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1) rotate(0deg)';
        btn.style.backgroundColor = '#6366f1';
    });

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        handle_single_click();
    });

    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggle_panel();
    });

    // Long press support
    let timer: any;
    btn.addEventListener('mousedown', () => {
        timer = setTimeout(toggle_panel, 600);
    });
    btn.addEventListener('mouseup', () => clearTimeout(timer));

    document.body.appendChild(btn);

    // Keyboard shortcut: Ctrl + Shift + F
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            handle_single_click();
        }
    });
}

function handle_single_click() {
    const fields = scan_form_fields();
    fill_fields(fields);

    const btn = document.getElementById('flash-fill-button');
    if (btn) {
        btn.innerHTML = '✅';
        setTimeout(() => { btn.innerHTML = '⚡'; }, 1000);
    }
}

function toggle_panel() {
    let panel = document.getElementById('flash-fill-panel');
    if (panel) {
        panel.remove();
    } else {
        show_panel();
    }
}

function show_panel() {
    const fields = scan_form_fields();
    const panel = document.createElement('div');
    panel.id = 'flash-fill-panel';
    apply_styles(panel, {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '320px',
        maxHeight: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        border: '1px solid #e5e7eb',
        zIndex: '99998',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '16px'
    });

    const title = document.createElement('h3');
    title.innerText = 'Flash Fill Details';
    title.style.margin = '0 0 12px 0';
    title.style.fontSize = '16px';
    panel.appendChild(title);

    fields.forEach(field => {
        const row = document.createElement('div');
        row.style.marginBottom = '8px';

        const label = document.createElement('label');
        label.innerText = field.key;
        label.style.display = 'block';
        label.style.fontSize = '12px';
        label.style.color = '#6b7280';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = (field.element as HTMLInputElement).value;
        apply_styles(input, {
            width: '100%',
            padding: '4px 8px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '2px'
        });

        input.addEventListener('input', (e) => {
            const val = (e.target as HTMLInputElement).value;
            (field.element as HTMLInputElement).value = val;
            field.element.dispatchEvent(new Event('input', { bubbles: true }));
        });

        row.appendChild(label);
        row.appendChild(input);
        panel.appendChild(row);
    });

    const refill_btn = document.createElement('button');
    refill_btn.innerText = 'Refill with Random Data';
    apply_styles(refill_btn, {
        width: '100%',
        padding: '8px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        marginTop: '12px',
        cursor: 'pointer',
        fontWeight: 'bold'
    });

    refill_btn.onclick = () => {
        fill_fields(fields);
        panel.remove();
        show_panel();
    };

    panel.appendChild(refill_btn);
    document.body.appendChild(panel);
}

function apply_styles(el: HTMLElement, styles: Record<string, string>) {
    Object.assign(el.style, styles);
}
