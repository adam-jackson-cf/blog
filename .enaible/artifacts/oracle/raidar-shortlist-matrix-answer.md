Below is a RAIDAR-specific matrix, not a generic “LLM eval framework” scorecard. I weighted the dimensions that RAIDAR itself makes first-class: scenario contracts, harness+model comparison, repeated experiment matrices, and custom scoring. That weighting follows RAIDAR’s own framing as “scenario evaluation of CLI harness + model pairs,” with repeated runs and evidence used to improve prompts, rules, starters, scenario design, and `AgentSpec` choice. ([GitHub][1])

Rubric: **1 = adjacent only**, **2 = weak fit / major scaffolding needed**, **3 = partial fit**, **4 = strong fit with notable gaps**, **5 = first-class fit for RAIDAR-style needs**.

| Dimension (weight)                                  | Inspect AI | Promptfoo | DeepEval |
| --------------------------------------------------- | ---------: | --------: | -------: |
| Scenario/task contract authoring flexibility (14)   |          4 |         3 |        2 |
| Harness/runtime as experimental variable (16)       |          5 |         3 |        1 |
| Model abstraction & multi-model execution (8)       |          5 |         5 |        2 |
| Matrix/repeats/sweep support (12)                   |          5 |         4 |        2 |
| Custom metrics/scorers/evaluator composition (12)   |          5 |         5 |        5 |
| Agentic/multi-step/tool/file execution support (10) |          5 |         4 |        3 |
| Run orchestration, retries, logs, resumability (10) |          5 |         4 |        3 |
| Fit for real project delivery tasks (8)             |          4 |         4 |        2 |
| Result comparison ergonomics (5)                    |          4 |         5 |        2 |
| Maturity, maintenance, license, cost (5)            |          4 |         5 |        5 |
| **Unweighted total / 50**                           |     **46** |    **42** |   **27** |
| **Weighted total / 100**                            |   **93.6** |  **80.0** | **51.0** |

**Scenario/task contract authoring flexibility (14).** This matters because RAIDAR’s core unit is a delivery scenario contract, not just a prompt or benchmark item. Inspect scores **4** because its `Task` model cleanly composes dataset, solver, scorer, plus `setup` and `task_with()` for variants, but the authoring style is code-first rather than RAIDAR’s explicit scenario-contract shape. Promptfoo scores **3** because `tests`, `vars`, dynamic generation, and `scenarios` are flexible, yet its “scenario” concept is mainly grouped data + tests rather than a full delivery-run contract. DeepEval scores **2** because its authoring unit is primarily goldens, test cases, and datasets, which is useful but materially thinner than a RAIDAR-style delivery scenario. ([GitHub][1])

**Harness/runtime as experimental variable (16).** This is the most discriminating row, because RAIDAR explicitly evaluates **harness + model** pairs. Inspect scores **5**: you can swap solvers at run time, adapt tasks with new `solver` and `sandbox`, and bridge both Python agents and sandboxed CLI agents such as Claude Code, Codex CLI, and Gemini CLI. Promptfoo scores **3** by inference: its docs clearly support comparing different agentic providers and SDKs, and they explicitly say agent architecture changes capability, but harness variation is represented indirectly through provider/integration config rather than as a standalone experimental axis. DeepEval scores **1** because its model is “instrument your application and evaluate traces/outputs”; it does not expose a first-class harness abstraction comparable to RAIDAR’s `AgentSpec`. ([GitHub][1])

**Model abstraction & multi-model execution (8).** RAIDAR needs model swapping to be routine, not bespoke. Inspect scores **5** because it supports many hosted and local model providers and `eval_set()` accepts model lists for multi-model runs. Promptfoo also scores **5** because provider comparison is a core workflow, it supports many providers/custom APIs, and its side-by-side benchmark guides are built around model comparison on your own data. DeepEval scores **2**: you can absolutely evaluate outputs from any app/model, but the official pattern is app + dataset + metrics, not first-class multi-model experiment management. ([Inspect][2])

**Matrix/repeats/sweep support (12).** RAIDAR is about repeated experiments, not one-off tests. Inspect scores **5** because `eval-set` supports retries, resumable reruns, added tasks/models/epochs, and exploratory sweeps over parameter grids plus model lists. Promptfoo scores **4** because its prompt/provider/test matrix is native, and it has `--repeat`, `--resume`, retry support, concurrency controls, and matrix-style views; the gap is that it is less explicitly built around scenario × harness × model experiments with delivery-style evidence bundles. DeepEval scores **2** because it offers repeats, caching, and parallelism, but not a strong first-class matrix/sweep story for harness-model comparisons. ([Inspect][3])

