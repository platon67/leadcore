---
name: rtk
description: Use RTK (Rust Token Killer) to reduce shell/Bash output and preserve Claude Code context. Apply RTK automatically to supported terminal commands when working in a repository.
---

# RTK — Token-Efficient Shell Usage

RTK is a CLI proxy that filters, groups, truncates and deduplicates command output before it reaches the LLM. It can reduce the amount of Bash output Claude reads by up to ~90% on supported commands. This reduces context noise; it does **not** mean a 90% reduction in the total API bill.

## Core rule

When executing shell commands, **prefer the `rtk` equivalent whenever one exists**.

Examples:

```bash
rtk ls .
rtk read src/file.ts
rtk find "*.ts" .
rtk grep "pattern" .
rtk diff
rtk git status
rtk git log -n 10
rtk git diff
rtk git add .
rtk git commit -m "message"
rtk git push
rtk pytest
rtk cargo test
rtk npm test
rtk tsc
rtk lint
rtk ruff check
rtk docker ps
rtk docker logs <container>
```

## File/code exploration

Prefer:
- `rtk ls` over `ls` / verbose tree listings
- `rtk read` over `cat`
- `rtk grep` over `grep` / `rg` when RTK supports the use case
- `rtk find` over `find`
- `rtk diff` over raw large diffs

For `rtk read`, use aggressive mode when only structure/signatures are needed:

```bash
rtk read path/to/file.ts -l aggressive
```

Use normal/full reading when the actual implementation details are required.

## Git

Prefer RTK for routine Git inspection and operations:

```bash
rtk git status
rtk git diff
rtk git log -n 10
rtk git add <files>
rtk git commit -m "..."
rtk git push
```

The goal is to give Claude the useful state/change information without consuming context on Git's progress noise.

## Tests, builds and linting

Prefer RTK wrappers for noisy developer commands:

```bash
rtk pytest
rtk cargo test
rtk go test
rtk npm test
rtk jest
rtk vitest
rtk tsc
rtk ruff check
rtk cargo build
rtk cargo clippy
rtk lint
```

These filters emphasize failures/errors and collapse successful or repetitive output.

## When NOT to use RTK

Do **not** force RTK when:
- no RTK equivalent exists;
- the raw output is specifically required for debugging;
- exact byte-for-byte output is needed;
- RTK changes the semantics or hides information needed for the task;
- a command is explicitly excluded from RTK configuration.

If an RTK command fails or behaves unexpectedly, fall back to the native command and continue.

## Installation / availability

First check whether RTK exists:

```bash
rtk --version
```

If it is not installed, do not repeatedly attempt to use it. Continue with native commands and, when useful, tell the user that RTK can be installed.

Recommended installation:

```bash
brew install rtk
```

Linux/macOS quick install:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

For Claude Code, RTK supports an automatic command-rewrite hook:

```bash
rtk init -g
```

After installation, restart Claude Code. The hook can transparently rewrite supported Bash commands to RTK equivalents.

## Important Claude Code limitation

RTK's automatic hook applies to **Bash/shell tool calls**. Claude Code's built-in `Read`, `Grep`, and `Glob` tools do not pass through that hook. When compact shell output is useful, explicitly use `rtk read`, `rtk grep`, or `rtk find`.

## Behavior

Use RTK silently and routinely. Do not explain the optimization on every command. Optimize for:
1. minimal context consumption,
2. preserving all information necessary for the task,
3. raw output whenever compacting could hide something important.

Useful diagnostics:

```bash
rtk gain
rtk discover
```
