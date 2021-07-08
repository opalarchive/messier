import Event from "../classes/Event";
import {
  APIMessageComponentInteraction,
  InteractionType,
} from "discord-api-types/payloads";
import {
  GatewayDispatchEvents,
  GatewayInteractionCreateDispatchData,
  GatewayOpcodes,
} from "discord-api-types/gateway";

export default class InteractionEvent extends Event {
  events = ["rawWS"];

  async run(_event: string, eventInfo: any) {
    const { op, d, t } = eventInfo;

    const type = t as GatewayDispatchEvents | undefined;
    if (op === GatewayOpcodes.Dispatch) {
      if (type === "INTERACTION_CREATE") {
        this.bot.log.info(`Interaction event: ${JSON.stringify(d, null, 2)}`);
        const data = d as GatewayInteractionCreateDispatchData;

        if (data.type === InteractionType.MessageComponent) {
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
