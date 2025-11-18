import { Environment } from "./Environment.ts";
import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { LoxFunction } from "./LoxFunction.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";
import { RuntimeError } from "./RuntimeError.ts";
import {
  Block,
  Expression,
  Function,
  If,
  Print,
  Stmt,
  StmtVisitor,
  Var,
  While,
} from "./Stmt.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Interpreter implements ExprVisitor<LoxValue>, StmtVisitor<void> {
  readonly globals: Environment = new Environment();
  private environment: Environment = this.globals;

  constructor() {
    this.globals.define(
      "clock",
      new (class extends LoxCallable {
        arity(): number {
          return 0;
        }

        call(_interpreter: Interpreter, _args: LoxValue[]): LoxValue {
          return Date.now() / 1000.0;
        }

        override toString(): string {
          return "<native fn>";
        }
      })()
    );
  }

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical): LoxValue {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
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

  public visitVariableExpr(expr: Variable): LoxValue {
    return this.environment.get(expr.name);
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
    if (typeof value === "boolean") return !!value;

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

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  public visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  public visitFunctionStmt(stmt: Function): void {
    const func = new LoxFunction(stmt);
    this.environment.define(stmt.name.lexeme, func);
  }

  public visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  public visitPrintStmt(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  public visitVarStmt(stmt: Var): void {
    const value: LoxValue =
      stmt.initializer !== null ? this.evaluate(stmt.initializer) : null;

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  public visitAssignExpr(expr: Assign): LoxValue {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
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

  public visitCallExpr(expr: Call): LoxValue {
    const callee = this.evaluate(expr.callee);

    const args: LoxValue[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    // console.dir(callee, { depth: null });

    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    const func = callee;

    if (args.length !== func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity()} arguments but got ${args.length}.`
      );
    }

    return func.call(this, args);
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      } else {
        // Rethrow any error that isn't one of our own so we can identify bugs in the interpreter itself.
        throw error;
      }
    }
  }
}
