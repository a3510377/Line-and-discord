import { BaseClient } from "../client/baseClient";

import { LinePlugin } from "../plugins/line";
import { DiscordPlugin } from "../plugins/discord";

export class BasePlugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public register(_client: BaseClient) {
    throw new Error("Method not implemented.");
  }
}

export { BaseClient, DiscordPlugin, LinePlugin };
