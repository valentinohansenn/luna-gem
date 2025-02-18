import { ChatInputCommandInteraction, SlashCommandBuilder, Collection } from "discord.js"

declare module "discord.js" {
	export interface Client {
		commands: Collection<any, any>
	}
}

module.exports = {
	name: "reload",
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a command.")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The command to reload.")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const commandName = interaction.options
			.getString("command", true)
			.toLowerCase()
		const command = interaction.client.commands.get(commandName)

		if (!command) {
			return interaction.reply(
				`There is no command with name \`${commandName}\`!`
			)
		}

		delete require.cache[require.resolve(`./commands/utility/${command.data.name}.ts`)]

		try {
			const newCommand = require(`./${command.data.name}.ts`)
			interaction.client.commands.set(newCommand.data.name, newCommand)
			await interaction.reply(
				`Command \`${newCommand.data.name}\` was reloaded!`
			)
		} catch (error) {
			console.error(error)
			await interaction.reply(
				`There was an error while reloading a command \`${command.data.name}\`:\n\`${(error as Error).message}\``
			)
		}
	},
}
