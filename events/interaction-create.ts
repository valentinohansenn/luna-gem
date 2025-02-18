import {
	Collection,
	CommandInteraction,
	Events,
	MessageFlags,
	Client,
} from "discord.js"

declare module "discord.js" {
	export interface Client {
		cooldown: Collection<string, Collection<string, number>>
	}
}

module.exports = {
	cooldown: 5,
	name: Events.InteractionCreate,
	async execute(interaction: CommandInteraction) {
		console.log(`=== Interaction Received ===`)
		console.log(`Type: ${interaction.type}`)
		console.log(`Command: ${interaction.commandName}`)
		console.log(`User: ${interaction.user.tag}`)
		console.log(`Guild: ${interaction.guild?.name}`)

		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			)
			return
		}

		interface CommandDetails {
			name?: string
			description?: string
			options?: string[]
		}

		console.log("Command details:", {
			name: command.data?.name,
			description: command.data?.description,
			options: command.data?.options?.map(
				(opt: { name: string }) => opt.name
			),
		} as CommandDetails)

		if (interaction.isChatInputCommand()) {
			console.log("Executing chat input command")
			try {
				await command.execute(interaction)
				console.log(
					`Command ${interaction.commandName} executed successfully`
				)
			} catch (error) {
				console.error("Error executing command:", error)
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: "There was an error while executing this command!",
						flags: MessageFlags.Ephemeral,
					})
				} else {
					await interaction.reply({
						content: "There was an error while executing this command!",
						flags: MessageFlags.Ephemeral,
					})
				}
			}
		} else if (interaction.isAutocomplete()) {
			console.log("Handling autocomplete interaction")
			try {
				await command.autocomplete(interaction)
				console.log("Autocomplete handled successfully")
			} catch (error) {
				console.error("Error handling autocomplete:", error)
			}
		}

		console.log(`=== Interaction End ===\n`)
	},
}
