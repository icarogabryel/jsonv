# Contributing to JSONV

Thank you for your interest in contributing to JSONV! This document provides
guidelines for setting up the project, running tests, and submitting
contributions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm

### Setup

Clone the repository:

```bash
git clone https://github.com/icarogabryel/jsonv.git
cd jsonv
```

Install dependencies:

```bash
npm install
```

## Development

### Build

Compile the TypeScript source code:

```bash
npm run build
```

The compiled files are generated in the `dist/` directory.

### Tests

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Contribution Guidelines

### Branches

Create a branch for your contribution:

```bash
git switch -c feature/your-feature
```

Suggested branch prefixes:

- `feature/` — New features.
- `fix/` — Bug fixes.
- `docs/` — Documentation changes.
- `refactor/` — Code refactoring.
- `test/` — Test-related changes.

### Commit Messages

JSONV follows [Conventional Commits](https://www.conventionalcommits.org/).

Use the following format:

```text
<type>(<scope>): <description>
```

Common commit types:

| Type | Description |
| --- | --- |
| `feat` | Introduces a new feature. |
| `fix` | Fixes a bug. |
| `docs` | Documentation changes. |
| `refactor` | Code changes without changing behavior. |
| `test` | Adds or modifies tests. |
| `build` | Build system or dependency changes. |
| `chore` | Maintenance tasks. |

Examples:

```text
feat(parser): add variable declarations
fix(parser): handle undefined variables
test(parser): add nested object tests
docs: update grammar specification
build: update TypeScript dependencies
```

Use the imperative mood and keep descriptions concise.

### Pull Requests

Before submitting a pull request:

1. Make sure the project builds successfully.
2. Run the test suite.
3. Follow the Conventional Commits format.
4. Keep changes focused on a single purpose.
5. Update documentation when necessary.

Provide a clear description of the changes and their purpose.

## Project Guidelines

- Keep the implementation simple and maintainable.
- Avoid unnecessary dependencies.
- Follow the existing TypeScript conventions.
- Keep the grammar specification up to date.
- Add tests for new features and bug fixes.
- Preserve JSON compatibility whenever possible.
