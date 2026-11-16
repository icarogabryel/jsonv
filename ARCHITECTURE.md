# JSONV Architecture

## Overview

JSONV is a JSONC-inspired language that extends JSONC with variable declarations
and references.

Its primary goal is to allow reusable values while preserving the original
document's formatting, including whitespace, indentation, line breaks, and
comments.

JSONV does not aim to generate an Abstract Syntax Tree (AST) or a JavaScript
object. Instead, it processes the source code and produces a JSONC document with
variable declarations removed and references replaced by their corresponding
values.

## Processing Pipeline

The parser processes the source code in a single pass.

```text
Source Code
    |
    v
+-------------------+
|      Parser       |
|                   |
|  +-------------+  |
|  |    Lexer    |  |
|  +-------------+  |
|         |         |
|  +-------------+  |
|  |   Grammar   |  |
|  | Recognition |  |
|  +-------------+  |
|         |         |
|  +-------------+  |
|  |   Symbol    |  |
|  |    Table    |  |
|  +-------------+  |
|         |         |
|  +-------------+  |
|  |    Output   |  |
|  +-------------+  |
+-------------------+
    |
    v
Formatted JSON Output
```

## Parser

The parser is the central component of JSONV.

It is responsible for:

- Reading the source code.
- Identifying and consuming tokens.
- Recognizing JSONV structures using recursive descent parsing.
- Managing variable declarations and references.
- Maintaining symbol tables and scopes.
- Preserving the original source formatting.
- Replacing variable references with their values.
- Detecting syntax and semantic errors.

The lexer is implemented internally as a private method of the parser rather
than as a separate component.

### Lexical Analysis

The lexer identifies tokens using regular expressions.

It processes the source incrementally, starting at the current reading position,
without generating a complete token array beforehand.

Tokens include:

- Strings.
- Numbers.
- Boolean values.
- Null values.
- Variable identifiers.
- Structural characters such as braces, brackets, commas, and colons.
- Whitespace and comments.

Whitespace and comments are preserved in the output rather than discarded.

### Syntax Analysis

JSONV uses a recursive descent parser.

The parser recognizes the document structure through dedicated parsing methods
corresponding to grammar productions.

The grammar is documented in `docs/grammar.ebnf` and serves as the language's
syntax specification.

## Symbol Table

The parser maintains a symbol table to store variable declarations and
references.

Each symbol contains:

| Field | Description |
| --- | --- |
| `value` | The variable's resolved value. |
| `used` | Indicates whether the variable has been referenced. |

A variable initially has an `undefined` value. When its declaration is
encountered, its value is assigned.

This allows references to appear before their declarations.

### Variable Resolution

When a variable reference is encountered:

1. The parser searches for the variable in the current scope and its ancestors.
2. If the variable does not exist, an unresolved symbol is registered.
3. The symbol is marked as used.
4. A reference is registered internally for later resolution.

When a declaration is encountered:

1. The parser identifies the variable name.
2. It checks for duplicate declarations in the current scope.
3. It evaluates the assigned value.
4. It updates the corresponding symbol.

After parsing, unresolved symbols are checked. Any variable that was referenced
but never declared produces an error.

Variables declared but never referenced can also be detected through the `used`
field.

## Scopes

JSON objects introduce new variable scopes.

Each scope maintains its own symbols and a reference to its parent scope.

The scope hierarchy follows these rules:

- Child scopes can access variables declared in parent scopes.
- Parent scopes cannot access variables declared in child scopes.
- Local declarations can shadow variables from parent scopes.
- Duplicate declarations within the same scope are not allowed.
- Arrays do not introduce new scopes.

## Output Generation

JSONV preserves the original source formatting by constructing the output while
parsing.

The parser maintains an output buffer and appends the original source characters
as it processes the document.

Variable declarations are omitted from the output, while variable references are
replaced with their corresponding values.

Internal placeholders are used to track references that cannot yet be resolved.

After parsing and semantic validation, the placeholders are replaced with their
resolved values.

The resulting document must be valid JSON.

## Error Handling

The parser is responsible for reporting syntax and semantic errors.

Expected error categories include:

- Syntax errors.
- Undefined variables.
- Duplicate variable declarations.
- Circular variable references.

Errors should provide useful information about their location in the original
source code whenever possible.

## Project Structure

```text
jsonv/
├── docs/
│   └── grammar.ebnf
├── src/
│   ├── index.ts
│   └── parser.ts
├── tests/
│   ├── parser.test.ts
│   ├── variables.test.ts
│   ├── scope.test.ts
│   └── errors.test.ts
├── .gitattributes
├── .gitignore
├── CONTRIBUTING.md
├── ARCHITECTURE.md
├── README.md
├── package.json
└── tsconfig.json
```

## Design Principles

JSONV follows these principles:

- **Simplicity:** Keep the implementation straightforward and avoid unnecessary
    abstractions.
- **Single-pass processing:** Process the source incrementally without requiring
    a complete intermediate syntax tree.
- **Formatting preservation:** Preserve the original document's formatting
    whenever possible.
- **JSON compatibility:** The generated output must be valid JSON.
- **Explicit semantics:** Variable resolution and scope rules must be
    well-defined.
- **Minimal dependencies:** Prefer a small implementation with as few external
    dependencies as possible.
