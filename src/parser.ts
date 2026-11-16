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

export class Parser {
  private position = 0;
  private output = "";
  private currentToken: Token;

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

    return this.output;
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

      case "STRING":
      case "NUMBER":
      case "VARIABLE":
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
    this.skipTrivia();

    if (this.currentToken.kind === "RIGHT_BRACE") {
      this.advance();
      return;
    }

    this.parseMember();

    while (this.currentToken.kind === "COMMA") {
      this.expect("COMMA");
      this.skipTrivia();
      this.parseMember();
    }

    this.skipTrivia();
    this.expect("RIGHT_BRACE");
  }

  private parseMember(): void {
    this.skipTrivia();

    if (
      this.currentToken.kind !== "STRING" &&
      this.currentToken.kind !== "VARIABLE"
    ) {
      this.throwUnexpectedToken();
    }

    this.write(this.currentToken.value);
    this.advance();

    this.skipTrivia();

    this.expect("COLON");
    this.parseValue();
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
}
