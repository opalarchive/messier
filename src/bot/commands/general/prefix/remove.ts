import { SubCommand } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import db from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import { Message, PrivateChannel, TextChannel } from "eris";

export default class RemovePrefix extends SubCommand {
  description =
    "Get the bot's current prefix, set a new prefix, or remove a prefix.";
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
    let prefix = pargs.get("prefix") || "";

    prefix = prefix.replace(/\s+/, " ").toLowerCase();

    let prefixes: Set<string> = (await db.exists(
      `guilds.${msg.channel.guild.id}.prefixes`
    ))
      ? new Set(await db.smembers(`guilds.${msg.channel.guild.id}.prefixes`))
      : new Set(this.bot.config.prefixes);

    const del = prefixes.delete(prefix);

    if (del) await db.srem(`guilds.${msg.channel.guild.id}.prefixes`, prefix);

    const prefixList = [...prefixes];
    prefixList.push(`<@${this.bot.user.id}> `);

    return msg.channel.sendMessage({
      embed: {
        title: "My prefixes",
        color: convertHex(colors.blue["500"]),
        description: `Here are my prefixes${
          msg.channel instanceof PrivateChannel ? "" : " for this server"
        }:\n\n${prefixList
          .map((prefix, idx) => `\`${idx + 1}.\` ${prefix}`)
          .join("\n")}`,
        footer: {
          text: `Ran by ${tagUser(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
      content: `Prefix ${prefix} successfully added.`,
    });
  }
}
