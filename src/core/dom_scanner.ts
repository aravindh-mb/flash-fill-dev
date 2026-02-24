export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  key: string;
  type: string;
  tag: string;
}

export function scan_form_fields(): DetectedField[] {
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]):not([type="hidden"]), textarea, select'
    )
  );

  return inputs
    .filter(el => !el.disabled && !el.closest('[style*="display: none"]'))
    .map(el => ({
      element: el,
      key: normalize_key(el),
      type: el.getAttribute('type')?.toLowerCase() || el.tagName.toLowerCase(),
      tag: el.tagName.toLowerCase()
    }));
}

function normalize_key(el: HTMLElement): string {
  const name = el.getAttribute('name');
  if (name) return name.toLowerCase().replace(/[\[\]]/g, '_');

  const id = el.getAttribute('id');
  if (id) return id.toLowerCase();

  const placeholder = el.getAttribute('placeholder');
  if (placeholder) return placeholder.toLowerCase();

  const aria_label = el.getAttribute('aria-label');
  if (aria_label) return aria_label.toLowerCase();

  const data_label = el.getAttribute('data-label');
  if (data_label) return data_label.toLowerCase();

  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label?.textContent) return label.textContent.trim().toLowerCase();
  }

  const parent_label = el.closest('label');
  if (parent_label?.textContent) {
    const clone = parent_label.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea').forEach(c => c.remove());
    return clone.textContent?.trim().toLowerCase() ?? 'unknown';
  }

  const fieldset = el.closest('fieldset');
  const legend = fieldset?.querySelector('legend');
  if (legend?.textContent) return legend.textContent.trim().toLowerCase();

  return el.getAttribute('autocomplete') ?? 'unknown';
}
