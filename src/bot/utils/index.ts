export { default as inlineReply } from "./inlineReply";
export { default as sendMessage } from "./sendMessage";
export { default as sendClientMessage } from "./sendClientMessage";
export { default as sendCode } from "./sendCode";
export { default as awaitMessage } from "./awaitMessage";
export { default as logger } from "./logger";
export { default as convertHex } from "./convertHex";
export { default as getRESTUser } from "./getRESTUser";
export { default as updateEris } from "./updateEris";
export { default as splitArgs } from "./splitArgs";
export { default as properCase } from "./properCase";
export { default as tagUser } from "./tagUser";
export { default as isPrivateChannel } from "./isPrivateChannel";

export function shortcuts() {
  if (!Array.prototype.last) {
    Array.prototype.last = function () {
      if (!this.length) {
        return undefined;
      }
      return this[this.length - 1];
    };
  }
  if (!Array.prototype.random) {
    Array.prototype.random = function (n: number) {
      var result = new Array<number>(n),
        len = this.length,
        taken = new Array<number>(len);
      if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
      while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = this[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    };
  }
}
