import EnableChannel from "./enable";

export default class DisableChannel extends EnableChannel {
  aliases = ["deny"];
  description = "Deny members to use commands in a certain channel.";
  enable = false;
}
