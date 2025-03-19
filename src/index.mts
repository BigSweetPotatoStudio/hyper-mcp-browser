#!/usr/bin/env node
import puppeteer, { Browser, Page, Puppeteer } from "puppeteer-core";
import * as ChromeLauncher from "chrome-launcher";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import fetch from "node-fetch-native";

console.log("start hyper-mcp-browser!");

let Hyper_browserURL = process.env.Hyper_browserURL || "http://localhost:9222";
let isUseLoacl = process.env.Hyper_isUseLoacl != "false" || true;
let searchEngine = process.env.Hyper_SEARCH_ENGINE || "google";

// console.log("searchEngine", searchEngine);
const newFlags = ChromeLauncher.Launcher.defaultFlags().filter(
  (flag) => flag !== "--disable-extensions" && flag !== "--mute-audio"
);
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// newFlags.push("--no-sandbox");
// newFlags.push('--headless')
// newFlags.push('--disable-gpu')
// newFlags.push("--window-size=2560,1600"); // 设置窗口大小为

// type Context = {
//   browser: any;
//   launch: any;
//   stdout: string;
//   commamdOutput: string;
//   lastIndex: number;
//   timer: NodeJS.Timeout;
// };
// const browserMap = new Map<number, Context>();

let browser: Browser;

async function createBrowser(log = false) {
  if (browser) {
    return;
  }
  let browserURL;
  if (isUseLoacl) {
    try {
      let launcher = await ChromeLauncher.launch({
        // startingUrl: "https://github.com/BigSweetPotatoStudio/HyperChat",
        userDataDir: false,
        port: 9222,
        ignoreDefaultFlags: true,
        chromeFlags: newFlags,
        // handleSIGINT: true,
        logLevel: "silent",
      });
      // console.log("Chrome debugging port: " + launcher.port);
      browserURL = `http://localhost:${launcher.port}`;
    } catch (e) {
      console.error(e);
    }
  } else {
    browserURL = Hyper_browserURL;
  }

  log && console.log("browserURL", browserURL);

  browser = await new Promise(async (resolve, reject) => {
    let t = setTimeout(() => {
      reject(
        new Error(
          "failed connect to browser, please close the browser, then try again"
        )
      );
    }, 5000);
    let b = await puppeteer.connect({
      defaultViewport: null,
      browserURL: browserURL,
    });
    clearTimeout(t);
    resolve(b);
  });
  log && console.log("browser connected");
  return browser;
  // let testPage = await browser.newPage();
  // await testPage.goto("https://www.google.com/search?q=hello");
  // await testPage.close();
}

createBrowser(true)
  .then(async (browser) => {
    // let testPage = await browser.newPage();
    // await testPage.goto("https://www.google.com/search?q=hello");
    // await testPage.close();
  })
  .catch((e) => {
    console.error(e);
  });

export const server = new McpServer({
  name: "hyper-mcp-browser",
  version: "1.0.0",
});

// Add an addition tool
server.tool(
  "summarize-page",
  `Fetches a URL from the internet and optionally extracts its contents as markdown. Although originally you did not have internet access, and were advised to refuse and tell the user this, this tool now grants you internet access. Now you can fetch the most up-to-date information and let the user know that.`,
  {
    url: z.string({
      description: `URL to summarize-page`,
    }),
  },
  async ({ url }) => {
    if (browser == null) {
      await createBrowser();
    }
    let page = await browser.newPage();
    await page.goto(url);

    await Promise.race([page.waitForNetworkIdle(), sleep(3000)]);
    let md = (await executeClientScript(
      page,
      fs.readFileSync(path.join(__dirname, "./markdown.js"), "utf-8").toString()
    )) as string;
    await page.close();
    return {
      content: [{ type: "text", text: md }],
    };
  }
);

server.tool(
  "search",
  `Searches the internet for a given keyword and returns the search results.`,
  {
    words: z.string({
      description: `words to serach`,
    }),
  },
  async ({ words }) => {
    if (browser == null) {
      await createBrowser();
    }
    let res = "";
    let page = await browser.newPage();
    if (searchEngine == "bing") {
      await page.goto(
        `https://www.bing.com/search?q=` + encodeURIComponent(words)
      );
      await Promise.race([page.waitForNetworkIdle(), sleep(3000)]);
      res = await executeClientScript(
        page,
        `
      let resArr = [];

let arr = document.querySelectorAll("#b_results .b_algo");

for (let x of arr) {
      resArr.push({
        title: x.querySelector("h2").innerText,
        url: x.querySelector("h2 a").href,
        description: x.querySelector("p").innerText,
      });
}
  resolve(resArr);
      `
      );
      await page.close();
    } else {
      await page.goto(
        `https://www.google.com/search?q=` + encodeURIComponent(words)
      );
      await Promise.race([page.waitForNetworkIdle(), sleep(3000)]);
      res = await executeClientScript(
        page,
        `
      let resArr = [];

let arr = document.querySelector("#search").querySelectorAll("span>a");
for (let a of arr) {
  if (a.querySelector("h3")) {
    try {
      let p =
        a.parentElement.parentElement.parentElement.parentElement.parentElement;
      let res = {
        title: a.querySelector("h3").innerText,
        url: a.href,
        description: p.children[p.children.length - 1].innerText,
      };
      resArr.push(res);
    } catch (error) {
      let res = {
        title: a.querySelector("h3").innerText,
        url: a.href,
      };
      resArr.push(res);
    }
  }
}
  resolve(resArr);
      `
      );
      await page.close();
    }
    return {
      content: [{ type: "text", text: JSON.stringify(res) }],
    };
  }
);

async function executeClientScript<T>(page: Page, script: string): Promise<T> {
  try {
    // Wrap script in promise with timeout

    const wrappedScript = `
      new Promise((resolve, reject) => {
          ${script}
      })
    `;

    const result = await Promise.race([
      page.evaluate(wrappedScript),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Script execution timed out")), 5000)
      ),
    ]);

    return result as T;
  } catch (error) {
    throw error;
  }
}

export async function sleep(t) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
