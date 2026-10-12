# Top10 — Curated Directory of Ranked Tools & Websites

**Top10** is a modern, high-performance web application featuring curated and algorithmically ranked "Top 10" lists of tools, software, and websites across categories like **AI & Technology**, **Productivity**, and **Education**.

The platform combines automated tool discovery via **Google Gemini with Google Search grounding** and public developer APIs (GitHub stars, Hacker News Algolia) with human-in-the-loop curator approvals, community upvotes, and weekly URL health monitoring.

---

## ✨ Features

- **Redesigned Overview Home**:
  - Compact hero with headline and search input.
  - Interactive **⌘K / Ctrl+K** instant keyboard search dialog with 150ms debounce and arrow-key navigation.
  - Horizontally scrollable category filter chips.
  - Desktop sticky category navigation sidebar and mobile slide-in drawer.
  - **Trending This Week** section (ranked by view count and upvotes) and **New Lists** section.
  - Category sections displaying responsive grids of Top 10 list cards with overlapping tool avatars and "+7 more".
- **Ranked List Page (`/list/:slug`)**:
  - Numbered rows 1 to 10 with gold/emerald rank badges.
  - Verified logos, one-line descriptions (<140 chars), pricing tags (`Free`, `Freemium`, `Paid`), algorithmic quality scores, and external links.
  - Optimistic **Upvote** toggle that recalculates tool scores in real time.
  - Sorting: *Ranked (1-10)*, *Newest*, and *Free Only*.
  - Native **Web Share API** with clipboard fallback toast.
  - Rich **JSON-LD `ItemList`** schema and meta tags for Google Search indexing.
  - Related lists recommendations.
- **Category Page (`/category/:slug`)**:
  - Dedicated directory page with category statistics and sorting (Most Popular, Recently Updated, Name A-Z).
- **Tool Submission (`/submit`)**:
  - Community tool recommendation form with URL auto-fill metadata inspection.
  - Domain deduplication and validation. Staged to `tools_staging` for curator review.
- **Admin Control Center (`/admin`)**:
  - **Review Queue**: Table of staged candidates with inline editing, one-click approve/reject, and bulk approval threshold.
  - **Manage Lists**: Reorder tool ranks 1-10, add/remove tools, toggle trending pins.
  - **Live Auto-Fetch Terminal**: Trigger discovery pipeline with real-time log streaming.
  - **Dead-Link Report**: Automatic 404/DNS error detection with one-click link replacement or removal.
- **Built-in Mock Fallback & Demo Switcher**:
  - Works 100% out-of-the-box in the browser using reactive local storage before Supabase credentials are configured.
  - One-click role switcher between **User** and **Admin** in demo mode.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, React Router DOM, Motion.
- **Design Tokens**: Dark minimal theme (Background `#0a0a0a`, Cards `#111111`, Borders `#1f1f1f`, Accent `#10b981` Emerald, Font `Inter`).
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, pg_cron, pg_net).
- **Edge Function**: Deno TypeScript runtime (`supabase/functions/fetch-tools`).
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`) with Google Search Grounding.

---

## 🧮 Ranking Score Algorithm

Every tool receives a composite quality score (0–100) calculated by:

$$\text{Score} = 0.40 \times \text{Popularity} + 0.30 \times \text{Recency} + 0.20 \times \text{Growth} + 0.10 \times \text{Manual Boost}$$

- **Popularity (40%)**: Normalized by verified community upvotes and organic click-throughs.
- **Recency (30%)**: Freshness decaying over time since the last verified health check.
- **Growth (20%)**: GitHub star velocity, Hacker News front-page presence, and Product Hunt signals.
- **Manual Boost (10%)**: Curator-assigned editorial weights for standout usability.

---

## 🚀 Setup & Deployment Guide

### 1. Local Development (Mock Mode)

The application starts immediately with realistic seed data:

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server on port 3000
npm run dev
```

Visit `http://localhost:3000`. You can immediately browse lists, submit tools, test search (⌘K), and test the admin review queue.

---

### 2. Supabase Backend Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of `supabase/schema.sql`. This will:
   - Create enums: `pricing_tier`, `tool_status`, `user_role`.
   - Create tables: `categories`, `tools`, `lists`, `list_items`, `profiles`, `upvotes`, `bookmarks`, `tools_staging`.
   - Apply Row Level Security (RLS) policies and security functions.
   - Seed the database with 3 categories and 12 ranked Top 10 lists.
4. Copy and run `supabase/cron.sql` to activate the `pg_cron` jobs:
   - Daily discovery crawler at 02:00 AM UTC.
   - 6-hour ranking score recomputation.
   - Weekly Sunday URL health check at 04:00 AM UTC.
5. In your project settings, copy `Project URL` and `anon public key` into your `.env` file:
   ```env
   VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```

---

### 3. Deploying the Supabase Edge Function (`fetch-tools`)

All Gemini calls, search grounding, and service-role writes run securely inside the Edge Function. Client code never receives server keys.

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
2. Link your local project:
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```
3. Set your Edge Function secrets:
   ```bash
   supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
4. Deploy the function:
   ```bash
   supabase functions deploy fetch-tools --no-verify-jwt
   ```

You can now trigger automated tool fetching either via the scheduled cron in `supabase/cron.sql` or by pressing **"Run fetch now"** in the `/admin` panel!

---

### 4. Deploying Frontend to Netlify

1. Connect your GitHub repository to [Netlify](https://www.netlify.com).
2. Set the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add environment variables in Netlify site settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add a `_redirects` file or Netlify rule for single page applications:
   ```text
   /*    /index.html   200
   ```
5. Click **Deploy**.

---

## 🔒 Security & Anti-Abuse Measures

- **Zero Client-Side Secrets**: Gemini keys and Supabase `service_role` keys are stored only in server-side Edge environments.
- **RLS Enforced**: Database queries strictly filter by `status = 'approved'` for unauthenticated public visitors.
- **Domain Deduplication**: Prevents duplicate submissions and crawler collisions across both active tools and staging queue.
- **HTML Sanitization**: External crawled HTML is parsed safely and never rendered directly via raw `innerHTML`.
- **Keyboard & Screen Reader Accessible**: Visible focus rings (`focus:ring-[#10b981]`), semantic HTML headings, and ARIA labels on all interactive controls.
