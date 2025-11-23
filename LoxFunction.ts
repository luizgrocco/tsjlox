import { Environment } from "./Environment.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";
import { ReturnThrow } from "./ReturnThrow.ts";
import { Function } from "./Stmt.ts";

export class LoxFunction extends LoxCallable {
  private readonly declaration: Function;
  private readonly closure: Environment;
  private readonly isInitializer: boolean;

  constructor(
    declaration: Function,
    closure: Environment,
    isInitializer: boolean
  ) {
    super();
    this.isInitializer = isInitializer;
    this.declaration = declaration;
    this.closure = closure;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
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
        if (this.isInitializer) return this.closure.getAt(0, "this");

        return returnValue.value;
      }
      // If not a returnValue than this code has a bug, rethrow the error for debugging.
      throw returnValue;
    }

    if (this.isInitializer) return this.closure.getAt(0, "this");

    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public override toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
