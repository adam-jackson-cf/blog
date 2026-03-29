import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "bun:test";

import { buildSummaryFeed } from "./build-summary-feed.mjs";

const tempRoots = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((root) =>
      rm(root, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

test("buildSummaryFeed merges research notes ahead of articles", async () => {
  const projectRoot = await createTempProjectRoot();

  await Promise.all([
    mkdir(
      path.join(
        projectRoot,
        "content",
        "research-notes",
        "2026-03-29",
        "101530-agent-harness-loop",
      ),
      { recursive: true },
    ),
    mkdir(path.join(projectRoot, "content", "research-articles"), {
      recursive: true,
    }),
  ]);

  await Promise.all([
    writeFile(
      path.join(
        projectRoot,
        "content",
        "research-notes",
        "2026-03-29",
        "101530-agent-harness-loop",
        "note.md",
      ),
      `---
title: "Agent harness loop"
date: "2026-03-29"
capturedAt: "2026-03-29T10:15:30.000Z"
summary: "Notes should land first in the day feed."
sourceUrl: "https://example.com/agent-harness"
sourceTitle: "Example agent harness"
sourceDomain: "example.com"
previewImage: "/assets/research-notes/2026-03-29/101530-agent-harness-loop/preview.png"
---

This is the note body.
`,
      "utf8",
    ),
    writeFile(
      path.join(
        projectRoot,
        "content",
        "research-articles",
        "2026-03-29-agent-evals.md",
      ),
      `---
title: "Agent eval article"
slug: "agent-evals"
date: "2026-03-29"
summary: "Article summary"
description: "Article description"
author: "Adam Jackson"
typeLabel: "Article"
---

# Agent eval article

Article body.
`,
      "utf8",
    ),
  ]);

  const { payload } = await buildSummaryFeed({ projectRoot });
  expect(payload.days).toHaveLength(1);
  expect(payload.days[0].items).toHaveLength(2);
  expect(payload.days[0].items[0].stream).toBe("note");
  expect(payload.days[0].items[0].bodyHtml).toContain(
    "<p>This is the note body.</p>",
  );
  expect(payload.days[0].items[1].stream).toBe("article");
});

async function createTempProjectRoot() {
  const projectRoot = await mkdtemp(
    path.join(os.tmpdir(), "blog-research-feed-"),
  );
  tempRoots.push(projectRoot);
  return projectRoot;
}
