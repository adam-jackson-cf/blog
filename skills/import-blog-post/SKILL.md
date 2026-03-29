---
name: "import-blog-post"
description: "Import a supplied article into this blog as an article research-feed entry with a dedicated detail page using the repo’s canonical article layout. USE WHEN a source article markdown file must become a repo-owned research-feed item plus detail page in this project."
---

# Import Blog Post

Create the canonical article source, research-feed overview item, detail page, AGENTS registration, and required build updates for a supplied article.

- Import a new long-form article into the research feed with its own detail page.
- Create consistent repo-owned article entries from external markdown drafts.
- Apply the approved article-detail design guidance while updating the feed and site structure.

## Fixed Topic Taxonomy

Use only these canonical multi-select topic values in article frontmatter:

- `Agents`
- `Computer Use`
- `Tool Use`
- `Planning & Orchestration`
- `Memory & Context`
- `Verification & Evaluation`
- `Code Review & Static Analysis`
- `Software Delivery & Design-to-Code`

## Canonical Media Path

- Store imported article media under `content/research-articles/assets/<slug>/`.
- Reference imported media from article markdown with `./assets/<slug>/<filename>`.
- Images use standard markdown syntax: `![Caption](./assets/<slug>/<filename>)`.
- Videos use the canonical video directive: `!video[Caption](./assets/<slug>/<filename>)`.
- During generation, local media is copied into `research/<slug>/assets/` and rewritten to route-local paths for the published detail page.

## Workflow

### Step 0: Preflight Inputs

- Purpose: confirm the supplied article path, current working tree, and canonical output paths before any drafting or generation.
- When: run first for every import.
- Require a supplied article path and fail fast if it does not exist.
- Confirm the current working tree is the target repo root.
- Resolve the canonical source path as `content/research-articles/<date>-<slug>.md`, the detail route as `research/<slug>/index.html`, and the required feed and `AGENTS.md` update points.
- Inspect the supplied article for image and video references. If media is supplied separately or referenced remotely, verify it is accessible, import it into `content/research-articles/assets/<slug>/`, and rewrite the article references to the canonical local paths before generation.
- Stop if any target path is ambiguous or collides with an existing article without explicit user intent.
- Workflow: [references/step-0-preflight-workflow.md](references/step-0-preflight-workflow.md)

### Step 1: Capture Article Metadata

- Purpose: derive deterministic metadata, summary, SEO inputs, and ordering rules from the supplied article.
- When: run after preflight passes and before design or generation.
- Extract the title from the first level-1 heading when explicit metadata is absent.
- Derive the slug from the title when an explicit slug is not supplied.
- Determine the article date, source type label `Article`, and detail-page metadata.
- Select one or more canonical `topics` values from the fixed topic taxonomy and write them explicitly into article frontmatter.
- Draft one short feed summary from the article’s opening argument.
- Determine the SEO metadata inputs for title, description, canonical route, and Open Graph basics.
- Freeze the article-first ordering rule so the `Article` item renders before the standard research-feed items for the same day.
- Workflow: [references/step-1-capture-article-workflow.md](references/step-1-capture-article-workflow.md)

### Step 2: Build Design Contract

- Purpose: convert the approved local design references into explicit rules for the article detail page and feed treatment.
- When: run before implementation so the page can be built without improvisation.
- Inspect `assets/design.png`, `assets/design2.png`, `assets/factory-missions-hero.png`, `assets/factory-missions-practice.png`, and `assets/factory-missions-how-to-use.png`.
- Define the canonical detail-page structure as the shared site header with the back link on a header row above the article-title hero, plus a narrow left `On This Page` rail and a wider right reading column.
- Define the canonical feed entry as the existing collapsible research-feed item pattern with the `Article` row expanded by default, not a bespoke CTA card.
- Define typography, spacing, accent, callout, navigation, body-copy, bullet-list, and media-embed rules for the article detail page and feed entry.
- Keep the page text-led on an ivory-light canvas with thin rules, mono metadata, restrained orange markers, and no invented hero image when the source article has none.
- Apply `uncodixfy` constraints so the result stays restrained, text-led, and free of generic AI UI patterns.
- Prefer structural rules, metadata rails, and thin separators over decorative gradients, oversized pills, or invented hero graphics.
- Keep the visible left rail limited to `On This Page`; do not reintroduce topic, published, read-time, or author blocks unless the product direction explicitly changes.
- Treat the left rail as part of the normal page flow, not as a sticky or pinned sidebar.
- Place the orange article marker in the gap between the left rail and the main content column as a mini separator, and keep the `Article` label plus body copy aligned to the content edge to the right of that separator.
- Keep the article title to two lines maximum on small screens and balanced, non-truncated reading on larger screens.
- Workflow: [references/step-2-design-contract-workflow.md](references/step-2-design-contract-workflow.md)

### Step 3: Generate Article And Feed Integration

- Purpose: create the canonical article source, detail page, feed wiring, and `AGENTS.md` registration changes.
- When: run after metadata and design contract are frozen.
- Write the canonical repo-owned article source under `content/research-articles/<date>-<slug>.md`.
- Write `topics` frontmatter using only the fixed taxonomy values.
- Import referenced article media into `content/research-articles/assets/<slug>/` and ensure the article body uses the canonical local media references.
- Create the detail-page route under `research/<slug>/index.html` with any required supporting implementation files.
- Update the feed-generation path so `Article` is a first-class stream and article entries render first within a day using the standard expandable entry layout.
- Ensure the day container chrome exposes the `Article` pill when a manual article exists on that day.
- Render the detail page so the article title becomes the shared header hero, the back link sits in the header row above it, the left rail contains only `On This Page`, and the orange article marker sits between the rail and the body column.
- Add a root `AGENTS.md` skills section that references `skills/import-blog-post/SKILL.md`.
- Write the required SEO metadata into the generated detail page.
- Workflow: [references/step-3-generate-article-and-feed-workflow.md](references/step-3-generate-article-and-feed-workflow.md)

### Step 4: Verify Feed And Detail Output

- Purpose: confirm the imported article appears correctly in the research feed and detail page with the approved design treatment.
- When: run after generation and before handoff.
- Rebuild the feed data and site assets.
- Verify the feed contains the new `Article` entry on the expected day, that it renders before the standard research items for that day, and that it is expanded by default using the standard entry chrome.
- Verify the detail-page route resolves and the article content renders correctly.
- Verify the detail page uses the shared header hero with the back-link row above it, that the left rail contains only `On This Page`, and that the rail scrolls with the article instead of pinning.
- Verify the orange article marker sits in the inter-column gap and that the `Article` label and body text start on the same left edge.
- Verify the detail page includes the required SEO metadata.
- Run browser-based functional and visual checks with `playwright-interactive` against the feed item, the article pill treatment, the shared site header, the detail page, and a mobile viewport.
- Workflow: [references/step-4-verify-and-register-workflow.md](references/step-4-verify-and-register-workflow.md)
