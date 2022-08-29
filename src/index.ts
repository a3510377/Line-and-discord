import axios from "axios";

import { Client } from "./client";

console.clear();

process
  .on("uncaughtException", (er: Error) => console.error(er.toString()))
  .on("unhandledRejection", (er: Error) => console.error(er.toString()));

const client = new Client();
client.start();

const {
  env: { NGROK_URL },
} = process;

if (process.env.NGROK || NGROK_URL) {
  const setUrl = () => {
    axios.get(NGROK_URL || "ngrok:1333").then(({ data }) => {
      client.line.setWebhookEndpointUrl(data);
      console.log("Webhook endpoint set to:", data);
    });
  };
  setUrl();
  setInterval(setUrl, 1e3 * 60 * 60); // 1 hour
}
