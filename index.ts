import dotenv from "dotenv"
import { Client, Collection, Events, GatewayIntentBits } from "discord.js"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
	MemorySaver,
	MessagesAnnotation,
	StateGraph,
} from "@langchain/langgraph"
import { RunnableConfig } from "@langchain/core/runnables"

// Load environment variables from .env file
console.log("Loading environment...")
dotenv.config()

const checkpointer = new MemorySaver()
const tools = [new TavilySearchResults({ maxResults: 3 })]
const toolNode = new ToolNode(tools)

const llm = new ChatOpenAI({
	model: "gpt-4o-mini",
	temperature: 0.3,
}).bindTools(tools)

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
	const lastMessage = messages[messages.length - 1] as AIMessage

	if (lastMessage.tool_calls?.length) {
		return "tools"
	}

	return "__end__"
}

async function callModel(
	state: typeof MessagesAnnotation.State,
	config?: RunnableConfig
) {
	const response = await llm.invoke(state.messages, config)
	return { messages: [response] }
}

// Define a graph workflow for the agent to understand
const workflow = new StateGraph(MessagesAnnotation)
	.addNode("agent", callModel)
	.addEdge("__start__", "agent")
	.addNode("tools", toolNode)
	.addEdge("tools", "agent")
	.addConditionalEdges("agent", shouldContinue)

const agent = workflow.compile({ checkpointer })

// Add initial logging
console.log("=== Bot Initialization ===")

declare module "discord.js" {
	export interface Client {
		commands: Collection<any, any>
		cooldowns: Collection<any, any>
	}
}

if (!process.env.DISCORD_TOKEN) {
	console.error("Please provide a valid Discord bot token.")
	process.exit(1)
}
console.log("Environment loaded successfully")

// Create a new Discord client instance
console.log("Creating Discord client...")
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
}) as Client

client.commands = new Collection()
client.cooldowns = new Collection()

client.on(Events.ClientReady, (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.MessageCreate, async (message) => {
	console.log(`Message received: ${message.content}`)

	if (!message.content.startsWith("!gem")) return

	// Check other conditions
	if (message.author.bot) return

	// Extract the actual message (remove !gem prefix and trim)
	const userMessage = message.content.slice(4).trim()

	// If no message after !gem, return
	if (!userMessage) return

	let config = {
		configurable: { thread_id: `conversation-${message.channel.id}` },
	}

	await message.channel.sendTyping()

	const res = await agent.invoke(
		{
			messages: [new HumanMessage(userMessage)],
		},
		config
	)

	const reply = res.messages[res.messages.length - 1].content
	message.reply(reply.toString())
})

// Login
console.log("\nAttempting to log in...")
client
	.login(process.env.DISCORD_TOKEN)
	.then(() => {
		console.log("Bot successfully logged in")
	})
	.catch((error) => {
		console.error("Failed to log in:", error)
		process.exit(1)
	})

// Handle process errors
process.on("unhandledRejection", (error) => {
	console.error("Unhandled promise rejection:", error)
})

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error)
})
