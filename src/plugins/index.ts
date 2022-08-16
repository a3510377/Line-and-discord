import { BaseClient } from "../client/baseClient";

export class BasePlugin {
  constructor(protected client: BaseClient) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public registerEvents(_client: BaseClient) {
    throw new Error("Method not implemented.");
  }
}

export { BaseClient };
