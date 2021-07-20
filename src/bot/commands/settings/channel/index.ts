import { Command, Database, Client } from "@classes";
import colors from "tailwindcss/colors";
import { convertHex } from "@utils";
import type { AdvancedMessageContent, InteractionPayload, Message } from "eris";
import type { APIMessageComponentInteraction } from "discord-api-types/payloads";

export default class Channel extends Command {
  description = "View the channel settings for this server.";
  subcommands = ["enable", "disable", "default"];
  allowdms = false;
  cooldown = 10000;
  interactions = {
    "channel.next": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.switchPage(params, info, this.bot, 1),

    "channel.previous": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.switchPage(params, info, this.bot, -1),
  };
  aliases = ["channels"];

  async switchPage(
    params: URLSearchParams,
    info: APIMessageComponentInteraction,
    bot: Client,
    direction: -1 | 1
  ) {
    const guild = params.get("g");
    const page = parseInt(params.get("p") || "");

    if (!guild || isNaN(page)) {
      await bot.createInteractionResponse(info.id, info.token, 4, {
        embeds: [
          {
            title: "<:error:837489379345694750> Something went wrong",
            description:
              "I'm not even sure how this happened but I'm missing some information on the interaction! Don't worry, it's been reported to a developer already.",
            color: convertHex(colors.red["500"]),
          },
        ],
      });
      this.bot.editMessage(info.message.channel_id, info.message.id, {
        components: [],
      });
      throw new Error(
        `Missing/invalid information in \`report view next\` query ${JSON.stringify(
          info,
          null,
          2
        )}`
      );
    }

    let prefixes = await Database.getPrefixes(guild);
    const prefix: string = prefixes[0] || bot.config.prefixes[0];

    const channels = await Database.getChannelInformation(guild);

    return await bot.createInteractionResponse(
      info.id,
      info.token,
      7,
      this.getChannelMessage(
        channels,
        page + direction,
        guild,
        prefix
      ) as InteractionPayload
    );
  }

  getChannelMessage(
    info: { disableDefault: boolean; list: string[] },
    page: number = 1,
    guild: string,
    prefix: string
  ) {
    const { disableDefault, list } = info;
    if (page > Math.ceil(list.length / 20)) page = Math.ceil(list.length / 20);
    if (page <= 0) page = 1;

    let components: any[] = [];

    if (page > 1)
      components.push({
        type: 2,
        label: "Previous",
        style: 1,
        custom_id: `channel.previous?g=${guild}&p=${page}`,
      });

    if (page * 20 < list.length)
      components.push({
        type: 2,
        label: "Next",
        style: 1,
        custom_id: `channel.next?g=${guild}&p=${page}`,
      });

    if (list.length === 0)
      return {
        embeds: [
          {
            title: "Channel Information",
            description: `There are no ${
              disableDefault ? "enabled" : "disabled"
            } channels in this guild. You may use \`${prefix}channel ${
              disableDefault ? "enable" : "disable"
            } [channel]\` to ${
              disableDefault ? "enable" : "disable"
            } that channel.`,
            fields: [
              {
                name: "Channels Disabled by Default?",
                value: disableDefault ? "Yes" : "No",
              },
            ],
            color: convertHex(colors.yellow["500"]),
          },
        ],
      };

    const returnContent: AdvancedMessageContent = {
      content: `Here are your tickets. You may use \`${prefix}channel ${
        disableDefault ? "enable" : "disable"
      } [channel]\` to ${disableDefault ? "enable" : "disable"} that channel.`,
      embeds: [
        {
          title: "Channel Information",
          description: `Here are the ${
            disableDefault ? "enabled" : "disabled"
          } channels in this guild; all other channels are ${
            disableDefault ? "disabled" : "enabled"
          }:\n\n${list
            .slice(page * 20 - 20, Math.min(list.length, page * 20))
            .map((cid, idx) => `${page * 20 - 19 + idx}. <#${cid}>`)
            .join("\n")}`,
          fields: [
            {
              name: "Channels Disabled by Default?",
              value: disableDefault ? "Yes" : "No",
            },
          ],
          color: convertHex(colors.yellow["500"]),
        },
      ],
    };

    if (components.length > 0)
      returnContent.components = [
        {
          type: 1,
          components: components,
        },
      ];

    return returnContent;
  }

  async run(msg: Message) {
    const info = await Database.getChannelInformation(msg.guild.id);

    await msg.inlineReply(
      this.getChannelMessage(info, 1, msg.guild.id, msg.prefix || "")
    );
  }
}
