import { Command } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex } from "../../../utils";
import { getChannelInformation } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Channel extends Command {
  description = "View the channel settings for this server.";
  subcommands = ["enable", "disable", "default"];
  allowdms = false;
  cooldown = 5000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["channels"];
  }

  getChannelMessage(
    info: { disableDefault: boolean; list: string[] },
    page: number = 0
  ) {
    const { disableDefault, list } = info;
    console.log(list);
    return {
      embeds: [
        {
          title: "Channel Information",
          description: !!list[0]
            ? `Here are the ${
                disableDefault ? "enabled" : "disabled"
              } channels in this guild; all other channels are ${
                disableDefault ? "disabled" : "enabled"
              }:\n\n${list
                .slice(page * 20, page * 20 + 20)
                .map((cid) => ` - <#${cid}>`)
                .join("\n")}`
            : `There are no ${
                disableDefault ? "enabled" : "disabled"
              } channels in this guild`,
          fields: [
            {
              name: "Channels Disabled by Default?",
              value: disableDefault ? "Yes" : "No",
            },
          ],
          color: convertHex(colors.pink["500"]),
        },
      ],
    };
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    const info = await getChannelInformation(msg.guild.id);

    await msg.inlineReply(this.getChannelMessage(info, 0));
  }
}
