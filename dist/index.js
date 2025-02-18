"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
// Add initial logging
console.log("=== Bot Initialization ===");
// Load environment variables from .env file
console.log("Loading environment...");
dotenv_1.default.config();
if (!process.env.DISCORD_TOKEN) {
    console.error("Please provide a valid Discord bot token.");
    process.exit(1);
}
console.log("Environment loaded successfully");
// Create a new Discord client instance
console.log("Creating Discord client...");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
client.commands = new discord_js_1.Collection();
client.cooldowns = new discord_js_1.Collection();
// Load commands
console.log("Loading commands...");
const foldersPath = node_path_1.default.join(__dirname, "commands");
const commandFolders = node_fs_1.default.readdirSync(foldersPath);
console.log(`Found command folders: ${commandFolders.join(", ")}`);
for (const folder of commandFolders) {
    const commandsPath = node_path_1.default.join(foldersPath, folder);
    const commandFiles = node_fs_1.default
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js")); // Note: changed from .ts to .js
    console.log(`Loading commands from ${folder}: ${commandFiles.join(", ")}`);
    for (const file of commandFiles) {
        const filePath = node_path_1.default.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
// Load events
console.log("\nLoading events...");
const eventsPath = node_path_1.default.join(__dirname, "events");
const eventFiles = node_fs_1.default
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));
console.log(`Found event files: ${eventFiles.join(", ")}`);
for (const file of eventFiles) {
    const filePath = node_path_1.default.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => {
            console.log(`Executing once event: ${event.name}`);
            event.execute(...args);
        });
    }
    else {
        client.on(event.name, (...args) => {
            console.log(`Executing event: ${event.name}`);
            event.execute(...args);
        });
    }
    console.log(`Loaded event: ${event.name}`);
}
// Login
console.log("\nAttempting to log in...");
client
    .login(process.env.DISCORD_TOKEN)
    .then(() => {
    console.log("Bot successfully logged in");
})
    .catch((error) => {
    console.error("Failed to log in:", error);
    process.exit(1);
});
// Handle process errors
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
});
//# sourceMappingURL=index.js.map