import type Client from "./Client";

export default abstract class Event {
  abstract events: string[];

  constructor(protected bot: Client, public name: string) {}

  abstract run(event: string, ...params: unknown[]): Promise<unknown> | void;
}
