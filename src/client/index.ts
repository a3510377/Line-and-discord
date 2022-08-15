import axios from "axios";
import FormData from "form-data";
import express, { Express } from "express";
import {
  Client as LineClient,
  middleware,
  ClientConfig as LineClientConfig,
  WebhookEvent,
} from "@line/bot-sdk";
import {
  GatewayIntentBits,
  Client as DCClient,
  ClientOptions as DCClientOptions,
  Awaitable,
  WebhookClient,
  MessagePayload,
  WebhookMessageOptions,
  AttachmentPayload,
} from "discord.js";
import EventEmitter from "events";
import { ClientEventsArgs } from "./types";

export interface ClientOptionals {
  line?: LineClientConfig & { channelAccessToken?: string };
  dc?: DCClientOptions;
}
export interface ClientConfig {
  line: LineClientConfig & { channelSecret: string };
}

export class Client extends EventEmitter {
  public readonly webhook: WebhookClient;
  public readonly client: DCClient;
  public readonly server: Express;
  public readonly line: LineClient;
  protected readonly config: ClientConfig;

  public constructor(protected options?: ClientOptionals) {
    super();

    const channelAccessToken =
      options?.line?.channelAccessToken || process.env.LINE_BOT_ACCESS_TOKEN;
    const channelSecret =
      options?.line?.channelSecret || process.env.LINE_BOT_SECRET;
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

    if (!channelAccessToken || !channelSecret || !DISCORD_WEBHOOK) {
      console.log(channelAccessToken, channelSecret);
      throw new Error("config is not set");
    }

    this.config = {
      ...options,
      line: { ...options?.line, channelAccessToken, channelSecret },
    };

    this.webhook = new WebhookClient({ url: DISCORD_WEBHOOK });
    this.client = new DCClient({
      ...options?.dc,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });
    this.server = express();
    this.line = new LineClient(this.config.line);

    this.init();
  }

  protected init() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.server.post("/callback", middleware(this.config.line), (req, res) => {
      const events: WebhookEvent[] = req.body.events;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events.forEach((event) => this.emit(event.type, <any>event));

      res.send("ok");
    });

    this.on("message", async (event) => {
      if (event.source.type !== "group") return console.log(event);

      const source = event.source;
      const author = await this.line.getGroupMemberProfile(
        source.groupId,
        <string>source.userId
      );
      const postData: string | MessagePayload | WebhookMessageOptions = {
        username: author.displayName,
        avatarURL: author.pictureUrl,
      };

      if (event.message.type === "text") postData.content = event.message.text;
      else if (event.message.type === "sticker") {
        postData.content = `發送了一個 ${
          event.message.keywords?.[0] || "不知名"
        } 貼圖`;
      } else if (event.message.type === "file") {
        postData.files = [
          await this.getLineMessageFile(
            event.message.id,
            event.message.fileName
          ),
        ];
      } else if (event.message.type == "image") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.jpg"),
        ];
      } else if (event.message.type == "video") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.mp4"),
        ];
      } else if (event.message.type == "audio") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.mp3"),
        ];
      }

      this.webhook.send(postData).catch();
    });

    this.client.on("messageCreate", async (event) => {
      const { channel, reference, attachments, member, author } = event;

      if (event.channelId !== process.env.DISCORD_CHANNEL_ID || author.bot)
        return;

      let content = event.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);
        if (referenceMsg) {
          content = `${referenceMsg.content || "..."} > ${content}`;
        }
      }
      if (event.content) {
        const bodyData = new FormData();

        bodyData.append(
          "message",
          `<${member?.nickname || author.username}>:\n${content}`
        );

        axios
          .post("https://notify-api.line.me/api/notify", bodyData, {
            headers: { Authorization: `Bearer ${process.env.NOTIFY_TOKEN}` },
          })
          .catch();
      }

      await Promise.all(
        attachments.map(async (data) => {
          const bodyData = new FormData();
          if (data.contentType?.split("/")[0] === "image") {
            bodyData.append(
              "message",
              `<${member?.nickname || author.username}>:`
            );
            bodyData.append("imageFullsize", data.url);
            bodyData.append("imageThumbnail", data.url);
          } else event.content += `\n${data.url}`;

          axios
            .post("https://notify-api.line.me/api/notify", bodyData, {
              headers: { Authorization: `Bearer ${process.env.NOTIFY_TOKEN}` },
            })
            .catch();
        })
      );
    });
  }

  public start() {
    this.server.listen(process.env.PORT || 5000);
    this.client.login(process.env.DISCORD_TOKEN);
  }

  public async getLineMessageFile(
    messageId: string,
    fileName: string
  ): Promise<AttachmentPayload> {
    return {
      name: fileName,
      attachment: await this.line
        .getMessageContent(messageId)
        .then(async (stream) => {
          return await new Promise((resolve) => {
            let totalLength = 0;
            const bufArray: Buffer[] = [];

            stream.on("readable", () => {
              let chunk;

              while ((chunk = stream.read()) !== null) {
                totalLength += chunk.length;
                bufArray.push(chunk);
              }
            });
            stream.on("end", () => {
              resolve(Buffer.concat(bufArray, totalLength));
            });
          });
        }),
    };
  }
}

export interface Client {
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
