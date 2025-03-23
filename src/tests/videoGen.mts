import { z } from "zod";
import { createBrowser, server, sleep } from "../index.mjs";

/**
 * Step One, Generate Video, from the input text
 * @param text The input text to generate video from
 * @returns A string indicating success and available voice options
 */
server.tool(
  "generate-video",
  `Step One, Generate Video, from the input text`,
  {
    text: z.string({
      description: `text`,
    }),
  },
  async ({ text }) => {
    if (!text) {
      throw new Error("text is required!");
    }

    let browser = await createBrowser();

    // Create new page
    const page = await browser.newPage();

    // Navigate to the storyboard page
    await page.goto("https://www.jianying.com/ai-creator/storyboard", {
      waitUntil: "networkidle0",
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Clear existing text if necessary
    await page.click(
      "#ai-creator .shot-copy-writing > div > div:nth-child(1) > div"
    );

    // await page.keyboard.press("Control+A");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");

    await page.keyboard.press("Delete");

    // Paste the text using clipboard
    await page.evaluate(`navigator.clipboard.writeText(\`${text}\`)`);
    await page.keyboard.down("Control");
    await page.keyboard.press("V");
    await page.keyboard.up("Control");

    // await page.keyboard.press("Control+V");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.click(
      "#ai-creator div[class*='menu'] > div[class^='menu-item']:nth-child(2)"
    );

    await page.click("#lv-tabs-0-tab-1");

    const result = await page.evaluate(() => {
      const result: string[] = [];
      document
        .querySelectorAll(
          "div[class*='revealing'] div[class^='cardContainer'] div[class^='content'] span"
        )
        .forEach((el: Element) => {
          result.push((el as HTMLElement).innerText);
        });
      return result;
    });
    // setTimeout(() => {}, 1000);
    // await page.close();
    return {
      content: [
        {
          type: "text",
          text: `success，请调用generateVideoSecond，下面是音色，请选择\n${result.join(
            "\n"
          )}`,
        },
      ],
    };
  }
);

/**
 * Step Two, Generate Video, from the input voicer
 * @param voiceName The name of the voice to use
 * @returns A string indicating success
 */
server.tool(
  "generate-video-second",
  `Step Two, Generate Video, from the input voicer`,
  {
    voiceName: z.string().optional().describe("The name of the voice to use"),
  },
  async ({ voiceName }) => {
    let browser = await createBrowser();

    // Find the page
    const pages = await browser.pages();
    const page = pages.find((page) =>
      page.url().includes("https://www.jianying.com/ai-creator/storyboard")
    );

    if (!page || page.isClosed()) {
      throw new Error("jianying page not found!");
    }

    await sleep(1000);

    const result = await page.evaluate(() => {
      const result: string[] = [];
      document
        .querySelectorAll(
          "div[class*='revealing'] div[class^='cardContainer'] div[class^='content'] span"
        )
        .forEach((el: Element) => {
          result.push((el as HTMLElement).innerText);
        });
      return result;
    });

    // Find the voice in the list
    let voiceIndex = -1;
    if (voiceName) {
      for (let i = 0; i < result.length; i++) {
        if (result[i].toLowerCase().includes(voiceName.toLowerCase())) {
          voiceIndex = i;
          break;
        }
      }
    }

    if (voiceIndex === -1) {
      for (let i = 0; i < result.length; i++) {
        if (result[i].includes("新闻男声")) {
          voiceIndex = i;
          break;
        }
      }
    }

    // Default to first voice if not found
    voiceIndex = voiceIndex || 0;

    await page.click(
      `div[class*='revealing'] div[class^='cardContainer']:nth-child(${voiceIndex + 1}) div[class^='content'] span`
    );

    await sleep(1000);
    await page.click("#ai-creator div[class*='footer'] button");

    // Wait for voice generation to complete
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const loading = await page.$(
        "#ai-creator div.ai-creator-layout-content-container div[class*='loadingMask']"
      );
      if (!loading) {
        break;
      }
    }
    console.log("Voice generated");

    await page.click(
      "#ai-creator div[class^='tabsContainer'] div[class^='tab']:nth-child(2)"
    );
    await sleep(2000);
    await page.click(
      "#ai-creator div[class^='materialOptionContainer'] > div:nth-child(4) div[class^='match']"
    );
    await sleep(1000);
    await page.click(
      "body div.lv-modal-footer > button.lv-btn.lv-btn-primary.lv-btn-size-default.lv-btn-shape-square"
    );
    await sleep(1000);
    // Wait for video generation to complete
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const loading = await page.$(
        "#ai-creator div.ai-creator-layout-content-container div[class*='loadingMask']"
      );
      if (!loading) {
        break;
      }
    }
    console.log("Video generated");
    await sleep(1000);
    await page.click(
      "#ai-creator > div > div.platform-ui-service-header-container.ai-creator-title-bar-container > div.header-right > div:nth-child(1) > div > div:nth-child(4) > div > button"
    );
    await sleep(1000);
    await page.click(
      "div[class^='downloadVideoSettingsContainer'] div[class^='footer'] > button"
    );

    await page.close();
    return {
      content: [
        {
          type: "text",
          text: "success",
        },
      ],
    };
  }
);
