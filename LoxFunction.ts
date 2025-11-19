import { Environment } from "./Environment.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";
import { ReturnThrow } from "./ReturnThrow.ts";
import { Function } from "./Stmt.ts";

export class LoxFunction extends LoxCallable {
  private readonly declaration: Function;
  private readonly closure: Environment;
  constructor(declaration: Function, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  public call(interpreter: Interpreter, args: LoxValue[]): LoxValue {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (returnValue instanceof ReturnThrow) {
        return returnValue.value;
      }
      // If not a returnValue than this code has a bug, rethrow the error for debugging.
      throw returnValue;
    }

    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public override toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
