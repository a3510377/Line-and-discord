import axios from "axios";
import { Window } from "happy-dom";

export const getDom = async (url: string) => {
  const window = new Window();
  const document = window.document;

  const { data } = await axios.get(url);

  const noscriptEl = document.createElement("noscript");
  noscriptEl.innerHTML = data;
  document.appendChild(noscriptEl);
  //   window.document.scripts.forEach((script) => script.remove());

  return window;
};
