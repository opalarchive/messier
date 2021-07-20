import { SubCommand, ValidArgs, Client, Database } from "@classes";
import colors from "@colors";
import { convertHex, extractContent, tagUser } from "@utils";
import type { AdvancedMessageContent, InteractionPayload, Message } from "eris";
import type {
  APIMessageComponentInteraction,
  APIGuildMessageComponentInteraction,
  APIDMMessageComponentInteraction,
} from "discord-api-types/payloads";

export default class ViewReports extends SubCommand {
  description =
    "View your current reports; which have been resolved, tracked to GitHub, denied, or not yet processed.";
  subcommands = [];
  allowdms = true;
  args = [
    {
      name: "reportid",
      type: "string",
      absorb: true,
      optional: true,
    },
  ];
  interactions = {
    "report.view.next": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.switchPage(params, info, this.bot, 1),

    "report.view.previous": (
      params: URLSearchParams,
      info: APIMessageComponentInteraction
    ) => this.switchPage(params, info, this.bot, -1),
  };

  async switchPage(
    params: URLSearchParams,
    info: APIMessageComponentInteraction,
    bot: Client,
    direction: -1 | 1
  ) {
    const author = params.get("a");
    const page = parseInt(params.get("p") || "");

    let user = "";

    if (info.hasOwnProperty("member"))
      user =
        (
          info as APIGuildMessageComponentInteraction
        ).member.user?.id?.toString() || "";
    else if (info.hasOwnProperty("user"))
      user = (info as APIDMMessageComponentInteraction).user?.id;
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

    if (!author || isNaN(page)) {
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

    if (user !== author) {
      return await bot.createInteractionResponse(info.id, info.token, 4, {
        embeds: [
          {
            title: "<:error:837489379345694750> You can't do that!",
            description:
              "Only the user who ran the command can actually view their reports - you are not that user, are you?",
            color: convertHex(colors.red["500"]),
          },
        ],
        flags: 1 << 6,
      });
    }

    let prefix = info.message.content || "";
    prefix = prefix.substring(prefix.indexOf("`") + 1);
    prefix = prefix.substring(0, prefix.indexOf("`") - 22);

    const tickets = [...(await Database.getReportForUser(author))];

    return await bot.createInteractionResponse(
      info.id,
      info.token,
      7,
      this.sendAllTickets(
        {
          id: author,
          tag: info.message?.embeds[0]?.footer?.text?.substring(11),
          url: info.message?.embeds[0]?.footer?.icon_url,
        },
        prefix,
        tickets,
        page + direction
      ) as InteractionPayload
    );
  }

  getStatus(report: Record<string, string>) {
    switch (report.status) {
      case "github":
        return `[On GitHub](${report.github})`;
      case "implemented":
        return `Implemented! 🥳 Note from author: ${report.comment}`;
      case "denied":
        return `Denied. Reason: ${report.comment}`;
      case "wip":
        return `We're working on it! Note from author: ${report.comment}`;
      default:
        return "We've not gotten to it yet.";
    }
  }

  sendAllTickets(
    author: { id: string; tag?: string; url?: string },
    prefix: string,
    tickets: string[],
    page: number
  ) {
    if (page > Math.ceil(tickets.length / 10))
      page = Math.ceil(tickets.length / 10);
    if (page <= 0) page = 1;

    let components: any[] = [];

    if (page > 1)
      components.push({
        type: 2,
        label: "Previous",
        style: 1,
        custom_id: `report.view.previous?a=${author.id}&p=${page}`,
      });

    if (page * 10 < tickets.length)
      components.push({
        type: 2,
        label: "Next",
        style: 1,
        custom_id: `report.view.next?a=${author.id}&p=${page}`,
      });

    if (tickets.length === 0)
      return {
        content: `You need to create a ticket first; you can use \`${prefix}report [bug]\` to create a report.`,
        embeds: [],
        components: [],
      };

    const returnContent: AdvancedMessageContent = {
      content: `Here are your tickets. You may use \`${prefix}report view [reportid]\` to view the report's status.`,
      embeds: [
        {
          title: `Showing tickets for ${author.tag}`,
          description: tickets
            ? `Tickets ${page * 10 - 9} to ${Math.min(
                page * 10,
                tickets.length
              )} of ${tickets.length} \`\`\`${tickets
                .slice(page * 10 - 10, Math.min(page * 10, tickets.length))
                .map((ticket, idx) => `${idx + page * 10 - 9}. ${ticket}`)
                .join("\n")}\`\`\``
            : `You have no tickets yet. You can use \`${prefix}report [report]\` to report your issue.`,
          footer: {
            text: `Reports by ${author.tag}`,
            icon_url: author.url,
          },
          color: convertHex(colors.rose["500"]),
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

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
    let reportid;

    const authorObject = {
      id: msg.author.id,
      tag: tagUser(msg.author),
      url: msg.author.dynamicAvatarURL(),
    };

    if (!(reportid = pargs.get("reportid") as string | undefined)) {
      const tickets =
        [...(await Database.getReportForUser(msg.author.id))] || [];
      return await msg.channel.sendMessage(
        this.sendAllTickets(authorObject, msg.prefix || "", tickets, 1)
      );
    }

    const report = await Database.getReport(extractContent(msg, true));

    if (!report.userId) {
      if (!isNaN(parseInt(reportid))) {
        const tickets = [...(await Database.getReportForUser(msg.author.id))];
        return await msg.channel.sendMessage(
          this.sendAllTickets(
            authorObject,
            msg.prefix || "",
            tickets,
            parseInt(reportid)
          )
        );
      }
      return await msg.inlineReply(
        `I couldn't find a report matching \`${reportid}\`. Are you sure you typed it right?`
      );
    }

    return await msg.channel.sendMessage({
      embeds: [
        {
          title: `Ticket ${reportid}`,
          description: `Message sent:\`\`\`${report.message}\`\`\``,
          fields: [
            {
              name: "Time",
              value: `<t:${Math.floor(parseInt(report.timestamp) / 1000)}>`,
              inline: true,
            },
            {
              name: "Author",
              value: `<@${report.userId}>`,
              inline: true,
            },
            {
              name: "Status",
              value: this.getStatus(report),
            },
          ],
          color: convertHex(colors.rose["500"]),
        },
      ],
    });
  }
}
