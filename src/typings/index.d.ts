interface Array<T> {
  last(): T | undefined;
  random(n: number): Array<T>;
}

interface BotLogs {
  args: string[];
  authorID: string;
  cmdName: string;
  date: number;
  guildID: string;
}
interface ParsedArgs {
  flag: string | string[] | undefined;
  name: string;
  optional: boolean;
  type: string;
  value?: any;
}
