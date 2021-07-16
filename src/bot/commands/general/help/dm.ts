import type Client from "../../../classes/Client";
import Help from "./index";

export default class DMHelp extends Help {
  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.dmUser = true;
    this.aliases = [];
    this.description =
      "The help command for the bot, but through a dm. Add a command, category, or subcommand after this to get specific information.";
  }
}
