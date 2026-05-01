# CIEL — Headless Storefront (Shopify Hydrogen)

A bold-modern headless storefront for **CIEL Clothing**, built on **Shopify
Hydrogen 2026** with **React Router 7**, **Tailwind v4**, and a token-driven
design system. Currently runs against Shopify's public **`mock.shop`** demo API
so it works end-to-end without any real Shopify credentials. Switching to a
real Shopify store later is a 4-line `.env` change — see
[Switching from `mock.shop` to a real Shopify store](#switching-from-mockshop-to-a-real-shopify-store).

---

## Stack

| Concern        | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Framework      | [Hydrogen 2026](https://shopify.dev/docs/custom-storefronts/hydrogen) |
| Routing        | [React Router 7](https://reactrouter.com)                        |
| Runtime        | Cloudflare Workers (Shopify Oxygen-compatible)                   |
| Bundler        | Vite                                                            |
| Styles         | Tailwind CSS v4 with `@theme` design tokens                      |
| UI primitives  | Radix UI (Dialog, Drawer, Popover, Accordion)                   |
| Animation      | Motion (Framer Motion successor)                                |
| Icons          | lucide-react                                                    |
| Type/lint      | TypeScript, ESLint, Prettier, GraphQL Codegen                   |
| Local data     | [`mock.shop`](https://mock.shop) (no auth required)             |
| Demo hosting   | Cloudflare Workers (`*.workers.dev`)                            |

---

## Quick start

```bash
# 1. Install
npm install

# 2. Run locally (uses mock.shop, port 3000 or next free)
npm run dev

# 3. Production build
npm run build

# 4. Preview the production build locally
npm run preview
```

The dev server prints a `Local:` URL (typically <http://localhost:3000/>).
GraphiQL and the sub-request profiler are mounted at:

- <http://localhost:3000/graphiql>
- <http://localhost:3000/subrequest-profiler>

---

## Project structure

```
app/
├── assets/brand/       # Logo SVGs (currentColor + dark/light originals)
├── components/
│   ├── cart/           # CartDrawer, CartLineItem, CartSummary, CartEmpty
│   ├── footer/         # Footer
│   ├── header/         # Header, MegaMenu, MobileMenuDrawer, SearchDrawer
│   ├── home/           # Hero, MarqueeBar, RecommendedProducts, FeaturedCollection, EditorialBanner
│   ├── layout/         # PageLayout, Container, Section, UIStateProvider
│   ├── motion/         # ScrollReveal, Marquee, HoverImageSwap
│   ├── product/        # ProductCard, ProductGallery, VariantSelector, ProductForm, ProductPrice, AddToCartButton
│   ├── search/         # Predictive search results
│   └── ui/             # Button, IconButton, Drawer, Dialog, Popover, Accordion, Skeleton, Logo
├── lib/                # cn (class names), motion variants, menu helpers, fragments, session, context
├── routes/             # File-based routing (React Router 7)
├── styles/             # tokens.css (design tokens), base.css (reset), tailwind.css (entry)
└── root.tsx            # Root layout, loaders, error boundary
```

### Design system (token-driven)

Edit colors, type scale, radii, shadows and motion in **`app/styles/tokens.css`**.
Every component reads from these tokens via Tailwind v4's `@theme` block, so a
single token change ripples through the entire UI.

---

## Environment variables

Local values live in **`.env`**. Production values live in **`wrangler.toml`**
(non-secrets) and as **Wrangler secrets** (e.g. `SESSION_SECRET`).

| Variable                       | Required | Purpose                                                      |
| ------------------------------ | -------- | ------------------------------------------------------------ |
| `SESSION_SECRET`               | ✅       | Cookie / session signing key. Generate locally with `openssl rand -hex 32`. |
| `PUBLIC_STORE_DOMAIN`          | ✅       | MyShopify domain (e.g. `your-store.myshopify.com`) or `mock.shop`. |
| `PUBLIC_STOREFRONT_API_TOKEN`  | ✅       | Storefront API access token from a Custom App. Any string for `mock.shop`. |
| `PUBLIC_STOREFRONT_ID`         | ✅       | Storefront analytics ID. Placeholder string is fine in mock mode. |
| `PUBLIC_CHECKOUT_DOMAIN`       | ✅       | Domain used for checkout (usually same as store domain).     |

Current `.env` is preconfigured for `mock.shop`. **Never commit `.env`** —
it's in `.gitignore`.

---

## Deployment — Cloudflare Workers

The project deploys to Cloudflare Workers with one command. Hydrogen's build
output (`dist/server/index.js`) is already a valid Worker; `dist/client/` is
served from the edge as static assets.

### One-time setup (per machine)

```bash
# Authenticate Wrangler with your Cloudflare account (free tier is fine)
npx wrangler login

# Set the SESSION_SECRET as a Worker secret (prompts for value)
npx wrangler secret put SESSION_SECRET
# Paste any long random string — generate with: openssl rand -hex 32
```

### Deploy

```bash
npm run deploy
```

This runs `npm run build` then `wrangler deploy`. Wrangler prints the public
URL on success — typically:

```
https://ciel.<your-cloudflare-subdomain>.workers.dev
```

That URL is your client preview link.

### Useful operations

```bash
npm run cf:tail         # Live-tail Workers logs
npm run cf:secret       # Re-set SESSION_SECRET
npx wrangler deployments list   # Roll back to a previous deploy
```

### Custom domain

To attach a real domain (e.g. `staging.cielclothing.com`):

1. Add the domain to your Cloudflare account.
2. In `wrangler.toml`, add:
   ```toml
   routes = [
     { pattern = "staging.cielclothing.com/*", custom_domain = true }
   ]
   ```
3. `npm run deploy` again.

---

## Switching from `mock.shop` to a real Shopify store

When the client is ready to wire up their actual storefront, follow these
steps. **No code changes are required** — only environment variables.

### 1. Get a Storefront API access token from Shopify

The "Hydrogen sales channel" is gated behind paid Shopify plans on newer dev
stores. The supported workaround is a **Custom App** with **Storefront API**
access:

1. Shopify admin → **Settings → Apps and sales channels → Develop apps**.
2. **Allow custom app development** (first time only).
3. **Create an app** → name it e.g. `Ciel Hydrogen`.
4. **Configuration tab → Storefront API integration → Configure**.
5. Enable scopes (at minimum):
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_product_pickup_locations`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_customers`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customer_tags`
   - `unauthenticated_read_content`
   - `unauthenticated_read_selling_plans`
   - `unauthenticated_read_metaobjects`
6. **Save** → top-right **Install app** → Install.
7. **API credentials tab → Storefront API access token** → reveal & copy.

> **Don't confuse with Admin API token** — that one starts with `shpat_` and is
> for server-to-server admin operations. Hydrogen needs the **Storefront API**
> access token (different field on the same screen).

### 2. Update the local `.env` for development

```
SESSION_SECRET=<generate via: openssl rand -hex 32>
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=<the Storefront API token from step 1>
PUBLIC_STOREFRONT_ID=<see note below>
PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com
```

> **`PUBLIC_STOREFRONT_ID`** — only auto-issued when the Hydrogen / Headless
> sales channel is installed. Without that channel, any non-empty placeholder
> string lets the app boot; only `getShopAnalytics` is degraded.

Restart `npm run dev` (env vars load at process start, not via HMR).

### 3. Update production env in `wrangler.toml`

Replace the `[vars]` block with the real values:

```toml
[vars]
PUBLIC_STORE_DOMAIN = "your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN = "<storefront token>"
PUBLIC_STOREFRONT_ID = "<storefront id or placeholder>"
PUBLIC_CHECKOUT_DOMAIN = "your-store.myshopify.com"
```

If you'd rather keep the token out of source control, set it as a secret
instead:

```bash
npx wrangler secret put PUBLIC_STOREFRONT_API_TOKEN
```

(Wrangler secrets override `[vars]` at runtime.)

### 4. Re-deploy

```bash
npm run deploy
```

The same `*.workers.dev` URL now serves real products, real cart, real
checkout from the client's Shopify store.

### 5. (Optional) Move to Shopify Oxygen

When the client subscribes to a paid Shopify plan and installs the
**Hydrogen sales channel**, you can switch hosting from Cloudflare Workers
to Shopify's native **Oxygen** (which is free with the plan and uses the
same Cloudflare Workers runtime under the hood).

```bash
npx shopify hydrogen link        # links the local repo to a Hydrogen storefront
npx shopify hydrogen env pull    # pulls env from Shopify into a local file
npx shopify hydrogen deploy      # deploys to Oxygen
```

No code changes required — Oxygen and our current Cloudflare Workers config
target the same runtime. You can remove `wrangler.toml` and the `wrangler`
devDependency at that point if you no longer need a fallback host.

---

## Routes

| Route                   | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `/`                     | Home (Hero, marquee, recommended, featured, editorial) |
| `/products/:handle`     | Product detail (gallery, variant selector, accordion) |
| `/collections`          | All collections                                   |
| `/collections/:handle`  | Collection PLP with sticky sort bar               |
| `/collections/all`      | All products PLP                                  |
| `/cart`                 | Full-page cart                                    |
| `/search`               | Search results                                    |
| `/account/*`            | Customer Account API routes (untouched template)  |
| `/blogs/*`              | Blog routes (untouched template)                  |
| `/policies/*`           | Shop policies (untouched template)                |

---

## Scripts

| Script                     | What it does                                              |
| -------------------------- | --------------------------------------------------------- |
| `npm run dev`              | Local dev with Mini-Oxygen + HMR                          |
| `npm run build`            | Production build (`dist/server/index.js`, `dist/client/`) |
| `npm run preview`          | Build + preview the production worker locally             |
| `npm run typecheck`        | `react-router typegen` + `tsc --noEmit`                   |
| `npm run lint`             | ESLint                                                    |
| `npm run codegen`          | Regenerate GraphQL types from `*.graphql` queries         |
| `npm run deploy`           | Build + deploy to Cloudflare Workers                      |
| `npm run cf:tail`          | Live-tail production Workers logs                         |
| `npm run cf:secret`        | Set/rotate `SESSION_SECRET` secret                        |

---

## Troubleshooting

**`npm run dev` shows 500 / "API response error: 404" on every page**
The `PUBLIC_STORE_DOMAIN` is wrong. For mock mode it must be exactly
`mock.shop` (no protocol, no path). For real Shopify it's
`<handle>.myshopify.com`.

**`Mock shop is used. Analytics will not work properly.`**
Expected message in mock mode — analytics is a no-op without a real
storefront ID. Disappears when you switch to a real store.

**`Error initializing PerfKit: Invalid storefrontId`**
Same cause as above — `PUBLIC_STOREFRONT_ID` is a placeholder. Harmless in
mock mode.

**`shopify hydrogen link` returns 401 "Service is not valid for authentication"**
The Hydrogen sales channel is not installed on the store (typical on free
Partners dev stores). Use the Custom App route in
[Switching from `mock.shop` to a real Shopify store](#switching-from-mockshop-to-a-real-shopify-store)
instead — it doesn't need the Hydrogen channel.

**Wrangler complains it can't write to `~/Library/Preferences/.wrangler`**
That's a sandbox permissions warning when running through restricted shells.
Run `npx wrangler …` directly in your normal terminal and it works fine.

---

## License

Proprietary — © CIEL Clothing.
