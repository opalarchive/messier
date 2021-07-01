import type { Message } from "eris";
import { PrivateChannel, TextChannel } from "eris";
import Event from "../classes/Event";
import * as Sentry from "@sentry/node";
import config from "../config";
import * as colors from "tailwindcss/colors";
import { convertHex } from "../utils";
import type { ParsedArgs } from "typings/args";

const inviteRegex = /(https?:\/\/)?discord.(gg)\/[a-z0-9]+/i;

// Hides API keys and the bot token from output
const tokens: string[] = [config.token, config.sentry.dsn];

// Tokens to hide
const tokenRegex = new RegExp(tokens.join("|"), "g");

export class HandlerEvent extends Event {
  events = ["messageCreate"];

  async run(_event: string, msg: Message<TextChannel | PrivateChannel>) {
    if (!msg || !msg.content || msg.author.bot || !msg.channel || !msg.author)
      return;
    let prefix = "";

    // DM Specific actions
    if (msg.channel instanceof PrivateChannel) {
      if (inviteRegex.test(msg.content)) {
        return msg.inlineReply({
          embed: {
            title: "Invite Me!",
            description:
              "You can invite me by clicking [this link](https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=1581116663) or going to [https://www.messier.dev/invite](https://www.messier.dev/invite).\n\n**Need Support?** Join the support server at [https://discord.gg/pxbxRDBQHp](https://discord.gg/pxbxRDBQHp) or [https://www.messier.dev/discord](https://www.messier.dev/discord).",
            color: convertHex(colors.green["500"]),
          },
        });
      }
    }

    const guildconfig: GuildConfig | undefined =
      msg.channel instanceof TextChannel
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

    msg.prefix = prefix;

    // Finds the command to run
    const [commandName, ...args] = msg.content
      .trim()
      .slice(prefix.length)
      .split(/\s+/g);
    const command = this.bot.commands.find(
      (cmd) =>
        cmd?.name === commandName.toLowerCase() ||
        cmd?.aliases.includes(commandName.toLowerCase())
    );

    if (!command) return;

    // Handles owner commands
    if (command.owner && !this.bot.config.owners.includes(msg.author.id))
      return;

    // Handles commands in DMs
    if (!command.allowdms && msg.channel instanceof PrivateChannel)
      return msg.channel.sendMessage({
        embed: {
          title: "❌ That action can't be done!",
          description: `You tried to run the command ${command.name}, which doesn't work in DMs. Try to run this in a server!`,
          color: convertHex(colors.red["500"]),
        },
      });

    // Handles guild options
    if (msg.channel instanceof TextChannel) {
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
        if (guildconfig?.disabledCmds?.includes(command.name))
          return msg.channel.sendMessage({
            embed: {
              title: "❌ That action can't be done!",
              description: `You tried to run the command ${command.name}, which is disabled in this guild. Run this in another guild!`,
              color: convertHex(colors.red["500"]),
            },
          });
      }

      // Handles staff commands
      if (command.staff) {
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

      // Handles commands with requiredPerms
      if (command.requiredperms?.length && !guildconfig?.staffRole) {
        const missingPerms: string[] = [];
        command.requiredperms.forEach((perm: any) => {
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
        this.bot.cooldowns.delete(command.name + msg.author.id);
      }, command.cooldown);
    }

    // Handles command arguments
    let parsedArgs: ParsedArgs[] = [];
    if (command.args) {
      // Parses arguments and sends if missing any
      parsedArgs = await this.bot.args.parse(command.args, args.join(" "), msg);
      const missingargs = parsedArgs.filter((a) => {
        return typeof a.value == "undefined" && !a.optional;
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
                value: `To find more information, run ${msg.prefix}help ${command.name}`,
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
        msg.channel instanceof PrivateChannel ? "DMs" : msg.channel.guild?.name
      }${args.length ? `: ${args}` : ""}`
    );
    this.bot.logs.push({
      cmdName: command.name,
      authorID: msg.author.id,
      guildID:
        msg.channel instanceof PrivateChannel
          ? msg.author.id
          : msg.channel.guild.id,
      args: args,
      date: msg.timestamp,
    });

    try {
      // Runs the command & emits typing if it isn't silent
      if (command.silent !== true) await msg.channel.sendTyping();
      await command.run(msg, parsedArgs, args);
    } catch (err: unknown) {
      // Captures exceptions with Sentry
      Sentry.configureScope((scope) => {
        scope.setUser({ id: msg.author.id, username: `<@${msg.author.id}>` });
        scope.setExtra(
          "guild",
          msg.channel instanceof PrivateChannel
            ? "DMs"
            : msg.channel.guild?.name
        );
        scope.setExtra(
          "guildID",
          msg.channel instanceof PrivateChannel
            ? msg.author.id
            : msg.channel.guild?.name
        );
      });

      // Logs the error
      Sentry.captureException(err);
      console.error(err);
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
