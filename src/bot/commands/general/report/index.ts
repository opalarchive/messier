import { Command } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser, isPrivateChannel } from "../../../utils";
import { addReport } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Report extends Command {
  description = "A ping command to get some basic information about the bot.";
  subcommands = [];
  allowdms = true;
  args = [
    {
      name: "bug",
      type: "string",
      absorb: true,
      optional: false,
    },
  ];
  cooldown = 10000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["bug"];
  }

  extractContent(msg: Message) {
    let content = msg.originalContent;

    content = content.substring(content.indexOf(msg.prefix || ""));
    content = content.substring(content.indexOf(" ") + 1);
    return content;
  }

  async run(msg: Message, pargs: Map<string, ValidArgs>, _args: string[]) {
    if (!pargs.get("bug")) throw new Error("There was no bug reported.");

    const report = this.extractContent(msg);

    const uid = await addReport(
      msg.author.id,
      report,
      isPrivateChannel(msg.channel) ? undefined : msg.channel.guild.id
    );

    return await msg.channel.sendMessage({
      embed: {
        title: "Report added!",
        description: `I added the report of\n\`\`\`${
          report.length > 125
            ? report.substring(0, 100).concat("...").concat(report.slice(-20))
            : report
        }\`\`\``,
        fields: [
          {
            name: "UID",
            value: `Use \`${msg.prefix}report view [uid]\` to view your report:\`\`\`${uid}\`\`\``,
          },
        ],
        color: convertHex(colors.sky["500"]),
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: `Reported by ${tagUser(msg.author)}`,
        },
      },
    });
  }
}
