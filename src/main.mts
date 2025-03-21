#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./index.mjs";

if (process.env.hyper_dev) {
  await import("./tests/videoGen.mjs");
}

const transport = new StdioServerTransport();
console.log("Server start");
await server.connect(transport);
