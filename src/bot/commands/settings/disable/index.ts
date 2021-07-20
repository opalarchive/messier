import { Command, Database, ValidArgs } from "@classes";
import colors from "@colors";
import { convertHex } from "@utils";
import type { Message } from "eris";

export default class Disable extends Command {
  description =
    "This allows the disabling of commands or categories (other than ones that can never be disabled).";
  public disable: boolean = true;
  subcommands = ["list", "category", "command"];
  allowdms = false;
  cooldown = 20000;
  allowdisable = false;
  args = [
    {
      name: "command",
      type: "string",
      optional: false,
      absorb: false,
    },
  ];

  async disableCategory(category: string, msg: Message) {
    if (category === "owner")
      return await msg.inlineReply({
        embeds: [
          {
            title: "This category can't be disabled.",
            description: `This particular category can not be disabled - it is probably a core category.`,
            color: convertHex(colors.red["500"]),
          },
        ],
      });

    await Database.disableCategory(msg.guild.id, category, this.disable);
    return await msg.inlineReply({
      embeds: [
        {
          title: "Successfully disabled category!",
          description: `I've now disabled the category ${category}. Run \`${msg.prefix}enable ${category}\` to re-enable the category.`,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }

  async disableCmd(command: string, msg: Message) {
    let cmd = this.bot.commands.get(command);
    while (typeof cmd === "string") cmd = this.bot.commands.get(cmd);

    if (!cmd)
      throw new Error(
        `Command ${cmd} suddenly disappeared from the list of commands.`
      );

    if (!cmd.allowdisable || cmd.owner || cmd.category === "owner")
      return await msg.inlineReply({
        embeds: [
          {
            title: "This command can't be disabled.",
            description: `This particular command can not be disabled - it is probably a core command.`,
            color: convertHex(colors.red["500"]),
          },
        ],
      });

    await Database.disableCmd(msg.guild.id, command, this.disable);
    return await msg.inlineReply({
      embeds: [
        {
          title: "Successfully disabled command!",
          description: `I've now disabled the command ${command}. Run \`${msg.prefix}enable ${command}\` to re-enable the command.`,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
    const command = (
      (pargs.get("command") as string | undefined) || ""
    ).toLowerCase();
    if (!!this.bot.categories.get(command))
      return await this.disableCategory(command, msg);

    if (!!this.bot.commands.get(command))
      return await this.disableCmd(command, msg);

    return await msg.inlineReply({
      embeds: [
        {
          title: "The command (or category) wasn't found.",
          description: `You gave me a command name of ${command}, but I couldn't find that!`,
          color: convertHex(colors.red["500"]),
        },
      ],
    });
  }
}
