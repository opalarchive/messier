import type { Client } from "@classes";
import EnableChannel from "./enable";

export default class DisableChannel extends EnableChannel {
  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {
    super(bot, name, category);
    this.aliases = ["deny"];
    this.enable = false;
    this.description = "Deny members to use commands in a certain channel.";
  }
}
