import { pubsub, runWith } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";

import { notifyRegistration } from "./gym/telegramBot";
import { getReebokAccounts } from "./gym/accountReader";
import { register } from "./gym/bodyBump";
import {
  PubSubRebookRegisterAccountTopic,
  PubSubRegistrationSuccessfulTopic,
} from "./constants";

initializeApp();

const db = getFirestore();
const pubSubClient: PubSub = new PubSub();

export const bodyBumpCrontab = pubsub
  .schedule("00 08 * * *")
  .timeZone("Atlantic/Reykjavik")
  .onRun(async () => {
    await getReebokAccounts(db, pubSubClient);
  });

export const registerAccountPubSub = runWith({
  memory: "512MB",
})
  .pubsub.topic(PubSubRebookRegisterAccountTopic)
  .onPublish(async ({ json }, { timestamp }) => {
    const username = json["username"];
    const password = json["password"];

    const date = new Date(timestamp);
    const day = date.getDay();
    console.log(`Registering account: ${username} - ${day}`);
    await register(pubSubClient, day == 0 ? 7 : day, username, password);
  });

export const registrationSuccessfulPubSub = runWith({
  secrets: ["TELEGRAM_BOT_TOKEN"],
})
  .pubsub.topic(PubSubRegistrationSuccessfulTopic)
  .onPublish(async ({ json }, { timestamp }) => {
    const { eventName, eventLength, instructor } = json;

    const date = new Date(timestamp);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });

    notifyRegistration(day, eventName, eventLength, instructor);
  });
