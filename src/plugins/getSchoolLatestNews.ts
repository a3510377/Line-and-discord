import fs from "fs";

import { getDom } from "../utils";

export const getSchoolLatestNews = async () => {
  const { document } = await getDom("https://www.pmai.tn.edu.tw/category/news");

  const articles = document
    .querySelector("#content-wrap #content #blog-entries")
    .querySelectorAll("article");

  return articles.map((article) => {
    const titleEl = article.querySelector("header > h2 > a");

    return {
      title: titleEl.textContent,
      href: titleEl.getAttribute("href"),
      summary: article.querySelector(".blog-entry-summary").textContent,
    };
  });
};

export const getSchoolLatestNew = async () => {
  const news = await getSchoolLatestNews();
  let newNews: PmaiSchoolNewData[] = [];

  try {
    const data = <string[]>(
      JSON.parse(fs.readFileSync("catch-news.json", { encoding: "utf8" }))
    );

    newNews = news.filter((news) => !data.includes(news.href));
    // eslint-disable-next-line no-empty
  } catch {}

  fs.writeFileSync("catch-news.json", JSON.stringify(news.map((_) => _.href)), {
    encoding: "utf8",
  });

  return newNews;
};

export interface PmaiSchoolNewData {
  title: string;
  href: string;
  summary: string;
}
