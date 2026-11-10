# JSONV Roadmap

## 1. Core Parsing

- [ ] Integrate Microsoft's `jsonc-parser`.
- [ ] Parse JSONC documents into an AST.
- [ ] Support JSONC comments.
- [ ] Support trailing commas.
- [ ] Detect and report syntax errors.

## 2. Variables

- [ ] Implement variable declarations using `$name: value`.
- [ ] Implement variable references using `$name`.
- [ ] Support string, number, boolean, null, array, and object values.
- [ ] Resolve variables regardless of declaration order.
- [ ] Implement lexical variable scoping.
- [ ] Allow child objects to inherit parent variables.
- [ ] Allow local variable declarations to shadow inherited variables.
- [ ] Use the containing object scope for array elements.
- [ ] Exclude variable declarations from the final output.
- [ ] Detect undefined variable references.
- [ ] Detect circular references.

## 3. Public API

- [ ] Implement the JSONV parsing API.
- [ ] Accept JSONV source strings.
- [ ] Return standard JavaScript values.
- [ ] Provide structured parsing and resolution errors.
- [ ] Export the public API through the package entry point.

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
- [ ] Add usage examples.
- [ ] Write API documentation.
- [ ] Document the JSONV syntax and language rules.

## 6. Release

- [ ] Configure the npm package for distribution.
- [ ] Verify TypeScript declarations.
- [ ] Verify ESM compatibility.
- [ ] Prepare the README.
- [ ] Publish JSONV to npm.
- [ ] Verify usage through npm and jsDelivr.

---

## Future Considerations

Features intentionally outside the initial scope:

- Variable interpolation.
- Expressions and operators.
- File imports.
