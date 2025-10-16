import { Scanner } from "./Scanner.ts";

export class Lox {
  static hadError = false;

  main(args: string[]) {
    if (args.length > 1) {
      console.log("Usage: deno run lox.ts [script]");
      Deno.exit(64);
    } else if (args.length === 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  private runFile(path: string) {
    const source = Deno.readTextFileSync(path);
    this.run(source);
    if (Lox.hadError) Deno.exit(65);
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
    // For now, just print the tokens.
    console.log(tokens);
  }

  static error(line: number, message: string) {
    this.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}

if (import.meta.main) {
  const lox = new Lox();
  lox.main(Deno.args);
}
