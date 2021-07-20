import Help from "./index";

export default class DMHelp extends Help {
  dmUser = true;
  aliases = [];
  description =
    "The help command for the bot, but through a dm. Add a command, category, or subcommand after this to get specific information.";
}
