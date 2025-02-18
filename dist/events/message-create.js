"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    cooldown: 5,
    name: discord_js_1.Events.MessageCreate,
    async execute(message) {
        // Listen for messages and log the sender's name
        if (message.author.bot) {
            // If the message is from a bot, stop further execution
            return;
        }
        if (!message.member) {
            // If the message is a DM, stop further execution
            return;
        }
        console.log(`${message.member.displayName} sent: ${message.content}`);
    },
};
//# sourceMappingURL=message-create.js.map