import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildSummaryFeed } from "./build-summary-feed.mjs";
import { saveResearchNoteCapture } from "./research-note-utils.mjs";

const DEFAULT_PORT = 4177;
const DEFAULT_HOSTNAME = "127.0.0.1";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function createResearchNoteServiceHandler({
  projectRoot = process.cwd(),
} = {}) {
  return async function handleRequest(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return jsonResponse(
        {
          ok: true,
          projectRoot,
          now: new Date().toISOString(),
        },
        { status: 200 },
      );
    }

    if (request.method === "POST" && url.pathname === "/api/research-notes") {
      return handleCreateResearchNote(request, { projectRoot });
    }

    return jsonResponse(
      {
        error: `Unknown route: ${request.method} ${url.pathname}`,
      },
      { status: 404 },
    );
  };
}

export function startResearchNoteService({
  projectRoot = process.cwd(),
  port = Number(process.env.RESEARCH_NOTE_SERVICE_PORT || DEFAULT_PORT),
  hostname = process.env.RESEARCH_NOTE_SERVICE_HOST || DEFAULT_HOSTNAME,
} = {}) {
  const handler = createResearchNoteServiceHandler({ projectRoot });

  return Bun.serve({
    hostname,
    port,
    fetch: handler,
  });
}

async function handleCreateResearchNote(request, { projectRoot }) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      {
        error: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  try {
    const saveResult = await saveResearchNoteCapture({
      projectRoot,
      capture: payload,
    });
    const buildResult = await buildSummaryFeed({ projectRoot });

    return jsonResponse(
      {
        ok: true,
        noteId: saveResult.noteId,
        paths: {
          noteFile: path.relative(projectRoot, saveResult.noteFile),
          cacheDir: path.relative(projectRoot, saveResult.cacheDir),
          publicPaths: saveResult.publicPaths,
        },
        assetErrors: saveResult.assetErrors,
        feed: {
          outFile: path.relative(projectRoot, buildResult.outFile),
          generatedAt: buildResult.payload.generatedAt,
          dayCount: buildResult.payload.days.length,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const status = isValidationError(error) ? 400 : 500;
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown server error.",
      },
      { status },
    );
  }
}

function isValidationError(error) {
  const message = error instanceof Error ? error.message : "";
  return (
    /valid JSON/i.test(message) ||
    /Capture payload/i.test(message) ||
    /source URL/i.test(message) ||
    /data URL asset/i.test(message)
  );
}

function jsonResponse(body, { status = 200 } = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const server = startResearchNoteService();
  console.log(
    `Research note service listening on http://${server.hostname}:${server.port}`,
  );
}
