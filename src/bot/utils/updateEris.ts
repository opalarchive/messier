import {
  inlineReply,
  sendMessage,
  sendClientMessage,
  sendCode,
  awaitMessage,
} from "./index";
import Eris, { PrivateChannel } from "eris";

export default function updateEris() {
  Object.assign(Eris.Message.prototype, { inlineReply });
  Object.defineProperty(Eris.Message.prototype, "guild", {
    get: function () {
      if (this.channel instanceof PrivateChannel) return undefined;
      return this.channel.guild;
    },
  });

  Object.assign(Eris.TextChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.NewsChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.PrivateChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.GroupChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Eris.Client.prototype.sendMessage = sendClientMessage;
  Eris.CommandClient.prototype.sendMessage = sendClientMessage;
}
