---
name: "create-motion-video"
description: "Create and embed a motion explainer video for an existing blog article. USE WHEN the user explicitly asks to use `create-motion-video` for an article in this project."
---

# Create Motion Video

Create an article-specific supporting video by turning an existing blog article into a storyboarded Remotion composition with `motion/react` scene animation, preview feedback rounds, a final render, and canonical article embedding.

- Create a diagram walkthrough video that clarifies a research article's system, lifecycle, or decision flow.
- Create a short technical explainer video that focuses on one article argument, framework, or comparison.
- Create a blog-specific supporting video that matches the site's editorial design language and embeds back into the article.

## Supporting References

- Scenario selection: [references/scenario-selection-guide.md](references/scenario-selection-guide.md)
- Good examples: [references/good-examples.md](references/good-examples.md)
- Blog design alignment: [references/blog-design-alignment.md](references/blog-design-alignment.md)
- Animation recipes: [references/animation-recipes.md](references/animation-recipes.md)
- Accessibility rules: [references/accessibility-checklist.md](references/accessibility-checklist.md)
- Performance rules: [references/performance-guardrails.md](references/performance-guardrails.md)
- Storyboard template: [assets/templates/storyboard-template.md](assets/templates/storyboard-template.md)
- Scene plan template: [assets/templates/scene-plan-template.md](assets/templates/scene-plan-template.md)
- Motion contract template: [assets/templates/motion-contract-template.md](assets/templates/motion-contract-template.md)

## Workflow

### Step 0: Preflight Article And Workspace

- Purpose: confirm the article input, repo-local workspace root, dependency surface, and canonical output paths before storyboarding or implementation.
- When: run first for every video request.
- Require an existing article path in this repo and a user-supplied video focus.
- Derive the article slug and canonical final asset directory as `content/research-articles/assets/<slug>/`.
- Resolve the repo-local video workspace root as `video-workspaces/<slug>/`.
- Stop for user intent if the same focus already has a supporting video or if target filenames would collide.
- Treat any supplied external repo or project paths as optional supporting context only, not required dependencies.
- Workflow: [references/step-0-preflight-workflow.md](references/step-0-preflight-workflow.md)

### Step 1: Capture Brief And Storyboard

- Purpose: narrow the requested video to one strong explanatory narrative and turn it into a deterministic storyboard before implementation.
- When: run after Step 0 passes and before any implementation work.
- Ask clarifying questions until the video focus, audience, and core takeaway are concrete.
- Use the article structure and any optional supporting context to identify the concepts, comparisons, diagrams, or flows worth animating.
- Select the best scenario pattern from the bundled scenario guide.
- Produce a storyboard that defines scene order, scene purpose, on-screen text, visual metaphor, and target runtime.
- **STOP** and ask the user to tighten scope if the requested focus is still too broad for a 45-90 second supporting video.
- Workflow: [references/step-1-capture-brief-and-storyboard-workflow.md](references/step-1-capture-brief-and-storyboard-workflow.md)

### Step 2: Build Motion Contract

- Purpose: convert the approved storyboard into an explicit scene-by-scene implementation contract aligned to the blog's editorial design language.
- When: run after the storyboard is approved and before draft generation.
- Define composition format, scene durations, transition rules, caption density, and motion primitives for each scene.
- Align typography, spacing, palette, and pacing to the blog's editorial and technical visual language rather than generic marketing motion.
- Apply reduced-motion, transform-and-opacity-first, and performance guardrail rules.
- Define the article embed location and deterministic final filename for the rendered video.
- Define the required draft preview outputs as one draft MP4 plus representative still frames.
- Workflow: [references/step-2-build-motion-contract-workflow.md](references/step-2-build-motion-contract-workflow.md)

### Step 3: Generate Draft Video

- Purpose: create or update the repo-local video workspace, implement the approved motion contract, and render a draft preview.
- When: run after the motion contract is explicit.
- Create or update the Remotion workspace under `video-workspaces/<slug>/`.
- Install or verify the required Bun-managed dependencies for Remotion and `motion/react` if they are absent.
- Implement the approved composition, scenes, captions, and animated diagrams using Remotion for sequencing and `motion/react` for scene animation.
- Render a draft `16:9` silent MP4 at the approved runtime and export representative still frames for review.
- Keep the video text-led unless the user explicitly asks for audio.
- Workflow: [references/step-3-generate-draft-video-workflow.md](references/step-3-generate-draft-video-workflow.md)

### Step 4: Review Preview And Iterate

- Purpose: use draft renders to gather user feedback and iterate before final embed.
- When: run immediately after the first draft render and repeat until approval.
- Present the draft MP4 and still frames to the user for feedback.
- Capture requested changes to story emphasis, pacing, labels, scene order, design alignment, or motion restraint.
- Iterate the workspace and re-render previews until the user approves the result or the brief must be narrowed.
- **STOP** and ask for a tighter brief if requested changes conflict with the approved narrative, scope, or runtime.
- Workflow: [references/step-4-preview-feedback-workflow.md](references/step-4-preview-feedback-workflow.md)

### Step 5: Finalize Render And Embed

- Purpose: produce the approved final asset and embed it into the article using the repo's canonical video directive.
- When: run only after preview approval.
- Render the final MP4 from the approved composition.
- Copy the final asset into `content/research-articles/assets/<slug>/` using the approved deterministic filename.
- Insert or update one canonical `!video[Caption](./assets/<slug>/<filename>)` directive at the approved embed location in the article markdown.
- Preserve the article copy and structure while embedding the supporting video.
- Workflow: [references/step-5-finalize-and-embed-workflow.md](references/step-5-finalize-and-embed-workflow.md)

### Step 6: Verify Video Integration

- Purpose: confirm the final render, canonical asset path, article embed, and front-end playback all work correctly.
- When: run after final embedding and before handoff.
- Verify the final asset exists in the canonical article media path and the article markdown references it correctly.
- Rebuild the relevant article outputs and confirm the video renders on the article detail page.
- Run browser-based playback and visual checks, including a mobile viewport pass.
- Confirm there are no broken media paths, duplicate embeds, or regressions from the approved preview.
- Workflow: [references/step-6-verify-video-integration-workflow.md](references/step-6-verify-video-integration-workflow.md)
