---
applyTo: "**/*.js,**/*.jsx,**/*.ts,**/*.tsx,**/*.py"
---

## Code Change Instructions
- Preserve existing architecture and conventions used by nearby files.
- Keep functions cohesive and avoid large multi-purpose modules.
- Prefer explicit types and clear interfaces where the language supports them.
- Validate input at boundaries (API handlers, CLI entry points, serializers).
- Add or update tests near changed behavior.
- Avoid adding new dependencies unless there is clear net value.
- If adding a dependency, explain why in the PR or change summary.

## Validation
- Run relevant linting and tests for changed files first.
- Run the broad project checks before concluding work.
- If tests are missing for a changed area, add targeted tests or document the gap.

## Design
- Make sure web application is responsive and designed with pwa princiapls.
- IOS, WEB, Andoid compatible fractionless design.