# For Agents

## Project Overview

JSONV is a lightweight configuration language based on JSONC, extended with
variables and scoped resolution.

Its purpose is to provide a simple way to define reusable values within JSONC
documents while preserving the familiar JSONC structure.

The project is implemented in TypeScript and targets Node.js.

### Core Principles

- Keep the language simple and predictable;
- Prefer straightforward algorithms over unnecessary abstractions;
- Preserve the original document structure and formatting whenever possible;
- Keep parsing and variable resolution responsibilities clearly defined;
- Avoid unnecessary dependencies;
- Do not introduce features outside the project's intended scope;
- Favor readable, maintainable and strongly typed TypeScript.

## Language Specification

JSONV extends JSONC with variable declarations and references.

Variables use `$` as their prefix.

### Variable Declaration and References

Variables are declared as members of objects, using the same key-value structure
as regular JSON members.

```JSONV
{
    "$primary-color": "#555",
    "theme": {
        "color": "$primary-color"
    }
}
```

Variable declarations are not regular JSONC properties. They must be resolved
internally and omitted from the generated JSON output.

References can appear before their declarations within the same object.

### Supported Values

Variables can be declared with any valid JSON value, including objects and
arrays.

```JSONV
{
    "$user": {
        "name": "John",
        "age": 30
    },
    "profile": {
        "user": "$user"
    }
}
```

An undefined variable must produce an error and prevent successful output
generation.

`undefined` is an internal state and must never be confused with JSONC `null`.

## Architecture

The implementation should remain minimal and organized around the language
processing pipeline.

### Parser

JSONV uses a simple recursive descent parser.

Do not introduce `jsonc-parser` or another general-purpose JSONC parser as a
replacement for the project's parser.

The parser is responsible for:

- Reading and validating the document structure;
- Recognizing objects, arrays and primitive values;
- Recognizing variable declarations and references;
- Managing the parsing process;
- Coordinating scopes and symbol registration;
- Producing the resolved textual output.

The lexer is integrated into the Parser implementation. Token recognition should
use regular expressions where appropriate.

Avoid introducing a separate lexer subsystem unless a concrete technical
requirement justifies it.

### Parsing Strategy

Use recursive descent to process the grammar.

The parser should follow the grammar structure instead of relying on large
regular expressions to parse nested structures.

Parsing and variable resolution must account for the fact that declarations can
appear after their references.

### Output Generation

The output must be textual.

Preserve the original formatting and document structure whenever possible,
replacing variable references with their resolved values and omitting variable
declarations.

Avoid unnecessary formatting changes to unrelated parts of the document.

## Scopes and Symbol Resolution

Variable declarations belong to objects.

Objects establish scopes. Arrays do not establish independent scopes and use the
surrounding object's scope.

The implementation must distinguish between:

- A variable declared in the current scope;
- A variable inherited from a parent scope;
- A variable that shadows a declaration in a parent scope;
- A variable that does not exist.

### Symbol Table

Keep symbol information separate from the textual output.

A symbol must track at least:

- Its declared value;
- Whether it has been used;
- Its resolution state when necessary.

`undefined` must represent an unresolved or unavailable internal value, never
JSONC `null`.

### Scope Lookup

Variable lookup should be based on lexical scope.

The lookup process must be deterministic and must account for declarations in
parent scopes.

When a variable is declared in a nested scope, the implementation must be able
to distinguish that declaration from a variable with the same name in an
ancestor scope.

Do not silently overwrite symbols belonging to another scope.

A duplicate declaration in the same scope must be distinguished from shadowing a
declaration in a parent scope.

### Recursive Resolution

Variable resolution must support nested structures and references to other
variables.

Use a recursive resolution algorithm that follows references until reaching a
concrete value.

The resolver must detect circular references.

A resolution registry or stack should track symbols currently being resolved.

When resolving a variable:

1. Locate its symbol using scope lookup;
2. Check whether the symbol is already being resolved;
3. If it is already in the resolution stack, report a circular reference;
4. Otherwise, mark it as being resolved;
5. Resolve its value recursively;
6. Store the resolved result;
7. Mark the symbol as resolved and remove it from the active resolution stack.

The registry must distinguish symbols from different scopes, even when they have
identical names.

A symbol should not be permanently marked as resolved before its recursive
resolution completes.

