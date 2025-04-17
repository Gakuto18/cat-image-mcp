import { Anthropic } from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import dotenv from "dotenv";
import terminalImage from "terminal-image";
dotenv.config();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}
class MCPClient {
    mcp;
    anthoripic;
    transport = null;
    tools = [];
    constructor() {
        this.anthoripic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
        this.mcp = new Client({
            name: "mcp-client",
            version: "0.1.0",
        });
    }
    async connectToServer(serverScriptPath) {
        try {
            this.transport = new StdioClientTransport({
                command: process.execPath,
                args: [serverScriptPath],
            });
            this.mcp.connect(this.transport);
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));
        }
        catch (error) {
            console.log("Failed to connect to MCP server: ", error);
            throw error;
        }
    }
    async processQuery(query) {
        const messages = [
            {
                role: "user",
                content: query,
            },
        ];
        const response = await this.anthoripic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1000,
            messages,
            tools: this.tools,
        });
        const finalText = [];
        for (const content of response.content) {
            if (content.type === "text") {
                // 返答がテキストの場合
                finalText.push(content.text);
            }
            else if (content.type === "tool_use") {
                // ツールを実行
                const toolName = content.name;
                const toolArgs = content.input;
                console.log("【ツールの実行】", toolName, toolArgs);
                const result = (await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                }));
                if (result.content) {
                    const imageData = result.content[0].data;
                    const buffer = Buffer.from(imageData, "base64");
                    console.log(await terminalImage.buffer(buffer));
                }
            }
        }
        return finalText.join("\n");
    }
    async chatLoop() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        try {
            console.log("Welcome to MCP Client! Type 'exit' to quit.");
            while (true) {
                const query = await rl.question("You: ");
                if (query.toLowerCase() === "quit") {
                    break;
                }
                const response = await this.processQuery(query);
                console.log("MCP: ", response);
            }
        }
        catch (error) {
            console.error("Error: ", error);
        }
        finally {
            rl.close();
        }
    }
    async cleanup() {
        await this.mcp.close();
    }
}
async function main() {
    if (process.argv.length < 3) {
        console.log("Usage: node index.ts <path_to_server_script>");
        return;
    }
    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer(process.argv[2]);
        await mcpClient.chatLoop();
    }
    finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}
main();
