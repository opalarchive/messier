import { Command } from "@classes";
import config from "@/config";
import type { Message } from "eris";
import { convertHex, extractContent } from "@utils";
import colors from "@colors";
import { transpile } from "typescript";

export default class Eval extends Command {
  description = "Evaluate a function!";
  subcommands = ["shell"];
  allowdms = true;
  cooldown = 3000;
  owner = true;
  tokens: string[] = [config.token, config.sentry.dsn];
  tokenRegex: RegExp = new RegExp(this.tokens.join("|"), "g");

  codeify(msg: string, ext: string) {
    if (msg.startsWith(`\`\`\`${ext}`) && msg.endsWith("```"))
      return msg.slice(5, -3);
    if (msg.startsWith("```") && msg.endsWith("```")) return msg.slice(3, -3);
    return msg;
  }

  async reportError(err: Error, msg: Message) {
    return await msg.channel.sendMessage({
      embeds: [
        {
          title: "<:error:837489379345694750> You got an error!",
          description: `You got the following error: \`\`\`\n${(err.stack || "")
            .replace(this.tokenRegex, "[token]")
            .substring(0, 4000)}\n\`\`\`You suck at coding mate.`,
          color: convertHex(colors.red["500"]),
        },
      ],
    });
  }

  async sendSuccess(res: string, msg: Message) {
    return await msg.inlineReply({
      embeds: [
        {
          title: "Result of Evaluated Code",
          description: `\`\`\`${`${res}`
            .replace(this.tokenRegex, "[token]")
            .substring(0, 4000)}\`\`\``,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }

  async run(msg: Message) {
    let code = this.codeify(extractContent(msg, true), "ts");
    try {
      code = transpile(code);
      const res = await eval(code);
      this.sendSuccess(res, msg);
    } catch (err) {
      await this.reportError(err as Error, msg);
    }
  }
}
