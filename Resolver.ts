import {
  Expr,
  Variable,
  Assign,
  ExprVisitor,
  Call,
  Binary,
  Grouping,
  Literal,
  Logical,
  Unary,
  Get,
  Set,
} from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import {
  Block,
  Var,
  Stmt,
  Function,
  StmtVisitor,
  Expression,
  If,
  Print,
  Return,
  While,
  Class,
} from "./Stmt.ts";
import { Token } from "./Token.ts";
import { Lox } from "./Lox.ts";

const FunctionType = {
  NONE: "NONE",
  FUNCTION: "FUNCTION",
} as const;

type FunctionType = (typeof FunctionType)[keyof typeof FunctionType];

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly interpreter: Interpreter;
  private readonly scopes: Map<string, boolean>[] = [];
  private currentFunction: FunctionType = FunctionType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitClassStmt(stmt: Class): void {
    this.declare(stmt.name);
    this.define(stmt.name);
  }

  visitExpressionStmt(stmt: Expression): void {
    this.resolve(stmt.expression);
  }

  visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitIfStmt(stmt: If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
  }

  visitPrintStmt(stmt: Print): void {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Return): void {
    if (this.currentFunction == FunctionType.NONE) {
      Lox.error(stmt.keyword, "Can't return from top-level code.");
    }

    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitWhileStmt(stmt: While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);

    for (const argument of expr.args) {
      this.resolve(argument);
    }
  }

  visitGetExpr(expr: Get): void {
    this.resolve(expr.object);
  }

  visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  visitLiteralExpr(_expr: Literal): void {}

  visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitSetExpr(expr: Set): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
  }

  visitVariableExpr(expr: Variable): void {
    if (
      this.scopes.length > 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false
    ) {
      Lox.error(expr.name, "Can't read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
  }

  resolve(statements: Stmt[]): void;
  resolve(statement: Stmt): void;
  resolve(expr: Expr): void;
  resolve(args: Stmt[] | Stmt | Expr): void {
    if (args instanceof Stmt) {
      args.accept(this);
    } else if (args instanceof Expr) {
      args.accept(this);
    } else {
      for (const statement of args) {
        this.resolve(statement);
      }
    }
  }

  private resolveFunction(func: Function, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(func.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) return;

    if (this.scopes[this.scopes.length - 1].has(name.lexeme)) {
      Lox.error(name, "Already a variable with this name in this scope.");
      Deno.exit();
    }

    this.scopes[this.scopes.length - 1].set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) return;

    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
