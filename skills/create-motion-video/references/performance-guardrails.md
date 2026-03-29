# Performance Guardrails

Apply these rules whenever you implement or revise the video workspace.

- Prefer transform and opacity animation over layout-triggering properties.
- Keep simultaneous animated elements limited to the smallest set needed for clarity.
- Reuse scene structure and motion primitives instead of inventing bespoke animation for every state.
- Avoid unnecessary blur, shadow, or filter animation.
- Keep SVG path counts and text density under control in diagram scenes.
- Render representative still frames early so visual complexity problems surface before the final export.
- Remove motion that does not improve comprehension.
