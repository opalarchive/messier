import { Command } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser, isPrivateChannel } from "../../../utils";
import { getPrefixes } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Prefix extends Command {
  description =
    "Get the bot's current prefix, set a new prefix, or remove a prefix.";
  subcommands = ["add"];
  allowdms = true;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["pre"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    let prefixes: string[] = this.bot.config.prefixes;

    if (!isPrivateChannel(msg.channel)) {
      prefixes = [`<@${this.bot.user.id}> `].concat(
        await getPrefixes(msg.channel.guild.id)
      );
    }

    return await msg.channel.sendMessage({
      embed: {
        title: "My prefixes",
        color: convertHex(colors.green["500"]),
        description: `Here are my prefixes${
          isPrivateChannel(msg.channel) ? "" : " for this server"
        }:\n\n${prefixes
          .map((prefix, idx) => `\`${idx + 1}.\` ${prefix}`)
          .join("\n")}`,
        footer: {
          text: `Ran by ${tagUser(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
