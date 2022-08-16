import axios from "axios";
import EventEmitter from "events";
import express, { Express } from "express";
import { Client as LineClient, middleware, WebhookEvent } from "@line/bot-sdk";
import {
  Client as DCClient,
  Awaitable,
  WebhookClient,
  AttachmentPayload,
  GatewayIntentBits,
} from "discord.js";

import { ClientEventsArgs } from "./types";
import { getFileExt } from "../utils/File";

export class BaseClient extends EventEmitter {
  public readonly webhook: WebhookClient;
  public readonly server: Express;
  public readonly line: LineClient;
  public readonly client: DCClient;
  protected readonly config: ClientConfig;
  public sendDiscord: InstanceType<typeof WebhookClient>["send"];

  public constructor(protected options?: ClientOptionals) {
    super();

    const {
      channelAccessToken = process.env.LINE_BOT_ACCESS_TOKEN,
      channelSecret = process.env.LINE_BOT_SECRET,
      notifyToken = process.env.NOTIFY_TOKEN,
      discordWebhook = process.env.DISCORD_WEBHOOK,
      discordToken = process.env.DISCORD_TOKEN,
      discordChannelId = process.env.DISCORD_CHANNEL_ID,
    } = options || {};

    if (
      !channelAccessToken ||
      !channelSecret ||
      !notifyToken ||
      !discordWebhook ||
      !discordToken ||
      !discordChannelId
    ) {
      throw new Error("config is not set");
    }

    this.config = {
      channelAccessToken,
      channelSecret,
      notifyToken,
      discordWebhook,
      discordToken,
      discordChannelId,
      baseLine: { channelAccessToken, channelSecret },
    };

    this.server = express();
    this.webhook = new WebhookClient({ url: discordWebhook });
    this.line = new LineClient(this.config.baseLine);
    this.client = new DCClient({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });
    this.sendDiscord = (...args) => this.webhook.send(...args);

    this.init();
  }

  public async getLINEFile(
    fileName: string,
    messageId: string,
    ext: string | boolean = true
  ): Promise<AttachmentPayload> {
    return await axios
      .get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
        headers: { Authorization: `Bearer ${this.config.channelAccessToken}` },
        responseType: "arraybuffer",
      })
      .then(({ data }) => ({
        name:
          fileName +
          (ext === true ? `.${getFileExt(new Uint8Array(data))}` : ext || ""),
        attachment: data,
      }));
  }

  protected init() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.server.post(
      "/callback",
      middleware(this.config.baseLine),
      (req, res) => {
        const events: WebhookEvent[] = req.body.events;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        events.forEach((event) => this.emit(event.type, <any>event));

        res.send("ok");
      }
    );
  }

  public start() {
    this.server.listen(process.env.PORT || 5000);
    this.client.login(this.config.discordToken);
  }

  public LINEStampUrl(stickerID: string) {
    return `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerID}/android/sticker.png`;
  }

  public AnimLINEStampUrl(packageID: string, stickerID: string) {
    return `https://stickershop.line-scdn.net/products/0/0/1/${packageID}/android/animation/${stickerID}.gif`;
  }
}

export interface BaseClient {
  on<K extends keyof ClientEventsArgs>(
    events: K,
    listener: (...args: ClientEventsArgs[K]) => Awaitable<void>
  ): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ClientEventsArgs>,
    listener: (...args: unknown[]) => Awaitable<void>
  ): this;

  once<K extends keyof ClientEventsArgs>(
    events: K,
    listener: (...args: ClientEventsArgs[K]) => Awaitable<void>
  ): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ClientEventsArgs>,
    listener: (...args: unknown[]) => Awaitable<void>
  ): this;

  emit<K extends keyof ClientEventsArgs>(
    event: K,
    ...args: ClientEventsArgs[K]
  ): boolean;
  emit<S extends string | symbol>(
    event: Exclude<S, keyof ClientEventsArgs>,
    ...args: unknown[]
  ): boolean;
}

export interface ClientOptionals {
  channelAccessToken: string;
  channelSecret: string;
  notifyToken: string;
  discordWebhook: string;
  discordToken: string;
  discordChannelId: string;
}

export interface ClientConfig extends Required<ClientOptionals> {
  baseLine: {
    channelAccessToken: string;
    channelSecret: string;
  };
}
