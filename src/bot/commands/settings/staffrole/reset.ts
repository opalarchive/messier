import { SubCommand, Database } from "@classes";
import { convertHex } from "../../../utils";
import colors from "tailwindcss/colors";
import type { Message } from "eris";

export default class SetStaff extends SubCommand {
  description =
    "Reset the staffrole for the server. Requires administrator permissions.";
  reqperms = ["administrator"];
  cooldown = 60000;
  aliases = ["none"];

  async run(msg: Message) {
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
