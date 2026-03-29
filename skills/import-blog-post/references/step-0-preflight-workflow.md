# Step 0 Workflow: Preflight Inputs

## Objective

Confirm the supplied article input exists, the current working tree is correct, and all canonical output paths are explicit before generation.

## Required actions

1. Validate the supplied article path.
2. Confirm the current working tree is the target repo root.
3. Resolve the canonical article source, detail route, feed integration, and `AGENTS.md` paths.
4. Inspect the article for image and video references, verify any referenced media is accessible, and import it into `content/research-articles/assets/<slug>/` before generation.
5. Fail fast on missing article input, inaccessible media, or ambiguous output targets.

## Done when

- The supplied article path exists.
- The current working tree is confirmed.
- Canonical output paths are explicit.
- Referenced media has either been imported to the canonical asset path or confirmed unnecessary.
- No required target path remains ambiguous.
