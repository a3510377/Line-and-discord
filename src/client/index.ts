import { BaseClient } from "./baseClient";

import { LinePlugin } from "../plugins/line";
import { DiscordPlugin } from "../plugins/discord";

export class Client extends BaseClient {
  constructor() {
    super();

    this.addPlugin(new LinePlugin());
    this.addPlugin(new DiscordPlugin());
  }
}
