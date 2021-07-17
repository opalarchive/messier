import { SubCommand, Database, ValidArgs, Client } from "@classes";
import colors from "tailwindcss/colors";
import { convertHex } from "@utils";
import type { Channel, Message } from "eris";

export default class EnableChannel extends SubCommand {
  allowdms = false;
  args = [
    {
      name: "channel",
      type: "channel",
      optional: false,
    },
  ];
  public description: string;
  public enable: boolean;
  staff = true;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["allow"];
    this.enable = true;
    this.description = "Allow members to use commands in a certain channel.";
  }

  async run(msg: Message, pargs: Map<string, ValidArgs>, _args: string[]) {
    const channel = pargs.get("channel") as Channel | undefined;

    if (!channel)
      return await msg.inlineReply({
        embeds: [
          {
            title: "⛔ You're missing the following arguments!",
            description: `You tried to run the command channel, which requires the following arguments you didn't provide:\n\`CHANNEL\``,
            fields: [
              {
                name: "Help",
                value: `To find more information, run \`${msg.prefix}help channel enable\`.`,
              },
            ],
            color: convertHex(colors.red["500"]),
          },
        ],
      });

    await Database.setChannel(msg.guild.id, channel.id, this.enable);

    return await msg.inlineReply({
      embeds: [
        {
          title: `${this.enable ? "Enabled" : "Disabled"} messages in channel!`,
          description: `I will now ${
            this.enable ? "" : "not "
          }listen to messages sent in <#${channel.id}>!`,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }
}
