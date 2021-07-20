import { SubCommand, ValidArgs, Client, Database } from "@classes";
import colors from "tailwindcss/colors";
import { convertHex } from "@utils";
import { Message, Permission } from "eris";
import type {
  APIMessageComponentInteraction,
  APIGuildMessageComponentInteraction,
} from "discord-api-types/payloads";

export default class DefaultChannel extends SubCommand {
  allowdms = false;
  description =
    "Change the default channel preset to enabled or disabled. Requires administrator permissions.";
  reqperms = ["administrator"];
  interactions = {
    "channel.enable": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.reset(params, info, this.bot, "e"),
    "channel.disable": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.reset(params, info, this.bot, "d"),
    "channel.no-default": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.reset(params, info, this.bot, "n"),
  };
  args = [
    {
      name: "toEnable",
      type: "string",
      optional: false,
    },
  ];
  cooldown = 60000;

  async reset(
    params: URLSearchParams,
    info: APIMessageComponentInteraction,
    bot: Client,
    type: string
  ) {
    const guild = params.get("g");
    let isAdmin: boolean;

    if (info.hasOwnProperty("member"))
      isAdmin = new Permission(
        (info as APIGuildMessageComponentInteraction).member.permissions || ""
      ).has("administrator");
    else
      return await bot.createInteractionResponse(info.id, info.token, 4, {
        embeds: [
          {
            title: "<:error:837489379345694750> Something went wrong",
            description:
              "This shouldn't happen - no one clicked the button...yeah right Discord.",
            color: convertHex(colors.red["500"]),
          },
        ],
        flags: 1 << 6,
      });

    if (!guild) {
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
        `Missing/invalid information in \`channel default\` query ${JSON.stringify(
          info,
          null,
          2
        )}`
      );
    }

    if (!isAdmin)
      return await bot.createInteractionResponse(info.id, info.token, 4, {
        embeds: [
          {
            title: "<:error:837489379345694750> You're not an admin",
            description:
              "You tried to press the button above me somewhere, but you're not even an admin. How so sneaky.",
            color: convertHex(colors.red["500"]),
          },
        ],
        flags: 1 << 6,
      });

    if (type === "n")
      return await bot.createInteractionResponse(info.id, info.token, 7, {
        content: "Action cancelled!",
        components: [],
      });
    else {
      Database.setChannelDefaultDisable(guild, type === "d");
      return await bot.createInteractionResponse(info.id, info.token, 7, {
        content: `By default, channels will now be ${
          type === "d" ? "disabled" : "enabled"
        }!`,
        components: [],
      });
    }
  }

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
    const toEnable = pargs.get("toEnable") as string | undefined;
    if (
      !toEnable ||
      !["d", "e"].some((el) => toEnable.toLowerCase().startsWith(el))
    )
      return await msg.inlineReply(
        "You need to tell me whether to **enable (e)** or **disable (d)** channels by default"
      );

    const disable = toEnable.startsWith("d");
    const curr = await Database.channelDefaultDisable(msg.guild.id);

    if (disable === curr)
      return await msg.inlineReply(
        `You chose to ${
          disable ? "disable" : "enable"
        } channels, but this is already the default!`
      );

    return await msg.inlineReply({
      content: `Are you **absolutely sure** you want to reset all channel settings, and also change the default to ${
        disable ? "disabled" : "enabled"
      } channels?`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Change Default, I'm Sure!",
              style: 3,
              custom_id: `channel.${disable ? "disable" : "enable"}?g=${
                msg.guild.id
              }`,
            },
            {
              type: 2,
              label: "Nevermind, Don't Reset!",
              style: 4,
              custom_id: `channel.no-default?g=${msg.guild.id}`,
            },
          ],
        },
      ],
    });
  }
}
