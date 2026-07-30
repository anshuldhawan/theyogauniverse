# The Yoga Universe — frontend functionality

An index of yoga and meditation offerings for The Yoga Universe. Single Design Component
(`The Yoga Universe.dc.html`) plus a standalone Leaflet map page and one drop-in
image-placeholder script.

## Files

| File | Role |
| --- | --- |
| `The Yoga Universe.dc.html` | The whole site — all views, data, state, booking and management logic |
| `rishikesh-map.html` | Leaflet + OpenStreetMap map, embedded in the Rishikesh page via `<iframe>` |
| `image-slot.js` | `<image-slot>` web component — user-fillable image placeholders |
| `assets/` | The Yoga Universe marks and logo, plus the exported eight-limbs diagram |

## Views

Client-side view switching held in `state.view`; every transition scrolls to top.
No routing or URLs — this is a prototype, not a deployed app.

1. **Home** — hero with search, "Start here" finder, category grid, featured teachers, blog teasers, listing CTA
2. **Directory** — kind tabs, filter sidebar, sortable result list
3. **Profile** — one listing: philosophy, bio, schedule, bookable classes, reviews, facts, socials, location
4. **Booking** — four steps: choose class → details → payment → confirmation
5. **For teachers** — timetable and capacity management for a chosen teacher or studio
6. **Blog** — post grid
7. **Article** — single post
8. **The Yoga Sutras of Patanjali** — reference page with the eight-limbs diagram
9. **Rishikesh** — place page with history, offerings, travel notes and interactive map

## The index

25 listings across six kinds: **Teacher** (9), **Studio** (3), **Retreat** (3),
**Training** (3), **Breathwork** (3), **Meditation** (3).

Each listing carries: name, kind, city, country, styles, format
(`in-person` / `online` / `both`), levels, years running, review count, tagline,
philosophy quote, bio, address, four facts, a schedule, social links and two reviews.
There are no star ratings anywhere — reviews are text only, with a total count.

Copy adapts per kind at render time: a retreat shows "Upcoming dates" and "What past
guests say", a studio shows "Timetable" and "What members say", a training shows
"Dates & structure" and "What graduates say", a teacher shows "Weekly timetable".
Online-only listings read "Online, worldwide" instead of a city and never
double-print their format.

## Search and filtering

**Hero search** — free-text query, a "Looking for" kind selector, and a location
selector; submitting lands on the directory with those applied. Six popular-style
shortcut chips set a style filter directly.

**Directory filters** — all live, all combinable:

- Kind tabs: Everything, Teachers, Studios, Retreats, Teacher training, Breathwork, Meditation
- Free-text search across name, kind, styles, tagline and city
- Verified only toggle
- Style & focus: 18 chips (Ashtanga → Teacher training, Ayurveda)
- Format: In person, Online
- Level: Beginner, Intermediate, Advanced
- Runs on: Mon–Sun (matches day ranges and "Daily" as well as named days)
- Location dropdown, built from the listing set
- Sort: most reviewed, longest established, name A–Z
- Clear all filters; an empty-state card when nothing matches

## Verification

Listings on a verified list show a badge on directory cards and a
"✓ Credentials verified" marker on the profile, with a plain-language note in the
sidebar explaining that certification or accreditation has been seen. The
"Verified only" filter narrows results to those listings.

## Start here

Six situations on the home page — never done yoga, coming back after injury,
pregnant, want to sleep better, want to sit not stretch, want to teach. Selecting
one reveals a short explanatory note plus **one blog post and two listings**, each
clickable through to its page. Selecting again collapses it.

## Booking and payment

Available on teachers, studios, breathwork and meditation listings. Retreats and
trainings show "Enquire about dates" / "Apply or ask a question" instead.

Each bookable listing's schedule is expanded into class slots with a deterministic
capacity (8–28) and a seeded number already booked, priced in the listing's local
currency; donation-based listings show "Donation" instead of a fee.

Flow:

1. **Choose** — slot list with places remaining, price, and a full/nearly-full colour cue
2. **Details** — name and email only; Continue stays disabled until both are valid
3. **Payment** — card number, expiry, CVC; Pay stays disabled until all three are plausible
4. **Confirmed** — booking reference, class summary, and where to go next

Confirmed bookings decrement the live capacity everywhere that slot appears, so a
class can sell out during a session. Cancellation terms are stated before payment.

## For teachers and studios

Pick any teacher, studio, breathwork or meditation listing from a dropdown, then:

- See three live counters: classes on the timetable, weekly places offered, currently booked
- Edit capacity inline per class
- Remove a class
- Add a class with day, time, class name, location, capacity and price

Added classes appear immediately on the public profile and are bookable. Existing
bookings are respected when capacity is lowered.

## Reference pages

**The Yoga Sutras of Patanjali** — the four books, an eight-limbs diagram (concentric
rings from outward conduct to samadhi, with a keyed list), a note on why it matters to
a weekly class, and reading advice. Hero image is a droppable slot.

**Rishikesh** — history from the rishis through Sivananda and the Beatles ashram to
the modern training industry; nine offerings; travel and season notes; and a real
interactive OpenStreetMap with seven pinned landmarks (Lakshman Jhula, Ram Jhula,
Parmarth Niketan, Chaurasi Kutia, Triveni Ghat, Tapovan, Neelkanth Mahadev), each
with a popup. Scroll-zoom is off until the map is clicked so the page still scrolls.

## Blog

Six posts, each with category, excerpt, read time and full body: the eleven styles
honestly described, breathwork is not one thing, what to expect in your first class,
choosing a retreat, telling a good teacher from a popular one, and what equipment to
buy. Three surface on the home page; all six in the blog grid.

## Design and behaviour notes

- Palette: deep green `#1b391c`, sage `#a2d1a2`, orange `#ff6540`, amber `#fbac49`, mint wash `#f0f6f0`
- Type: Petrona for headings and pull quotes, Roboto for UI and body
- Fully responsive via `clamp()` and wrapping flex/grid; sticky header and sidebars
- Hover states on every interactive element; disabled buttons are visibly inert
- Images: `<image-slot>` placeholders on the Sutras and Rishikesh heroes persist a
  dropped image across reloads
- The eight-limbs diagram is marked `data-om-raster` so it exports as an image

## Not built (deliberate)

Real authentication, a payment processor, persistence beyond the session, listing
submission for new teachers, review submission and moderation, saved lists,
radius/map search, price-band filters, accessibility filters, and a styles glossary.
