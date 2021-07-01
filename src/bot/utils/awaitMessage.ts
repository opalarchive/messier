import { EventEmitter } from "events";
import type { Message, Channel } from "eris";

const collectors: MessageCollector[] = [];
let listening = false;

export class MessageCollector extends EventEmitter {
  private channel: Channel;
  private filter: (message: Message) => boolean;
  private options: { maximum: number; time: number } = { maximum: 1, time: -1 };
  private collected: Message[];
  private ended: boolean = false;

  constructor(
    channel: Channel,
    filter: (message: Message) => boolean = () => true,
    options: { maximum?: number; time?: number } = {}
  ) {
    super();
    this.channel = channel;
    this.filter = filter;

    Object.assign(this.options, { maximum: 1, time: -1 }, options);
    this.collected = [];

    collectors.push(this);
    if (this.options.time >= 0)
      setTimeout(() => this.stop("time"), this.options.time);
  }

  verify(message: Message) {
    if (this.channel.id !== message.channel.id) return false;
    if (this.filter(message)) {
      this.collected.push(message);

      this.emit("message", message);
      if (this.collected.length >= this.options.maximum) this.stop("maximum");
      return true;
    }
    return false;
  }

  stop(reason: string) {
    if (this.ended) return;
    this.ended = true;

    collectors.splice(collectors.indexOf(this), 1);
    this.emit("end", this.collected, reason);
  }
}

export default function awaitMessages(
  this: Channel,
  filter: (message: Message) => boolean,
  options: { maximum?: number; time?: number }
) {
  if (!listening) {
    this.client.on("messageCreate", (message: Message) => {
      for (const collector of collectors) collector.verify(message);
    });

    listening = true;
  }

  const collector = new MessageCollector(this, filter, options);
  return new Promise((resolve) => collector.on("end", resolve));
}
