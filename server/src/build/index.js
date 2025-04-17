"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const fetchCatImage_js_1 = require("../fetchCatImage.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
// Create server instance
const server = new mcp_js_1.McpServer({
  name: "cat-image",
  version: "1.0.0",
});
server.tool("get-cat-image", "Get a random cat image", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, fetchCatImage_js_1.fetchCatImage)();
    return {
      content: [
        {
          type: "image",
          data,
          mimeType: "image/jpeg",
        },
      ],
    };
  })
);
function main() {
  return __awaiter(this, void 0, void 0, function* () {
    const transport = new stdio_js_1.StdioServerTransport();
    yield server.connect(transport);
    console.error("Cat Image MCP Server running on stdio");
  });
}
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
