"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_state_manager_1 = require("../utils/voice-state-manager");
module.exports = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        const guilds = await client.guilds.fetch();
        for (const [, guild] of guilds) {
            const fullGuild = await guild.fetch();
            const voiceStates = fullGuild.voiceStates.cache;
            console.log(`Initializing voice states for ${fullGuild.name}`);
            voice_state_manager_1.VoiceStateManager.getInstance().clearGuildVoiceStates(fullGuild.id);
            voiceStates.forEach((voiceState) => {
                if (voiceState.channelId && voiceState.member) {
                    voice_state_manager_1.VoiceStateManager.getInstance().updateVoiceState({}, voiceState);
                }
            });
        }
        console.log("✅ Ready! Voice states initialized.");
    },
};
//# sourceMappingURL=ready.js.map