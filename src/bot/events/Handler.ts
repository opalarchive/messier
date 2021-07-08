import Event from "../classes/Event";
import * as Sentry from "@sentry/node";
import config from "../config";
import * as colors from "tailwindcss/colors";
import { convertHex, isPrivateChannel } from "../utils";
import type { Command } from "../classes/Command";
import type { Message } from "eris";

const inviteRegex = /(https?:\/\/)?discord.(gg)\/[a-z0-9]+/i;

// Hides API keys and the bot token from output
const tokens: string[] = [config.token, config.sentry.dsn];

// Tokens to hide
const tokenRegex = new RegExp(tokens.join("|"), "g");

export class HandlerEvent extends Event {
  events = ["messageCreate"];

  async run(_event: string, msg: Message) {
    if (!msg || !msg.content || msg.author.bot || !msg.channel || !msg.author)
      return;
    let prefix = "";

    if (!msg.channel.createMessage)
      msg.channel = await msg.author.getDMChannel();

    msg.originalContent = msg.content;
    msg.content = msg.content.toLowerCase();

    // DM Specific actions
    if (isPrivateChannel(msg.channel)) {
      if (inviteRegex.test(msg.content)) {
        return msg.inlineReply({
          embed: {
            title: "Invite Me!",
            description: `You can invite me by clicking [this link](https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=2147806272) or going to [https://www.messier.dev/invite](https://www.messier.dev/invite).\n\n**Need Support?** Join the support server at [https://discord.gg/pxbxRDBQHp](https://discord.gg/pxbxRDBQHp) or [https://www.messier.dev/discord](https://www.messier.dev/discord).`,
            color: convertHex(colors.green["500"]),
          },
        });
      }
    }

    const guildconfig: GuildConfig | undefined = !isPrivateChannel(msg.channel)
      ? await this.bot.db.getGuildConfig(
          msg.channel.guild ? msg.channel.guild.id : ""
        )
      : undefined;
    // Finds what prefix to use
    const mentionRegex = new RegExp(`<@!?${this.bot.user.id}> ?`);
    const mentionPrefix = mentionRegex.exec(msg.content);
    const prefixes = this.bot.config.prefixes
      .map((p: string) => msg.content.toLowerCase().startsWith(p))
      .indexOf(true);
    let userPrefix;
    if (mentionPrefix?.index === 0) prefix = mentionPrefix?.[0];
    else if (
      guildconfig?.prefixes &&
      (userPrefix = guildconfig.prefixes.filter((p) =>
        msg.content.toLowerCase().startsWith(p)
      )[0])
    )
      prefix = userPrefix;
    else if (!guildconfig?.prefixes && prefixes !== -1)
      prefix = this.bot.config.prefixes[prefixes];
    else if (msg.content.startsWith(`<@${this.bot.user.id}> `))
      prefix = `<@${this.bot.user.id}> `;

    if (!prefix) return;

    msg.prefix = prefix;

    // Finds the command to run
    const [commandName, ...args] = msg.content
      .trim()
      .slice(prefix.length)
      .split(/\s+/g);
    let command = this.bot.commands.get(commandName);

    while (typeof command === "string")
      command = this.bot.commands.get(command);

    if (!command) return;

    let subcommand = this.bot.subcommands.get(command.name)?.get(args[0]);

    while (typeof subcommand === "string")
      subcommand = this.bot.subcommands.get(command.name)?.get(args[0]);

    if (subcommand) args.shift();

    // Handles owner commands
    if (
      (command.owner || subcommand?.owner) &&
      !this.bot.config.owners.includes(msg.author.id)
    )
      return;

    // Handles commands in DMs
    if (
      (!command.allowdms || (subcommand && !subcommand.allowdms)) &&
      isPrivateChannel(msg.channel)
    )
      return msg.channel.sendMessage({
        embed: {
          title: "❌ That action can't be done!",
          description: `You tried to run the command ${command.name}, which doesn't work in DMs. Try to run this in a server!`,
          color: convertHex(colors.red["500"]),
        },
      });

    // Handles guild options
    if (!isPrivateChannel(msg.channel)) {
      if (command.allowdisable !== false) {
        // Disabled categories
        if (guildconfig?.disabledCategories?.includes(command.category))
          return msg.channel.sendMessage({
            embed: {
              title: "❌ That action can't be done!",
              description: `You tried to run the command ${command.name}, which is disabled in this guild (in fact, the entire category ${command.category} is disabled). Run this in another guild!`,
              color: convertHex(colors.red["500"]),
            },
          });

        // Disabled commands
        if (
          guildconfig?.disabledCmds?.includes(command.name) ||
          guildconfig?.disabledCmds?.includes(
            `${command.name}/${subcommand?.name}`
          )
        )
          return msg.channel.sendMessage({
            embed: {
              title: "❌ That action can't be done!",
              description: `You tried to run the command ${command.name}, which is disabled in this guild. Run this in another guild!`,
              color: convertHex(colors.red["500"]),
            },
          });
      }

      // Handles staff commands
      if (command.staff || subcommand?.staff) {
        if (
          !msg.member?.permissions?.has("administrator") &&
          guildconfig?.staffRole &&
          !msg.member?.roles.includes(guildconfig.staffRole)
        )
          return msg.channel.sendMessage({
            embed: {
              title: "❌ That action can't be done!",
              description: `You need the staff role ${
                guildconfig.staffRole
                  ? `(<@&${guildconfig.staffRole}>)`
                  : "(which is not set up yet)"
              } or administrator permissions to run a staff command!`,
              color: convertHex(colors.red["500"]),
            },
          });
      }

      const dmChannel = await msg.author.getDMChannel();
      const botPerms = msg.channel.guild.members.get(
        this.bot.user.id
      )?.permissions;

      // Sends if the bot can't send messages in a channel or guild
      if (
        !msg.channel.permissionsOf(this.bot.user.id).has("sendMessages") ||
        !botPerms?.has("sendMessages")
      ) {
        return dmChannel
          .sendMessage({
            embed: {
              title: "🔇 I can't speak!",
              description: `You tried to run the command ${command.name}, but I can't talk in the channel <#${msg.channel.id}>. Try to resolve this issue and run the command again.`,
              color: convertHex(colors.red["500"]),
            },
          })
          .catch(() => {});
      }

      // Sends if the bot can't embed messages in a channel or guild
      if (
        !msg.channel.permissionsOf(this.bot.user.id).has("embedLinks") ||
        !botPerms.has("embedLinks")
      ) {
        return dmChannel
          .sendMessage({
            embed: {
              title: "🔇 I can't speak!",
              description: `You tried to run the command ${command.name}, but I can't send embeds in the channel <#${msg.channel.id}>. Try to resolve this issue and run the command again.`,
              color: convertHex(colors.red["500"]),
            },
          })
          .catch(() => {});
      }

      // Handles clientPerms
      if (command.clientperms?.length) {
        const missingPerms: string[] = [];

        command.clientperms.forEach((perm: any) => {
          if (!botPerms.has(perm)) missingPerms.push(perm);
        });

        // Sends any missingperms
        if (missingPerms.length)
          return msg.inlineReply({
            embed: {
              title: "🔇 I'm missing the following permissions!",
              description: `You tried to run the command ${
                command.name
              }, which requires the following permissions I don't have:\n${missingPerms
                .map((mperm) => `\`${mperm}\``)
                .join("\n")}`,
              color: convertHex(colors.red["500"]),
            },
          });
      }

      // Handles commands with reqperms
      if (command.reqperms?.length && !guildconfig?.staffRole) {
        const missingPerms: string[] = [];
        command.reqperms.forEach((perm: any) => {
          if (!msg.member?.permissions?.has(perm)) missingPerms.push(perm);
        });

        // Sends any missingperms
        if (missingPerms.length)
          return msg.inlineReply({
            embed: {
              title: "⛔ You're missing the following permissions!",
              description: `You tried to run the command ${
                command.name
              }, which requires the following permissions you don't have:\n${missingPerms
                .map((mperm) => `\`${mperm}\``)
                .join("\n")}`,
              color: convertHex(colors.red["500"]),
            },
          });
      }
    }

    // Handles command cooldowns
    if (command.cooldown && !this.bot.config.owners.includes(msg.author.id)) {
      const cooldown = this.bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return msg.addReaction("⌛");
      this.bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => {
        this.bot.cooldowns.delete((command as Command).name + msg.author.id);
      }, command.cooldown);
    }

    // Handles command arguments
    let parsedArgs = new Map();
    if (command.args || subcommand?.args) {
      // Parses arguments and sends if missing any
      const cmdArgs = subcommand ? subcommand.args : command.args;
      parsedArgs = await this.bot.args.parse(cmdArgs, args.join(" "), msg);
      const missingargs = cmdArgs.filter((el) => {
        return !el.optional && parsedArgs.get(el.name) === undefined;
      });

      if (missingargs.length) {
        return msg.inlineReply({
          embed: {
            title: "⛔ You're missing the following arguments!",
            description: `You tried to run the command ${
              command.name
            }, which requires the following arguments you didn't provide:\n${missingargs
              .map((a) => `\`${a.name.toUpperCase()}\``)
              .join(` or `)}`,
            fields: [
              {
                name: "Help",
                value: `To find more information, run \`${msg.prefix}help ${
                  command.name
                }${subcommand ? ` ${subcommand.name}` : ""}\`.`,
              },
            ],
            color: convertHex(colors.red["500"]),
          },
        });
      }
    }

    // Logs when a command is ran
    this.bot.log.info(
      `<@${msg.author}> ran ${command.name} in ${
        isPrivateChannel(msg.channel) ? "DMs" : msg.channel.guild?.name
      }${args.length ? `: ${args}` : ""}`
    );
    this.bot.logs.push({
      cmdName: command.name,
      authorID: msg.author.id,
      guildID: isPrivateChannel(msg.channel)
        ? msg.author.id
        : msg.channel.guild?.id,
      args: args,
      date: msg.timestamp,
    });

    try {
      // Runs the command & emits typing if it isn't silent
      if (command.silent !== true || subcommand?.silent !== true)
        await msg.channel.sendTyping();
      subcommand
        ? await subcommand.run(msg, parsedArgs, args)
        : await command.run(msg, parsedArgs, args);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        // Captures exceptions with Sentry
        Sentry.configureScope((scope) => {
          scope.setUser({ id: msg.author.id, username: `<@${msg.author.id}>` });
          scope.setExtra(
            "guild",
            isPrivateChannel(msg.channel) ? "DMs" : msg.channel.guild?.name
          );
          scope.setExtra(
            "guildID",
            isPrivateChannel(msg.channel)
              ? msg.author.id
              : msg.channel.guild?.name
          );
        });

        // Logs the error
        Sentry.captureException(err);
      }
      this.bot.log.error(err);

      msg.channel.sendMessage({
        embed: {
          title: "<:error:837489379345694750> I ran into an error!",
          description: `I ran into the following error: \`\`\`\n${(
            err as Error
          ).message
            .replace(tokenRegex, "[token]")
            .substring(
              1900
            )}\n\`\`\`It's already been reported, and a developer will contact you soon.`,
          color: convertHex(colors.red["500"]),
        },
      });
    }
  }
}
