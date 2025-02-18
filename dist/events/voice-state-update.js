"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_state_manager_1 = require("../utils/voice-state-manager");
module.exports = {
    name: discord_js_1.Events.VoiceStateUpdate,
    execute(oldState, newState) {
        console.log("Voice state update detected");
        voice_state_manager_1.VoiceStateManager.getInstance().updateVoiceState(oldState, newState);
        // Log for debugging
        if (newState.channelId) {
            const members = voice_state_manager_1.VoiceStateManager.getInstance().getVoiceMembers(newState.guild.id, newState.channelId);
            console.log(`👋 ${newState.member?.displayName} joined '${newState.channel?.name}'` +
                `   └─ Channel now has ${newState.channel?.members.size} members`);
        }
        else {
            console.log(`👋 ${oldState.member?.displayName} left '${oldState.channel?.name}'` +
                `   └─ Channel now has ${oldState.channel?.members.size} members`);
        }
    },
};
//# sourceMappingURL=voice-state-update.js.map