import type Client from "../classes/Client";
import { User, BaseData } from "eris";

/**
 * Eris' endpoints aren't typed but you can view them here
 * {@link https://github.com/abalabahaha/eris/blob/master/lib/rest/Endpoints.js }
 */

const erisEndpoints = require("eris/lib/rest/Endpoints");

export default async function getRESTUser(user: string, bot: Client) {
  const RESTUser = await bot.requestHandler
    .request("GET", erisEndpoints.USER(user, true), true)
    .catch(() => {});
  if (!RESTUser) return;
  return new User(RESTUser as BaseData, bot);
}
