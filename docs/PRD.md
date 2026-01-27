# Garden Planner Web App

## 1. Purpose
Create a **stand‑alone, client‑side web application** that generates a personalized garden plan and a Gantt‑style implementation schedule. The user supplies:

- **USDA Hardiness Zone** – to filter climate‑compatible crops.
- **Recipe Preference** – vegetarian, mixed, chicken, supplemental.
- **Household Size & Consumption Goals** – defines how much produce is needed.
- **Garden Size** – *optional*.
  - If the user leaves this field blank (or selects “TBD”), the app estimates a garden size sufficient to meet the specified goals.

The app outputs:

1. A list of plants with seed counts and planting dates.
2. A visual Gantt chart of sowing, transplanting, harvesting, and maintenance tasks.
3. PDF (or other) export of the complete plan.

No user accounts or server‑side data storage are required; everything runs locally in the browser.

## 2. Target Audience
- Home gardeners and hobbyists.
- Families looking to plan seasonal produce.
- Anyone wanting a quick, offline garden planning tool.

## 3. Key Features (Client‑Side Only)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Input Form** | USDA zone, recipe type, household size, optional garden square footage or “TBD”. | High |
| **Plant & Recipe Data** | JSON files bundled with the app. Contains USDA hardiness ranges, seed density, crop windows, and recipe‑crop mapping. | High |
| **Plan Engine** | Calculates required seed counts, estimates garden size if needed, and schedules tasks. | High |
| **Gantt Chart** | Interactive timeline (plain JavaScript, HTML5, CSS). Allows drag‑and‑drop of dates. | High |
| **Export** | Generate PDF of the plan (client‑side PDF library). | Medium |
| **Responsive UI** | Works on desktop and mobile browsers. | High |

## 4. User Flow (Single Page App)

1. **Start** – User lands on the page.
2. **Provide Inputs** – Fill out zone, recipe, household size, garden size (optional).
3. **Generate Plan** – Click “Create Garden Plan”.
4. **View Results** – Table of crops + Gantt chart appear.
5. **Adjust (Optional)** – Drag dates or change quantities.
6. **Export** – Click “Download PDF” to save the plan.

No authentication or server‑side persistence; the app stores state only in memory and optionally in the browser’s `localStorage` for quick reloads.

## 5. Technical Architecture

| Layer | Stack | Notes |
|-------|-------|-------|
| **Frontend** | Plain JavaScript (ES6+), HTML5, CSS3 | No frameworks; modular ES modules. |
| **State** | In‑memory objects + optional `localStorage` | Persists user inputs between page loads. |
| **Data Files** | `plants.json`, `recipes.json`, `zone_map.json` | Bundled in the repo, served statically. |
| **Chart Library** | Lightweight JS chart (e.g., Chart.js or a custom SVG implementation) | Gantt timeline. |
| **PDF Generation** | jsPDF or html2pdf.js | Client‑side PDF export. |
| **Hosting** | Cloudflare Pages (static site) | CI/CD via GitHub Actions – push → build (bundler) → deploy. |
| **Build Tool** | Rollup or Vite (ES modules → single bundle) | Minify, tree‑shake unused code. |
| **Testing** | Jest + JSDOM | Unit tests for engine logic, integration tests for UI. |

## 6. Data Model (JSON)

```json
// plants.json
[
  {
    "id": 1,
    "name": "Tomato",
    "min_zone": 5,
    "max_zone": 11,
    "seed_per_sqft": 30,
    "grow_window": {"start_month": 4, "end_month": 10},
    "companions": [2, 3]
  },
  ...
]

// recipes.json
[
  {
    "id": "veg",
    "name": "Vegetarian",
    "required_crops": [1, 4, 7]
  },
  ...
]
```

## 7. Implementation Steps

1. **Project Scaffold** – Initialize repo, add static folder, create `index.html`, `app.js`.
2. **Build System** – Set up Rollup/Vite to bundle modules.
3. **Data Import** – Load JSON files via `fetch` during app init.
4. **UI** – Build form, table, Gantt container.
5. **Engine** – Write algorithms to:
   - Filter crops by zone.
   - Match recipes to crops.
   - Calculate seed counts based on household size and garden size.
   - Estimate garden size if “TBD”.
   - Schedule tasks with dates.
6. **Chart Rendering** – Render Gantt chart, add drag‑and‑drop.
7. **Export** – Hook PDF library to generate a downloadable PDF.
8. **Persistence** – Save user inputs to `localStorage` for convenience.
9. **Testing** – Unit tests for engine logic; E2E tests with Puppeteer.
10. **CI/CD** – GitHub Actions workflow: lint → test → build → deploy to Cloudflare Pages.

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Plan Generation Time | < 3 s |
| User Retention (30 days) | > 40 % (via localStorage visits) |
| PDF Export Rate | > 15 % of sessions |
| Bug Rate | < 0.5 % |

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Browser compatibility | Test on Chrome, Firefox, Safari, Edge; use polyfills if needed. |
| Large data files | Bundle JSON efficiently; use compression on Cloudflare. |
| Offline use | All assets are static; works without network after first load. |

---

Feel free to modify any section before we start coding.
