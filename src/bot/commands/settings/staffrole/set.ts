import { SubCommand, Client, ValidArgs, Database } from "@classes";
import { convertHex } from "../../../utils";
import colors from "tailwindcss/colors";
import type { Message, Role } from "eris";

export default class SetStaff extends SubCommand {
  description =
    "Set the staffrole for the server. Requires administrator permissions.";
  reqperms = ["administrator"];
  args = [
    {
      type: "role",
      name: "staffrole",
      optional: false,
    },
  ];

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["add"];
  }

  async run(msg: Message, pargs: Map<string, ValidArgs>, _args: string[]) {
    const role = pargs.get("staffrole") as Role | undefined;

    if (!role)
      return await msg.inlineReply({
        embeds: [
          {
            title: "⛔ You're missing the following arguments!",
            description: `You tried to run the command staff, which requires the following arguments you didn't provide:\n\`STAFFROLE\``,
            fields: [
              {
                name: "Help",
                value: `To find more information, run \`${msg.prefix}help staff set\`.`,
              },
            ],
            color: convertHex(colors.red["500"]),
          },
        ],
      });

    await Database.setStaffRole(msg.guild.id, role.id);

    return await msg.inlineReply({
      embeds: [
        {
          title: "Added staff role!",
          description: `Made <@&${role.id}> the staff role.`,
          color: convertHex(colors.green["500"]),
        },
      ],
    });
  }
}
