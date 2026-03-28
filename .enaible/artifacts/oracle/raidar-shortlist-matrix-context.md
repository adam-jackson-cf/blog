# Objective

Analyze a shortlist of open-source or low-cost evaluation frameworks relative to RAIDAR, then devise a suitable capability/feature comparison matrix and score each framework against it.

# Constraints

- Treat this as a technical framework comparison for software delivery and agentic delivery evaluation.
- Prioritize open-source or low-cost options.
- Focus on capability fit, not only popularity.
- Use the supplied source links and facts directly; do not rely on local filesystem references.
- Be explicit where a framework is adjacent but not a direct substitute.
- Prefer practical, discriminating criteria over generic benchmark checklists.

# Target System: RAIDAR

RAIDAR is designed to:

- identify harness-engineering improvements for common project delivery tasks
- determine which harness + model pairs are best for a given task
- define scenarios (delivery task) and run experiments (scenario + harness + model runs) with a user-defined metric schema
- provide a flexible framework to address capability, suitability, and optimisation across project, harness, and model vectors

Observed repo positioning:

- "Scenario evaluation of CLI harness + model pairs (`AgentSpec`s) to improve delivery performance using Harbor-based runs"
- README shows:
  - scenario files
  - matrix runs
  - harness + model pair definitions
  - an orchestrator that executes and scores scenarios

Primary source:

- RAIDAR repo: <https://github.com/adam-jackson-cf/raidar>

# Current Shortlist

## 1. Inspect AI

Why it made the shortlist:

- Closest open-source architectural analogue to RAIDAR
- Explicitly separates tasks, solvers, and scorers
- Supports agents, tools, multi-turn execution, and eval sets across multiple models
- Provides logs and retry/resume workflows

Signals:

- Repo: <https://github.com/UKGovernmentBEIS/inspect_ai>
- Docs: <https://inspect.aisi.org.uk/>
- Solvers: <https://inspect.aisi.org.uk/solvers.html>
- Scorers: <https://inspect.aisi.org.uk/scorers.html>
- Eval sets: <https://inspect.aisi.org.uk/eval-sets.html>
- GitHub stars observed on 2026-03-15: 1,828
- License: MIT

## 2. Promptfoo

Why it made the shortlist:

- Best lightweight OSS comparison workflow for repeated model or coding-agent evaluation
- Strong on custom assertions, metrics, and side-by-side comparison
- Useful for coding-agent evaluation and rapid experiment iteration
- Less centered than RAIDAR on project-specific execution harnesses and scenario orchestration

Signals:

- Repo: <https://github.com/promptfoo/promptfoo>
- Intro: <https://www.promptfoo.dev/docs/intro/>
- Coding-agent eval guide: <https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/>
- Assertions and metrics: <https://www.promptfoo.dev/docs/configuration/expected-outputs/>
- OpenAI Agents provider docs: <https://www.promptfoo.dev/docs/providers/openai-agents/>
- GitHub stars observed on 2026-03-15: 16,318
- License: MIT

## 3. DeepEval

Why it made the shortlist:

- Strong OSS evaluation framework with broad metric support
- Strong on agentic metrics and evaluator composition
- Better viewed as a metric/regression layer than a full RAIDAR substitute
- Less centered on scenario + harness + model experiment structure for delivery work

Signals:

- Repo: <https://github.com/confident-ai/deepeval>
- Docs: <https://deepeval.com/docs/getting-started>
- Changelog: <https://deepeval.com/changelog>
- GitHub stars observed on 2026-03-15: 14,100
- License: Apache-2.0

# Adjacent But Not Direct Substitutes

These are relevant baselines, but not expected to score as direct substitutes for RAIDAR:

- AgentBench: <https://github.com/THUDM/AgentBench>
- SWE-bench: <https://github.com/SWE-bench/SWE-bench>
- OpenHands Benchmarks: <https://github.com/OpenHands/benchmarks>

Reason:

- They are primarily benchmark suites or benchmark harnesses, not general frameworks for arbitrary user-authored delivery scenarios plus harness/model experimentation.

# Findings From Prior Research

- Inspect AI is the closest architectural match to RAIDAR.
- Promptfoo is the strongest lightweight comparison framework.
- DeepEval is complementary but not a full substitute.
- Benchmark suites should be treated as an adjacent category, not mixed into the direct-fit shortlist.
- "Best fit" and "most adopted" are not the same thing.

# Requested Analysis

Please act as a second-model reviewer and do all of the following:

1. Devise a capability/feature comparison matrix suitable for RAIDAR-style evaluation needs.
2. Explain why each matrix dimension matters for this use case.
3. Score each shortlisted framework:
   - Inspect AI
   - Promptfoo
   - DeepEval
4. Use a clear scoring rubric, for example 1-5 or 0-3, but define it explicitly.
5. Provide short justification for each score.
6. If useful, provide weighted and unweighted totals, but explain the weighting logic.
7. Call out where a framework is:
   - a close substitute
   - a partial substitute
   - a companion layer
8. Note any dimensions where RAIDAR itself appears differentiated from all shortlisted alternatives.

# Suggested Evaluation Themes

You do not have to use this exact list, but the matrix should likely discriminate on dimensions such as:

- scenario/task authoring flexibility
- ability to treat harness/runtime as an experimental variable
- model abstraction and multi-model execution
- support for repeated experiment matrices
- custom metrics / scorers / evaluators
- support for agentic or multi-step delivery tasks
- run orchestration, retries, logs, and resumability
- suitability for real project delivery tasks rather than fixed public benchmarks
- result interpretation / comparison ergonomics
- maturity / maintenance / adoption

# Output Format

Return:

1. A short explanation of the matrix design.
2. A comparison table with dimensions, rubric, and framework scores.
3. A ranked summary.
4. A short "when to choose X" section for each shortlisted framework.
5. A final recommendation for which framework is:
   - best architectural comparison point for RAIDAR
   - best practical lightweight comparison point
   - best companion metric/evaluation layer

# Notes

- Do not broaden the shortlist unless there is a compelling reason.
- If you believe one dimension should be split into two, do so.
- If the evidence is insufficient for a firm score on one row, say so explicitly rather than bluffing.
