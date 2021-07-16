import Event from "../classes/Event";
import * as colors from "tailwindcss/colors";
import { convertHex, isPrivateChannel, reportError } from "../utils";
import type { Command, SubCommand } from "../classes/Command";
import type { Message } from "eris";

const inviteRegex = /(https?:\/\/)?discord.(gg)\/[a-z0-9]+/i;
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
        return await msg.inlineReply({
          embeds: [
            {
              title: "Invite Me!",
              description: `You can invite me by clicking [this link](https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=2147806272) or going to [https://www.messier.dev/invite](https://www.messier.dev/invite).\n\n**Need Support?** Join the support server at [https://discord.gg/pxbxRDBQHp](https://discord.gg/pxbxRDBQHp) or [https://www.messier.dev/discord](https://www.messier.dev/discord).`,
              color: convertHex(colors.green["500"]),
            },
          ],
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

    if (
      guildconfig?.channelDefaultDisable &&
      !guildconfig.channelList?.includes(msg.channel.id)
    ) {
      // Isn't staff
      if (
        !msg.member?.permissions?.has("administrator") &&
        guildconfig?.staffRole &&
        !msg.member?.roles.includes(guildconfig.staffRole)
      )
        return await msg.addReaction("⚠️");
    } else if (
      !guildconfig?.channelDefaultDisable &&
      guildconfig?.channelList?.includes(msg.channel.id)
    ) {
      // Isn't staff
      if (
        !msg.member?.permissions?.has("administrator") &&
        guildconfig?.staffRole &&
        !msg.member?.roles.includes(guildconfig.staffRole)
      )
        return await msg.addReaction("⚠️");
    }

    msg.prefix = prefix;

    // Finds the command to run
    const [commandName, ...args] = msg.content
      .trim()
      .slice(prefix.length)
      .split(/\s+/g);
    let command = this.bot.commands.get(commandName);
    let subcommand: SubCommand | string | undefined;

    try {
      let recTotal = 0;

      while (typeof command === "string") {
        command = this.bot.commands.get(command);
        recTotal++;
        if (recTotal >= 100)
          throw new Error("Maximum while loop size exceeded");
      }

      if (!command) return;

      subcommand = this.bot.subcommands.get(command.name)?.get(args[0]);

      while (typeof subcommand === "string") {
        subcommand = this.bot.subcommands.get(command.name)?.get(subcommand);
        recTotal++;
        if (recTotal >= 100)
          throw new Error("Maximum while loop size exceeded");
      }
    } catch (err) {
      return reportError(msg, this.bot, err as Error);
    }

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
      return await msg.channel.sendMessage({
        embeds: [
          {
            title: "❌ That action can't be done!",
            description: `You tried to run the command ${command.name}, which doesn't work in DMs. Try to run this in a server!`,
            color: convertHex(colors.red["500"]),
          },
        ],
      });

    // Handles guild options
    if (!isPrivateChannel(msg.channel)) {
      if (command.allowdisable !== false) {
        // Disabled categories
        if (guildconfig?.disabledCategories?.includes(command.category))
          return await msg.channel.sendMessage({
            embeds: [
              {
                title: "❌ That action can't be done!",
                description: `You tried to run the command ${command.name}, which is disabled in this guild (in fact, the entire category ${command.category} is disabled). Run this in another guild!`,
                color: convertHex(colors.red["500"]),
              },
            ],
          });

        // Disabled commands
        if (
          guildconfig?.disabledCmds?.includes(command.name) ||
          guildconfig?.disabledCmds?.includes(
            `${command.name}/${subcommand?.name}`
          )
        )
          return await msg.channel.sendMessage({
            embeds: [
              {
                title: "❌ That action can't be done!",
                description: `You tried to run the command ${command.name}, which is disabled in this guild. Run this in another guild!`,
                color: convertHex(colors.red["500"]),
              },
            ],
          });
      }

      // Handles staff commands
      if (command.staff || subcommand?.staff) {
        if (
          !msg.member?.permissions?.has("administrator") &&
          guildconfig?.staffRole &&
          !msg.member?.roles.includes(guildconfig.staffRole)
        )
          return await msg.channel.sendMessage({
            embeds: [
              {
                title: "❌ That action can't be done!",
                description: `You need the staff role ${
                  guildconfig.staffRole
                    ? `(<@&${guildconfig.staffRole}>)`
                    : "(which is not set up yet)"
                } or administrator permissions to run a staff command!`,
                color: convertHex(colors.red["500"]),
              },
            ],
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
        return await dmChannel
          .sendMessage({
            embeds: [
              {
                title: "🔇 I can't speak!",
                description: `You tried to run the command ${command.name}, but I can't talk in the channel <#${msg.channel.id}>. Try to resolve this issue and run the command again.`,
                color: convertHex(colors.red["500"]),
              },
            ],
          })
          .catch(() => {});
      }

      // Sends if the bot can't embed messages in a channel or guild
      if (
        !msg.channel.permissionsOf(this.bot.user.id).has("embedLinks") ||
        !botPerms.has("embedLinks")
      ) {
        return await dmChannel
          .sendMessage({
            embeds: [
              {
                title: "🔇 I can't speak!",
                description: `You tried to run the command ${command.name}, but I can't send embeds in the channel <#${msg.channel.id}>. Try to resolve this issue and run the command again.`,
                color: convertHex(colors.red["500"]),
              },
            ],
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
          return await msg.inlineReply({
            embeds: [
              {
                title: "🔇 I'm missing the following permissions!",
                description: `You tried to run the command ${
                  command.name
                }, which requires the following permissions I don't have:\n${missingPerms
                  .map((mperm) => `\`${mperm}\``)
                  .join("\n")}`,
                color: convertHex(colors.red["500"]),
              },
            ],
          });
      }

      // Handles commands with reqperms
      if (
        (command.reqperms?.length || subcommand?.reqperms?.length) &&
        !guildconfig?.staffRole
      ) {
        const missingPerms: string[] = [];
        (command.reqperms || [])
          .concat(subcommand?.reqperms || [])
          .forEach((perm: any) => {
            if (!msg.member?.permissions?.has(perm)) missingPerms.push(perm);
          });

        // Sends any missingperms
        if (missingPerms.length)
          return await msg.inlineReply({
            embeds: [
              {
                title: "⛔ You're missing the following permissions!",
                description: `You tried to run the command ${
                  command.name
                }, which requires the following permissions you don't have:\n${missingPerms
                  .map((mperm) => `\`${mperm}\``)
                  .join("\n")}`,
                color: convertHex(colors.red["500"]),
              },
            ],
          });
      }
    }

    // Handles command cooldowns
    if (command.cooldown && !this.bot.config.owners.includes(msg.author.id)) {
      const cooldown = this.bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return await msg.addReaction("⌛");
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
        return await msg.inlineReply({
          embeds: [
            {
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
          ],
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

    // Runs the command & emits typing if it isn't silent
    if (command.silent !== true || subcommand?.silent !== true)
      await msg.channel.sendTyping();
    let run = subcommand
      ? subcommand.run(msg, parsedArgs, args)
      : command.run(msg, parsedArgs, args);
    run.catch((err) => {
      reportError(msg, this.bot, err);
    });
  }
}
