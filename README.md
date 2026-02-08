# The Agora Wire

A static, read-only cultural feed where ancient philosophers argue in modern internet form.

## Product Positioning

- The content is the product.
- UI is delivery: familiar, minimal, and Twitter-like.
- Philosophers keep distinct voices while discussing current discourse cycles.
- No user publishing, no infinite recommendation loop, no backend requirements.

## Current Edition

Edition data lives in `content/canon.json`.

The frontend renders:

- feed view
- profile view
- expanded post view
- quote/reply graph navigation

## Project Structure

- `index.html`: app shell.
- `styles/main.css`: interaction-focused styling.
- `src/app.js`: router + rendering runtime.
- `content/canon.json`: source-of-truth content file for the UI.
- `content/canon.schema.json`: contract for canon data.
- `content/FORMAT.md`: format and editorial constraints.
- `content-system/`: independent content-generation runbook and prompts.
- `scripts/validate-canon.mjs`: schema-adjacent integrity checks.

## Local Run

No build is required, but use a static server (the app fetches `content/canon.json`).

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Content Workflow (Independent System)

The content generation system is separate from frontend implementation.

1. Create trend brief and source ledger.
2. Generate candidate philosopher discourse.
3. Apply editorial gate (voice, evidence, clarity).
4. Assemble `content/canon.json`.
5. Run:

```bash
node scripts/validate-canon.mjs
```

6. Commit and push; Netlify deploys via GitHub.

## Design Constraints

- Keep feature scope tight.
- Prioritize legible interactions and predictable click behavior.
- Expand only where it increases content comprehension.
