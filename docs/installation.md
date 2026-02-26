# Installation 🚀

Getting started with **Flash Fill** is quick and easy.

## NPM Install

Install the package as a development dependency:

```bash
npm install --save-dev @aravindh-arumugam/flash-fill
```

## Compatibility 🏛️

Flash Fill is designed to be framework-agnostic but includes deep optimizations for React:

- **React Support**: Fully compatible with **React 16.8+**, **React 17**, **React 18**, and **React 19**.
- **Event Systems**: Support for React's Synthetic Event system (including React 19's updated event delegation).
- **Control**: Works with both controlled and uncontrolled components.
- **Strict Mode**: Built-in protection against double-execution in React 18/19 Strict Mode.
- **Plain JS**: Works in any environment (Vite, Webpack, etc.) without React.

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
