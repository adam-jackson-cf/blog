# autogen

- Repo: microsoft/autogen
- Commit: b0477309d2a0baf489aa256646e41e513ab3bfe8
- Commit date: 2026-03-11T12:42:46-07:00
- Stars: 55644
- License: CC-BY-4.0
- Updated at: 2026-03-15T19:08:11Z

## Top-level entries

- .azure
- .devcontainer
- .git
- .gitattributes
- .github
- .gitignore
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- FAQ.md
- LICENSE
- LICENSE-CODE
- README.md
- SECURITY.md
- SUPPORT.md
- TRANSPARENCY_FAQS.md
- autogen-landing.jpg
- codecov.yml
- docs
- dotnet
- protos
- python

## README keyword hits

- README.md:16: **AutoGen** is a framework for creating multi-agent AI applications that can act autonomously or work alongside humans.
- README.md:18: > **Important:** if you are new to AutoGen, please checkout [Microsoft Agent Framework](https://github.com/microsoft/agent-framework).
- README.md:27: # Install AgentChat and OpenAI client from Extensions
- README.md:28: pip install -U "autogen-agentchat" "autogen-ext[openai]"
- README.md:31: The current stable version can be found in the [releases](https://github.com/microsoft/autogen/releases). If you are upgrading from AutoGen v0.2, please refer to the [Migration Guide](https://microsoft.github.io/autogen/stable/user-guide/ag
- README.md:44: Create an assistant agent using OpenAI's GPT-4o model. See [other supported models](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/models.html).
- README.md:48: from autogen_agentchat.agents import AssistantAgent
- README.md:49: from autogen_ext.models.openai import OpenAIChatCompletionClient
- README.md:52:     model_client = OpenAIChatCompletionClient(model="gpt-4.1")
- README.md:53:     agent = AssistantAgent("assistant", model_client=model_client)
- README.md:54:     print(await agent.run(task="Say 'Hello World!'"))
- README.md:55:     await model_client.close()
- README.md:62: Create a web browsing assistant agent that uses the Playwright MCP server.
- README.md:67: from autogen_agentchat.agents import AssistantAgent
- README.md:68: from autogen_agentchat.ui import Console
- README.md:69: from autogen_ext.models.openai import OpenAIChatCompletionClient
- README.md:74:     model_client = OpenAIChatCompletionClient(model="gpt-4.1")
- README.md:83:         agent = AssistantAgent(
- README.md:85:             model_client=model_client,
- README.md:87:             model_client_stream=True,
- README.md:90:         await Console(agent.run_stream(task="Find out how many contributors for the microsoft/autogen repository"))
- README.md:99: ### Multi-Agent Orchestration
- README.md:101: You can use `AgentTool` to create a basic multi-agent orchestration setup.
- README.md:106: from autogen_agentchat.agents import AssistantAgent
- README.md:107: from autogen_agentchat.tools import AgentTool
