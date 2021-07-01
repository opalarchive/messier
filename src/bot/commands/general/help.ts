import {
  GuildChannel,
  PrivateChannel,
  TextChannel,
  Message,
  EmbedField,
} from "eris";
import type { ParsedArgs } from "typings/args";
import Command from "../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex } from "../../utils";

export class HelpCommand extends Command {
  description = "Sends a list of commands or info about a specific command.";
  args = "[command:string] | [dm:string]";
  aliases = ["commands", "h", "listcmds", "listcommands"];
  allowdisable = false;
  allowdms = true;
  silent = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Localizes command categories
    function formatCategory(category: string) {
      let label = "";

      switch (category) {
        case "general":
          label = `<:info:837490084302946324> General`;
          break;
        case "settings":
          label = `⚙️ Settings`;
          break;
        case "potd":
          label = `🗓️ PoTD`;
          break;
        case "owner":
          label = `👑 Owner`;
          break;
        case "contest":
          label = `📝 Contest`;
          break;
        case "integrations":
          label = `🔗 Integrations`;
          break;
        case "groupsolve":
          label = `💡 Groupsolve`;
          break;
        default:
          label = `❓ Other Commands`;
          break;
      }

      return label;
    }

    // Finds a command
    let cmd: Command | undefined;
    let owneramt = 0;
    this.bot.commands.forEach((c) =>
      c.category === "owner" ? owneramt++ : null
    );

    if (args)
      cmd = this.bot.commands.find(
        (c) =>
          c.name.toLowerCase() === args.join(" ").toLowerCase() ||
          c.aliases.includes(args.join(" ").toLowerCase())
      );

    // If no command, send a list of commands
    if (!cmd) {
      let db: GuildConfig | undefined;
      if (msg.channel instanceof GuildChannel)
        db = await this.bot.db.getGuildConfig(msg.channel.guild.id);
      let categories: string[] = [];

      // Hides owner & disabled cmds
      this.bot.commands.forEach((c) => {
        if (
          !categories.includes(c.category) &&
          c.nsfw === true &&
          msg.channel.guild &&
          msg.channel.nsfw !== true
        )
          return;
        if (!categories.includes(c.category) && c.category !== "owner")
          categories.push(c.category);
      });

      if (db?.disabledCategories)
        categories = categories.filter((c) => {
          return !db?.disabledCategories?.includes(c);
        });

      const sortedcategories: string[] = [];

      // Sorts categories
      categories = categories.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Formats categories
      categories.forEach((e) => {
        sortedcategories[categories.indexOf(e)] = formatCategory(e);
      });

      const embed = {
        title: `📚 Help`,
        description: `To get more info about a command, run \`${
          db?.prefixes && db.prefixes[0]
            ? db?.prefixes[0]
            : this.bot.config.prefixes[0]
        }help <command>\`.`,
        color: convertHex(colors.blue["500"]),
        fields: categories.map((category) => ({
          name: sortedcategories[categories.indexOf(category)],
          value: this.bot.commands
            .map((c) => {
              if (db?.disabledCmds?.includes?.(c.name)) return;
              if (c.category !== category) return;
              return `\`${c.name}\``;
            })
            .join(" "),
        })),
      };

      // Sends help in the current channel
      if (args?.join(" ").toLowerCase() !== "dm") {
        await msg.channel.sendTyping();
        return msg.channel.sendMessage({
          embed,
        });
      }

      // DMs the user a list of commands
      const dmChannel = await msg.author.getDMChannel();
      const dmson = await dmChannel
        .sendMessage({
          embed,
        })
        .catch(() => {
          // Sends in the channel if failed
          msg.channel.sendMessage({
            embed,
          });

          return;
        });

      // Adds a reaction; ignores in DMs
      if (msg.channel instanceof PrivateChannel) return;
      if (dmson) return msg.addReaction("📬").catch(() => {});
    } else {
      const fields: EmbedField[] = [];
      let aliases: string[] = [];
      aliases = [...cmd.aliases].sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Command aliases
      if (cmd.aliases.length) {
        fields.push({
          name: "Aliases",
          value: aliases.map((alias) => `\`${alias}\``).join(", "),
          inline: false,
        });
      }

      // Command usage
      if (cmd.args) {
        fields.push({
          name: "Usage",
          value: cmd.args
            .split(" ")
            .map(
              (arg) =>
                `${arg.split(":")[0]}${
                  arg[0] === "<" ? ">" : arg[0] === "[" ? "]" : ""
                }`
            )
            .join(" "),
          inline: false,
        });
      }

      // Command cooldown
      if (cmd.cooldown) {
        const time = Math.round(cmd.cooldown / 1000);
        fields.push({
          name: "Cooldown",
          value: `${time} second${time === 1 ? "" : "s"}`,
          inline: true,
        });
      }

      // Command clientperms
      if (cmd.clientperms?.length && cmd.clientperms !== ["embedLinks"]) {
        fields.push({
          name: "Required Permissions (for me)",
          value: cmd.clientperms.join(", "),
          inline: false,
        });
      }

      // Command requiredperms
      if (cmd?.requiredperms?.length) {
        fields.push({
          name: "Required Permissions (for you)",
          value: cmd.requiredperms.join(", "),
          inline: false,
        });
      }

      // If a command isn't toggleable
      if (!cmd.allowdisable) {
        fields.push({
          name: "Allow disable",
          value: `${cmd.allowdisable}`,
          inline: true,
        });
      }

      // If a command is staff restricted
      if (cmd.staff) {
        fields.push({
          name: "Staff",
          value: `${cmd.staff}`,
          inline: true,
        });
      }

      // Sends info about a specific command
      msg.channel.sendTyping();
      msg.channel.createMessage({
        embed: {
          description: cmd.description,
          color: convertHex(colors.blue["500"]),
          fields: fields,
          author: {
            name: cmd.name,
            icon_url: this.bot.user.dynamicAvatarURL(),
          },
          footer: {
            icon_url: msg.author.dynamicAvatarURL(),
            text: `Ran by ${msg.author.username}#${
              msg.author.discriminator
            } | ${this.bot.commands.length - owneramt} commands loaded`,
          },
        },
      });
    }
  }
}
