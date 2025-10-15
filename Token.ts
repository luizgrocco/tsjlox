import { TokenType } from "./TokenType.ts";

export class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: Record<any, any>;
  readonly line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: Record<any, any>,
    line: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
