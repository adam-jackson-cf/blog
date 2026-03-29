# Step 0 Workflow: Preflight Article And Workspace

## Objective

Confirm the article input, workspace root, dependency status, and canonical output paths before any storyboarding or generation.

## Required actions

1. Validate that the supplied article path exists, lives in this repo, and is a research article markdown file.
2. Require a user-supplied video focus before any storyboard work begins.
3. Derive the article slug, canonical asset directory `content/research-articles/assets/<slug>/`, and workspace root `video-workspaces/<slug>/`.
4. Inspect the article markdown for existing `!video[...]()` directives and stop for user intent if the same focus already has a supporting video or if filenames would collide.
5. Treat any supplied external repo or project path as optional supporting context only.
6. Determine whether the workspace already contains a Bun-managed Remotion and `motion/react` setup or whether Step 3 must create it.

## Done when

- The article input is valid.
- The workspace and asset paths are explicit.
- Collision behavior is explicit.
- Dependency expectations for Step 3 are explicit.
