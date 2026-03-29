# Step 3 Workflow: Generate Article And Feed Integration

## Objective

Create the repo artifacts needed for a canonical `Article` entry, its detail page, and its registration in the project.

## Required actions

1. Write the canonical article source file.
2. Write `topics` frontmatter using only the fixed taxonomy values.
3. Import article media into `content/research-articles/assets/<slug>/` and ensure markdown references use the canonical local media paths.
4. Create the detail-page route and supporting implementation files.
5. Update feed wiring so `Article` is a first-class stream using the standard expandable entry layout.
6. Ensure `Article` appears as the day pill type when present and orders before standard research items.
7. Render the detail page with a section-level shared-header hero, the article title at the top of the body column, a non-sticky left rail whose lead item is the back link above the table of contents, and the orange article marker centered in the gap between rail and content.
8. Add root `AGENTS.md` registration for the local skill.
9. Write the canonical SEO metadata into the detail page.

## Done when

- The canonical article source exists.
- The article frontmatter includes valid `topics`.
- Imported media sits in the canonical article asset path when media is present.
- The detail-page route exists.
- The detail page matches the canonical header, rail, and marker layout.
- The feed wiring includes the `Article` stream.
- The detail page includes the required SEO metadata.
- The `AGENTS.md` skill reference exists.
