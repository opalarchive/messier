import { SubCommand } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import { removePrefix } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message, TextChannel } from "eris";

export default class RemovePrefix extends SubCommand {
  description = "Remove a prefix from the bot for this server.";
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
    this.aliases = ["yeet"];
  }

  async run(
    msg: Message<TextChannel>,
    pargs: Map<string, ValidArgs>,
    _args: string[]
  ) {
    let prefix = (pargs.get("prefix") || "") as string;
    try {
      const prefixes = [`<@${this.bot.user.id}> `].concat(
        await removePrefix(msg.channel.guild.id, prefix)
      );

      return await msg.channel.sendMessage({
        embeds: [
          {
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
        ],
        content: `Prefix ${prefix} successfully removed.`,
      });
    } catch (err) {
      return await msg.inlineReply((err as Error).message);
    }
  }
}
