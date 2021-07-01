import type { ClientOptions } from "eris";
import Client from "./classes/Client";
import config from "./config";
import { shortcuts, updateEris } from "./utils";

new Client(config.token, config.eris as ClientOptions);
shortcuts();
updateEris();
