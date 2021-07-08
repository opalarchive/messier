import { Command } from "../../../classes/Command";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Support extends Command {
  description = "Get an invite to my support server!";
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
      content: `You can join the server at https://www.messier.dev/support or by going directly through discord: https://discord.gg/pxbxRDBQHp - whichever you prefer.`,
    });
  }
}
