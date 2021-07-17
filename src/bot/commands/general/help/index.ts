import { properCase, tagUser, convertHex } from "@utils";
import { Command, SubCommand, ValidArgs, Client } from "@classes";
import type { EmbedField, Message, MessageContent, MessageFile } from "eris";
import colors from "tailwindcss/colors";

export default class Help extends Command {
  public description: string;
  subcommands = ["dm"];
  allowdisable = false;
  allowdms = true;
  args = [
    {
      name: "command",
      type: "string",
      optional: true,
      absorb: true,
    },
  ];
  public dmUser: boolean;
  cooldown = 5000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["h", "listcmds", "listcommands", "commands"];
    this.dmUser = false;
    this.description =
      "The help command for the bot. Add a command, category, or subcommand after this to get specific information.";
  }

  getEmoji(category: string) {
    switch (category) {
      case "general":
        return "⚙️";
      default:
        return "❓";
    }
  }

  getDescription(category: string) {
    switch (category) {
      case "general":
        return `General commands about the bot, such as ping latency, prefixes, invites, and more.`;
      default:
        return "❓";
    }
  }

  getLoadedCommands(category: string) {
    const total = this.bot.commandInfo[category] || 0;

    if (total === 1) return `${total} command loaded.`;
    return `${total} commands loaded`;
  }

  async sendInfo(
    msg: Message,
    content: MessageContent,
    file?: MessageFile | MessageFile[]
  ) {
    if (this.dmUser) {
      try {
        return await (
          await msg.author.getDMChannel()
        ).sendMessage(content, file);
      } catch (_err) {
        return await msg.inlineReply(content, false, file);
      }
    } else return await msg.inlineReply(content, false, file);
  }

  async generalHelpCommand(msg: Message) {
    return await this.sendInfo(msg, {
      embeds: [
        {
          title: "Messier Help",
          color: convertHex(colors[Object.keys(colors).random(1)[0]]["500"]),
          description: `Here are the categories for Messier. To find information about a category, run \`${msg.prefix}help [category]\`.`,
          fields: Array.from(this.bot.categories.keys()).map(
            (category: string) => ({
              name: `**${this.getEmoji(category)}  ${properCase(category)}**`,
              value: `\`${
                this.dmUser ? this.bot.config.prefixes[0] : msg.prefix
              }help ${category}\`\n[Hover for Information](https://messier.dev/commands?category=${category} "${this.getDescription(
                category
              )} ${this.getLoadedCommands(category)}")`,
              inline: false,
            })
          ),
          footer: {
            text: `Ran by ${tagUser(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      ],
    });
  }

  async categoryHelpCommand(msg: Message, category: string) {
    let commands;
    if (!(commands = this.bot.categories.get(category)))
      throw new Error("Invalid Category");

    return await this.sendInfo(msg, {
      embeds: [
        {
          title: `**${this.getEmoji(category)}  ${properCase(category)}**`,
          color: convertHex(colors[Object.keys(colors).random(1)[0]]["500"]),
          description: `[${this.getDescription(
            category
          )}](https://www.messier.dev/commands?category=${category})\n\nRun \`${
            msg.prefix
          }help [command]\` for more information on any particular command. `
            .concat("\n\n")
            .concat(
              Array.from(commands)
                .map((cmd) => `\`${cmd}\``)
                .join(", ")
            ),
          footer: {
            text: `Ran by ${tagUser(msg.author)} | ${this.getLoadedCommands(
              category
            )}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      ],
    });
  }

  getFields(
    command: Command | SubCommand,
    msg: Message,
    higherCommand?: string
  ) {
    let subcommands: Map<string, string | SubCommand>;
    if (!higherCommand) subcommands = new Map();
    else subcommands = this.bot.subcommands.get(command.name) || new Map();

    const fields: EmbedField[] = [];
    const validSubcmds: string[] = [];

    subcommands.forEach((subcmd, name) => {
      if (typeof subcmd !== "string") validSubcmds.push(name);
    });

    if (subcommands.size > 0)
      fields.push({
        name: "Subcommands",
        value: Array.from(validSubcmds)
          .map((subcmd) => `\`${subcmd}\``)
          .join(", "),
        inline: false,
      });

    fields.push({
      name: "Usage",
      value: `<...> is a **required** argument, [...] is an **optional** one.\n\n\`${
        msg.prefix
      }${higherCommand ? higherCommand.concat(" ") : ""}${command.name
        .concat(" ")
        .concat(
          command.args
            .map((arg) => (arg.optional ? `[${arg.name}]` : `<${arg.name}>`))
            .join(" ")
        )
        .trim()}\`\n\n ${command.args.map(
        (arg) =>
          ` - \`${arg.name}\` is a ${arg.type} - ${this.bot.args.getInfo(
            arg.type
          )}`
      )}`,
    });

    if (command.allowdisable === false)
      fields.push({
        name: "Can be Disabled?",
        value: "No",
        inline: true,
      });

    fields.push({
      name: "Can be used in DMs?",
      value: command.allowdms ? "Yes" : "No",
      inline: true,
    });

    if (command.staff)
      fields.push({
        name: "Is staff command?",
        value: "Yes",
        inline: true,
      });

    if (command.cooldown)
      fields.push({
        name: "Cooldown",
        value: `${command.cooldown / 1000} s`,
        inline: true,
      });

    return fields;
  }

  async commandHelpCommand(
    msg: Message,
    command: Command | SubCommand,
    higherCommand?: string
  ) {
    return await this.sendInfo(msg, {
      embeds: [
        {
          title: `**${properCase(higherCommand || command.name)}**`,
          description: command.description,
          fields: this.getFields(command, msg, higherCommand),
          color: convertHex(colors[Object.keys(colors).random(1)[0]]["500"]),
          footer: {
            text: `Ran by ${tagUser(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      ],
    });
  }

  async run(msg: Message, parsedArgs: Map<string, ValidArgs>, _args: string[]) {
    if (!parsedArgs.get("command")) return await this.generalHelpCommand(msg);

    const firstArg =
      (parsedArgs.get("command") as string | undefined)?.split(" ")[0] || "";

    if (this.bot.categories.get(firstArg))
      return await this.categoryHelpCommand(msg, firstArg);

    let command;
    if ((command = this.bot.commands.get(firstArg))) {
      const secondArg =
        (parsedArgs.get("command") as string | undefined)?.split(" ")[1] || "";
      while (typeof command === "string")
        command = this.bot.commands.get(command);

      if (!command) throw new Error("Command not found");

      let subcommand;
      if (
        secondArg &&
        (subcommand = this.bot.subcommands.get(command.name)?.get(secondArg))
      ) {
        while (typeof subcommand === "string")
          subcommand = this.bot.subcommands.get(command.name)?.get(subcommand);
        if (!subcommand) throw new Error("Subcommand not found");
        return await this.commandHelpCommand(msg, subcommand, command.name);
      }
      return await this.commandHelpCommand(msg, command);
    }

    return await this.generalHelpCommand(msg);
  }
}
