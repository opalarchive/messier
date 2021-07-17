import { SubCommand, ValidArgs, Client, Database } from "@classes";
import { convertHex } from "../../../utils";
import colors from "tailwindcss/colors";
import type { Message } from "eris";

export default class SetStaff extends SubCommand {
  description =
    "Reset the staffrole for the server. Requires administrator permissions.";
  reqperms = ["administrator"];

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["none"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    await Database.setStaffRole(msg.guild.id, "");

    return await msg.inlineReply({
      embeds: [
        {
          title: "Reset staff role!",
          description: `Reset the staff role, so only administrators are staff members now.`,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }
}
