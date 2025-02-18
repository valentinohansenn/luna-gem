"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_genai_1 = require("@langchain/google-genai");
const generative_ai_1 = require("@google/generative-ai");
const discord_js_1 = require("discord.js");
const searchRetrievalTool = {
    googleSearchRetrieval: {
        dynamicRetrievalConfig: {
            mode: generative_ai_1.DynamicRetrievalMode.MODE_DYNAMIC,
            dynamicThreshold: 0.7,
        },
    },
};
const searchRetrievalModel = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0,
    maxRetries: 3,
    apiKey: process.env.GOOGLE_API_KEY,
}).bindTools([searchRetrievalTool]);
module.exports = {
    cooldown: 5,
    name: discord_js_1.Events.MessageCreate,
    async execute(message) {
        console.log("Message received");
        // Check if the message starts with !gem
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
        let prevMessages = await message.channel.messages.fetch({ limit: 15 });
        // Reverse the messages to get the most recent messages first
        prevMessages.reverse();
        // Filter out the messages from the bot
        prevMessages = prevMessages.filter((msg) => {
            return (msg.content.startsWith("!gem") &&
                !msg.author.bot &&
                msg.author.id === message.author.id);
        });
        let conversation = [
            {
                role: "system",
                content: "You are a friendly and helpful chatbot that has the ability to search your information online with the binded tool, or simply reply with your background knowledge. If you don't get the question, simply state it and ask for clarification",
            },
        ];
        conversation.push({ role: "user", content: userMessage });
        try {
            const res = await searchRetrievalModel.invoke(userMessage);
            console.log("Response:", res.content.toString());
            await message.reply(res.content.toString());
        }
        catch (error) {
            console.error("Error:", error);
            await message.reply("Sorry, there was an error processing your request.");
        }
    },
};
//# sourceMappingURL=message-create.js.map