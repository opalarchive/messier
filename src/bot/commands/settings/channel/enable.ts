import { SubCommand, Database, ValidArgs } from "@classes";
import colors from "@colors";
import { convertHex } from "@utils";
import { Channel, Message, Constants } from "eris";

export default class EnableChannel extends SubCommand {
  allowdms = false;
  args = [
    {
      name: "channel",
      type: "channel",
      optional: false,
    },
  ];
  description = "Allow members to use commands in a certain channel.";
  public enable: boolean = true;
  staff = true;
  aliases = ["allow"];

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
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

    const types = Constants.ChannelTypes;
    if (
      ![
        types.GUILD_NEWS,
        types.GUILD_NEWS_THREAD,
        types.GUILD_PRIVATE_THREAD,
        types.GUILD_PUBLIC_THREAD,
        types.GUILD_TEXT,
      ].some((el) => el === channel.type)
    )
      return await msg.inlineReply({
        embeds: [
          {
            title: "⛔ That's not a text channel.",
            description: `You tried to run the command channel, which requires a text channel to be provided. Please make sure to give me a text channel and not a voice (or other) channel.`,
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
