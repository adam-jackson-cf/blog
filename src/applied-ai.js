import {
  bindEntryToggles,
  escapeHtml,
  renderCollapsibleEntry,
  renderEmptyState,
  renderPageShell,
} from "./ui.js";

const app = document.querySelector("#app");

const PRACTICES = [
  {
    title: "Verified starting base",
    definition:
      "Start from a known-good baseline before introducing agentic changes. Avoid AI-generated scaffolding unless it is validated against a deterministic template.",
    good: [
      "Project scaffolding comes from maintained templates or proven generators. There are many established cli’s and templates for starting most projects.",
      "Baseline builds and tests pass before agentic work starts.",
      "Dependencies and toolchain versions are pinned where appropriate.",
    ],
  },
  {
    title: "Implementation as first class documentation",
    definition:
      "LLMs don’t require human readable instructions and documentation adds maintenance overhead and risk of context poisoning. Developer need for documentation is usually better served by creating a prompt that will surface up to date information than documents that get largely ignored after onboarding.",
    good: [
      "Shared prompt that can be used for gaining project knowledge for onboarding.",
      "No documentation that repeats easy to infer implementation that creates overhead or risk of doc drift.",
      "AGENTS.md or equivalent: only contain high level repo map (use judgement, can cause issues), non standard workflows specific to the project, LLM/Developer coding guidance to complement or reinforce automated process i.e. linting or to define rules for automated code reviews.",
    ],
  },
  {
    title: "Guidance via system docs, but favour verification tools",
    definition:
      "System docs e.g. AGENTS.md, copilot.instructions.md are still useful for project behaviour and coding guidance where deterministic tools like linting are insufficient or are required to guide LLM based code review mechanisms.",
    good: [
      "Rules should be conceptually true or false with no mention of exceptions, even if exist (save these for at time of implementation request)",
      "Rules dilute context, minimise what you can, use progressive disclosure where possible.",
      "Rules should never be used instead of deterministic tools if the latter is possible - never include lintable rules.",
      "Conceptual rules benefit from concise examples of good.",
      "Pattern and framework rules are largely ignored and some already baked in, ive seen no benefit to mentioning SOLID etc even in detail.",
    ],
  },
  {
    title: "Planning is fundamental",
    definition: "Agentic tasks start with explicit intent, constraints, and acceptance checks.",
    good: [
      "Clear goal, non-goals, constraints (security, compliance, client/tool limits), and acceptance criteria.",
      "Verification plan: what you will run locally/CI, and what outcomes prove success.",
      "Large planning tasks are useful for team/own project understanding, but keep build execution free for large planning artefacts (see context efficiency)",
      "Review/discuss plans ahead of execution - it’s your opportunity to course correct.",
    ],
  },
  {
    title: "Context efficiency",
    definition:
      "Keep context to the minimum required to complete the task successfully; avoid diluting critical information with noise.",
    good: [
      "Avoid tools that obfuscate context usage and/or actions that have been carried out - anything that impacts your ability to context engineer.",
      "Avoid MCP for non experimental, permanent, multi step workflows - tool definitions waste context and LLMs haven’t been trained on them (higher tool failure rate) - replace with bash implementation (LLMs highly trained on bash usage). If MCP must be used then use a tool like mcporter",
      "Try and keep your context session usage to the magic 40% mark, over this threshold models tend to become dumber.",
      "Separate large planning and build execution into separate sessions - avoid polluting build tasks.",
      "Prefer planning artefacts over residing in context, better for context and multi session driving.",
      "Avoid overly polluting system files i.e. AGENTS.md",
      "Can rules be moved to an automated process?",
      "Can I use progressive disclosure?",
      "Am I following the implementation as documentation guidance?",
      "If a session context becomes poisoned (picks up incorrect or irrelevant info) consider starting a fresh and using previous session as guidance on what not to do. Restarting is now a low effort cost.",
      "Try and keep the session task encapsulated, start > action > complete > reset.",
    ],
  },
  {
    title: "Verification as first class requirement",
    definition:
      "Verification at all stages is essential and prefer those with tangible outcomes, they are more trustworthy. This should predominantly be via deterministic code actions that avoid being bypassed or gamed (LLM reward hacking is a problem).",
    good: [
      "Local verification mirrors CI.",
      "Verification must include some integration/smoke test",
      "Automated code reviews are conducted and have clear guidance",
      "Verification scope is proportional to risk and change size",
      "Teams optimise for catching regressions early",
      "Regular reviews of quality exceptions which are then codified back into the project (this can be automated).",
    ],
  },
  {
    title: "Agentic harnesses (ide chat, cli’s etc)",
    definition:
      "Prefer tooling that is transparent and inspectable: you should be able to see prompts, tool calls, and execution steps, and reproduce results.",
    good: [
      "System prompts and tool configuration are visible and versioned.",
      "Workflows can be repeated by another engineer with the same inputs.",
      "Open-source harnesses are preferred where they reduce obfuscation and lock-in; proprietary harnesses are acceptable with mitigations.",
      "Remember you are responsible for LLM actions, you want visibility.",
      "Avoid lockin, We are still early in AI sector maturity - a sought after feature in one tool is often adopted wider shortly after!",
    ],
  },
  {
    title: "Compliment LLM actions with deterministic code where possible",
    definition:
      "Prefer code based workflows that minimise context pollution and make execution explicit e.g. rules in linting vs rules in AGENTS.md. Look for opportunities to mitigate LLM weakness - LLM strength is in analysis, scale and contextual awareness, its weakness is consistency and actions are costly.",
    good: [
      "Permanent workflows are implemented as scripts/commands with clear inputs/outputs.",
      "Tooling mitigates LLM weaknesses",
      "Tooling reduce token costs",
      "LLMs often duplicate code that shares intention (most search by string, not intention) and create God classes - be mindful of this and try to use tools that mitigate. Often this is picked up and correct at the automated code review stage.",
    ],
  },
  {
    title: "Observability - empower LLMs with feedback",
    definition:
      "LLMs are best achieving desired outcomes through brute force, provide mechanisms so they can get feedback on work carried out and course correct where needed. Empower the agent to fix itself, continually review this for new opportunities to automate surfacing bad behaviour.",
    good: [
      "Access to dev logs i.e. simple make commands that grab log contents (made aware of option through system file i.e. AGENTS.md)",
      "Automated quality gates i.e. linting provides feedback, set precommit hooks",
      "Explore the use of LSP’s via automated feedback at symbol creation",
      "If your agent supports it, explore the use of Stop hooks to add JIT quality checking and reinforcement.",
      "Use libraries that enable component capture, ui testing steps and screenshot capture (Browser skill React Grab) - dont use mcps versions, they do the same but less effective!",
    ],
  },
].map((practice) => ({
  ...practice,
  bodyHtml: renderPracticeBody(practice.definition, practice.good),
}));

