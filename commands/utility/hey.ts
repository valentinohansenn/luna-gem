import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hey")
		.setDescription("Interact with your beloved bot!"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("What's up, girl? Whatchu lookin' at?")
	},
}
