# ELP

> **Every event around El Paso, in one place.**

ELP is a community events app for El Paso. The goal: you don't have to know
anybody to belong here — just show up.

## Tech stack

- **React + Vite** — fast dev server and build.
- **Framer Motion** — smooth blur-to-sharp fade-in animations.
- **React Router** — navigation between screens.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Landing page behavior

Three phrases fade in one at a time, blurred-to-sharp, in sequence:

1. **Top-left** — "Every event around El Paso, in one place."
2. **Center-right** — "You don't have to know anybody to belong here. Just show up"
3. **Bottom-center** — "See what's happening" — **clickable**, navigates to the
   events screen (`/events`).

## Project structure

```
index.html
src/
  main.jsx            # app entry + router
  index.css           # global styles, palette, fonts
  pages/
    Landing.jsx       # animated landing page
    Landing.css
    Events.jsx        # placeholder "next step" screen
docs/
  landing-page.png    # design reference
```

## Status

🚧 Landing page built. Events feed is a placeholder — next up.