if (!app) {
  throw new Error("App root not found.");
}

createAppliedAiPage(app, PRACTICES);

function createAppliedAiPage(root, items) {
  const openEntries = new Set();

  root.innerHTML = renderPageShell({
    railBrand: "Applied AI: Learnings in Enterprise",
    railChip: "Reference list",
    railNote: `${items.length} practices`,
    navActive: "applied-ai",
    siteRoot: "../",
    mainContent: `
      <section class="practice-stack">
        <div class="day-entries day-entries-latest practice-panel">
          <div class="day-entries-chrome">
            <span class="day-entries-dot" aria-hidden="true"></span>
            <p class="day-entries-label">AI SDLC / Applied AI</p>
          </div>
          <div id="practice-list" class="entry-grid"></div>
        </div>
      </section>
    `,
  });

  const list = root.querySelector("#practice-list");

  if (!list) {
    root.innerHTML = renderEmptyState("Could not render the applied AI list.");
    return;
  }

  bindEntryToggles(list, openEntries, render);
  render();

  function render() {
    list.innerHTML = items
      .map((item, index) =>
        renderCollapsibleEntry(item, {
          entryKey: `practice:${index}`,
          isExpanded: openEntries.has(`practice:${index}`),
        }),
      )
      .join("");
  }
}

function renderPracticeBody(definition, points) {
  return `
    <div class="practice-detail-grid">
      <div class="practice-detail-column">
        <p class="practice-detail-label">Definition</p>
        <p class="entry-copy">${escapeHtml(definition)}</p>
      </div>
      <div class="practice-detail-column">
        <p class="practice-detail-label">What “good” looks like</p>
        <ul class="entry-points">
          ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}
