import { Interpreter } from "./Interpreter.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";

export class LoxClass extends LoxCallable {
  public name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  override call(_interpreter: Interpreter, _args: LoxValue[]): LoxInstance {
    const instance = new LoxInstance(this);
    return instance;
  }

  arity(): number {
    return 0;
  }

  override toString(): string {
    return this.name;
  }
}
