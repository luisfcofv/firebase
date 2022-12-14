import * as puppeteer from "puppeteer";
import { PubSub } from "@google-cloud/pubsub";
import { PubSubRegistrationSuccessfulTopic } from "../constants";

// TODO: Upgrade puppeteer and use this https://github.com/cenfun/puppeteer-chromium-resolver
// Maybe not worth it?
const EVENT_NAME = "Body Pump";
const REEBOK_URL =
  "https://reebokfitness-tjarnarvellir.cms.efitness.com.pl/Login/SystemLogin?returnurl=https://reebokfitness-tjarnarvellir.cms.efitness.com.pl/calendar";

const fetchEventProperty = async (
  event: puppeteer.ElementHandle<Node>,
  className: string
): Promise<string> => {
  const eventNameArray = await event.$$(className);
  const eventNameTextContent = await eventNameArray[0].getProperty(
    "textContent"
  );
  return ((await eventNameTextContent.jsonValue()) as string).trim();
};

export const register = async (
  pubSub: PubSub,
  day: number,
  account: string,
  password: string
) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(REEBOK_URL);

  await page.type("#Login", account);
  await page.type("#Password", password);
  await page.click("#SubmitCredentials");

  const tableSelector = "#scheduler";
  await page.waitForSelector(tableSelector);

  const xpath = await page.$x(
    `//*[@id="scheduler"]/div[1]/table/tbody/tr/td[${day}]`
  );

  const events = await xpath[0].$$("div");

  if (events.length == 0) {
    console.log("No events found for today");
  }

  for (let event of events) {
    const eventName = await fetchEventProperty(event, ".event_name");
    const eventLength = await fetchEventProperty(event, ".eventlength");
    const instructor = await fetchEventProperty(event, ".instructor");

    if (eventName == EVENT_NAME) {
      await (event as puppeteer.ElementHandle<Element>).click();
      const overlaySelector = "#OverlayEvent";
      await page.waitForSelector(overlaySelector);

      const overlay = await page.$(overlaySelector);

      if (!overlay) {
        console.error("Overlay div not found");
        return;
      }

      const registerButtonSelector = ".calendar-register-for-class";
      await overlay.waitForSelector(registerButtonSelector);
      const registerButton = await overlay.$(registerButtonSelector);

      if (!registerButton) {
        console.error("Register button not found");
        return;
      }

      await registerButton.click();
      await overlay.waitForSelector("#calendar-register-for-success");

      console.log(eventName, eventLength, instructor);

      const payload = { eventName, eventLength, instructor };
      const outboundMessage = { json: payload, attributes: {} };
      const message = await pubSub
        .topic(PubSubRegistrationSuccessfulTopic)
        .publishMessage(outboundMessage);

      console.log(message);
    }
  }

  await browser.close();
};
