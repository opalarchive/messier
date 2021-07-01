import type { Message } from "eris";
import type { ParsedArgs } from "typings/args";
import type Client from "./Client";

export default abstract class Command {
  aliases: string[] = [];
  args?: string;
  cooldown?: number;
  requiredkeys?: string[] = [];
  clientperms?: string[] = [];
  requiredperms?: string[] = [];
  allowdms = false;
  allowdisable = true;
  nsfw = false;
  owner = false;
  staff = false;
  voice = false;
  silent = false;

  abstract description: string;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {}

  abstract run(
    msg: Message,
    pargs?: ParsedArgs[],
    args?: string[],
    ...extra: any
  ): Promise<unknown>;
}
