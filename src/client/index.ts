import axios from "axios";
import FormData from "form-data";
import { BaseClient } from "./baseClient";

export class Client extends BaseClient {
  constructor() {
    super();
    this.registerEvents();
  }

  protected registerEvents() {
    this.on("join", async ({ source }) => {
      if (source.type === "group") this.line.leaveGroup(source.groupId);
      else if (source.type === "room") this.line.leaveRoom(source.roomId);
    });
    this.on("message", async (event) => {
      console.log(event);
      const { source, message: msg } = event;

      if (source.type !== "group" || !source.userId) return;

      const profile = await this.line.getGroupMemberProfile(
        source.groupId,
        source.userId
      );

      switch (msg.type) {
        case "text":
          this.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: msg.text || "",
          });

          break;

        case "image":
          switch (msg.contentProvider.type) {
            case "line": {
              this.sendDiscord({
                avatarURL: profile.pictureUrl,
                username: profile.displayName,
                content: "發送了一張圖片",
                files: [(await this.getLINEFile("MEDIA", msg.id)).attachment],
              });

              break;
            }
            case "external": {
              this.sendDiscord({
                avatarURL: profile.pictureUrl,
                username: profile.displayName,
                content: "發送了一張圖片",
                files: [msg.contentProvider.originalContentUrl],
              });

              break;
            }
          }
      }
    });

    this.client.on("messageCreate", async (event) => {
      const { channel, reference, author } = event;

      if (event.channelId !== process.env.DISCORD_CHANNEL_ID || author.bot)
        return;

      let content = event.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);
        if (referenceMsg) {
          content = `${referenceMsg.content || "..."} > ${content}`;
        }
      }
    });
  }
}
