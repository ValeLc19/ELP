# ELP

> **Live app → [elpaso-events.pages.dev](https://elpaso-events.pages.dev/)**

Everyone in El Paso says "there's nothing to do here." It isn't true — the events exist, they're just scattered across venue pages, city calendars, and Instagram posts nobody sees. ELP pulls them into one place: concerts, markets, art walks, free yoga, festivals. So people can find something to do, meet each other in person, and support local businesses.

The app is deliberately about meeting people in person. There's no stranger-to-stranger chat, by design: real connection happens at the event, not through a screen.

---

## What it does

**Three views of the same events**, each linking out to its official page for details and registration:

- **Map** — pins across the city
- **Calendar** — month and week
- **List** — everything, sorted by date or price

**Filters apply across all three:**

| Filter | Options |
| --- | --- |
| Category | Food · Music · Arts · Outdoors · Markets · Sports |
| When | Today · This Weekend · This Week |
| Price | Free · Paid |
| Good for | Kids · 18+ |

**Plus:**

- **Save events** — heart the ones you're interested in and find them again
- **Follow local businesses** — add the accounts of the spots whose events you don't want to miss
- **Add an event** — paste a link and ELP fills in the details for you
- **Bilingual (EN / ES)** — because El Paso is

---

## Screen by screen

### 1. Landing

An original illustrated map of El Paso — drawn for this project, not stock — that shifts between day, dusk, and night depending on the hour you visit. The copy fades in one line at a time, and there's exactly one thing to click.

<img width="820" alt="ELP landing page: an illustrated map of El Paso with the Franklin Mountains, Plaza Theatre, Mission Trail and the Rio Grande. Headline reads 'Every event around El Paso, in one place.'" src="https://github.com/user-attachments/assets/ee7ffabb-06af-49d5-aaf5-4e63d8cd6e12" />

### 2. Map view

Every event as a pin, colour-coded by category, over a real, pannable map. The panel on the right lists the same events as cards — filter or search, and the pins and cards stay in sync.

<img width="820" alt="ELP map view: filter chips for category, price and audience above an OpenStreetMap of El Paso with coloured pins. A sidebar lists event cards." src="https://github.com/user-attachments/assets/8214dfc7-cc3b-4dac-ad4e-b82958de10f2" />

### 3. Calendar view

The whole month at a glance, or a single week with times. Click any event and its full details open beside the calendar — venue, date, description, and a link to the official page.

<img width="820" alt="ELP calendar view: July 2026 month grid with colour-coded events per day, and an event detail panel on the right." src="https://github.com/user-attachments/assets/5290eff1-ded6-41a0-81d0-c76eb4868bed" />

### 4. List view

Everything upcoming as a grid of cards, sortable by date or price. The card you select stays highlighted while its details open on the right.

<img width="820" alt="ELP list view: a grid of event cards each with an image, category chip, date and a 'See Details' button, with a detail panel on the right." src="https://github.com/user-attachments/assets/97504db5-3898-4254-90ed-3296f0612269" />

### 5. Sign up and log in

Saving events needs an account. Email validation happens as you type (the green check), you pick the categories you care about, and then you confirm your address before you're let in.

<img width="820" alt="Three ELP auth screens side by side: Log in, Sign up with interest chips, and a 'Check your email' confirmation prompt." src="https://github.com/user-attachments/assets/93d8a7b0-3dd0-4694-adc9-d643d675292b" />

Confirmation email is sent by Supabase, styled to match the app.

<!-- Email screenshot removed: the original leaked a live Supabase `?token=` verify link.
     Re-upload a cropped version and paste the new URL here. -->

### 6. First run

Two callouts, once, pointing at the two things a new account can do that a visitor can't: follow a local business, and save an event. Then they never appear again.

<table>
<tr>
<td width="50%"><img width="100%" alt="Onboarding callout pointing at the profile icon: 'In your profile, open My Local Business to add a business's social account and pull in the events they post.'" src="https://github.com/user-attachments/assets/52d79444-375c-435f-8f60-b3b970573e5a" /></td>
<td width="50%"><img width="100%" alt="Onboarding callout pointing at the saved-events icon: 'Now you can save the events you are interested in.'" src="https://github.com/user-attachments/assets/44f67b58-b114-4164-8ecc-b8570bbd68b3" /></td>
</tr>
<tr>
<td align="center"><em>1 — follow a business</em></td>
<td align="center"><em>2 — save an event</em></td>
</tr>
</table>

### 7. My Local Business

Add the social accounts of the places you care about. ELP pulls their profile photo and name automatically, and their events show up in your feed behind a filter chip only you can see.

<img width="820" alt="ELP 'My Local Business' screen: a card for Break Room Coffee and an 'Add business' tile, with a modal for pasting an Instagram URL." src="https://github.com/user-attachments/assets/e4f1b851-dad1-46b8-a9d6-4eea6c2305b2" />

### 8. Add an event

Paste a link to an event — or upload the flyer — and ELP reads what it can: title, date, time, price, place, description, image. You review and correct it, then it lands on your calendar.

<img width="300" alt="ELP 'Add an event' modal: paste a link, autofill from link, then a review-and-edit form with title, detected dates, category chips, price, place and the flyer image." src="https://github.com/user-attachments/assets/8594119c-7cae-4d0e-8e64-48bf49bb144c" />

---

## Tech stack

**Frontend**
- **React + Vite** — fast dev server and build
- **React Router** — navigation between screens
- **Leaflet / OpenStreetMap** — the map view, no API key needed

**Backend**
- **FastAPI (Python)** on **Render** — the API, and it verifies every login token
- **Supabase** — authentication (ES256 / JWKS) and the Postgres database
- **GitHub Actions** — a nightly job that re-scrapes the local events catalog

**Deployment & design**
- **Cloudflare Pages** — hosts the frontend
- **Figma** — frames and mockups

## How it works

```
Cloudflare Pages  ──calls + token──▶  Render (FastAPI)  ──SQL + verify──▶  Supabase
   the website                          the logic                       Postgres + Auth
```

Public events are refreshed **nightly** by a GitHub Action that reads visitelpaso.com's sitemap, parses each event's structured data, geocodes the venue, and upserts it into Postgres. Your saved events and followed businesses are private to your account.

## How it was made

ELP runs on a small, deliberate design system: a warm sand background, a single clay accent, and Antic Didone paired with Mulish.

I built it with AI assistance (Claude) as a pair-programmer and planner. I had no formal technical background when I started; I designed it, scoped it, made the hard calls about what to cut, and shipped it.

## Run it locally

Nothing to install to *use* ELP — it runs in your browser at [elpaso-events.pages.dev](https://elpaso-events.pages.dev/).

To run the source:

```bash
npm install
npm run dev
```

The frontend works on its own against the live API. To run the backend too, see [`backend/README.md`](backend/README.md).

## Status

**Live and working → [elpaso-events.pages.dev](https://elpaso-events.pages.dev/)**

Event import ships as **paste-a-link**: you give ELP a URL or a flyer and it extracts the details. Fully automatic import from Instagram and Facebook is still open — those platforms serve a login wall to anything that isn't a browser, and a working app with real events beats a broken app with an ambitious feature.

**Next:** businesses connecting their own social accounts so their events import automatically.
