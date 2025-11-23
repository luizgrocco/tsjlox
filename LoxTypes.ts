import { Interpreter } from "./Interpreter.ts";
import { LoxClass } from "./LoxClass.ts";
import { LoxInstance } from "./LoxInstance.ts";

export type LoxLiteral = string | number | boolean | null;

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: LoxValue[]): LoxValue;
}

export type LoxValue = LoxLiteral | LoxCallable | LoxClass | LoxInstance;
