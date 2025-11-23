import { LoxClass } from "./LoxClass.ts";
import { LoxValue } from "./LoxTypes.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";

export class LoxInstance {
  private klass: LoxClass;
  private readonly fields = new Map<string, LoxValue>();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): LoxValue {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method != null) return method.bind(this);

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  set(name: Token, value: LoxValue): void {
    this.fields.set(name.lexeme, value);
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
