# agentbench

- Repo: THUDM/AgentBench
- Commit: d1e4a10db08c87075c78972e48ecc182be03e2d5
- Commit date: 2026-02-09T01:00:40+08:00
- Stars: 3239
- License: Apache-2.0
- Updated at: 2026-03-15T15:22:43Z

## Top-level entries

- .git
- .github
- .gitignore
- LICENSE
- README.md
- assets
- configs
- data
- docs
- extra
- requirements.txt
- scripts
- src

## README keyword hits

- README.md:1: # AgentBench
- README.md:6:    <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRR3Wl7wsCgHpwUw1_eUXW_fptAPLL3FkhnW_rua0O1Ji_GIVrpTjY5LaKAhwO-WeARjnY_KNw0SYNJ/pubhtml" target="_blank">🌐 Leaderboard (new)</a> | <a href="https://twitter.com/thukeg" target="_bla
- README.md:10: 👋 Join our <a href="https://join.slack.com/t/agentbenchcol-huw1944/shared_invite/zt-20ixabcuv-31cFLBAkqGQxQkJqrWVEVg" target="_blank">Slack</a>  for <i>Q & A</i> or <i><b>collaboration</b> on next version of AgentBench</i>!
- README.md:13: ## 🔥[2025.10.10] Introducing **AgentBench FC (Function Calling)** based on [AgentRL](https://github.com/THUDM/AgentRL)
- README.md:15: The current repository contains the function-calling version of AgentBench, integrated with [AgentRL](https://github.com/THUDM/AgentRL), an end-to-end multitask and mutliturn LLM Agent RL framework.
- README.md:16: If you wish to use the older version, you can revert to [v0.1](https://github.com/THUDM/AgentBench/tree/v0.1) and [v0.2](https://github.com/THUDM/AgentBench/tree/v0.2).
- README.md:18: Comparing to the original AgentBench, this version uses a function-calling style prompt,
- README.md:19: and adds fully-containerized deployment support for the following tasks:
- README.md:29: We support a quick one-command setup for all the above tasks using Docker Compose.
- README.md:31: Before starting, please download or build the following Docker images required by the tasks:
- README.md:54: - AgentRL Controller
- README.md:55: - `alfworld` task worker (x1, increase as needed)
- README.md:56: - `dbbench` task worker (x1, increase as needed)
- README.md:57: - `knowledgegraph` task worker (x1, increase as needed)
- README.md:58: - `os_interaction` task worker (x1, increase as needed)
- README.md:59: - `webshop` task worker (x1, increase as needed)
- README.md:60: - freebase server (for `knowledgegraph` task)
- README.md:67: > and the current implementation of `alfworld` leaks memory and disk space until the task worker is restarted.
- README.md:70: ### Benchmarking Results
- README.md:72: We report the results of various models on the test set of AgentBench FC.
- README.md:77: Please contact [agentbench_fc&#64;googlegroups.com](mailto:agentbench_fc@googlegroups.com) if you have any questions or would like to contribute your results.
- README.md:81: ## 🔥[2024.08.13] Introducing [VisualAgentBench](https://github.com/THUDM/VisualAgentBench)
- README.md:83: VisualAgentBench is designed for evaluating and training visual foundation agents based on large multimodel models (LMMs). We introduce 5 distinct environments spanning 
- README.md:89: to systematically benchmark 17 LMMs (proprietary & open LMMs). We also provide the trajectory dataset for behavior cloning training on open LMMs for you to develop your own visual foundation agents!
- README.md:93: The following is the introduction to the original AgentBench (v0.2).
