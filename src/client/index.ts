import { BaseClient } from "./baseClient";

import LinePlugin from "../plugins/line";
import DiscordPlugin from "../plugins/discord";
// import { ConfigPlugin } from "../plugins/config";

export class Client extends BaseClient {
  constructor() {
    super();

    // this.addPlugin(new ConfigPlugin());
    this.addPlugin(new LinePlugin());
    this.addPlugin(new DiscordPlugin());
  }
}
