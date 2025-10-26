import { Binary, Expr, ExprVisitor, Grouping, Literal, Unary } from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { LoxValue, Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Interpreter implements ExprVisitor<LoxValue> {
  constructor() {}

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: Unary) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    // Unreachable.
    return null;
  }

  private checkNumberOperand(
    operator: Token,
    operand: LoxValue
  ): asserts operand is number {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private isTruthy(value: unknown): boolean {
    if (value == null) return false;
    if (value instanceof Boolean) return !!value;
    return true;
  }

  private isEqual(a: LoxValue, b: LoxValue): boolean {
    return a === b;
  }

  private stringify(value: LoxValue): string {
    if (value === null) return "nil";

    return value.toString();
  }

  private evaluate(expr: Expr): LoxValue {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): LoxValue {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.GREATER:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left <= right;
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left - right;
      case TokenType.PLUS: {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      }
      case TokenType.SLASH:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperand(expr.operator, left);
        this.checkNumberOperand(expr.operator, right);
        return left * right;
    }

    // Unreachable.
    return null;
  }

  interpret(expression: Expr): void {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      }
    }
  }
}
