import { Command, Database } from "@classes";
import colors from "@colors";
import { convertHex, tagUser, isPrivateChannel } from "../../../utils";
import type { Message } from "eris";

export default class Prefix extends Command {
  description =
    "Get the bot's current prefix, set a new prefix, or remove a prefix.";
  subcommands = ["add", "remove", "reset"];
  allowdms = true;
  cooldown = 20000;
  aliases = ["pre"];

  async run(msg: Message) {
    let prefixes: string[] = this.bot.config.prefixes;

    if (!isPrivateChannel(msg.channel)) {
      prefixes = [`<@${this.bot.user.id}> `].concat(
        await Database.getPrefixes(msg.channel.guild.id)
      );
    }

    return await msg.channel.sendMessage({
      embeds: [
        {
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
      ],
    });
  }
}
