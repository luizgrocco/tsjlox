import { Environment } from "./Environment.ts";
import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  This,
  Unary,
  Variable,
  Super,
} from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { LoxFunction } from "./LoxFunction.ts";
import { LoxCallable, LoxValue } from "./LoxTypes.ts";
import { RuntimeError } from "./RuntimeError.ts";
import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  StmtVisitor,
  Var,
  While,
} from "./Stmt.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";
import { ReturnThrow } from "./ReturnThrow.ts";
import { LoxClass } from "./LoxClass.ts";
import { LoxInstance } from "./LoxInstance.ts";

export class Interpreter implements ExprVisitor<LoxValue>, StmtVisitor<void> {
  readonly globals: Environment = new Environment();
  private environment: Environment = this.globals;
  private readonly locals: Map<Expr, number> = new Map();

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

  public visitSetExpr(expr: Set): LoxValue {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitSuperExpr(expr: Super): LoxValue {
    const distance = this.locals.get(expr)!;
    const superclass = this.environment.getAt(distance, "super") as LoxClass;

    const object = this.environment.getAt(distance - 1, "this") as LoxInstance;

    const method = superclass.findMethod(expr.method.lexeme);

    if (method === null) {
      throw new RuntimeError(
        expr.method,
        `Undefined property '${expr.method.lexeme}'.`
      );
    }

    return method.bind(object);
  }

  public visitThisExpr(expr: This): LoxValue {
    return this.lookUpVariable(expr.keyword, expr);
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
    return this.lookUpVariable(expr.name, expr);
  }

  private lookUpVariable(name: Token, expr: Expr): LoxValue {
    const distance = this.locals.get(expr);
    if (distance != null) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
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

  resolve(expr: Expr, depth: number): void {
    this.locals.set(expr, depth);
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

  visitClassStmt(stmt: Class): void {
    let superclass = null;
    if (stmt.superclass !== null) {
      superclass = this.evaluate(stmt.superclass);
      if (!(superclass instanceof LoxClass)) {
        throw new RuntimeError(
          stmt.superclass.name,
          "Superclass must be a class."
        );
      }
    }

    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass !== null) {
      this.environment = new Environment(this.environment);
      this.environment.define("super", superclass);
    }

    const methods: Map<string, LoxFunction> = new Map();
    for (const method of stmt.methods) {
      const func = new LoxFunction(
        method,
        this.environment,
        method.name.lexeme === "init"
      );
      methods.set(method.name.lexeme, func);
    }

    const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

    if (superclass !== null && this.environment.enclosing) {
      this.environment = this.environment.enclosing;
    }

    this.environment.assign(stmt.name, klass);
  }

  public visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  public visitFunctionStmt(stmt: Function): void {
    const func = new LoxFunction(stmt, this.environment, false);
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

  public visitReturnStmt(stmt: Return): void {
    const value = stmt.value !== null ? this.evaluate(stmt.value) : null;

    throw new ReturnThrow(value);
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

    const distance = this.locals.get(expr);
    if (distance != null) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

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

  public visitGetExpr(expr: Get): LoxValue {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties.");
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
        // Rethrow any errors that isn't one of our own so we can identify bugs in the interpreter itself.
        throw error;
      }
    }
  }
}
