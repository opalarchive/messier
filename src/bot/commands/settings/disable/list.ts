import { Database, SubCommand } from "@classes";
import type { AdvancedMessageContent, Message } from "eris";

export default class List extends SubCommand {
  allowdms = false;
  aliases = ["all", "show"];
  description = "List all disabled commands for this guild";

  getDisabledComponent(
    list: { commands?: string[]; categories?: string[] },
    page: number,
    prefix: string,
    guild: string
  ) {
    if (!list.commands) list.commands = [];
    if (!list.categories) list.categories = [];

    if (page > Math.ceil(list.commands.length / 20))
      page = Math.ceil(list.commands.length / 20);
    if (page <= 0) page = 1;

    let components: any[] = [];

    if (page > 1)
      components.push({
        type: 2,
        label: "Previous",
        style: 1,
        custom_id: `disable.previous?g=${guild}`,
      });

    if (page * 20 < list.commands.length)
      components.push({
        type: 2,
        label: "Next",
        style: 1,
        custom_id: `disable.next?g=${guild}`,
      });

    if (list.commands.length === 0 && list.categories.length === 0)
      return {
        content: "",
        embeds: [
          {
            title: "There are no disabled commands or categories.",
            description: `You can use \`${prefix}disable [command/category] to disable the command.\``,
          },
        ],
        components: [],
      };

    //let embeds = [];
    let returnContent: AdvancedMessageContent = {};
    return returnContent;
  }

  async run(msg: Message) {
    const disabled = await Database.disableList(msg.guild.id);

    await msg.inlineReply(
      this.getDisabledComponent(disabled, 1, msg.prefix || "", msg.guild.id)
    );
  }
}
