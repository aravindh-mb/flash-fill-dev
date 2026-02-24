import { scan_form_fields } from '../core/dom_scanner';
import { fill_fields } from '../core/autofill_engine';
import { get_config, save_config } from '../utils/storage';

export function create_ui() {
    if (document.getElementById('flash-fill-button')) return;

    // Inject keyframe animations
    const style = document.createElement('style');
    style.id = 'flash-fill-styles';
    style.textContent = `
        @keyframes ff-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255, 200, 50, 0.6), 0 0 20px rgba(255, 180, 0, 0.4); }
            50%       { box-shadow: 0 0 0 12px rgba(255, 200, 50, 0), 0 0 40px rgba(255, 200, 0, 0.6); }
        }
        @keyframes ff-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes ff-float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-6px); }
        }
        @keyframes ff-ring-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes ff-overlay-in {
            from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
            to   { opacity: 1; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        }
        @keyframes ff-slide-up {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        #flash-fill-button {
            /* no idle animation – stays still */
        }
        @keyframes ff-hover-glow {
            0%, 100% { box-shadow: 0 0 12px rgba(255,215,0,0.5), 0 0 28px rgba(255,200,0,0.25); }
            50%       { box-shadow: 0 0 24px rgba(255,215,0,0.85), 0 0 48px rgba(255,200,0,0.45); }
        }
        #flash-fill-button:hover {
            animation: ff-hover-glow 1s ease-in-out infinite !important;
        }
        #flash-fill-button .ff-ring {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: #ffd700;
            border-right-color: #ffb700;
            pointer-events: none;
        }
        #flash-fill-button .ff-ring2 {
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            border: 1.5px solid transparent;
            border-bottom-color: rgba(255, 215, 0, 0.4);
            border-left-color: rgba(255, 180, 0, 0.2);
            pointer-events: none;
        }
        #flash-fill-button:hover .ff-ring {
            animation: ff-ring-spin 1.5s linear infinite;
        }
        #flash-fill-button:hover .ff-ring2 {
            animation: ff-ring-spin 2.5s linear infinite reverse;
        }
        #flash-fill-button .ff-label {
            position: absolute;
            bottom: -26px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #ffd700;
            text-shadow: 0 0 8px rgba(255,215,0,0.6);
            white-space: nowrap;
            pointer-events: none;
            font-family: system-ui, sans-serif;
        }
        #ff-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 99997;
            animation: ff-overlay-in 0.3s ease forwards;
        }
        #flash-fill-panel {
            animation: ff-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('div');
    btn.id = 'flash-fill-button';
    apply_styles(btn, {
        position: 'fixed',
        bottom: '36px',
        right: '28px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        webkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255, 215, 0, 0.5)',
        color: '#ffd700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        cursor: 'pointer',
        zIndex: '99999',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s',
        userSelect: 'none',
        boxSizing: 'border-box',
        filter: 'drop-shadow(0 0 12px rgba(255, 200, 0, 0.5))',
    });

    // Spinning rings
    const ring1 = document.createElement('div');
    ring1.className = 'ff-ring';
    const ring2 = document.createElement('div');
    ring2.className = 'ff-ring2';

    // Icon content — golden shimmer ⚡
    const icon = document.createElement('span');
    icon.textContent = '⚡';
    apply_styles(icon, {
        background: 'linear-gradient(90deg, #ffd700, #ffb700, #fff176, #ffd700)',
        backgroundSize: '200% auto',
        webkitBackgroundClip: 'text',
        webkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'ff-shimmer 2s linear infinite',
        display: 'block',
        lineHeight: '1',
        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
    });

    // Mini label
    const label = document.createElement('div');
    label.className = 'ff-label';
    label.textContent = 'FILL';

    btn.appendChild(ring1);
    btn.appendChild(ring2);
    btn.appendChild(icon);
    btn.appendChild(label);

    btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255, 215, 0, 0.15)';
        btn.style.borderColor = '#ffd700';
        btn.style.filter = 'drop-shadow(0 0 20px rgba(255, 200, 0, 0.8))';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(255, 255, 255, 0.08)';
        btn.style.borderColor = 'rgba(255, 215, 0, 0.5)';
        btn.style.filter = 'drop-shadow(0 0 12px rgba(255, 200, 0, 0.5))';
    });

    btn.addEventListener('click', (e) => { e.preventDefault(); handle_single_click(); });
    btn.addEventListener('contextmenu', (e) => { e.preventDefault(); toggle_panel(); });

    let timer: ReturnType<typeof setTimeout>;
    btn.addEventListener('mousedown', () => { timer = setTimeout(toggle_panel, 600); });
    btn.addEventListener('mouseup', () => clearTimeout(timer));
    btn.addEventListener('touchstart', () => { timer = setTimeout(toggle_panel, 600); }, { passive: true });
    btn.addEventListener('touchend', () => clearTimeout(timer));

    document.body.appendChild(btn);

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') { e.preventDefault(); handle_single_click(); }
    });
}

function handle_single_click() {
    const fields = scan_form_fields();
    fill_fields(fields);

    const btn = document.getElementById('flash-fill-button');
    if (btn) {
        // Flash success: swap icon, add glow burst
        const icon = btn.querySelector('span');
        if (icon) {
            icon.textContent = '✅';
            icon.style.animation = 'none';
            icon.style.webkitTextFillColor = '';
            icon.style.background = 'none';
            icon.style.filter = 'drop-shadow(0 0 8px rgba(34,197,94,0.9))';
            btn.style.borderColor = '#22c55e';
            btn.style.filter = 'drop-shadow(0 0 24px rgba(34,197,94,0.7))';
            setTimeout(() => {
                icon.textContent = '⚡';
                icon.style.background = 'linear-gradient(90deg, #ffd700, #ffb700, #fff176, #ffd700)';
                icon.style.backgroundSize = '200% auto';
                icon.style.webkitBackgroundClip = 'text';
                icon.style.webkitTextFillColor = 'transparent';
                icon.style.backgroundClip = 'text';
                icon.style.animation = 'ff-shimmer 2s linear infinite';
                icon.style.filter = 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))';
                btn.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                btn.style.filter = 'drop-shadow(0 0 12px rgba(255, 200, 0, 0.5))';
            }, 1500);
        }
    }
}

function close_panel() {
    document.getElementById('flash-fill-panel')?.remove();
    document.getElementById('ff-overlay')?.remove();
}

function toggle_panel() {
    const panel = document.getElementById('flash-fill-panel');
    if (panel) {
        close_panel();
    } else {
        // Blur overlay
        const overlay = document.createElement('div');
        overlay.id = 'ff-overlay';
        overlay.addEventListener('click', close_panel);
        document.body.appendChild(overlay);
        show_panel();
    }
}

function show_panel() {
    const fields = scan_form_fields();
    const panel = document.createElement('div');
    panel.id = 'flash-fill-panel';
    apply_styles(panel, {
        position: 'fixed',
        bottom: '110px',
        right: '28px',
        width: '340px',
        maxHeight: '480px',
        background: 'rgba(10, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        webkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        zIndex: '99998',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '18px',
        color: '#f1f5f9'
    });

    const title = document.createElement('h3');
    title.innerText = '⚡ Flash Fill Panel';
    apply_styles(title, {
        margin: '0 0 14px 0',
        fontSize: '15px',
        fontWeight: '700',
        background: 'linear-gradient(90deg, #ffd700, #ffb700)',
        webkitBackgroundClip: 'text',
        webkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.02em'
    });
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
