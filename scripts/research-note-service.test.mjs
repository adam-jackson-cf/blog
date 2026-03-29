import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "bun:test";

import { createResearchNoteServiceHandler } from "./research-note-service.mjs";

const tempRoots = [];
const SAMPLE_SCREENSHOT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2uoAAAAASUVORK5CYII=";

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

test("research note service writes note files, cache, and feed output", async () => {
  const projectRoot = await createTempProjectRoot();
  const handler = createResearchNoteServiceHandler({ projectRoot });

  const response = await handler(
    new Request("http://127.0.0.1:4177/api/research-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Interesting page",
        summary: "A concise note summary",
        body: "A longer note body.",
        sourceUrl: "https://example.com/research",
        sourceTitle: "Example research page",
        sourceDescription: "Example description",
        screenshotDataUrl: SAMPLE_SCREENSHOT,
        htmlSnapshot: "<html><body>example</body></html>",
        capturedAt: "2026-03-29T10:15:30.000Z",
      }),
    }),
  );

  expect(response.status).toBe(201);

  const result = await response.json();
  const noteFile = path.join(projectRoot, result.paths.noteFile);
  const cacheDir = path.join(projectRoot, result.paths.cacheDir);
  const summaryFeed = path.join(projectRoot, result.feed.outFile);
  const noteFolder = result.noteId.replace(/^2026-03-29-/, "");

  const [noteMarkdown, cachedHtml, feedData] = await Promise.all([
    readFile(noteFile, "utf8"),
    readFile(path.join(cacheDir, "page.html"), "utf8"),
    readFile(summaryFeed, "utf8"),
  ]);

  expect(noteMarkdown).toContain('title: "Interesting page"');
  expect(noteMarkdown).toContain('sourceUrl: "https://example.com/research"');
  expect(noteMarkdown).toContain(
    `screenshot: "/assets/research-notes/2026-03-29/${noteFolder}/screenshot.png"`,
  );
  expect(cachedHtml).toBe("<html><body>example</body></html>");
  expect(feedData).toContain('"stream": "note"');
  expect(result.noteId).toMatch(/^2026-03-29-\d{6}-interesting-page$/);
});

test("research note service exposes a health endpoint", async () => {
  const projectRoot = await createTempProjectRoot();
  const handler = createResearchNoteServiceHandler({ projectRoot });

  const response = await handler(
    new Request("http://127.0.0.1:4177/api/health"),
  );
  expect(response.status).toBe(200);

  const result = await response.json();
  expect(result.ok).toBe(true);
  expect(result.projectRoot).toBe(projectRoot);
});

async function createTempProjectRoot() {
  const projectRoot = await mkdtemp(
    path.join(os.tmpdir(), "blog-research-service-"),
  );
  tempRoots.push(projectRoot);
  return projectRoot;
}
