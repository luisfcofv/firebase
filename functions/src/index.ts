import { pubsub } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";

import { getReebokAccounts } from "./gym/accountReader";
import { register } from "./gym/bodyBump";
import { PubSubRebookRegisterAccountTopic } from "./constants";

initializeApp();

const db = getFirestore();
const pubSubClient: PubSub = new PubSub();

export const bodyBumpCrontab = pubsub
  .schedule("0 9 * * *")
  .timeZone("Atlantic/Reykjavik") // Users can choose timezone - default is America/Los_Angeles
  .onRun(async () => {
    await getReebokAccounts(db, pubSubClient);
  });

export const characterLeftPubSub = pubsub
  .topic(PubSubRebookRegisterAccountTopic)
  .onPublish(async ({ json }, { timestamp }) => {
    const account = json["account"];
    const password = json["password"];

    const date = new Date(timestamp);
    const day = date.getDay();
    console.log(day);
    // await register(day == 0 ? 7 : day, account, password);

    await register(7, account, password);
  });
