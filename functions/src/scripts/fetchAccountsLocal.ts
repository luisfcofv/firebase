import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("../../../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

(async () => {
  const snapshot = await db.collection("reebok").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
})();
