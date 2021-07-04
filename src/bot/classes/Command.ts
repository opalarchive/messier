import type { Message } from "eris";
import type { ValidArgs } from "./Arg";
import type Client from "./Client";

export abstract class SubCommand {
  public abstract description: string;
  public aliases: string[] = [];
  public cooldown?: number;
  public args: {
    name: string;
    type: string;
    optional?: boolean;
    absorb?: boolean;
  }[] = [];
  public allowdms: boolean = false;
  public owner: boolean = false;
  public staff: boolean = false;
  public silent: boolean = false;
  public clientperms: string[] = [];
  public reqperms: string[] = [];
  public allowdisable: boolean = false;

  constructor(
    protected bot: Client,
    public name: string,
    public category: string
  ) {}

  abstract run(
    msg: Message,
    parsedArgs: Map<string, ValidArgs>,
    args: string[]
  ): Promise<unknown>;
}

export abstract class Command extends SubCommand {
  public abstract subcommands: string[];
}
