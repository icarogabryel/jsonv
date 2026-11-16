import { readFile } from "node:fs/promises";
import { Parser, type JsonvWarning } from "./parser.js";

export type { JsonvWarning };

export interface ParseOptions {
  onWarning?: (warning: JsonvWarning) => void;
}

export class JsonvError extends SyntaxError {
  public readonly code = "PARSE_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "JsonvError";
  }
}

export function parse(source: string, options: ParseOptions = {}): string {
  try {
    return new Parser(source, options.onWarning).parse();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new JsonvError(error.message);
    }

    throw error;
  }
}

export async function parseFile(
  path: string,
  options: ParseOptions = {},
): Promise<string> {
  const source = await readFile(path, "utf-8");
  return parse(source, options);
}
