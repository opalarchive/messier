import type { ValidArgs } from "@classes";
import { convertHex } from "@utils";
import type { Message } from "eris";
import colors from "tailwindcss/colors";
import Disable from "./";

export default class DisableCategory extends Disable {
  disable = true;
  description = "This allows the disabling of categories.";

  async run(msg: Message, pargs: Map<string, ValidArgs>) {
    const command = (
      (pargs.get("command") as string | undefined) || ""
    ).toLowerCase();

    if (!!this.bot.categories.get(command))
      return await this.disableCategory(command, msg);

    return await msg.inlineReply({
      embeds: [
        {
          title: "The category wasn't found.",
          description: `You gave me a category name of ${command}, but I couldn't find that!`,
          color: convertHex(colors.red["500"]),
        },
      ],
    });
  }
}
