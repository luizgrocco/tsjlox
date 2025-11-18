import { LoxLiteral } from "./LoxTypes.ts";
import { TokenType } from "./TokenType.ts";

export class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: LoxLiteral;
  readonly line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: LoxLiteral,
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
