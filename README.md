# ELP

> **Live app → elpaso-events.pages.dev**

Everyone in El Paso says "there's nothing to do here." It isn't true, the events exist, they're just scattered across venue pages, city calendars, and Instagram posts nobody sees. ELP pulls them into one place: concerts, markets, art walks, free yoga and festivals, so people can find something to do, meet each other in person, and support local businesses.

The app is deliberately about meeting people in person. There's no stranger-to-stranger chat, by design: real connection happens at the event, not through a screen.

## What it does

Three views of the same events, curated from local sources, each linking out to its official page for details and registration.:
- Map with pins
- Calendar (month and week)
- List

Filters apply across all three:
— Category (Food, Music, Arts, Outdoors, Markets, Sports)
- Time (Today, This Weekend, This Week)
- Price (Free / Paid)

Other features: 
- Save events: heart the ones you're interested in and find them again.
- Follow local businesses: add the accounts of local spots whose events you don't want to miss.
- Bilingual (EN / ES): because El Paso is.

## Tech stack
- **React + Vite** — fast dev server and build
- **Framer Motion** — smooth blur-to-sharp fade-in animations
- **React Router** — navigation between screens
- **Leaflet / OpenStreetMap** — the map view
- **Supabase** — authentication and user data
- **Cloudflare Pages** — deployment
- **Figma** — frames and mockups

## How it was made

ELP runs on a small, deliberate design system: a warm sand background, a single clay accent, and Antic Didone paired with Mulish. The landing page uses an original illustrated map of El Paso — drawn for this project, not stock, that shifts between day, dusk, and night.

I built it with AI assistance (Claude) as a pair-programmer and planner. I had no formal technical background when I started; I designed it, scoped it, made the hard calls about what to cut, and shipped it.

## Getting started
Nothing to install — it runs in your browser.

## Running it locally
If you want to run the source code:

npm install
npm run dev

## Status
Live and working **→ [elpaso-events.pages.dev](https://elpaso-events.pages.dev/)** 

Note: I also designed the social-media import flow and then shipped the curated version first. The automatic import depends on platform APIs I couldn't get working reliably in the time I had, and a working app with real events beats a broken app with an ambitious feature.

Next: businesses connecting their own social accounts so their events import automatically.
