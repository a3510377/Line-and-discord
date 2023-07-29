import axios from "axios";

import { Client } from "./client";

console.clear();

process
  .on("uncaughtException", console.error)
  .on("unhandledRejection", console.error);

const client = new Client();
client.start();

const {
  env: { NGROK_URL },
} = process;

if (process.env.NGROK || NGROK_URL) {
  let oldUrl = "";
  const setUrl = () => {
    axios.get(NGROK_URL || "http://ngrok:1333").then(({ data }) => {
      if (oldUrl !== data) {
        client.line.setWebhookEndpointUrl(`${data}/callback`);
        console.log("Webhook endpoint set to:", data);
        oldUrl = data;
      }
    });
  };
  setUrl();
  setInterval(setUrl, 1e3 * 60 * 60 * 24); // 1 day
}
