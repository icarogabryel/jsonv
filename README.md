# JSONV

JSONV (JSON with Variables) is a JSONC (JSON with Comments) superset that
extends it with variable declarations, references, and lexical scoping.

It aims to provide a simple way to define reusable values in structured
configuration files while preserving the familiar syntax of JSON and JSONC.

## Features

- Fully compatible with JSONC syntax.
- Variable declarations using the `$` prefix.
- Lexical scoping based on object nesting.
- Variable inheritance from parent scopes.
- Local variable overrides.
- Two-pass variable resolution, allowing declarations to appear after their
references.
- JSON output with all variables resolved.

## Syntax

JSONV preserves JSONC syntax and introduces variable declarations and
references. If in key, is a declaration. If in value, is a reference. Variables
are declared using `$` followed by an identifier and a colon.

```jsonv
{
  $primary-color: "#555",

  theme: {
    color: $primary-color
  }
}
```

Variables can hold any valid JSON value, including strings, numbers, booleans,
null, arrays, and objects. Variables can also reference other variables.

### Variable Resolution

Variables can be referenced before or after their declarations.

```jsonv
{
  color: $primary-color,
  $primary-color: "#555"
}
```

Variables are resolved independently of their declaration order within the same
scope. Variable declarations are removed from the resulting JSON structure.

### Scoping

JSONV uses lexical scoping based on object nesting. A variable declared in an
object is available within that object and all its descendants.

```jsonv
{
  $color: "#555",

  header: {
    color: $color
  },

  footer: {
    color: $color
  }
}
```

Child objects inherit variables from their parent scopes. A variable declared in
a child scope overrides a variable with the same name in an ancestor scope.

```jsonv
{
  $color: "#555",

  header: {
    color: $color
  },

  footer: {
    $color: "#999",
    color: $color // This will resolve to "#999"
  }
}
```

The `header` inherits `#555`, while the `footer` uses its local value `#999`.
Local declarations do not modify their parent scopes or sibling scopes.

## Resolution Rules

The JSONV resolver follows these principles:

1. Collect variable declarations within each object scope.
2. Make declarations available throughout their respective scope, regardless of
their position.
3. Inherit declarations from ancestor scopes.
4. Give local declarations precedence over inherited declarations.
5. Resolve variable references recursively.
6. Remove variable declarations from the final output.
7. Report errors for undefined variables and circular references.

## Output

JSONV documents are resolved into standard JSONC or JSON, with all variable
references replaced by their corresponding values and all variable declarations
removed.

## Technology

JSONV is developed using:

- **TypeScript** — implementation language.
- **Node.js** — runtime environment.
- **ES Modules (ESM)** — module system.
- **npm** — package distribution.

## Usage

JSONV is designed to be available both as a JavaScript/TypeScript library and as
a command-line tool.

### Command Line

The CLI will support resolving JSONV files into standard JSONC and JSON.

```bash
jsonv input.jsonv --output output.json
```

### Package API

The package will also expose a programmatic API.

```typescript
import { parse } from "jsonv";

const result = parse(`
{
  $color: "#555",
  button: {
    background: $color
  }
}
`);
```

## Project Structure

The implementation is organized around three main components:

- **Lexer:** Converts source text into tokens.
- **Parser:** Builds an abstract syntax tree (AST).
- **Resolver:** Resolves variables, scopes, and references.

The CLI and public API consume these components independently.

## Goals

JSONV aims to:

- Keep JSONC familiar and easy to read.
- Introduce variables without ambiguous syntax.
- Provide predictable lexical scoping.
- Keep the language minimal and focused.
- Support integration into Node.js applications and development workflows.

## License

JSONV is licensed under the MIT License. See the [LICENSE](LICENSE) file for
details.
