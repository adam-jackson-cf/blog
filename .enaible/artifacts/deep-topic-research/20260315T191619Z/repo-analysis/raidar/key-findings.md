# raidar

- Repo: adam-jackson-cf/raidar
- Commit: 82d90ee5bd2b69317c6867bd771e96378c64d148
- Commit date: 2026-03-14T21:55:45Z
- Stars: 0
- License: None
- Updated at: 2026-03-14T21:55:48Z

## Top-level entries

- .git
- .github
- .gitignore
- .pre-commit-config.yaml
- AGENTS.md
- CHANGELOG.md
- Makefile
- README.md
- docs
- orchestrator
- scenarios
- scripts

## README keyword hits

- README.md:5: **Scenario evaluation of CLI harness + model pairs (`AgentSpec`s) to improve delivery performance using Harbor-based runs**
- README.md:20: - at least one harness/provider API key in `orchestrator/.env`
- README.md:33: Run one review-grade experiment for one `AgentSpec` (`harness + model`).
- README.md:36: make harness-validate HARNESS=codex-cli MODEL=codex/gpt-5.4-low
- README.md:38:   SCENARIO=scenarios/hello-world-smoke/v001/scenario.yaml \
- README.md:39:   HARNESS=codex-cli \
- README.md:40:   MODEL=codex/gpt-5.4-low \
- README.md:48: Use `make smoke` when you want a fast smoke/debug pass for one `AgentSpec`.
- README.md:57: make matrix-run scenarios/homepage-implementation/v001/scenario.yaml codex
- README.md:69:   agents:
- README.md:70:     - harness: codex-cli
- README.md:71:       model: codex/gpt-5.2-high
- README.md:72:     - harness: codex-cli
- README.md:73:       model: codex/gpt-5.2-low
- README.md:74:     - harness: codex-cli
- README.md:75:       model: codex/gpt-5.2-medium
- README.md:76:     - harness: codex-cli
- README.md:77:       model: codex/gpt-5.4-extra-high
- README.md:78:     - harness: codex-cli
- README.md:79:       model: codex/gpt-5.4-high
- README.md:80:     - harness: codex-cli
- README.md:81:       model: codex/gpt-5.4-low
- README.md:82:     - harness: codex-cli
- README.md:83:       model: codex/gpt-5.4-medium
- README.md:90: - `orchestrator/`: CLI and runtime pipeline that executes and scores scenarios.
