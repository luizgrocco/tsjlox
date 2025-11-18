import { Environment } from "./Environment.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";
import { Function } from "./Stmt.ts";

export class LoxFunction extends LoxCallable {
  private readonly declaration: Function;
  constructor(declaration: Function) {
    super();
    this.declaration = declaration;
  }

  public call(interpreter: Interpreter, args: LoxValue[]): LoxValue {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public override toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
