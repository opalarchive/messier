interface Array<T> {
  last(): T | undefined;
}

interface BotLogs {
  args: string[];
  authorID: string;
  cmdName: string;
  date: number;
  guildID: string;
}
