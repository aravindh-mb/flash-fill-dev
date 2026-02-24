# @aravindh-arumugam/flash-fill ⚡

A developer-only form autofill helper that intelligently detects form fields and allows single-click full form autofill. Powered by `@faker-js/faker`.

## Features

- ⚡ **Single-Click Fill**: Instantly scan and autofill ALL form fields.
- 🛠 **Dev-Only**: Automatically disables itself in production builds.
- 🤖 **Smart Detection**: Detects fields by name, id, placeholder, and labels.
- 🎲 **Realistic Data**: Uses FakerJS to generate names, emails, phones, addresses, etc.
- 🖱 **UI Controls**:
  - Left-Click ⚡: Fill everything.
  - Right-Click/Long-Press ⚡: Open panel to edit values.
- ⌨ **Keyboard Shortcut**: `Ctrl + Shift + F` for instant fill.
- ⚛ **React Support**: Built-in hook `use_flash_fill`.

## Installation

```bash
npm install --save-dev @aravindh-arumugam/flash-fill
```

## Usage

### Vanilla JS / Auto-Initialization

Simply import the package in your entry file (e.g., `main.js` or `index.js`). It will automatically initialize the floating button in development mode.

```javascript
import "@aravindh-arumugam/flash-fill";
```

### Manual Initialization

```javascript
import { init_flash_fill } from "@aravindh-arumugam/flash-fill";

init_flash_fill();
```

### React Hook

```tsx
import { use_flash_fill } from "@aravindh-arumugam/flash-fill";

function MyComponent() {
  const { trigger_fill } = use_flash_fill({ auto_fill: false });

  return (
    <button onClick={trigger_fill}>
      Custom Fill Button
    </button>
  );
}
```

## How it works

1. **Scans the DOM** for `input`, `textarea`, and `select` elements.
2. **Normalizes identifiers** based on priority: `name` > `id` > `placeholder` > `label`.
3. **Matches keywords** (e.g., "mail" -> email, "mobile" -> phone).
4. **Generates data** using FakerJS or uses default fallbacks.
5. **Triggers events** (`input`, `change`) to ensure compatibility with reactive frameworks like React/Vue.

## Safety

- This package checks `process.env.NODE_ENV`. If it's set to `'production'`, the UI contribution and auto-run logic are completely skipped.
- No external API calls are made.

## License

MIT
