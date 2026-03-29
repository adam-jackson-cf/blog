import { expect, test } from "bun:test";

import { renderCollapsibleEntry } from "./ui.js";

test("renderCollapsibleEntry shows note preview media and source metadata", () => {
  const html = renderCollapsibleEntry(
    {
      stream: "note",
      title: "Research note",
      bodyHtml: "<p>Captured body.</p>",
      sourceLinks: [
        { label: "example.com", url: "https://example.com/article" },
      ],
      sourceTitle: "Example article",
      sourceDomain: "example.com",
      previewImage:
        "/assets/research-notes/2026-03-29/101530-research-note/preview.png",
      favicon:
        "/assets/research-notes/2026-03-29/101530-research-note/favicon.ico",
    },
    { entryKey: "note-1", isExpanded: true },
  );

  expect(html).toContain("entry-note-media");
  expect(html).toContain("entry-note-favicon");
  expect(html).toContain("example.com");
  expect(html).toContain(
    "/assets/research-notes/2026-03-29/101530-research-note/preview.png",
  );
});

test("renderCollapsibleEntry keeps non-note rows free of note media markup", () => {
  const html = renderCollapsibleEntry(
    {
      stream: "blog-arxiv",
      title: "External item",
      summary: "Summary only.",
      sourceLinks: [
        { label: "arxiv.org", url: "https://arxiv.org/abs/1234.5678" },
      ],
    },
    { entryKey: "external-1", isExpanded: true },
  );

  expect(html).not.toContain("entry-note-media");
  expect(html).not.toContain("entry-note-favicon");
});
