import { Telegraf } from "telegraf";

export const notifyRegistration = async (
  day: String,
  eventName: String,
  eventLength: String,
  instructor: String
) => {
  const token = process.env.Telegram;
  if (!token) {
    console.error("Telegram token not found");
    return;
  }

  const bot = new Telegraf(token);

  bot.telegram.sendMessage(
    "1546842788",
    `✅ *Registered* ✅\n🏋️ *${eventName}*\n🕣 ${day}, ${eventLength.replace(
      "-",
      "\\-"
    )}\n🎤 ${instructor}`,
    { parse_mode: "MarkdownV2" }
  );
};
