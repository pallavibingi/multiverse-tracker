# Multiverse Tracker
Unofficial fan-made MCU tracker. React + Vite, no backend; progress is stored in localStorage.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # outputs dist/

## Deploy
- **Vercel:** import the repo; framework preset Vite; build `npm run build`, output `dist`.
- **GitHub Pages:** run `npm run build`, then publish `dist/` (e.g. with the `gh-pages` package). `base: './'` is already set.

## Edit content
All titles live in `src/data.js` (one array row each). Verify post-2025 release status there.
