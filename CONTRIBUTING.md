# Contributing to Xelma Frontend

Thanks for contributing to Xelma — a trustless, dual-mode prediction market on Stellar.

This document captures the **single, adopted app-shell pattern** for the frontend, decided under [issue #188](https://github.com/TevaLabs/Xelma-Frontend/issues/188). Make sure new pages and components fit it before opening a PR.

---

## App shell pattern (the only one)

We follow the **dark-terminal shell** in `src/App.tsx`. Every routed page renders inside it. There is **no other shared layout component** — please do not introduce one without first opening an issue.

### What's in the shell (top → bottom)

1. **`<OfflineBanner />`** — fixed-top red banner shown only when the realtime socket drops.
2. **`<Navbar />`** — sticky, dark (`bg-[#0A0F1A]/90 backdrop-blur-xl`) top bar with logo, primary nav links, wallet connect, mobile drawer.
3. **`<Routes>`** (wrapped in `<LazyBoundary>` + `<Suspense>`) — the active page.
4. **`<Footer />`** — global session footer with Stellar branding, GitHub/learn links, and a decorative network badge. Rendered for every route **except `/`** (Landing renders its own Footer inside its bespoke hero).
5. **`<Toaster />`** — `sonner` toast portal at `top-center`, dark theme.

Source of truth: see [`src/App.tsx`](./src/App.tsx).

### Required page conventions

- Pages must render **outside** the shell container using the dark utility classes that already exist:
  - Use the `xelma-grid-bg min-h-screen` wrapper for the fintech grid background.
  - Center content with `mx-auto max-w-{6xl|7xl}` and horizontal padding `px-4 sm:px-6 lg:px-8` (matches Navbar/Footer).
  - Use the dark palette tokens defined in [`src/index.css`](./src/index.css) (`--color-xelma-bg`, `--color-xelma-blue`, `--color-xelma-teal`, etc). Tailwind arbitrary values like `bg-[#0A0F1A]`, `text-[#F3F4F6]`, `border-[#BEC7FE]/10` are also fine.
- Pages render their own header/title — do **not** add another `<header>`. The only `<header>` in the document is the one inside `Navbar`.
- Reuse shared widgets instead of reimplementing: `<Footer />`, `<OfflineBanner />`, `<RouteFallback />`, `<LazyBoundary />`, `<ConnectThroughWallet>` (`WalletConnect`), educational components, etc.

### What is **not** part of the shell (do not re-add)

These components existed at some point and were removed because they were never wired into the routed tree and caused architectural confusion. Pull requests that re-introduce them will be rejected:

| Removed component | Why it's gone |
| --- | --- |
| `src/components/layout/GameShell.tsx` | Light-bg (`#FAFAFA`) + `lg:px-14` model that conflicted with the dark-terminal pages. |
| `src/components/Header.tsx` | Duplicate of `Navbar.tsx` and tied to the unused `next-themes` provider. |
| `src/components/HeroSection.tsx` | Duplicated the bespoke Landing hero in `src/pages/Landing.tsx`. |
| `src/components/RouteProgressBar.tsx` | Fixed-top `z-50` clashed with `<OfflineBanner />` and provided no signal that `<LazyBoundary>` + per-page loading states don't already give. |
| `src/components/ThemeProvider.tsx` + `src/contexts/ThemeContext.tsx` | Never mounted; only the two above depended on `next-themes`, which has now been removed from `package.json`, `pnpm-lock.yaml`, and `package-lock.json`. |

If you genuinely need a page-level layout primitive (e.g. a centered auth card), put it in the page file itself — do not create a global "shell" component. The dark-terminal shell in `App.tsx` is the single source of truth.

---

## Local development

```bash
pnpm install          # primary install — regenerates pnpm-lock.yaml
npm install           # ALSO run this — CI uses `npm ci`, which reads package-lock.json
pnpm dev              # run Vite dev server
pnpm test:unit        # run vitest
pnpm lint             # run ESLint
pnpm build            # tsc + vite build (CI equivalent)
```

> **Heads-up:** CI (`.github/workflows/ci.yml`) runs `npm ci`, which reads **`package-lock.json`**, not `pnpm-lock.yaml`. When you bump or remove a dependency, run **both** `pnpm install` and `npm install` so the two lockfiles stay in sync. A half-refreshed lockfile will break CI with a phantom-dependency error.

## Pull requests

- Reference the issue you are closing (e.g. `Closes #188`).
- Keep changes scoped — one concern per PR.
- Run `npm run lint && npm run build && npm run test:unit` locally before pushing (this is what CI runs).
- Confirm that no dead imports are left behind (the project enforces this; see the table above).
- Prefer the existing dark-terminal styles; do not introduce new theme files without discussion.

## Questions?

Open a GitHub discussion or mention `@maintainers` in your PR — happy to help shape changes that fit the architecture.
