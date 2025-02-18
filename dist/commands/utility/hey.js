"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("hey")
        .setDescription("Interact with your beloved bot!"),
    async execute(interaction) {
        await interaction.reply("What's up, girl? Whatchu lookin' at?");
    },
};
//# sourceMappingURL=hey.js.map