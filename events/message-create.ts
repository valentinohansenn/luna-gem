import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import {
	DynamicRetrievalMode,
	GoogleSearchRetrievalTool,
} from "@google/generative-ai"
import { Events, Message } from "discord.js"
import { Conversation } from "../types/conversation"

const searchRetrievalTool: GoogleSearchRetrievalTool = {
	googleSearchRetrieval: {
		dynamicRetrievalConfig: {
			mode: DynamicRetrievalMode.MODE_DYNAMIC,
			dynamicThreshold: 0.7,
		},
	},
}

const searchRetrievalModel = new ChatGoogleGenerativeAI({
	model: "gemini-1.5-pro",
	temperature: 0,
	maxRetries: 3,
	apiKey: process.env.GOOGLE_API_KEY,
}).bindTools([searchRetrievalTool])

module.exports = {
	cooldown: 5,
	name: Events.MessageCreate,
	async execute(message: Message) {
		console.log("Message received")
		// Check if the message starts with !gem
		if (!message.content.startsWith("!gem")) return

		// Check other conditions
		if (message.author.bot) return

		// Extract the actual message (remove !gem prefix and trim)
		const userMessage = message.content.slice(4).trim()

		// If no message after !gem, return
		if (!userMessage) return

		let prevMessages = await message.channel.messages.fetch({ limit: 15 })

		// Reverse the messages to get the most recent messages first
		prevMessages.reverse()

		// Filter out the messages from the bot
		prevMessages = prevMessages.filter((msg) => {
			return (
				msg.content.startsWith("!gem") &&
				!msg.author.bot &&
				msg.author.id === message.author.id
			)
		})

		let conversation: Conversation[] = [
			{
				role: "system",
				content:
					"You are a friendly and helpful chatbot that has the ability to search your information online with the binded tool, or simply reply with your background knowledge. If you don't get the question, simply state it and ask for clarification",
			},
		]

		conversation.push({ role: "user", content: userMessage })

		try {
			const res = await searchRetrievalModel.invoke(userMessage)
         console.log("Response:", res.content.toString())

			await message.reply(res.content.toString())
		} catch (error) {
			console.error("Error:", error)
			await message.reply(
				"Sorry, there was an error processing your request."
			)
		}
	},
}
