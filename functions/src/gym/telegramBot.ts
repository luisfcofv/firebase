import { Telegraf } from "telegraf";

export const notifyRegistration = async (
  day: String,
  eventName: String,
  eventLength: String,
  instructor: String
) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("Telegram token not found");
    return;
  }

  const bot = new Telegraf(token);

  // TODO: Store in firebase?
  const chatId = "1546842788";

  // Instagram bot doesn't like unescaped characters.
  const escapedEventLength = eventLength.replace("-", "\\-");
  const message = `✅ *Registered* ✅\n🏋️ *${eventName}*\n🕣 ${day}, ${escapedEventLength}\n🎤 ${instructor}`;

  bot.telegram.sendMessage(chatId, message, { parse_mode: "MarkdownV2" });
};
