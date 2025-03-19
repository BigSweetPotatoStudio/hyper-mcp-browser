import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { server } from "./index.mjs";

const transport = new StdioServerTransport();
console.log("Server start");
await server.connect(transport);