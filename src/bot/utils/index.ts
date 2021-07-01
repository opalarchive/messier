export { default as inlineReply } from "./inlineReply";
export { default as sendMessage } from "./sendMessage";
export { default as sendClientMessage } from "./sendClientMessage";
export { default as sendCode } from "./sendCode";
export { default as awaitMessage } from "./awaitMessage";
export { default as logger } from "./logger";
export { default as convertHex } from "./convertHex";
export { default as getRESTUser } from "./getRESTUser";
export { default as updateEris } from "./updateEris";

export function shortcuts() {
  if (!Array.prototype.last) {
    Array.prototype.last = function () {
      if (!this.length) {
        return undefined;
      }
      return this[this.length - 1];
    };
  }
}
