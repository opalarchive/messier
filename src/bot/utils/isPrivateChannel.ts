import type { Channel, PrivateChannel } from "eris";

export default function isPrivateChannel(
  channel: Channel
): channel is PrivateChannel {
  return !channel.hasOwnProperty("guild");
}
