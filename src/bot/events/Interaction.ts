import { Event } from "@classes";
import type { APIMessageComponentInteraction } from "discord-api-types/payloads";
import type {
  GatewayDispatchEvents,
  GatewayInteractionCreateDispatchData,
} from "discord-api-types/gateway";

enum GatewayOpcodes {
  /**
   * An event was dispatched
   */
  Dispatch,
  /**
   * A bidirectional opcode to maintain an active gateway connection.
   * Fired periodically by the client, or fired by the gateway to request an immediate heartbeat from the client.
   */
  Heartbeat,
  /**
   * Starts a new session during the initial handshake
   */
  Identify,
  /**
   * Update the client's presence
   */
  PresenceUpdate,
  /**
   * Used to join/leave or move between voice channels
   */
  VoiceStateUpdate,
  /**
   * Resume a previous session that was disconnected
   */
  Resume = 6,
  /**
   * You should attempt to reconnect and resume immediately
   */
  Reconnect,
  /**
   * Request information about offline guild members in a large guild
   */
  RequestGuildMembers,
  /**
   * The session has been invalidated. You should reconnect and identify/resume accordingly
   */
  InvalidSession,
  /**
   * Sent immediately after connecting, contains the `heartbeat_interval` to use
   */
  Hello,
  /**
   * Sent in response to receiving a heartbeat to acknowledge that it has been received
   */
  HeartbeatAck,
}

export default class InteractionEvent extends Event {
  events = ["rawWS"];

  async run(_event: string, eventInfo: any) {
    const { op, d, t } = eventInfo;

    const type = t as GatewayDispatchEvents | undefined;
    if (op === GatewayOpcodes.Dispatch) {
      if (type === "INTERACTION_CREATE") {
        this.bot.log.info(`Interaction event: ${JSON.stringify(d, null, 2)}`);
        const data = d as GatewayInteractionCreateDispatchData;

        if (data.type === 3) {
          if (!data.data)
            return this.bot.log.error(
              `Data packet does not have data: ${JSON.stringify(d, null, 2)}`
            );

          if (data.data.hasOwnProperty("component_type"))
            return this.bot.interactions.onCompopnentInteraction(
              data as APIMessageComponentInteraction
            );
        }
      }
    }

    return null;
  }
}
