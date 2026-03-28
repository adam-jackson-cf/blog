# swe-bench

- Repo: SWE-bench/SWE-bench
- Commit: fa79f3af3e0f212d4d14b1c858c77fcaae5308ce
- Commit date: 2026-01-04T16:01:48-05:00
- Stars: 4474
- License: MIT
- Updated at: 2026-03-15T18:35:52Z

## Top-level entries

- .git
- .github
- .gitignore
- .pre-commit-config.yaml
- CHANGELOG.md
- LICENSE
- README.md
- codecov.yml
- docs
- mkdocs.yml
- pyproject.toml
- swebench
- tests

## README keyword hits

- README.md:31: * [ICLR 2024 Oral] <a href="https://arxiv.org/abs/2310.06770">SWE-bench: Can Language Models Resolve Real-World GitHub Issues?</a>
- README.md:34: * **[Jan. 13, 2025]**: We've integrated [SWE-bench Multimodal](https://swebench.com/multimodal) ([paper](https://arxiv.org/abs/2410.03859), [dataset](https://huggingface.co/datasets/SWE-bench/SWE-bench_Multimodal)) into this repository! Unl
- README.md:35: * **[Jan. 11, 2025]**: Thanks to [Modal](https://modal.com/), you can now run evaluations entirely on the cloud! See [here](https://github.com/swe-bench/SWE-bench/blob/main/docs/assets/evaluation.md#%EF%B8%8F-evaluation-with-modal) for more
- README.md:37: * **[Jun. 27, 2024]**: We have an exciting update for SWE-bench - with support from [OpenAI's Preparedness](https://openai.com/preparedness/) team: We're moving to a fully containerized evaluation harness using Docker for more reproducible 
- README.md:38: * **[Apr. 2, 2024]**: We have released [SWE-agent](https://github.com/SWE-agent/SWE-agent), which sets the state-of-the-art on the full SWE-bench test set! ([Tweet 🔗](https://twitter.com/jyangballin/status/1775114444370051582))
- README.md:42: SWE-bench is a benchmark for evaluating large language models on real world software issues collected from GitHub.
- README.md:43: Given a *codebase* and an *issue*, a language model is tasked with generating a *patch* that resolves the described problem.
- README.md:54: SWE-bench uses Docker for reproducible evaluations.
- README.md:67: python -m swebench.harness.run_evaluation \
- README.md:75: > By default, the evaluation script pulls images (built for Linux) from [DockerHub](https://hub.docker.com/u/swebench).
- README.md:76: > Adding `--namespace ''` will cause evaluation images to be built locally instead.
- README.md:81: python -m swebench.harness.run_evaluation \
- README.md:87:     # use --run_id to name the evaluation run
- README.md:91: This command will generate docker build logs (`logs/build_images`) and evaluation logs (`logs/run_evaluation`) in the current directory.
- README.md:93: The final evaluation results will be stored in the `evaluation_results` directory.
- README.md:96: > SWE-bench evaluation can be resource intensive
- README.md:104: To see the full list of arguments for the evaluation harness, run:
- README.md:106: python -m swebench.harness.run_evaluation --help
- README.md:109: See the [evaluation tutorial](docs/guides/evaluation.md) for the full rundown on datasets you can evaluate.
- README.md:110: If you're looking for non-local, cloud based evaluations, check out...
- README.md:111: * [sb-cli](https://github.com/swe-bench/sb-cli), our tool for running evaluations automatically on AWS, or...
- README.md:112: * Running SWE-bench evaluation on [Modal](https://modal.com/). Details [here](docs/guides/evaluation.md#Cloud-Based-Evaluation)
- README.md:115: * [Train](https://github.com/swe-bench/SWE-bench/tree/main/swebench/inference/make_datasets) your own models on our pre-processed datasets. (🆕 Check out [SWE-smith](https://swesmith.com/), a dedicated toolkit for creating SWE training data.
- README.md:116: * Run [inference](docs/reference/inference.md) on existing models (both local and API models). The inference step is where you give the model a repo + issue and have it generate a fix.
- README.md:117: *  Run SWE-bench's [data collection procedure](https://github.com/swe-bench/SWE-bench/blob/main/swebench/collect/) ([tutorial](docs/guides/collection.md)) on your own repositories, to make new SWE-Bench tasks.
