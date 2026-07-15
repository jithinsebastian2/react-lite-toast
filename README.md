# react-lite-toast

> **One import. Zero config. Infinite control.**

A production-ready, provider-less React notification library — zero configuration, zero dependencies, zero compromises.

[![npm version](https://img.shields.io/npm/v/react-lite-toast?style=flat-square)](https://www.npmjs.com/package/react-lite-toast)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-lite-toast?style=flat-square)](https://bundlephobia.com/package/react-lite-toast)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/react-lite-toast?style=flat-square)](LICENSE)

---

## The Zero-Config Promise

```typescript
import { toast } from 'react-lite-toast';

// That's it. No <ToastProvider>. No setup. No configuration.
toast.success('Saved successfully!');
toast.error('Something went wrong.');
toast.promise(fetchData(), {
  messages: {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: (err) => `Failed: ${err.message}`,
  },
});
```

The library **auto-bootstraps** on the first call. It:

1. Detects the browser environment
2. Creates `<div id="react-lite-toast-root">` if missing
3. Mounts a React root
4. Renders the internal container
5. Caches the instance — subsequent calls skip all initialization

---

## Why react-lite-toast?

| Feature | react-lite-toast | react-toastify | Sonner | Notistack |
|---|---|---|---|---|
| No Provider required | ✅ | ❌ | ❌ | ❌ |
| TypeScript strict | ✅ | ⚠️ | ✅ | ⚠️ |
| Zero dependencies | ✅ | ❌ | ✅ | ❌ |
| Headless mode | ✅ | ❌ | ⚠️ | ❌ |
| Observable store | ✅ | ❌ | ❌ | ❌ |
| SSR safe | ✅ | ⚠️ | ✅ | ⚠️ |
| React 19 ready | ✅ | ⚠️ | ✅ | ❌ |
| Micro-frontend safe | ✅ | ❌ | ❌ | ❌ |
| Bundle size (gzip) | <8 KB | ~18 KB | ~8 KB | ~25 KB |

---

## Monorepo Structure

This project is a **pnpm monorepo** with Turborepo:

```
packages/
├── core/            → @react-lite-toast/core    (framework-agnostic engine)
├── react/           → @react-lite-toast/react   (React renderer + components)
├── themes/          → @react-lite-toast/themes  (built-in themes)
├── icons/           → @react-lite-toast/icons   (SVG icon pack)
├── devtools/        → @react-lite-toast/devtools (dev debugging tools)
├── testing/         → @react-lite-toast/testing (test utilities)
└── react-lite-toast/ → react-lite-toast        (umbrella convenience package)

apps/
└── playground/      → Interactive demo (port 3000)

.storybook/          → Component library documentation
```

---

## Installation

```bash
# The convenience package (recommended)
npm install react-lite-toast

# Or the scoped React package for finer control
npm install @react-lite-toast/react
```

---

## API Reference

> 📖 Full API reference is generated in Phase 19 (Documentation).

### `toast(message, options?)`
### `toast.success(message, options?)`
### `toast.error(message, options?)`
### `toast.warning(message, options?)`
### `toast.info(message, options?)`
### `toast.loading(message, options?)`
### `toast.promise(promise, options)`
### `toast.custom(content, options?)`
### `toast.dismiss(id?)`
### `toast.dismissAll()`
### `toast.update(id, options)`
### `toast.pause(id)`
### `toast.resume(id)`
### `toast.isActive(id)`
### `toast.configure(defaults)`
### `toast.createContainer(config)`
### `toast.removeContainer(id)`

---

## Development

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9

### Setup

```bash
# Clone the repository
git clone https://github.com/jithinsebastian2/react-lite-toast.git
cd react-lite-toast

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Start the playground
pnpm playground

# Run all tests
pnpm test

# Open Storybook
pnpm storybook
```

### Available Scripts

| Command | Description |
|---|---|
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch mode for all packages |
| `pnpm test` | Run all tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint all packages |
| `pnpm format` | Prettier format all files |
| `pnpm playground` | Start playground at localhost:3000 |
| `pnpm storybook` | Start Storybook at localhost:6006 |

---

## Architecture

> 📐 Full Architecture Guide is generated in Phase 19 (Documentation).

### Global Singleton

The library uses `Symbol.for('__REACT_LITE_TOAST_ENGINE_v1__')` on `globalThis` to guarantee exactly one engine instance — even across Module Federation boundaries, duplicate bundle installs, and HMR reloads.

### Observable Store (no Context)

State is managed by a custom observable store:

```
toast.success() → Engine.dispatch() → Store.setState() → notify subscribers → React.useSyncExternalStore → component re-render
```

No React Context. No Provider. Components subscribe directly to the store.

### State Machine

Every toast moves through a predictable lifecycle:

```
CREATED → QUEUED → VISIBLE → PAUSED → RESUMED → DISMISSING → REMOVED
```

Invalid transitions are silently rejected.

---

## Implementation Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Project Initialization | ✅ Complete |
| 2 | Type System | ✅ Complete |
| 3 | Observable Store | 🔄 Next |
| 4-20 | See implementation plan | ⏳ Pending |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — generated in Phase 19.

## License

[MIT](LICENSE) © jithinsebastian2
