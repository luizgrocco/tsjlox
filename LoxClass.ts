import { Interpreter } from "./Interpreter.ts";
import { LoxFunction } from "./LoxFunction.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";

export class LoxClass extends LoxCallable {
  public readonly name: string;
  public readonly superclass: LoxClass | null;
  private readonly methods: Map<string, LoxFunction> = new Map();

  constructor(
    name: string,
    superclass: LoxClass | null,
    methods: Map<string, LoxFunction>
  ) {
    super();
    this.superclass = superclass;
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return null;
  }

  override call(interpreter: Interpreter, args: LoxValue[]): LoxInstance {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer != null) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  arity(): number {
    const initializer = this.findMethod("init");
    if (initializer == null) return 0;
    return initializer.arity();
  }

  override toString(): string {
    return this.name;
  }
}
