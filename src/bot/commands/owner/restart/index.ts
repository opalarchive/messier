import { Command } from "@classes";
import { exec } from "child_process";
import type { Message } from "eris";

export default class Restart extends Command {
  description = "Restart the bot";
  subcommands = [];
  owner = true;

  async run(msg: Message) {
    await msg.inlineReply("Restarting server...");
    if (process.env.NODE_ENV === "development") exec("touch src/bot/index.ts");
  }
}
