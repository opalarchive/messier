import { SubCommand } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import db from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import { Message, PrivateChannel, TextChannel } from "eris";

export default class AddPrefix extends SubCommand {
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
    this.aliases = ["set"];
  }

  async run(
    msg: Message<TextChannel>,
    pargs: Map<string, ValidArgs>,
    _args: string[]
  ) {
    let prefix = pargs.get("prefix") || "";
    if (!prefix || prefix.length < 1)
      return msg.inlineReply("You need to specify a non-empty prefix!");
    if (prefix.length > 15)
      return msg.inlineReply("Prefixes may be at most 15 characters.");
    if (prefix.includes("`"))
      return msg.inlineReply("Prefixes may not contain the character `");

    prefix = prefix.replace(/\s+/, " ").toLowerCase();

    let prefixes: string[] = (await db.exists(
      `guilds.${msg.channel.guild.id}.prefixes`
    ))
      ? await db.smembers(`guilds.${msg.channel.guild.id}.prefixes`)
      : this.bot.config.prefixes;

    if (prefixes.some((el) => el.startsWith(prefix) || prefix.startsWith(el)))
      return msg.inlineReply(
        "You can't make a prefix a substring of another prefix."
      );

    prefixes.push(prefix);

    prefixes = [...new Set(prefixes)];

    if (!(await db.smembers(`guilds.${msg.channel.guild.id}.prefixes`)))
      await db.sadd(`guilds.${msg.channel.guild.id}.prefixes`, ...prefixes);
    else await db.sadd(`guilds.${msg.channel.guild.id}.prefixes`, prefix);

    prefixes.unshift(`<@${this.bot.user.id}> `);

    prefixes = [...new Set(prefixes)];

    return msg.channel.sendMessage({
      embed: {
        title: "My prefixes",
        color: convertHex(colors.yellow["500"]),
        description: `Here are my prefixes${
          msg.channel instanceof PrivateChannel ? "" : " for this server"
        }:\n\n${prefixes
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
