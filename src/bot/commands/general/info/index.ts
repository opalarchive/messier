import { Command } from "../../../classes/Command";
import colors from "tailwindcss/colors";
import { convertHex, tagUser } from "../../../utils";
import type { ValidArgs } from "../../../classes/Arg";
import type Client from "../../../classes/Client";
import type { Message } from "eris";

export default class Info extends Command {
  description = "Get some information about me!";
  subcommands = [];
  allowdms = true;
  cooldown = 5000;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["i", "aboutme", "more"];
  }

  async run(msg: Message, _pargs: Map<string, ValidArgs>, _args: string[]) {
    return await msg.channel.sendMessage({
      embed: {
        title: "Information about me!",
        author: {
          name: "Messier",
          url: "https://www.messier.dev",
          icon_url: this.bot.user.dynamicAvatarURL(),
        },
        description:
          "I'm Messier, a Discord Bot used to fetch statements and more information about math problems! Here's some information about me!",
        color: convertHex(colors.teal["500"]),
        footer: {
          text: `Ran by ${tagUser(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
        fields: [
          {
            name: "How are you made?",
            value:
              "I'm actually made using [Eris](https://github.com/abalabahaha/eris) and written in [TypeScript](https://github.com/microsoft/TypeScript). You can find the GitHub repository [here](https://github.com/opalarchive/messier), and read more about me on [my website](https://www.messier.dev/about)!",
          },
          {
            name: "Who made you?",
            value:
              "I'm made by <@446065841172250638>, and the website is made by <@830155264887226439> (alongwith me). However, the repository is open-source, and you can learn more about contributing [here](https://www.messier.dev/contribute).",
          },
          {
            name: "How many commands do you have?",
            value: `I currently have ${
              this.bot.commandInfo.total - (this.bot.commandInfo.owner || 0)
            } commands loaded on this bot! More are to come in the future.`,
          },
          {
            name: "How does fetching a contest work?",
            value:
              "All problems and information is stored in a local [Redis](https://redis.io/) database, with the problems being well-maintained by contributors. When you send a command, it actually parses your information and fetches the appropriate data. Read more about how you can build your own version off of our database [here](http://messier.dev/docs).",
          },
          {
            name: "How can I add problems to the database?",
            value:
              "We've not added the ability for all users to add problems, but we will let you know when we do!",
          },
          {
            name: "Do you have a roadmap for the future?",
            value:
              "Once we get all the current ideas down on paper, we'll take ideas and create a roadmap.",
          },
        ],
      },
    });
  }
}
