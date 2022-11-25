import { pubsub } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";

import { register } from "./gym/bodyBump";

initializeApp();

// const db = getFirestore();

export const bodyBumpCrontab = pubsub
  .schedule("0 9 * * *")
  .timeZone("Atlantic/Reykjavik") // Users can choose timezone - default is America/Los_Angeles
  .onRun(async ({ timestamp }) => {
    const date = new Date(timestamp);
    const day = date.getDay();

    await register(day == 0 ? 7 : day, "account", "pass");
  });
