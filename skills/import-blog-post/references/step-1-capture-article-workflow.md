# Step 1 Workflow: Capture Article Metadata

## Objective

Derive deterministic metadata, summary, SEO inputs, and ordering rules from the supplied article.

## Required actions

1. Extract the title and article body from the supplied markdown.
2. Determine or derive the slug and date.
3. Set the source type label to `Article`.
4. Select one or more `topics` values from the fixed taxonomy: `Agents`, `Computer Use`, `Tool Use`, `Planning & Orchestration`, `Memory & Context`, `Verification & Evaluation`, `Code Review & Static Analysis`, `Software Delivery & Design-to-Code`.
5. Draft the feed summary from the opening argument.
6. Determine SEO metadata inputs from the article title, opening argument, and canonical route.
7. Freeze the article-first ordering rule for mixed-source days.

## Done when

- The title, slug, date, and type label are concrete.
- The `topics` selection is concrete and uses only the fixed taxonomy.
- The feed summary is concrete.
- The detail-page metadata is explicit.
- SEO metadata inputs are explicit.
- The article-first day-ordering rule is fixed.
