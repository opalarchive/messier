import * as Sentry from "@sentry/node";
import isPrivateChannel from "./isPrivateChannel";
import convertHex from "./convertHex";
import colors from "@colors";
import config from "../config";
import type { Message } from "eris";
import type Client from "../classes/Client";

// Hides API keys and the bot token from output
const tokens: string[] = [config.token, config.sentry.dsn];

// Tokens to hide
const tokenRegex = new RegExp(tokens.join("|"), "g");

export default function reportError(msg: Message, bot: Client, err: Error) {
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
        isPrivateChannel(msg.channel) ? msg.author.id : msg.channel.guild?.name
      );
    });

    // Logs the error
    Sentry.captureException(err);
  }
  bot.log.error(err.stack);

  msg.channel.sendMessage({
    embeds: [
      {
        title: "<:error:837489379345694750> I ran into an error!",
        description: `I ran into the following error: \`\`\`\n${err.message
          .replace(tokenRegex, "[token]")
          .substring(
            0,
            1900
          )}\n\`\`\`It's already been reported, and a developer will contact you soon.`,
        color: convertHex(colors.red["500"]),
      },
    ],
  });
}
