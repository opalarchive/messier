import { Command } from "../../../classes/Command";
import { getStaffRole } from "../../../classes/Database";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Staff extends Command {
  description = "View the current staff role for the server.";
  subcommands = ["set", "reset"];
  cooldown = 10000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["staff"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    const role = await getStaffRole(msg.guild.id);

    if (!role)
      return await msg.channel.sendMessage(
        `There is no staff role currently set. You can have an administrator to set one using \`${msg.prefix}staff set [role]\`.`
      );
    return await msg.channel.sendMessage(
      `The current staff role is <@&${role}>.`
    );
  }
}