**Custom metrics/scorers/evaluator composition (12).** RAIDAR’s metric schema is user-defined, so weak evaluator composition would be disqualifying. Inspect scores **5** because it supports custom scorers, per-task metric overrides, complex score dictionaries, and model-graded scorers with multiple graders. Promptfoo scores **5** because it combines deterministic assertions, model-assisted assertions, thresholds, weights, and custom scoring functions in JavaScript or Python. DeepEval also scores **5** because this is its strongest area: 50+ metrics, G-Eval, DAG, and DIY metrics that plug into its evaluation runtime. ([Inspect][4])

**Agentic/multi-step/tool/file execution support (10).** RAIDAR is for delivery tasks, so it must handle more than single-turn prompting. Inspect scores **5** because solvers cover multi-turn dialog and agent scaffolds, tools are first-class, and agent bridges extend that to third-party or CLI agents in sandboxes. Promptfoo scores **4** because it now has explicit coding-agent evaluation, OpenAI Agents support, tracing, and integrations like LangGraph; still, this is more provider/integration-driven than a general execution framework. DeepEval scores **3** because its agentic metrics are rich—task completion, tool correctness, goal accuracy, plan quality, topic adherence—but it evaluates agent traces rather than running the delivery harness itself. ([Inspect][5])

**Run orchestration, retries, logs, resumability (10).** Repeated delivery evaluation breaks down quickly without recovery and evidence management. Inspect scores **5** because it has log files, a browser log viewer, dataframes over logs, `eval-retry`, sample retries, and resumable `eval-set` runs. Promptfoo scores **4** because it has pause/resume, retry-errors, a retry command, concurrency controls, and tracing, which is strong for a lightweight tool. DeepEval scores **3** because it has async config, caching, error handling, display/file-output config, parallelization, and repeats, but that is still more CI/test-run orchestration than RAIDAR-style experiment management. ([Inspect][2])

**Fit for real project delivery tasks (8).** This row asks whether the framework naturally evaluates “work that looks like project delivery,” not just prompt quality. Inspect scores **4** because tasks can be sandboxed, solver/sandbox can be swapped, and CLI agents can be bridged, but it is still a general-purpose evaluation framework rather than a delivery-opinionated one. Promptfoo also scores **4** because its coding-agent guidance is explicitly about filesystem/codebase tasks like security audit, refactoring, and feature work, and it explicitly says to test the system rather than just the model. DeepEval scores **2** because it can evaluate agents and end-to-end systems, but you must bring your own delivery runner and scenario execution layer. ([GitHub][1])

**Result comparison ergonomics (5).** RAIDAR’s value is in deciding what to change next, so comparison UX matters. Inspect scores **4** because it has a log viewer, VS Code integration, and log dataframes, which are useful for diagnosis and analysis. Promptfoo scores **5** because side-by-side matrix views and `view`-driven result comparison are central to the product experience. DeepEval scores **2**, and this is my lowest-confidence row: the OSS docs clearly cover display modes, file output, verbosity, and run identifiers, but they do not show a comparably strong open-source side-by-side comparison workflow. ([Inspect][2])

**Maturity, maintenance, license, cost (5).** I weighted this low because your brief prioritizes fit over popularity, but it still matters as a tiebreaker. Inspect is **4**: MIT licensed, roughly **1.8k** stars, **195** tags, and **197** contributors. Promptfoo is **5**: MIT licensed, roughly **16.2k** stars, **398** releases, and GitHub shows it as used by **311** repositories. DeepEval is **5**: Apache-2.0 licensed, roughly **14.1k** stars, **53** releases, **248** contributors, and GitHub shows it as used by about **1.2k** repositories. ([GitHub][6])

## Ranked summary

**1. Inspect AI — 93.6/100 weighted, 46/50 unweighted — close substitute.**
Architecturally, it is the nearest match to RAIDAR because it separates task definition, execution strategy, and scoring; supports solver/sandbox substitution; can bridge third-party and CLI agents; and has strong eval-set orchestration with retries, reruns, and logs. It is less delivery-opinionated than RAIDAR, but it is the clearest open-source analogue. ([Inspect][7])

**2. Promptfoo — 80.0/100 weighted, 42/50 unweighted — partial substitute / best lightweight comparison point.**
Promptfoo is excellent when the priority is rapid side-by-side comparison, strong assertions, coding-agent tests, and easy CI/CLI use. It is less suitable as a full RAIDAR replacement because harness/runtime is not modeled as a first-class experimental object in the same way. ([promptfoo.dev][8])

