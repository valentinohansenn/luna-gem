"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const langgraph_1 = require("@langchain/langgraph");
// Load environment variables from .env file
console.log("Loading environment...");
dotenv_1.default.config();
const checkpointer = new langgraph_1.MemorySaver();
const tools = [new tavily_search_1.TavilySearchResults({ maxResults: 3 })];
const toolNode = new prebuilt_1.ToolNode(tools);
const llm = new openai_1.ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
}).bindTools(tools);
function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.tool_calls?.length) {
        return "tools";
    }
    return "__end__";
}
async function callModel(state, config) {
    const response = await llm.invoke(state.messages, config);
    return { messages: [response] };
}
// Define a graph workflow for the agent to understand
const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);
const agent = workflow.compile({ checkpointer });
// Add initial logging
console.log("=== Bot Initialization ===");
if (!process.env.DISCORD_TOKEN) {
    console.error("Please provide a valid Discord bot token.");
    process.exit(1);
}
console.log("Environment loaded successfully");
// Create a new Discord client instance
console.log("Creating Discord client...");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
client.commands = new discord_js_1.Collection();
client.cooldowns = new discord_js_1.Collection();
client.on(discord_js_1.Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.on(discord_js_1.Events.MessageCreate, async (message) => {
    console.log(`Message received: ${message.content}`);
    if (!message.content.startsWith("!gem"))
        return;
    // Check other conditions
    if (message.author.bot)
        return;
    // Extract the actual message (remove !gem prefix and trim)
    const userMessage = message.content.slice(4).trim();
    // If no message after !gem, return
    if (!userMessage)
        return;
    let config = {
        configurable: { thread_id: `conversation-${message.channel.id}` },
    };
    await message.channel.sendTyping();
    const res = await agent.invoke({
        messages: [new messages_1.HumanMessage(userMessage)],
    }, config);
    const reply = res.messages[res.messages.length - 1].content;
    message.reply(reply.toString());
});
// Login
console.log("\nAttempting to log in...");
client
    .login(process.env.DISCORD_TOKEN)
    .then(() => {
    console.log("Bot successfully logged in");
})
    .catch((error) => {
    console.error("Failed to log in:", error);
    process.exit(1);
});
// Handle process errors
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
});
//# sourceMappingURL=index.js.map