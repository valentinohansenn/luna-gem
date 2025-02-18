import {
	ChatInputCommandInteraction,
	Client,
	Events,
	Message,
} from "discord.js"

module.exports = {
	cooldown: 5,
	name: Events.MessageCreate,
	async execute(message: Message) {
		// Listen for messages and log the sender's name
		if (message.author.bot) {
			// If the message is from a bot, stop further execution
			return
		}

		if (!message.member) {
			// If the message is a DM, stop further execution
			return
		}

		console.log(`${message.member.displayName} sent: ${message.content}`)
	},
}
