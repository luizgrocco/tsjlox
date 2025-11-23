import { LoxValue } from "./LoxTypes.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";

export class Environment {
  readonly enclosing?: Environment;
  private readonly values: Map<string, LoxValue> = new Map<string, LoxValue>();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing;
  }

  define(name: string, value: LoxValue): void {
    this.values.set(name, value);
  }

  ancestor(distance: number): Environment {
    let environment;
    environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing!;
    }

    return environment;
  }

  getAt(distance: number, name: string): LoxValue {
    return this.ancestor(distance).values.get(name)!;
  }

  assignAt(distance: number, name: Token, value: LoxValue): void {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  get(name: Token): LoxValue {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    if (this.enclosing) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: LoxValue): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
