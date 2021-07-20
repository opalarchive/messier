import { Command, Database } from "@classes";
import colors from "tailwindcss/colors";
import { convertHex, tagUser, isPrivateChannel } from "@utils";
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
  allowdisable = false;
  aliases = ["bug"];

  extractContent(msg: Message) {
    let content = msg.originalContent.concat(" ");

    content = content.substring(content.indexOf(msg.prefix || ""));
    content = content.substring(content.regexIndexOf(/\s/g) + 1);
    return content;
  }

  async run(msg: Message) {
    const report = this.extractContent(msg).trim();

    if (!report) throw new Error("There was no bug reported.");

    const uid = await Database.addReport(
      msg.author.id,
      report,
      isPrivateChannel(msg.channel) ? undefined : msg.channel.guild.id
    );

    return await msg.channel.sendMessage({
      embeds: [
        {
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
      ],
    });
  }
}
