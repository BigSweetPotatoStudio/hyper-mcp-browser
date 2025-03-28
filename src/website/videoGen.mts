import { z } from "zod";
import { createBrowser, server, sleep } from "../index.mjs";

/**
 * Step One, Generate Video, from the input text
 * @param text The input text to generate video from
 * @returns A string indicating success and available voice options
 */
server.tool(
  "generate-video",
  `Generate Video, from the input text content`,
  {
    content: z.string({
      description: `text content to generate video`,
    }),
    voiceRole: z.enum(
      [
        "感性女生",
        "养生丽姐",
        "生活导师",
        "温柔播报",
        "科技博主",
        "温和宝爸",
        "刘语熙",
        "知性女声",
        "温柔淑女",
        "小姐姐",
        "生活主播",
        "英语女王",
        "军事解说",
        "生活小妙招",
        "旅游资讯",
        "稚气少女",
        "电竞解说",
        "新闻男声",
        "雅痞大叔",
        "恐怖电影",
        "快板",
        "阳光男生",
        "抱怨男声",
        "开朗弟弟",
        "上海阿姨",
        "京腔",
        "粤语男声",
        "天津小哥",
        "河南大叔",
        "西安掌柜",
        "重庆小伙",
        "大丫",
        "靓女",
        "湘普甜甜",
        "幺妹",
        "青岛小哥",
        "动漫小新",
        "大耳小图",
        "小品艺术家",
        "咆哮哥",
        "东厂公公",
        "小魔童",
        "女儿国王",
        "八戒",
        "天线波波",
        "章鱼哥哥",
        "说唱小哥",
        "太乙",
        "小女孩",
        "萌娃",
        "童话解说",
        "心灵鸡汤",
        "甜美解说",
        "知识讲解",
        "新闻女声",
        "娱乐扒妹II",
        "甜美悦悦",
        "强势妹",
        "理智姐",
        "心机御姐",
        "语音助手",
        "老婆婆",
        "亲切女声",
        "林潇",
        "娇羞猴哥",
        "紫薇说唱",
        "雍容贵妃",
        "神厨老佛爷",
        "随性女声",
        "元气少女",
        "威猛震天",
        "百科解说",
        "温柔姐姐",
        "少儿百科",
        "广告男声",
        "AI旁白",
        "蜡笔小妮",
        "台湾女生",
        "娱乐扒妹",
        "港配男声",
        "有声小说",
        "爽朗男声",
        "解说小帅",
        "东北老铁",
        "广西表哥",
        "电视广告",
        "港普男声",
        "译制片男",
        "龅牙珍珍",
        "猴哥说唱",
        "译制片男II",
        "直播一姐",
        "娱乐播报",
        "动漫海绵",
        "商务殷语",
        "樱花小哥",
        "沉稳解说",
        "电台广播",
        "文艺男声",
        "单口相声",
        "文艺女声",
        "广普",
        "清冷女声",
      ],
      {
        description: `Choose voiceRole based on content`,
      }
    ),
  },
  async ({ content, voiceRole }) => {
    if (!content) {
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
    await page.evaluate(`navigator.clipboard.writeText(\`${content}\`)`);
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
    //     return {
    //       content: [
    //         {
    //           type: "text",
    //           text: `success，请调用generateVideoSecond，下面是音色，请选择\n${JSON.stringify(
    //             result
    //           )}`,
    //         },
    //       ],
    //     };
    //   }
    // );

    // /**
    //  * Step Two, Generate Video, from the input voicer
    //  * @param voiceName The name of the voice to use
    //  * @returns A string indicating success
    //  */
    // server.tool(
    //   "generate-video-second",
    //   `Step Two, Generate Video, from the input voicer`,
    //   {
    //     voiceName: z.string().optional().describe("The name of the voice to use"),
    //   },
    //   async ({ voiceName }) => {
    //     let browser = await createBrowser();

    //     // Find the page
    //     const pages = await browser.pages();
    //     const page = pages.find((page) =>
    //       page.url().includes("https://www.jianying.com/ai-creator/storyboard")
    //     );

    //     if (!page || page.isClosed()) {
    //       throw new Error("jianying page not found!");
    //     }

    //     await sleep(1000);

    //     const result = await page.evaluate(() => {
    //       const result: string[] = [];
    //       document
    //         .querySelectorAll(
    //           "div[class*='revealing'] div[class^='cardContainer'] div[class^='content'] span"
    //         )
    //         .forEach((el: Element) => {
    //           result.push((el as HTMLElement).innerText);
    //         });
    //       return result;
    //     });

    // Find the voice in the list
    let voiceIndex = -1;
    if (voiceRole) {
      for (let i = 0; i < result.length; i++) {
        if (result[i].toLowerCase().includes(voiceRole.toLowerCase())) {
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
    // 点击音声
    await page.click(
      `div[class*='revealing'] div[class^='cardContainer']:nth-child(${
        voiceIndex + 1
      }) div[class^='content'] span`
    );
    // await page.hover(
    //   `div[class*='revealing'] div[class^='cardContainer']:nth-child(${
    //     voiceIndex + 1
    //   }) div[class^='content'] span`
    // );
    // 点击音声速度设置
    await page.click(
      `div[class*='revealing'] div[class^='cardContainer']:nth-child(${
        voiceIndex + 1
      }) .tools-btn`
    );
    await sleep(500);
    // 输入速度
    await page.click("div[class*='adjustInput'] input");
    await sleep(500);
    await page.keyboard.press("ArrowUp");

    // 点击生成声音
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
    // 点击素材
    await page.click(
      "#ai-creator div[class^='tabsContainer'] div[class^='tab']:nth-child(2)"
    );
    await sleep(1000);
    // 匹配按钮
    await page.click(
      "#ai-creator div[class^='materialOptionContainer'] > div:nth-child(4) div[class^='match']"
    );
    await sleep(1000);
    if (
      await page.$(
        "body div.lv-modal-footer > button.lv-btn.lv-btn-primary.lv-btn-size-default.lv-btn-shape-square"
      )
    ) {
      await page.click(
        "body div.lv-modal-footer > button.lv-btn.lv-btn-primary.lv-btn-size-default.lv-btn-shape-square"
      );
    }

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

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const success = await page
        .$eval(".lv-modal span[class*='success']", (e) => {
          return e.innerText.includes("导出成功");
        })
        .catch(() => false);
      if (success) {
        break;
      }
    }
    await sleep(1000);
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
