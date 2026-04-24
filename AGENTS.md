# AGENTS Guide

This file defines behavior for AI agents operating in this repository.

## Primary Goals
- Deliver correct, minimal, and maintainable changes.
- Keep CI green by matching local validation to CI workflows.
- Reduce exploration time by starting from root docs and config files.

## Operating Procedure
1. Read repository-level instructions in `.github/copilot-instructions.md` first.
2. Detect project tooling and runtime versions from config files.
3. Use existing scripts for install, test, lint, and build.
4. Make the smallest coherent code change.
5. Validate touched behavior and summarize exact verification performed.

## Editing Rules
- Do not modify unrelated files.
- Do not perform broad formatting-only changes unless requested.
- Preserve backward compatibility unless a breaking change is explicitly requested.
- Add comments only where logic is not immediately obvious.

## Validation Rules
- Prefer fast, targeted checks during iteration.
- Run full project checks before completion when feasible.
- If a command cannot be run, state why and provide the closest alternative validation.

## Reporting Rules
- Summarize changed files and intent.
- List commands run and outcomes.
- Call out assumptions, risks, and follow-up items when applicable.
