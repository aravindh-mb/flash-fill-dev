# Installation 🚀

Getting started with **Flash Fill** is quick and easy.

## NPM Install

Install the package as a development dependency:

```bash
npm install --save-dev @aravindh-arumugam/flash-fill
```

## Setup

### Vanilla JavaScript / Auto-Initialization

For most projects, you can simply import the package at the top of your main entry file (e.g., `app.js` or `main.js`). 

```javascript
import "@aravindh-arumugam/flash-fill";
```

Flash Fill will automatically:
1. Detect if you are in a **Development** environment.
2. Inject a floating ⚡ trigger button in the bottom right corner of your webpage.
3. Listen for the `Ctrl + Shift + F` shortcut.

### React Integration

If you prefer a programmatic approach or need custom triggers in React:

```tsx
import { use_flash_fill } from "@aravindh-arumugam/flash-fill";

function MyComponent() {
  // Pass auto_fill: false if you don't want the floating button
  const { trigger_fill } = use_flash_fill({ auto_fill: true });

  return (
    <button onClick={trigger_fill}>
      Manual Sync
    </button>
  );
}
```

## Production Safety

**Flash Fill is built for developers.** 

The library internal logic checks for `process.env.NODE_ENV === 'production'`. If detected, it:
- ❌ Does **not** inject any UI.
- ❌ Does **not** listen for keyboard shortcuts.
- ❌ Does **not** execute any scanning logic.

This ensures zero impact on your actual users.
