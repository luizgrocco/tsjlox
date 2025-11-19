import { LoxValue } from "./LoxTypes.ts";

export class ReturnThrow extends Error {
  public readonly value: LoxValue;

  constructor(value: LoxValue) {
    super();
    this.value = value;
  }
}
