import { PubSub, Attributes } from "@google-cloud/pubsub";
import { PubSubRebookRegisterAccountTopic } from "../constants";

export const getReebokAccounts = async (
  db: FirebaseFirestore.Firestore,
  pubSub: PubSub
) => {
  const snapshot = await db.collection("reebok").get();
  snapshot.forEach(async (doc) => {
    const data = doc.data();

    const payload = {
      username: data["username"],
      password: data["password"],
    };

    console.log(`Sending payload to pubsub: ${payload.username}`);

    const customAtt: Attributes = {};
    const outboundMessage = { json: payload, attributes: customAtt };
    const message = await pubSub
      .topic(PubSubRebookRegisterAccountTopic)
      .publishMessage(outboundMessage);
    console.log(message);
  });
};
