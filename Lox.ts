import { Interpreter } from "./Interpreter.ts";
import { Parser } from "./Parser.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Scanner } from "./Scanner.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Lox {
  private static readonly interpreter = new Interpreter();
  static hadError = false;
  static hadRuntimeError = false;

  static main(args: string[]) {
    const lox = new Lox();

    if (args.length > 1) {
      console.log("Usage: deno run lox.ts [script]");
      Deno.exit(64);
    } else if (args.length === 1) {
      lox.runFile(args[0]);
    } else {
      lox.runPrompt();
    }
  }

  private runFile(path: string) {
    const source = Deno.readTextFileSync(path);
    this.run(source);
    if (Lox.hadError) Deno.exit(65);
    if (Lox.hadRuntimeError) Deno.exit(70);
  }

  private runPrompt() {
    while (true) {
      const line = prompt("> ");
      if (line === null) break;
      this.run(line);
      Lox.hadError = false;
    }
  }

  private run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (Lox.hadError || expression === null) return;

    Lox.interpreter.interpret(expression);
  }

  static error(line: number, message: string): void;
  static error(token: Token, message: string): void;
  static error(lineOrToken: number | Token, message: string): void {
    if (typeof lineOrToken === "number") {
      const line = lineOrToken;
      this.report(line, "", message);
    } else {
      const token = lineOrToken;
      const where =
        token.type === TokenType.EOF ? " at end" : ` at '${token.lexeme}'`;
      this.report(token.line, where, message);
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.log(error.message + "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }

  private static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}

if (import.meta.main) {
  Lox.main(Deno.args);
}
