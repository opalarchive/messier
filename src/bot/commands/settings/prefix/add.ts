import { SubCommand } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import { addPrefix } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message, TextChannel } from "eris";

export default class AddPrefix extends SubCommand {
  description = "Add a prefix that the bot will listen to for this server.";
  allowdms = false;
  args = [
    {
      name: "prefix",
      type: "string",
      optional: false,
      absorb: true,
    },
  ];
  staff = true;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["set"];
  }

  async run(
    msg: Message<TextChannel>,
    pargs: Map<string, ValidArgs>,
    _args: string[]
  ) {
    try {
      const prefix = (pargs.get("prefix") || "") as string;
      let prefixes = [`<@${this.bot.user.id}> `].concat(
        await addPrefix(msg.guild.id, prefix)
      );

      return await msg.channel.sendMessage({
        embed: {
          title: "My prefixes",
          color: convertHex(colors.yellow["500"]),
          description: `Here are my prefixes for this server:\n\n${prefixes
            .map((prefix, idx) => `\`${idx + 1}.\` ${prefix}`)
            .join("\n")}`,
          footer: {
            text: `Ran by ${tagUser(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
        content: `Prefix ${prefix} successfully added.`,
      });
    } catch (err) {
      return await msg.inlineReply((err as Error).message);
    }
  }
}
