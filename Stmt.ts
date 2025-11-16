import { Expr } from "./Expr.ts";
import { Token } from "./Token.ts";

export interface StmtVisitor<T> {
  // visitBlockStmt(stmt: Block): T;
  // visitClassStmt(stmt: Class): T;
  visitExpressionStmt(stmt: Expression): T;
  // visitFunctionStmt(stmt: Function): T;
  // visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  // visitReturnStmt(stmt: Return): T;
  visitVarStmt(stmt: Var): T;
  // visitWhileStmt(stmt: While): T;
}

export abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T;
}

// export class Block extends Stmt {
//   readonly statements: Stmt[];

//   constructor(statements: Stmt[]) {
//     super();
//     this.statements = statements;
//   }

//   accept<T>(visitor: Visitor<T>): T {
//     return visitor.visitBlockStmt(this);
//   }
// }

export class Print extends Stmt {
  readonly expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}

export class Expression extends Stmt {
  readonly expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class Var extends Stmt {
  readonly name: Token;
  readonly initializer: Expr | null;

  constructor(name: Token, initializer: Expr | null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}
