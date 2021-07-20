import { Command, Database } from "@classes";
import type { Message } from "eris";

export default class Staff extends Command {
  description = "View the current staff role for the server.";
  subcommands = ["set", "reset"];
  cooldown = 10000;
  aliases = ["staff"];

  async run(msg: Message) {
    const role = await Database.getStaffRole(msg.guild.id);

    if (!role)
      return await msg.channel.sendMessage(
        `There is no staff role currently set. You can have an administrator to set one using \`${msg.prefix}staff set [role]\`.`
      );
    return await msg.channel.sendMessage(
      `The current staff role is <@&${role}>.`
    );
  }
}
