import { FileEventMessage } from "@line/bot-sdk";

import { BasePlugin, BaseClient } from ".";

export class LinePlugin extends BasePlugin {
  public register(bot: BaseClient) {
    bot.on("message", async (event) => {
      console.log(event);
      const { source, message: msg } = event;

      if (!source.userId || source.type !== "group") return;

      const profile = await bot.line.getGroupMemberProfile(
        source.groupId,
        source.userId
      );

      const type = msg.type;

      if (type === "text") {
        // TEXT
        bot.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: msg.text,
        });
      } else if (type === "image") {
        // IMAGE
        if (msg.contentProvider.type === "line") {
          bot.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            files: [await bot.getLINEFile("MEDIA", msg.id)],
          });
        } else {
          bot.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            files: [msg.contentProvider.originalContentUrl],
          });
        }
      } else if (type === "sticker") {
        // STICKER
        const { packageId, stickerId, stickerResourceType } = msg;

        bot.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          files: [
            ["ANIMATION", "ANIMATION_SOUND"].includes(stickerResourceType)
              ? bot.AnimLINEStampUrl(packageId, stickerId)
              : bot.LINEStampUrl(stickerId),
          ],
        });
      } else if (type === "file") {
        // FILE
        bot.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          files: [
            await bot.getLINEFile(
              (<FileEventMessage>event.message).fileName,
              msg.id,
              false
            ),
          ],
        });
      } else if (type === "audio" || type === "video") {
        // AUDIO, VIDEO
        bot.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          files: [
            await bot.getLINEFile(
              "MEDIA",
              msg.id,
              type === "audio" ? ".mp3" : ".mp4"
            ),
          ],
        });
      }
    });
  }
}