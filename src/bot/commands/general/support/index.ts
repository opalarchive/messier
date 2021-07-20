import { Command } from "@classes";
import type { Message } from "eris";

export default class Support extends Command {
  description = "Get an invite to my support server!";
  subcommands = [];
  allowdms = true;
  cooldown = 3000;
  aliases = ["server"];

  async run(msg: Message) {
    return await msg.channel.sendMessage({
      content: `You can join the server at https://www.messier.dev/support or by going directly through discord: https://discord.gg/pxbxRDBQHp - whichever you prefer.`,
    });
  }
}
