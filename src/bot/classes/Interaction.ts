import type {
  APIMessageComponentInteraction,
  APIMessageComponentInteractionData,
} from "discord-api-types/payloads";
import type Client from "./Client";

export type InteractionFunction = (
  params: URLSearchParams,
  info: APIMessageComponentInteraction,
  interaction: string
) => void;

export default class Interaction {
  private _commandInteractions: Record<string, InteractionFunction>;
  private _componentInteractions: Record<string, InteractionFunction>;

  constructor(protected bot: Client) {
    this._commandInteractions = {};
    this._componentInteractions = {};
  }

  setComponentInteraction(name: string, handler: InteractionFunction) {
    if (
      Object.keys(this._componentInteractions).some(
        (el) => el.startsWith(name) || name.startsWith(el)
      )
    )
      throw new Error("Names can not be a substring of another name.");

    this._componentInteractions[name] = handler;
  }

  setCommandInteraction(name: string, handler: InteractionFunction) {
    if (
      Object.keys(this._commandInteractions).some(
        (el) => el.startsWith(name) || name.startsWith(el)
      )
    )
      throw new Error("Names can not be a substring of another name.");

    this._commandInteractions[name] = handler;
  }

  onCompopnentInteraction(info: APIMessageComponentInteraction) {
    info.data = info.data as APIMessageComponentInteractionData;
    if (!info.data || !info.data.custom_id) return;

    const id = info.data.custom_id;

    let interaction = Object.keys(this._componentInteractions).find((el) =>
      id.startsWith(el)
    );

    if (!interaction)
      return this.bot.log.error(
        `Unknown interaction: ${JSON.stringify(info, null, 2)}`
      );

    const params = new URLSearchParams(
      id.substring(id.indexOf(interaction) + interaction.length)
    );

    return this._componentInteractions[interaction](params, info, interaction);
  }
}
