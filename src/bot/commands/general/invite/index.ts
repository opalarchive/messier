import { Command } from "@classes";
import type { Message } from "eris";

export default class Invite extends Command {
  description = "Get my invite link.";
  subcommands = [];
  allowdms = true;
  cooldown = 3000;
  aliases = ["join"];

  async run(msg: Message) {
    return await msg.channel.sendMessage({
      content: `You can invite me at https://www.messier.dev/invite or by going directly through discord: https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=2147806272.`,
    });
  }
}
