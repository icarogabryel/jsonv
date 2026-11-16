type TokenKind =
  | "STRING"
  | "NUMBER"
  | "VARIABLE"
  | "TRUE"
  | "FALSE"
  | "NULL"
  | "LEFT_BRACE"
  | "RIGHT_BRACE"
  | "LEFT_BRACKET"
  | "RIGHT_BRACKET"
  | "COLON"
  | "COMMA"
  | "WHITESPACE"
  | "LINE_COMMENT"
  | "BLOCK_COMMENT"
  | "EOF";

interface Token {
  kind: TokenKind;
  value: string;
  position: number;
}

type SymbolState = "unresolved" | "resolving" | "resolved";

interface VariableSymbol {
  name: string;
  value: string | undefined;
  state: SymbolState;
}

interface Scope {
  parent: Scope | undefined;
  symbols: Map<string, VariableSymbol>;
}

interface VariableReference {
  placeholder: string;
  name: string;
  scope: Scope;
}

export class Parser {
  private position = 0;
  private output = "";
  private currentToken: Token;
  private readonly rootScope: Scope = {
    parent: undefined,
    symbols: new Map(),
  };
  private currentScope = this.rootScope;
  private referenceCounter = 0;
  private readonly references: VariableReference[] = [];

  constructor(private readonly source: string) {
    this.currentToken = this.readToken();
  }

  private write(value: string): void {
    this.output += value;
  }

  public parse(): string {
    this.skipTrivia();
    this.parseValue();
    this.skipTrivia();

    this.expect("EOF");

    return this.resolveOutput();
  }

  private parseValue(): void {
    this.skipTrivia();

    switch (this.currentToken.kind) {
      case "LEFT_BRACE":
        this.parseObject();
        break;

      case "LEFT_BRACKET":
        this.parseArray();
        break;

      case "VARIABLE":
        this.resolveVariable(this.currentToken.value);
        this.advance();
        break;

      case "STRING":
      case "NUMBER":
      case "TRUE":
      case "FALSE":
      case "NULL":
        this.write(this.currentToken.value);
        this.advance();
        break;

      default:
        this.throwUnexpectedToken();
    }
  }

  private parseObject(): void {
    this.expect("LEFT_BRACE");
    const parentScope = this.currentScope;
    this.currentScope = {
      parent: parentScope,
      symbols: new Map(),
    };

    try {
      this.skipTrivia();

      if (this.getCurrentTokenKind() === "RIGHT_BRACE") {
        this.expect("RIGHT_BRACE");
        return;
      }

      let previousMemberWasVariableOnlyLine = this.parseMember();
      let hasRegularMember = !previousMemberWasVariableOnlyLine;

      while (this.getCurrentTokenKind() === "COMMA") {
        const previousOutput = this.output;

        if (previousMemberWasVariableOnlyLine) {
          this.expectWithoutWrite("COMMA");
        } else {
          this.expect("COMMA");
        }

        const triviaStart = this.output.length;
        this.skipTrivia();

        if (previousMemberWasVariableOnlyLine) {
          const trivia = this.output.slice(triviaStart);
          this.output =
            previousOutput + trivia.replace(/^[ \t]*\r?\n[ \t]*/, "");
        } else if (this.getCurrentTokenKind() === "VARIABLE") {
          const trivia = this.output.slice(triviaStart);
          this.output =
            previousOutput + (hasRegularMember ? "," : "") + trivia;
        }

        previousMemberWasVariableOnlyLine = this.parseMember();
        hasRegularMember =
          hasRegularMember || !previousMemberWasVariableOnlyLine;
      }

      const triviaStart = this.output.length;
      this.skipTrivia();

      if (previousMemberWasVariableOnlyLine) {
        const trivia = this.output.slice(triviaStart);
        this.output =
          this.output.slice(0, triviaStart) +
          trivia.replace(/^[ \t]*\r?\n[ \t]*/, "");
      }

      this.expect("RIGHT_BRACE");
    } finally {
      this.currentScope = parentScope;
    }
  }

  private parseMember(): boolean {
    this.skipTrivia();

    const isVariable = this.currentToken.kind === "VARIABLE";
    const variableStart = this.currentToken.position;

    if (!isVariable && this.currentToken.kind !== "STRING") {
      this.throwUnexpectedToken();
    }

    const name = this.currentToken.value;

    if (!isVariable) {
      this.write(name);
    }

    this.advance();
    this.skipTrivia();

    if (isVariable) {
      this.expectWithoutWrite("COLON");
      if (this.currentScope.symbols.has(name)) {
        throw new SyntaxError(`Duplicate variable '${name}' in the same scope`);
      }

      const symbol: VariableSymbol = {
        name,
        value: undefined,
        state: "unresolved",
      };
      this.currentScope.symbols.set(name, symbol);
      symbol.value = this.parseSymbolValue();

      const isOnlyLine = this.isVariableOnlyLine(
        variableStart,
        this.currentToken.position,
      );

      if (isOnlyLine) {
        this.removeCurrentLineIndent();
      }

      return isOnlyLine;
    }

    this.expect("COLON");
    this.parseValue();
    return false;
  }

  private isVariableOnlyLine(
    variableStart: number,
    valueEnd: number,
  ): boolean {
    const lineStart = this.source.lastIndexOf("\n", variableStart) + 1;
    const lineEnd = this.source.indexOf("\n", valueEnd);
    const end = lineEnd === -1 ? this.source.length : lineEnd;
    const prefix = this.source.slice(lineStart, variableStart);
    const suffix = this.source.slice(valueEnd, end);

    return (
      /^[ \t]*$/.test(prefix) &&
      /^[ \t]*(?:,[ \t]*)?\r?$/.test(suffix)
    );
  }

