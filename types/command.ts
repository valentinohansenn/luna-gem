import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export interface CommandsOptions {
	data: SlashCommandBuilder
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
