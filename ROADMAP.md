# JSONV Roadmap

> Status reflects the functionality currently implemented in the repository.
> Items remain unchecked when they are only partially implemented or only
> documented.

## 1. Core Parsing

- [X] Parse JSONC documents.
- [X] Support JSONC comments.
- [x] Support trailing commas.
- [X] Detect and report syntax errors.

## 2. Variables

- [x] Implement variable declarations using `$name: value`.
- [x] Implement variable references using `$name`.
- [x] Support string, number, boolean, null, array, and object values.
- [x] Resolve variables regardless of declaration order.
- [x] Implement lexical variable scoping.
- [x] Allow child objects to inherit parent variables.
- [x] Allow local variable declarations to shadow inherited variables.
- [x] Use the containing object scope for array elements.
- [x] Exclude variable declarations from the final output.
- [x] Detect undefined variable references.
- [x] Detect circular references.
- [x] Warn about unused variable declarations.

## 3. Public API

- [x] Implement the JSONV parsing API.
- [x] Accept JSONV source strings.
- [x] Provide structured parsing and resolution errors.
- [x] Export the public API through the package entry point.

## 4. CLI

- [ ] Implement a command-line interface.
- [ ] Read JSONV files.
- [ ] Output standard JSON.
- [ ] Report errors with useful source locations.

## 5. Testing and Documentation

- [ ] Add unit tests for parsing.
- [ ] Add unit tests for variable resolution.
- [ ] Test nested scopes and variable shadowing.
- [ ] Test forward references.
- [ ] Test undefined and circular references.
- [x] Add usage examples.
- [ ] Write API documentation.
- [x] Document the JSONV syntax and language rules.

## 6. Release

- [x] Configure the npm package for distribution.
- [x] Verify TypeScript declarations.
- [x] Verify ESM compatibility.
- [x] Prepare the README.
- [ ] Publish JSONV to npm.
- [ ] Verify usage through npm and jsDelivr.

---

## Future Considerations

Features intentionally outside the initial scope:

- Variable interpolation.
- Expressions and operators.
- File imports.
