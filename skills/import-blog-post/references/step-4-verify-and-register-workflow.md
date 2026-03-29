# Step 4 Workflow: Verify Feed And Detail Output

## Objective

Confirm the new `Article` entry is visible, ordered correctly, routed correctly, and visually aligned with the approved design contract.

## Required actions

1. Rebuild data and assets.
2. Verify the feed entry is present on the correct day.
3. Verify the `Article` entry orders before the standard research items for that day and is expanded by default using the standard entry chrome.
4. Verify the detail-page route, shared site header, `On This Page` rail, and article rendering.
5. Verify title, meta description, canonical URL, and Open Graph basics are present on the detail page.
6. Verify imported media renders correctly when present.
7. Verify the back link sits above the hero title, the TOC rail scrolls with the page, and the orange article marker sits in the inter-column gap with the label and body text aligned to the same content edge.
8. Run browser-based visual and functional checks with `playwright-interactive`, including a mobile viewport pass.

## Done when

- The feed includes the new `Article` entry.
- The entry order is correct within the day container.
- The entry is expanded by default and behaves like the standard collapsible feed items.
- The detail page renders correctly.
- The detail page header, rail, and inter-column marker layout verify cleanly.
- SEO metadata verification passes.
- Media verification passes when media is present.
- Functional and visual verification pass.
