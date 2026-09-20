---
name: headroom
description: Use Headroom to compress AI-agent context locally, reducing noisy tool outputs, logs, files, RAG results and other context before they reach the LLM. Prefer Headroom's wrapper/proxy workflow for Claude Code when available.
---

# Headroom — Context Compression

Headroom is a local context-optimization layer for AI agents. It compresses tool outputs, logs, files, API/RAG results and other context before they reach the LLM, while keeping originals locally retrievable. It supports Claude Code and other coding agents through `headroom wrap`, a local proxy, MCP tools, or an SDK.

## Core rule

When working in Claude Code, prefer running the session through Headroom rather than manually reproducing its compression behavior.

Recommended setup:

```bash
headroom --version
headroom doctor
headroom wrap claude
```

`headroom wrap claude` starts/configures the local Headroom path for Claude Code. To remove the setup:

```bash
headroom unwrap claude
```

If Headroom is already configured, do not repeatedly reinstall or reconfigure it.

## Installation

For the CLI:

```bash
uv tool install --python 3.13 "headroom-ai[all]"
```

Or:

```bash
pip install "headroom-ai[all]"
```

Verify:

```bash
headroom --version
headroom doctor
```

The npm package is the TypeScript SDK and does **not** provide the `headroom` CLI.

## How to use it

For a coding-agent session:

```bash
headroom wrap claude
```

Other supported agents include Codex, Cursor, Cline, Aider, OpenCode, Continue, Goose, OpenHands and others.

For a generic local proxy:

```bash
headroom proxy --port 8787
```

For a persistent background installation:

```bash
headroom install apply --preset persistent-service --providers auto
```

Use:

```bash
headroom dashboard
headroom perf
```

to inspect compression/savings when the relevant runtime is active.

## What Headroom compresses

Headroom can route different content types to specialized compressors:

- JSON/tool output → SmartCrusher
- source code → CodeCompressor / AST-aware compression
- prose/text → Kompress-v2-base
- volatile prompt sections → CacheAligner
- original content → CCR local cache for reversible retrieval

The model should work from the compressed representation unless the exact original is required. When full source/output is necessary, use Headroom's retrieval capability rather than assuming compressed text is complete.

## MCP

Headroom exposes MCP capabilities including:

```text
headroom_compress
headroom_retrieve
headroom_stats
```

Use these when Headroom is configured as an MCP server and the task benefits from explicit compression, retrieval, or savings inspection.

## Failure learning

When a session exposes a repeated mistake or a correction that should persist across future sessions, Headroom can mine failed sessions:

```bash
headroom learn
```

By default this can write to `CLAUDE.local.md`; shared/team configuration can target `CLAUDE.md`. Do not automatically write learned rules unless the correction is genuinely useful and stable.

## Important behavior

- Prefer compressed context for routine exploration and noisy outputs.
- Do not sacrifice correctness for token savings.
- If exact raw output is required for debugging, verification, parsing, security review, or byte-level comparison, obtain the original.
- Headroom is reversible: originals are cached locally and can be retrieved when needed.
- Headroom runs compression locally; prompt/file content is not sent elsewhere merely for compression.
- Headroom's anonymous telemetry beacon is enabled by default. It can be disabled with `HEADROOM_BEACON=off`, `DO_NOT_TRACK=1`, or `--offline` if required.

## Claude Code workflow

At the beginning of a substantial coding session:

1. Check whether Headroom is available:
   ```bash
   headroom --version
   ```
2. If available, prefer the Headroom-wrapped Claude workflow.
3. Use compressed context for routine tool output and exploration.
4. Retrieve original content when compression could hide a detail needed for correctness.
5. Use `headroom stats`, `perf`, or `dashboard` only when measuring/diagnosing savings is relevant.

Do not explain Headroom on every command. Treat it as infrastructure that should quietly reduce context usage while preserving the information required to complete the task.
