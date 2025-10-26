import { LoxValue, Token } from "./Token.ts";

export interface ExprVisitor<T> {
  // visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  // visitCallExpr(expr: Call): T;
  // visitGetExpr(expr: Get): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  // visitLogicalExpr(expr: Logical): T;
  // visitSetExpr(expr: SetExpr): T;
  // visitSuperExpr(expr: SuperExpr): T;
  // visitThisExpr(expr: ThisExpr): T;
  visitUnaryExpr(expr: Unary): T;
  // visitVariableExpr(expr: Variable): T;
}

export abstract class Expr {
  abstract accept<T>(visitor: ExprVisitor<T>): T;
}

// export class Assign extends Expr {
//   constructor(public name: Token, public value: Expr) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitAssignExpr(this);
//   }
// }

export class Binary extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

// export class Call extends Expr {
//   constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitCallExpr(this);
//   }
// }

// export class Get extends Expr {
//   constructor(public object: Expr, public name: Token) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitGetExpr(this);
//   }
// }

export class Grouping extends Expr {
  constructor(public expression: Expr) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  constructor(public value: LoxValue) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

// export class Logical extends Expr {
//   constructor(public left: Expr, public operator: Token, public right: Expr) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitLogicalExpr(this);
//   }
// }

// export class SetExpr extends Expr {
//   constructor(public object: Expr, public name: Token, public value: Expr) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitSetExpr(this);
//   }
// }

// export class SuperExpr extends Expr {
//   constructor(public keyword: Token) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitSuperExpr(this);
//   }
// }

// export class ThisExpr extends Expr {
//   constructor(public keyword: Token) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitThisExpr(this);
//   }
// }

export class Unary extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

// export class Variable extends Expr {
//   constructor(public name: Token) {
//     super();
//   }

//   accept<T>(visitor: ExprVisitor<T>): T {
//     return visitor.visitVariableExpr(this);
//   }
// }
