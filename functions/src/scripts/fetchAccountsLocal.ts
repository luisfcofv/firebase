import { initializeApp, cert } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import { getReebokAccounts } from "../gym/accountReader";

const serviceAccount = require("../../../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

// const db = getFirestore();

// (async () => {
//   await getReebokAccounts(db)
// })();