### Circular References

The implementation must detect direct and indirect circular references.

Examples:

```JSONV
{
    "$a": "$a",
    "value": "$a"
}
```

```JSONV
{
    "$a": "$b",
    "$b": "$a",
    "value": "$a"
}
```

Circular references must produce a descriptive error.

Avoid arbitrary recursion limits as a substitute for proper cycle detection.

---

## Grammar

The initial grammar is based on the following EBNF:

```ebnf
document
    = value;

value
    = object
    | array
    | STRING
    | NUMBER
    | VARIABLE
    | "true"
    | "false"
    | "null";

object
    = "{", [ member, { ",", member } ], "}";

member
    = STRING, ":", value
    | VARIABLE, ":", value;

array
    = "[", [ value, { ",", value } ], "]";
```

The grammar is the reference for parsing behavior.

Any modification to the grammar must be intentional and consistent with the
language's existing syntax.

Do not add syntax extensions without an explicit requirement.

## Error Handling

Errors must be descriptive and identify the problem whenever possible.

The implementation should distinguish between different error categories,
including:

- Syntax errors;
- Undefined variable references;
- Circular variable references;
- Duplicate declarations;
- Unused variables, if unused-variable validation is enabled.

Do not silently replace invalid references with `null`, empty strings or other
default values.

Invalid documents must not produce successful output.

Keep error handling explicit. Avoid generic error handling that hides the
original cause.

---

## TypeScript Conventions

- Use TypeScript strict mode;
- Prefer explicit and precise types;
- Avoid `any`;
- Use `unknown` when the type is genuinely unknown;
- Avoid unnecessary type assertions;
- Prefer small functions with a single responsibility;
- Use `const` by default and `let` only when reassignment is necessary;
- Use named exports unless a default export has a clear reason;
- Keep implementation details private when they are not part of the public API;
- Avoid unnecessary inheritance and complex class hierarchies.

Use the existing project's TypeScript and Node.js configuration as the source of
truth.

Do not change compiler settings or module conventions without a concrete reason.

## Code Organization

Keep modules organized according to their responsibilities.

Avoid creating abstractions or directories for functionality that does not yet
justify them.

Do not duplicate parsing, scope lookup or resolution logic.

Before introducing a new module, class or interface, verify that it represents a
meaningful responsibility.

Keep internal implementation details separate from the public API.

## Dependencies

Avoid adding dependencies for functionality that can be implemented simply using
TypeScript and Node.js.

Do not introduce a general-purpose parser library to replace the recursive
descent parser.

Before adding a dependency, evaluate:

- Whether it is actually necessary;
- Whether the functionality can be implemented without it;
- Whether it introduces unnecessary complexity;
- Whether it fits the project's existing architecture.

## Development Guidelines

When implementing new functionality:

1. Inspect the existing implementation before making changes;
2. Understand the current architecture and its responsibilities;
3. Follow established naming and coding conventions;
4. Prefer incremental changes;
5. Avoid unrelated refactoring.
6. Preserve existing behavior unless the task explicitly requires changing it;
7. Add or update tests for new behavior;
8. Verify TypeScript compilation and relevant tests after modifications;

Do not rewrite existing modules simply because another implementation style is
possible.

Do not introduce speculative abstractions for hypothetical future features.

### Tests

Tests should cover:

- Valid JSONV documents;
- Invalid syntax;
- Variable declarations;
- Forward references;
- Nested objects and arrays;
- Scope lookup;
- Variable shadowing;
- Undefined variables;
- Circular references;
- Duplicate declarations;
- Output formatting and declaration removal;

Prefer testing observable behavior instead of internal implementation details.

---

## Agent Instructions

Before implementing a task:

- Read the relevant source files;
- Check existing tests;
- Understand the established architecture;
- Identify which existing responsibilities are affected.

When making architectural decisions:

- Prefer consistency with existing decisions;
- Explain why a change is necessary;
- Avoid introducing additional layers without justification;
- Do not treat suggestions from previous implementations as established
requirements.

When a requirement is ambiguous, do not silently invent language semantics.
Identify the ambiguity and choose the smallest implementation consistent with
the established specification, or ask for clarification when necessary.

The project's language specification and explicit architectural decisions take
precedence over generic programming preferences.

Keep changes focused, simple and easy to review.
