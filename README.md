# Bayt Immobilier · real estate agency demo

Demo website for a real estate agency in Algiers and Oran, built in French. It has no backend: listings live in one data file, and every request (visit, question, estimate) opens WhatsApp with the message already written.

Built by **Nova Web Dz** (@nova_webdz).

## Pages

| Page | Address | What it does |
| --- | --- | --- |
| Home | `/` | Sentence search ("Je cherche un F3 à acheter à Hydra, jusqu'à 3 milliards"), latest listings, neighbourhoods with price per m², selling steps, loan calculator, reviews |
| Listings | `/annonces/` | Filters (buy/rent, type, area, budget, surface, lift, parking, sea view, furnished, livret foncier, new), sorting, and a map with price pins. The address updates with the filters, so a search can be shared |
| One page per listing | `/bien/<slug>/` | Photo gallery, price in centimes and DA, key facts, papers, description, floor plan, map of the area, loan calculator, WhatsApp, visit booking, share, favourites, similar listings |
| Estimate | `/estimer/` | 3-step form that gives a price range from the average price per m² of the area, then sends a visit request on WhatsApp |
| The agency | `/agence/` | Offices, team, FAQ, contact form |
| Favourites | `/favoris/` | Listings saved with the heart (stored on the visitor's device), and a button to send the selection to the agency |

Prices can be shown in **centimes** ("5,4 milliards") or in **DA** ("54 000 000 DA") with the switch in the header. The visitor's choice is remembered.

## How it works

There is nothing to install. `build.js` reads `src/data.js` and writes the finished site into `dist/`, with one HTML page per listing. Because each listing has its own page, a link shared on WhatsApp or Facebook shows that listing's photo, price and surface.

```
src/data.js      ← everything the agency edits: contact details, neighbourhoods, listings, team, reviews
src/core.js      shared functions (prices, cards, floor plans, filters)
src/app.js       interactions in the browser
src/styles.css   design
public/          favicon, icons, og-image.jpg (copied as is)
build.js         generates dist/
serve.js         small local server for testing
```

## Deploy on Vercel

1. Create a GitHub repository and upload all the files and folders (`src`, `public`, `tools`, `build.js`, `serve.js`, `package.json`, `vercel.json`, `README.md`). You don't need to upload `dist`.
2. On vercel.com: **Add New → Project → Import** the repository.
3. Keep the defaults and click **Deploy**. `vercel.json` already tells Vercel to run `node build.js` and publish `dist`.
4. Once you know the final address (for example `https://bayt-immobilier.vercel.app`), put it in `src/data.js` → `SITE.url` and push again. The link previews need it.

Every time you change `src/data.js` and push to GitHub, Vercel rebuilds the pages automatically.

### Test on your computer

With Node.js 18 or newer:

```bash
npm run dev      # builds the site, then http://localhost:3000
```

## What to replace

All of it is in `src/data.js`.

| What | Where |
| --- | --- |
| Agency name, site address, phone, e-mail, licence number | `SITE` |
| **WhatsApp number** | `SITE.whatsapp`: international format, no `+`, no spaces (`213561913869`) |
| Offices (address, hours, map position) | `SITE.offices` |
| Loan calculator defaults (rate, years, down payment) | `SITE.loan` |
| Neighbourhoods and **average price per m²** | `QUARTIERS` (used by the estimate page and the home page) |
| Team | `AGENTS` (initials are generated from the name) |
| Reviews | `TEMOIGNAGES` (the current ones are fictional) |
| **Listings** | `BIENS` (see below) |

### Adding or editing a listing

Copy an existing entry in `BIENS` and change it:

- `ref`: the agency's reference (`BY-2050`). It must be unique.
- `slug`: the end of the page address (`f3-hydra-vue-mer`), using lowercase letters, numbers and dashes only. It must be unique.
- `transaction`: `"vente"` or `"location"`. For a rental, `prix` is per month and `conditions` holds the terms (for example "6 mois d'avance").
- `type`: `appartement`, `duplex`, `niveau` (niveau de villa), `villa`, `terrain` or `local`. `pieces`: 3 for an F3.
- `quartier`: an `id` from `QUARTIERS`. `lat` / `lng`: position on the map. Use an approximate point; the page only shows a circle around it.
- `prix`: in **dinars** (54 000 000 for 5,4 milliards).
- `papiers`, `etat`, `annee`, `surface`, `chambres`, `sdb`, `etage`, `etages`, `ascenseur`, `parking`, `vueMer`, `meuble`: the key facts.
- `photos`: list of `[photo, description]`. The first photo is the cover and the link preview image.
- `plan`: floor plan model, one of `f2`, `f3`, `f4`, `f5`, `villa`, `local` or `terrain`. Room areas are scaled to the listing's surface.
- `nouveau: true` or `coupDeCoeur: true` adds a badge on the card.

If something is wrong (duplicate reference, unknown neighbourhood, missing photo), `node build.js` stops and says which listing to fix.

### Photos

The demo uses Unsplash photos (`"photo-…"` ids) as placeholders. To use the agency's own photos:

1. Put them in `public/images/` (for example `public/images/by-2041-salon.jpg`). Use about 1600 px wide and under 400 KB.
2. In the listing, write the path instead of the Unsplash id: `["/images/by-2041-salon.jpg", "Séjour lumineux"]`.

The home page, sell and agency photos are in `build.js` (search for `photo-`).

### Link preview and icons

- `public/og-image.jpg` (1200 × 630) is the preview for the home page and the other general pages. Each listing uses its own cover photo.
- `public/favicon.png`, `apple-touch-icon.png` and `icon-512.png` are the icons. `tools/make_images.py` regenerates all four (it needs Python with Pillow, and the Sofia Sans and Noto Kufi Arabic fonts).

## Map

The map uses [Leaflet](https://leafletjs.com) (loaded only when a map comes into view) and CARTO map tiles based on OpenStreetMap. For a real agency site with a lot of visitors, check CARTO's terms of use, or switch to a provider with a free plan (MapTiler or Stadia Maps, for example) by changing `TILES` at the top of `src/app.js`.

## Accessibility and motion

- Every form field has a label, errors are written out, and everything works with the keyboard. The gallery, menu and filters close with Escape.
- Smooth scrolling (Lenis) only runs on computers. Phones keep their normal scrolling.
- If the visitor turns on "reduce motion", the shutter animation and smooth scrolling are switched off.

## Notes

- This is a demonstration site: listings, prices, price per m² and reviews are fictional.
- Favourites and the price display choice are stored in the visitor's browser only.
- The estimate is a rough range calculated from the average price per m² of the area. The page says so, and invites the owner to book a visit.
