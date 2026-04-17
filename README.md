# Velumen Workspace

A Vue 3 employee self-service demo: payslips, timesheet, task board, org chart, and a floating time tracker. Layout and navigation are built for desktop and mobile; task cards and the timer use pointer-based dragging so moving items on a phone or tablet feels natural.

## What you need

- **Node.js** 18+ (20 LTS is fine)
- **npm** (comes with Node)

## Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Other commands

| Command | Purpose |
|--------|---------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |

## Project notes

- **Stack:** Vite, Vue 3, Vue Router, Tailwind CSS.
- **Data:** Demo data lives in JSON under the repo and in browser storage (e.g. tasks, timer position). There is no backend in this project.
- **Dragging:** The task board and floating timer use pointer events (`pointerdown` / `move` / `up`) with a small movement threshold so taps and scroll aren’t confused with drags on touch devices.

## Repo and deployment

Build with `npm run build` and deploy the `dist/` folder to any static host. Point your Git remote at your own repository, then push as usual.
