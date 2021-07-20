import type { ValidArgs } from "@classes";
import { convertHex } from "@utils";
import type { Message } from "eris";
import colors from "@colors";
import Disable from "./";

export default class DisableCommand extends Disable {
  disable = true;
  description = `This allows the disabling of commands (other than ones that can never be disabled).`;

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
    const command = (
      (pargs.get("command") as string | undefined) || ""
    ).toLowerCase();

    if (!!this.bot.commands.get(command))
      return await this.disableCmd(command, msg);

    return await msg.inlineReply({
      embeds: [
        {
          title: "The command wasn't found.",
          description: `You gave me a command name of ${command}, but I couldn't find that!`,
          color: convertHex(colors.red["500"]),
        },
      ],
    });
  }
}
