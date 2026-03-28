# openhands-benchmarks

- Repo: OpenHands/benchmarks
- Commit: 628139da22447fdec3f48317b9c04297e69f6e0f
- Commit date: 2026-03-13T22:44:55+01:00
- Stars: 57
- License: MIT
- Updated at: 2026-03-14T02:58:35Z

## Top-level entries

- .git
- .github
- .gitignore
- .gitmodules
- .llm_config
- .openhands
- .pre-commit-config.yaml
- .python-version
- AGENTS.md
- LICENSE
- Makefile
- README.md
- benchmarks
- legacy
- pyproject.toml
- pyrightconfig.json
- sitecustomize.py
- test_swebenchmultilingual.sh
- tests
- uv.lock
- vendor

## README keyword hits

- README.md:1: # OpenHands Benchmarks
- README.md:3: This repository contains benchmark evaluation infrastructure for [OpenHands](https://github.com/OpenHands/OpenHands/) agents. It provides standardized evaluation pipelines for testing agent capabilities across various real-world tasks.
- README.md:5: ⚠️ **Migration in Progress**: We are currently migrating the [benchmarks from OpenHands V0](https://github.com/OpenHands/OpenHands/tree/main/evaluation) to work with the [OpenHands Software Agent SDK](https://github.com/OpenHands/software-a
- README.md:7: ## Available Benchmarks
- README.md:9: | Benchmark | Description | Status |
- README.md:11: | [SWE-Bench](benchmarks/swebench/) | Software engineering tasks from GitHub issues | ✅ Active |
- README.md:12: | [GAIA](benchmarks/gaia/) | General AI assistant tasks requiring multi-step reasoning | ✅ Active |
- README.md:13: | [Commit0](benchmarks/commit0/) | Python function implementation tasks with unit tests | ✅ Active |
- README.md:14: | [OpenAgentSafety](benchmarks/openagentsafety/) | AI agent safety evaluation in workplace scenarios with NPC interactions | ✅ Active |
- README.md:16: See the individual benchmark directories for detailed usage instructions.
- README.md:22: Before running any benchmarks, you need to set up the environment and ensure the local Agent SDK submodule is initialized.
- README.md:31: ### 🧩 1. Initialize the Agent SDK submodule
- README.md:33: The Benchmarks project uses a **local git submodule** for the [OpenHands Agent SDK](https://github.com/OpenHands/software-agent-sdk).
- README.md:43: - clone the SDK into `vendor/software-agent-sdk/`
- README.md:65: and ensures the `openhands-*` packages (SDK, tools, workspace, agent-server) are installed **from the local workspace** declared in `pyproject.toml`.
- README.md:74: cd vendor/software-agent-sdk
- README.md:78: git add vendor/software-agent-sdk
- README.md:79: git commit -m "Update software-agent-sdk submodule to <new_commit_sha>"
- README.md:94: All benchmarks require an LLM configuration file. Define your LLM config as a JSON following the model fields in the [LLM class](https://github.com/OpenHands/software-agent-sdk/blob/main/openhands/sdk/llm/llm.py#L93).
- README.md:100:   "model": "litellm_proxy/anthropic/claude-sonnet-4-20250514",
- README.md:112: ## Running Benchmarks
- README.md:114: After setting up the environment and configuring your LLM, see the individual benchmark directories for specific usage instructions:
- README.md:116: - **[SWE-Bench](benchmarks/swebench/)**: Software engineering tasks from GitHub issues
- README.md:117: - **[GAIA](benchmarks/gaia/)**: General AI assistant tasks requiring multi-step reasoning  
- README.md:118: - **[OpenAgentSafety](benchmarks/openagentsafety/)**: AI agent safety evaluation in workplace scenarios with NPC interactions
