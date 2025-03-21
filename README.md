```
hyper-mcp-browser
```

## 功能

1.总结页面
2.谷歌、bing搜索

## 普通安装

```
command:  npx

args:  -y hyper-mcp-browser

env:  

    // 连接浏览器的远程调试端口
    let Hyper_browserURL = process.env.Hyper_browserURL || "http://localhost:9222";
    // 是否使用本地浏览器，如果为false则使用设置的端口调试浏览器
    let isUseLoacl = process.env.Hyper_isUseLoacl != "false" || true;
    // 搜索引擎
    let searchEngine = process.env.Hyper_SEARCH_ENGINE || "google";
    // 起始页
    let startingUrl = process.env.Hyper_startingUrl || "https://github.com/BigSweetPotatoStudio/HyperChat";
    // （可选）浏览器默认路径
    // * the `CHROME_PATH` env variable will be used if set. (`LIGHTHOUSE_CHROMIUM_PATH` is deprecated)
    // * Otherwise, a detected Chrome Canary will be used if found
    // * Otherwise, a detected Chrome (stable) will be used
    let CHROME_PATH = process.env.CHROME_PATH || undefined;
```

## 使用图片


https://github.com/user-attachments/assets/5d963741-1384-4915-bcc6-6b1248294be0

![image](https://github.com/user-attachments/assets/f92221bf-e273-4fdb-aa18-e98f7866dc1d)




## Usage

### hyperchat安装方式  [下载地址](https://github.com/BigSweetPotatoStudio/HyperChat)



