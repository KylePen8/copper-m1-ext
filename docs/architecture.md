# Architecture

How the Copper State Labs app fits together. Each module adds a section at the
end (see [Adding a module](#adding-a-module)) when it changes how the app
works: new pages, tables or AI calls.

_Fictional — for educational use._

## The starter app (Module 0)

A Next.js app that builds, runs and deploys with **no environment variables**.
Supabase and the AI gateway are optional until a module needs them.

| Piece | Where | What it does |
|---|---|---|
| Pages | `app/` | `layout.tsx` sets the fonts and theme; `page.tsx` is the placeholder home page |
| Brand components | `components/copper/` | `Logo`, `SiteHeader`, `SiteFooter`, `ModeToggle` |
| UI kit | `components/ui/` (shadcn), `components/ai-elements/` (AI Elements) | The only UI libraries the app uses |
| Setup card | `components/setup-required.tsx` | `<SetupRequired service="supabase" \| "ai" />`, shown instead of a page whose service isn't configured |
| Company catalog | `lib/copper/catalog.ts`, `lib/copper/data/catalog.json` | Product, plan and privacy facts from the Product Bible (Sections 3, 4, 8 and 10). Pages read prices and plan details from here instead of typing them (added in the Module 1 starter) |
| Database helpers | `lib/supabase/` | `createClient()` for the server and the browser; returns `null` when Supabase isn't set up |
| AI wrapper | `lib/ai/call.ts` | `callText` and `callObject`: every model call goes through these and is logged to `ai_calls` |
| Models and prices | `lib/ai/models.ts`, `lib/ai/pricing.ts` | The approved models (Claude Haiku, Sonnet, Opus through the Vercel AI Gateway) and their token prices |
| Database | `supabase/migrations/`, `supabase/seed.sql` | Company tables from the Product Bible (Section 10) plus `ai_calls` |
| Module checks | `specs/module-N/`, `scripts/check.mjs` | Each module's spec, instructions, rubric and acceptance tests; `npm run check` runs them |

## Data flow

1. A user opens a page in `app/`.
2. Server code checks what's configured (`isSupabaseConfigured()`,
   `isAiConfigured()`). If something is missing, the page renders
   `<SetupRequired />` instead of crashing.
3. Data comes from Supabase through `lib/supabase/server.ts`.
4. AI requests go through `callText` / `callObject` in `lib/ai/call.ts`, which
   calls the model through the AI Gateway and then writes one row to `ai_calls`:
   `module`, `feature`, `model`, tokens, `cost_usd`, `latency_ms`, `ok`. Without
   Supabase, the row is logged to the console instead.

```ts
const { text } = await callText(
  { module: 2, feature: "review-radar" },
  { prompt },
);
```

## Two kinds of "AI tiers"

Don't mix these up:

- **Copper State Labs' product tiers** (On-device, Raw Ore, Refined, the
  Copper Cloud) are part of the fictional company. They are facts in the
  [Product Bible](copper-state-labs/product-bible.md) and rows in the `ai_tiers`
  table.
- **The models this app calls** are real Claude models listed in
  `lib/ai/models.ts`. Their cost is logged in `ai_calls`.

## Decisions

- **No environment variables required.** Every service is optional, so a fresh
  clone builds and deploys before any accounts are set up.
- **One AI wrapper.** Routing every call through `lib/ai/call.ts` gives one
  place to log cost and latency per module and feature.
- **No authentication or row-level security yet.** They arrive in a later
  module.

## Adding a module

When a module changes how the app fits together, add a section here:

```md
## Module N: <feature name>

**Summary:** one or two sentences: what this adds and why.

| Piece | Where | What it does |
|---|---|---|
| Page / route | `app/...` | |
| Components | `components/...` | |
| Data | `supabase/migrations/...` | Tables and columns added |
| AI calls | `lib/ai/call.ts` (module, feature) | Model, prompt purpose, expected cost per call |

**Data flow:** user action → page → server code → database / model → response.

**Decisions and trade-offs:** what you chose, the alternatives, and why.

**Risks and open questions:** cost, privacy, accuracy or safety risks, and how
you handle them.
```

## Module 1: Landing page

**Summary:** Replaces the placeholder home page with one landing page that shows
the products, Copper Plus pricing and the 2026 privacy policy. Every price, plan
detail and privacy fact is read from the catalog, never typed into the page.

| Piece | Where | What it does |
|---|---|---|
| Page / route | `app/page.tsx` | The only route, `/`. Seven sections in order: header, hero, products, showcase, Copper Plus pricing, privacy, footer |
| Components | `components/copper/site-header.tsx`, `site-footer.tsx` | Sticky header with links to `#products`, `#plus` and `#privacy`; Night Sky footer with the logo |
| Data | `lib/copper/catalog.ts` | `getProducts()`, `getPlans()` and `getPrivacySummary()`, formatted with `formatUsd()`, `formatMemory()` and `formatNotesHours()` |
| Images | `public/assets/{cutouts,lifestyle,brand}/` | Product cutouts, lifestyle photos and the mascot, moved from `specs/module-1/assets/`. All shown through `next/image` |
| AI calls | none | |

**Data flow:** request for `/` → server component reads the catalog (static JSON)
→ prerendered HTML. There is no database, API call or client-side data fetching.

**Decisions and trade-offs:**
- Only theme tokens are used for color (`bg-primary`, `bg-secondary`, `bg-accent`,
  `bg-foreground`), so light and dark mode both work with no hex values in code.
- Catalog image paths are strings, so lifestyle photos use `fill` with
  `object-cover` in a fixed 16:10 box, and cutouts use their 1254×1254 size.
- Header links wrap to a second row on phones instead of a hamburger menu, which
  needs no client JavaScript.
- The footer always uses the light wordmark, because its background is dark in
  both themes.

**Risks and open questions:** The privacy text is the catalog's wording rendered
as-is, so it is only as accurate as the catalog. Color names on the product cards
are text chips because the catalog has no color values.

## Extension: Talk to Copper demo

**Summary:** A "Talk to Copper" section on the landing page, right after
Products, where a shopper taps one of three preset prompts and sees how Copper
answers. It is **scripted**: every reply is a fixed string in the component.
There are no AI or API calls, keys, routes or new libraries, and it is labeled
"Demo · simulated responses".

| Piece | Where | What it does |
|---|---|---|
| Section | `app/page.tsx` | `<section id="talk" data-testid="talk-to-copper">` between `products` and `showcase` |
| Component | `components/copper/talk-to-copper.tsx` | Client component with phases `idle` → `thinking` → `awaiting-choice` → `done`, built from `Card`, `Button`, `Badge` and `Spinner` |
| Tests | `components/copper/talk-to-copper.test.tsx` | Each script, the Yes/No choice, focus, reduced motion, Start over and timer cleanup |
| AI calls | none | |

**Data flow:** button click → local state → reply shown after 700 ms (at once
under `prefers-reduced-motion`). Nothing leaves the browser.

**Decisions and trade-offs:** Replies are hard-coded instead of calling a
model, so the demo costs nothing, works without keys and can't say something
off-brand. The pending reply timeout is cleared on unmount and on Start over.
Prompt buttons stay disabled while Copper is thinking or waiting for Yes/No.

**Risks and open questions:** A shopper could mistake the demo for a live
assistant, so the label says the responses are simulated. The replies avoid
prices and never claim Copper "never records."
