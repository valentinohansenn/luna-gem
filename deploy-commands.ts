import { REST, Routes } from "discord.js"
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { CommandsOptions } from "./types/command"

dotenv.config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

if (!token) {
	console.error("Please provide a valid Discord bot token.")
	process.exit(1)
}

if (!clientId) {
	console.error("Please provide a valid Discord client ID.")
	process.exit(1)
}

if (!guildId) {
	console.error("Please provide a valid Discord guild ID.")
	process.exit(1)
}

const commands: CommandsOptions[] = []
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands")
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"))
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		if ("data" in command && "execute" in command) {
			commands.push(command.data.toJSON())
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			)
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)

// and deploy your commands!
;(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = (await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands }
		)) as unknown[]

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