**3. DeepEval — 51.0/100 weighted, 27/50 unweighted — companion layer.**
DeepEval is strongest as a metric, regression, and tracing layer. It is not a strong direct substitute for RAIDAR because its abstractions center on test cases, datasets, metrics, and instrumented application traces rather than on scenario + harness + model experiment orchestration. ([deepeval.com][9])

A useful sanity check is that the most adopted tools are **not** the best architectural fit here: Promptfoo and DeepEval have much larger GitHub followings than Inspect, but Inspect still matches RAIDAR more closely. ([GitHub][6])

## When to choose each

**Choose Inspect AI** when you want the closest open-source comparison point to RAIDAR: code-defined tasks, explicit execution plans, swappable solvers/sandboxes, agent bridges, multi-model eval sets, and solid retry/log workflows. It is the best starting point if the goal is “build something RAIDAR-like without starting from zero.” ([Inspect][7])

**Choose Promptfoo** when you want the fastest practical path to repeated comparisons across models or coding agents, with excellent assertion flexibility and very good result visualization. It is especially attractive for lightweight benchmarking, CI gating, and rapid iteration on agent or prompt configurations. ([promptfoo.dev][8])

**Choose DeepEval** when you already have a runner or harness and mainly need better evaluators: agentic metrics, tracing, CI regression tests, custom metrics, and synthetic dataset generation. It is the best companion if RAIDAR (or another runner) remains the orchestration layer. ([deepeval.com][9])

## Where RAIDAR still looks differentiated

RAIDAR’s clearest differentiator is that **`AgentSpec = harness + model` is the primary unit**, and its public matrix schema exposes `harness` and `model` explicitly. Inspect comes closest, but its core abstraction is still `Task`; Promptfoo mostly encodes this through providers/integrations; DeepEval assumes an application under test rather than a first-class harness-model pair. ([GitHub][1])

RAIDAR also appears more **delivery-opinionated** than any shortlist option: its scenario contract includes prompt, rules, starter, verification settings, acceptance requirements, metrics, and optional visual baselines. The alternatives all have flexible authoring units, but none expose that exact delivery-task contract as a native concept. ([GitHub][1])

Finally, RAIDAR’s artifact model is unusually specific to delivery evaluation: canonical per-run and per-experiment artifacts, and decision questions around functional correctness, acceptance, verification stability, execution validity, visual quality, efficiency, and repeat stability. Inspect, Promptfoo, and DeepEval all have logs or traces, but not that same delivery-specific evidence schema out of the box. ([GitHub][1])

## Adjacent but not direct substitutes

I would keep **AgentBench**, **SWE-bench**, and **OpenHands Benchmarks** outside the direct-fit matrix. Their own repo positioning is as a benchmark across fixed environments, a benchmark for real-world GitHub issues, and an evaluation harness for OpenHands benchmark suites such as GAIA and SWE-bench. They are useful baselines and datasets, but they are not general user-authored delivery-scenario frameworks in the same sense as RAIDAR, Inspect, or even Promptfoo. ([GitHub][10])

## Final recommendations

**Best architectural comparison point for RAIDAR:** **Inspect AI**
**Best practical lightweight comparison point:** **Promptfoo**
**Best companion metric/evaluation layer:** **DeepEval**

If you want, I can turn this into a one-page decision memo or an exec-ready slide.

[1]: https://github.com/adam-jackson-cf/raidar "GitHub - adam-jackson-cf/raidar: Terminal bench based eval for real project tasks · GitHub"
[2]: https://inspect.aisi.org.uk/ "Inspect"
[3]: https://inspect.aisi.org.uk/eval-sets.html "Eval Sets – Inspect"
[4]: https://inspect.aisi.org.uk/scorers.html "Scorers – Inspect"
[5]: https://inspect.aisi.org.uk/solvers.html "Solvers – Inspect"
[6]: https://github.com/UKGovernmentBEIS/inspect_ai "GitHub - UKGovernmentBEIS/inspect_ai: Inspect: A framework for large language model evaluations · GitHub"
[7]: https://inspect.aisi.org.uk/tasks.html "Tasks – Inspect"
[8]: https://www.promptfoo.dev/docs/intro/ "Intro | Promptfoo"
[9]: https://deepeval.com/docs/getting-started "Quick Introduction | DeepEval by Confident AI - The LLM Evaluation Framework"
[10]: https://github.com/THUDM/AgentBench "https://github.com/THUDM/AgentBench"
