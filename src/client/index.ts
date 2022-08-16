import { BaseClient } from "./baseClient";

import { LinePlugin, DiscordPlugin } from "../plugins";

export class Client extends BaseClient {
  constructor() {
    super();

    this.addPlugin(new LinePlugin());
    this.addPlugin(new DiscordPlugin());
  }
}
