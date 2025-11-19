import { Expr } from "./Expr.ts";
import { Token } from "./Token.ts";

export interface StmtVisitor<T> {
  visitBlockStmt(stmt: Block): T;
  // visitClassStmt(stmt: Class): T;
  visitExpressionStmt(stmt: Expression): T;
  visitFunctionStmt(stmt: Function): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitReturnStmt(stmt: Return): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
}

export abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T;
}

export class Block extends Stmt {
  readonly statements: Stmt[];

  constructor(statements: Stmt[]) {
    super();
    this.statements = statements;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

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

export class If extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch?: Stmt
  ) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

export class While extends Stmt {
  constructor(public readonly condition: Expr, public readonly body: Stmt) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

export class Function extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly params: Token[],
    public readonly body: Stmt[]
  ) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitFunctionStmt(this);
  }
}

export class Return extends Stmt {
  constructor(
    public readonly keyword: Token,
    public readonly value: Expr | null
  ) {
    super();
    this.keyword = keyword;
    this.value = value;
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

// export class Class extends Stmt {
//   constructor(
//     public readonly name: Token,
//     public readonly superclass: Variable | null,
//     public readonly methods: Function[]
//   ) {
//     super();
//     this.name = name;
//     this.superclass = superclass;
//     this.methods = methods;
//   }

//   accept<T>(visitor: StmtVisitor<T>): T {
//     return visitor.visitClassStmt(this);
//   }
// }
