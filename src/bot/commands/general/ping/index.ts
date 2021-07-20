import { Command } from "@classes";
import colors from "@colors";
import { convertHex, tagUser, isPrivateChannel } from "@utils";
import type { Message } from "eris";

export default class Ping extends Command {
  description = "A ping command to get some basic information about the bot.";
  subcommands = [];
  allowdms = true;
  cooldown = 5000;
  allowdisable = false;

  aliases = ["pong", "wassup"];

  async run(msg: Message) {
    const pingmsg = await msg.channel.sendMessage({
      embeds: [
        {
          title: "Ping!",
          description: "Pinging server ...",
        },
      ],
      content: "Pinging server ...",
    });

    return await pingmsg.edit({
      embeds: [
        {
          title: "Ping!",
          description: `Server responded in ${
            pingmsg.timestamp - msg.timestamp
          } ms!`,
          color: convertHex(colors.indigo["500"]),
          fields: [
            {
              name: "API Latency",
              value: `${pingmsg.timestamp - msg.timestamp} ms`,
            },
            isPrivateChannel(msg.channel)
              ? null
              : {
                  name: "Latency",
                  value: `${msg.channel.guild.shard.latency} ms`,
                },
          ].filter((el) => !!el),
          footer: {
            text: `Ran by ${tagUser(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      ],
      content: "Server responded!",
    });
  }
}
