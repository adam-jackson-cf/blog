# Step 3 Workflow: Generate Draft Video

## Objective

Implement the approved motion contract in a repo-local workspace and render the first preview.

## Required actions

1. Create or update the article workspace under `video-workspaces/<slug>/`.
2. Use Bun inside that workspace to create or update the local `package.json` and install the required Remotion and `motion/react` dependencies when they are absent.
3. Implement the approved composition, scenes, captions, and animated diagrams.
4. Use Remotion for sequencing and rendering, and `motion/react` for scene-level animation.
5. Render a draft `16:9` silent MP4 and export representative still frames for preview review.
6. Keep the video text-led unless the user explicitly asked for audio.

## Done when

- The workspace exists and is runnable.
- The composition implements the approved motion contract.
- A draft MP4 exists.
- Still frames exist for review.
