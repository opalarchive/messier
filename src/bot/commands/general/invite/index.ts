import { Command, ValidArgs, Client } from "@classes";
import type { Message } from "eris";

export default class Invite extends Command {
  description = "Get my invite link.";
  subcommands = [];
  allowdms = true;
  cooldown = 3000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["join"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    return await msg.channel.sendMessage({
      content: `You can invite me at https://www.messier.dev/invite or by going directly through discord: https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=2147806272.`,
    });
  }
}
