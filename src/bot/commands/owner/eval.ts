import type { Message, TextChannel } from "eris";
import { inspect } from "util";
import Command from "../../classes/Command";
import config from "../../config";
import axios from "axios";
import type { ParsedArgs } from "typings/args";
import { convertHex } from "../../utils";
import colors from "tailwindcss/colors";

// Hides API keys and the bot token
const tokens: string[] = [config.token, config.sentry.dsn];

// Tokens to hide
const tokenRegex = new RegExp(tokens.join("|"), "g");

export class EvalCommand extends Command {
  description = "Evaluates some code.";
  args = "[code:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    try {
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring =
        typeof evaluated === "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (evalstring.length > 2000) {
        const body = await axios.post(
          "https://pastie.io/documents",
          evalstring
        );
        await dmchannel.createMessage(`https://pastie.io/${body.data.key}`);
      } else if (evalstring === "true") {
        return msg.channel.createMessage("true!");
      } else {
        return msg.channel.sendMessage({
          embed: {
            title: "Success!",
            description: `\`\`\`js\n${evalstring.replace(
              tokenRegex,
              "[token]"
            )}\n\`\`\``,
            color: convertHex(colors.green["500"]),
          },
        });
      }
    } catch (err) {
      console.error(err);
      this.bot.log.error(err);
      return msg.channel.sendMessage({
        embed: {
          title: "Error!",
          description: `\`\`\`js\n${(err as Error).stack?.replace(
            tokenRegex,
            "[token]"
          )}\n\`\`\``,
          color: convertHex(colors.red["500"]),
        },
      });
    }
  }
}
