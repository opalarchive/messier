import { SubCommand, ValidArgs, Client, Database } from "@classes";
import colors from "tailwindcss/colors";
import { convertHex } from "@utils";
import { Message, Permission } from "eris";
import type {
  APIMessageComponentInteraction,
  APIGuildMessageComponentInteraction,
} from "discord-api-types/payloads";

export default class EnableChannel extends SubCommand {
  allowdms = false;
  public description: string;
  reqperms = ["administrator"];
  interactions = {
    "channel.reset": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.reset(params, info, this.bot),
  };

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.description =
      "Reset all channel preferences. Requires administrator permissions.";
  }

  async reset(
    params: URLSearchParams,
    info: APIMessageComponentInteraction,
    bot: Client
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
      bot.log.error(
        `Missing/invalid information in \`channel reset\` query ${JSON.stringify(
          info,
          null,
          2
        )}`
      );
      return await bot.createInteractionResponse(info.id, info.token, 4, {
        embeds: [
          {
            title: "<:error:837489379345694750> Something went wrong",
            description:
              "I'm not even sure how this happened but I'm missing some information on the interaction! Don't worry, it's been reported to a developer already.",
            color: convertHex(colors.red["500"]),
          },
        ],
        flags: 1 << 6,
      });
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

    await Database.clearChannel(guild);
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    return await msg.inlineReply({
      content:
        "Are you **absolutely sure** you want to reset all channel settings? This does not change the default for new channels (enable/disable).",
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Reset Values, I'm Sure!",
              style: 1,
              custom_id: `channel.reset?g=${msg.guild.id}`,
            },
          ],
        },
      ],
    });
  }
}
