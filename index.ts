import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { Client, Collection, GatewayIntentBits } from "discord.js"

// Add initial logging
console.log("=== Bot Initialization ===")

declare module "discord.js" {
	export interface Client {
		commands: Collection<any, any>
		cooldowns: Collection<any, any>
	}
}

// Load environment variables from .env file
console.log("Loading environment...")
dotenv.config()

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

// Load commands
console.log("Loading commands...")
const foldersPath = path.join(__dirname, "commands")
const commandFolders = fs.readdirSync(foldersPath)
console.log(`Found command folders: ${commandFolders.join(", ")}`)

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js")) // Note: changed from .ts to .js
	console.log(`Loading commands from ${folder}: ${commandFiles.join(", ")}`)

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command)
			console.log(`Loaded command: ${command.data.name}`)
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			)
		}
	}
}

// Load events
console.log("\nLoading events...")
const eventsPath = path.join(__dirname, "events")
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"))
console.log(`Found event files: ${eventFiles.join(", ")}`)

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file)
	const event = require(filePath)
	if (event.once) {
		client.once(event.name, (...args) => {
			console.log(`Executing once event: ${event.name}`)
			event.execute(...args)
		})
	} else {
		client.on(event.name, (...args) => {
			console.log(`Executing event: ${event.name}`)
			event.execute(...args)
		})
	}
	console.log(`Loaded event: ${event.name}`)
}

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
