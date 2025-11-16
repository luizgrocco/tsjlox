import { RuntimeError } from "./RuntimeError.ts";
import { LoxValue, Token } from "./Token.ts";

export class Environment {
  private readonly values: Map<string, LoxValue> = new Map<string, LoxValue>();

  define(name: string, value: LoxValue): void {
    this.values.set(name, value);
  }

  get(name: Token) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
