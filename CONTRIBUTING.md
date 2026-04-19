# Contributing

## Code Quality

- Code: Follow KISS principle. Don’t settle for "it works" - make it clear, lean, and maintainable.
- Structure: Organize code by feature module and colocate everything a module owns within it. Promote code to shared locations only when genuine cross-module reuse emerges.
- Comments: Explain why, not what. Code should be self-documenting. Use comments only to clarify intent, domain rules, or non-obvious details (e.g. magic numbers). Avoid redundant or decorative comments.
- Package manager: [npm](https://www.npmjs.com)
- Linting & formatting: [BiomeJS](https://biomejs.dev)
- Editor defaults: [EditorConfig](https://editorconfig.org)
- Type checking: [TypeScript](https://www.typescriptlang.org)

## Workflow

- Follow [Conventional Commits](https://www.conventionalcommits.org)
- Keep PRs focused and reference related issues where possible
- [GitHub Actions](https://github.com/features/actions) enforces code quality and tests on all branches/PRs
