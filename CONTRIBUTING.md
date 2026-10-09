# Contributing

## Code Quality

- Code: Follow KISS principle. Don’t settle for "it works" - make it clear, lean, and maintainable.
- Structure: Organize code by feature module and colocate everything a module owns within it. Promote code to shared locations only when genuine cross-module reuse emerges.
- Comments: Explain why, not what. Code should be self-documenting. Use comments only to clarify intent, domain rules, or non-obvious details (e.g. magic numbers). Avoid redundant or decorative comments.
- Package manager: [pnpm](https://pnpm.io/)
- Linting & formatting: [OXC](https://oxc.rs/)
- Editor defaults: [EditorConfig](https://editorconfig.org)
- Type checking: [TypeScript](https://www.typescriptlang.org)
- `vp run typecheck` uses TypeScript 7 through the `@typescript/native` alias. The `typescript` alias supplies Microsoft's TypeScript 6 compatibility API for Storybook's prop extraction.

## Workflow

- Follow [Conventional Commits](https://www.conventionalcommits.org)
- Keep PRs focused and reference related issues where possible
- [GitHub Actions](https://github.com/features/actions) enforces code quality and tests on all branches/PRs
