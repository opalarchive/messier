import type { Message } from "eris";
import { exec } from "child_process";
import Eval from "./";
import { extractContent } from "@utils";

export default class Shell extends Eval {
  description = "Run a shell command!";

  async run(msg: Message) {
    let code = this.codeify(extractContent(msg), "sh");
    try {
      const { err, stdout, stderr } = await new Promise((res) =>
        exec(code, (err, stdout, stderr) => res({ err, stdout, stderr }))
      );
      if (err || stderr) throw new Error(err || stderr);
      await this.sendSuccess(stdout, msg);
    } catch (err) {
      await this.reportError(err as Error, msg);
    }
  }
}