  private removeCurrentLineIndent(): void {
    const lineStart = this.output.lastIndexOf("\n") + 1;
    const indent = this.output.slice(lineStart);

    if (/^[ \t]*$/.test(indent)) {
      this.output = this.output.slice(0, lineStart);
    }
  }

  private resolveOutput(): string {
    let output = this.output;

    for (const reference of this.references) {
      if (output.includes(reference.placeholder)) {
        output = output.replaceAll(
          reference.placeholder,
          this.resolveReference(reference),
        );
      }
    }

    return output;
  }

  private resolveReference(reference: VariableReference): string {
    const symbol = this.findSymbol(reference.scope, reference.name);

    if (symbol === undefined) {
      throw new SyntaxError(`Undefined variable '${reference.name}'`);
    }

    return this.resolveSymbol(symbol);
  }

  private resolveSymbol(symbol: VariableSymbol): string {
    if (symbol.state === "resolving") {
      throw new SyntaxError(`Circular reference involving '${symbol.name}'`);
    }

    if (symbol.state === "resolved") {
      if (symbol.value === undefined) {
        throw new SyntaxError(`Undefined variable '${symbol.name}'`);
      }

      return symbol.value;
    }

    if (symbol.value === undefined) {
      throw new SyntaxError(`Undefined variable '${symbol.name}'`);
    }

    symbol.state = "resolving";
    let value = symbol.value;

    for (const reference of this.references) {
      if (value.includes(reference.placeholder)) {
        value = value.replaceAll(
          reference.placeholder,
          this.resolveReference(reference),
        );
      }
    }

    symbol.value = value;
    symbol.state = "resolved";

    return value;
  }

  private findSymbol(
    scope: Scope | undefined,
    name: string,
  ): VariableSymbol | undefined {
    if (scope === undefined) {
      return undefined;
    }

    return scope.symbols.get(name) ?? this.findSymbol(scope.parent, name);
  }

  private parseArray(): void {
    this.expect("LEFT_BRACKET");
    this.skipTrivia();

    if (this.currentToken.kind === "RIGHT_BRACKET") {
      this.advance();
      return;
    }

    this.parseValue();

    while (this.currentToken.kind === "COMMA") {
      this.expect("COMMA");
      this.parseValue();
    }

    this.skipTrivia();
    this.expect("RIGHT_BRACKET");
  }

  private expectWithoutWrite(kind: TokenKind): void { // TODO: Needed?
    if (this.currentToken.kind !== kind) {
      this.throwUnexpectedToken();
    }

    this.advance();
  }

  private getCurrentTokenKind(): TokenKind {  // TODO: Needed?
    return this.currentToken.kind;
  }

  // Lexer

  private readToken(): Token {
    const start = this.position;
    const remaining = this.source.slice(start);

    const patterns: [TokenKind, RegExp][] = [
      ["WHITESPACE", /^[ \t\n\r]+/],
      ["LINE_COMMENT", /^\/\/[^\n\r]*/],
      ["BLOCK_COMMENT", /^\/\*([^*]|\*+[^*/])*\*+\//],
      ["STRING", /^"([^"\\\r\n]|\\.)*"/],
      ["NUMBER", /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/],
      ["VARIABLE", /^\$[a-zA-Z_][a-zA-Z0-9_-]*/],
      ["TRUE", /^true\b/],
      ["FALSE", /^false\b/],
      ["NULL", /^null\b/],
    ];

    for (const [kind, pattern] of patterns) {
      const match = pattern.exec(remaining);

      if (match) {
        this.position += match[0].length;

        return {
          kind,
          value: match[0],
          position: start,
        };
      }
    }

    const punctuation: Record<string, TokenKind> = {
      "{": "LEFT_BRACE",
      "}": "RIGHT_BRACE",
      "[": "LEFT_BRACKET",
      "]": "RIGHT_BRACKET",
      ":": "COLON",
      ",": "COMMA",
    };

    const character = remaining[0];

    if (character && punctuation[character]) {
      this.position++;

      return {
        kind: punctuation[character],
        value: character,
        position: start,
      };
    }

    if (remaining.startsWith("/*")) {
      throw new SyntaxError(`Unterminated block comment at ${start}`);
    }

    if (remaining.startsWith('"')) {
      throw new SyntaxError(`Invalid or unterminated string at ${start}`);
    }

    if (start >= this.source.length) {
      return {
        kind: "EOF",
        value: "",
        position: start,
      };
    }

    throw new SyntaxError(`Unexpected character at ${start}`);
  }

  private parseSymbolValue(): string {
    const previousOutput = this.output;
    this.output = "";

    this.parseValue();

    const value = this.output;
    this.output = previousOutput;

    return value;
  }

  // Token handling

  private advance(): void {
    this.currentToken = this.readToken();
  }

  private expect(kind: TokenKind): void {
    if (this.currentToken.kind !== kind) {
      this.throwUnexpectedToken();
    }

    this.write(this.currentToken.value);
    this.advance();
  }

  private skipTrivia(): void {
    while (
      this.currentToken.kind === "WHITESPACE" ||
      this.currentToken.kind === "LINE_COMMENT" ||
      this.currentToken.kind === "BLOCK_COMMENT"
    ) {
      this.write(this.currentToken.value);
      this.advance();
    }
  }

  private throwUnexpectedToken(): never {
    const { kind, value, position } = this.currentToken;

    throw new SyntaxError(
      `Unexpected token '${value || kind}' at position ${position}`,
    );
  }

  private resolveVariable(name: string): void {
    const placeholder = `\u0000jsonv-reference-${this.referenceCounter++}\u0000`;

    this.references.push({
      placeholder,
      name,
      scope: this.currentScope,
    });
    this.write(placeholder);
  }
}
