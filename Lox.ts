export class Lox {
  private hadError = false;

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
    if (this.hadError) Deno.exit(65);
  }

  private runPrompt() {
    while (true) {
      const line = prompt("> ");
      if (line === null) break;
      this.run(line);
      this.hadError = false;
    }
  }

  private run(source: string) {
    console.log(`Would interpret:\n${source}`);
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  private report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}

if (import.meta.main) {
  const lox = new Lox();
  lox.main(Deno.args);
}
