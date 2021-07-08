import { SubCommand } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import { resetPrefixes } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message, TextChannel } from "eris";

export default class ResetPrefix extends SubCommand {
  description = "Reset the prefixes of the bot.";
  allowdms = false;
  staff = true;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
  }

  async run(
    msg: Message<TextChannel>,
    _pargs: Map<string, ValidArgs>,
    _args: string[]
  ) {
    const prefixes = [`<@${this.bot.user.id}> `].concat(
      await resetPrefixes(msg.channel.guild.id)
    );

    return await msg.channel.sendMessage({
      embed: {
        title: "My prefixes",
        color: convertHex(colors.blue["500"]),
        description: `Here are my prefixes for this server:\n\n${prefixes
          .map((prefix, idx) => `\`${idx + 1}.\` ${prefix}`)
          .join("\n")}`,
        footer: {
          text: `Ran by ${tagUser(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
      content: `Prefixes successfully reset`,
    });
  }
}
