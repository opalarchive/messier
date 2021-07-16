import { Command } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser, isPrivateChannel } from "../../../utils";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Ping extends Command {
  description = "A ping command to get some basic information about the bot.";
  subcommands = [];
  allowdms = true;
  cooldown = 5000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["pong", "wassup"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
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
