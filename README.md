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

<img width="1394" height="750" alt="Screenshot 2026-07-08 at 6 16 03 pm" src="https://github.com/user-attachments/assets/ee7ffabb-06af-49d5-aaf5-4e63d8cd6e12" />

<img width="1127" height="707" alt="Screenshot 2026-07-09 at 12 57 45 pm" src="https://github.com/user-attachments/assets/8214dfc7-cc3b-4dac-ad4e-b82958de10f2" />

<img width="1408" height="530" alt="Screenshot 2026-07-09 at 1 10 33 pm" src="https://github.com/user-attachments/assets/93d8a7b0-3dd0-4694-adc9-d643d675292b" />

<img width="1160" height="661" alt="Screenshot 2026-07-09 at 1 11 53 pm" src="https://github.com/user-attachments/assets/0e117ec7-46a5-4df9-9118-22c1900ffa59" />

<img width="1160" height="630" alt="Screenshot 2026-07-09 at 1 18 42 pm" src="https://github.com/user-attachments/assets/52d79444-375c-435f-8f60-b3b970573e5a" />

<img width="1160" height="630" alt="Screenshot 2026-07-09 at 1 19 37 pm" src="https://github.com/user-attachments/assets/44f67b58-b114-4164-8ecc-b8570bbd68b3" />

<img width="978" height="748" alt="Screenshot 2026-07-09 at 2 18 39 pm" src="https://github.com/user-attachments/assets/5290eff1-ded6-41a0-81d0-c76eb4868bed" />

<img width="919" height="735" alt="Screenshot 2026-07-09 at 2 18 54 pm" src="https://github.com/user-attachments/assets/97504db5-3898-4254-90ed-3296f0612269" />


<img width="1452" height="814" alt="Screenshot 2026-07-08 at 6 37 13 pm" src="https://github.com/user-attachments/assets/e4f1b851-dad1-46b8-a9d6-4eea6c2305b2" />

<img width="243" height="695" alt="Screenshot 2026-07-08 at 6 43 05 pm" src="https://github.com/user-attachments/assets/8594119c-7cae-4d0e-8e64-48bf49bb144c" />
