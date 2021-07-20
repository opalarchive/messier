import { SubCommand, Database } from "@classes";
import colors from "@colors";
import { convertHex, tagUser } from "../../../utils";
import type { Message, TextChannel } from "eris";

export default class ResetPrefix extends SubCommand {
  description = "Reset the prefixes of the bot.";
  allowdms = false;
  staff = true;
  cooldown = 60000;

  async run(msg: Message<TextChannel>) {
    const prefixes = [`<@${this.bot.user.id}> `].concat(
      await Database.resetPrefixes(msg.channel.guild.id)
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
      content: `Prefixes successfully reset`,
    });
  }
}
