import { BaseClient } from "../client/baseClient";

export class BasePlugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public register(_client: BaseClient) {
    throw new Error("Method not implemented.");
  }

  get name(): string {
    return this.constructor.name;
  }
}

export { BaseClient };
