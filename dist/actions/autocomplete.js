"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteActions = void 0;
const voice_state_manager_1 = require("../utils/voice-state-manager");
class AutocompleteActions {
    static voiceStateManager = voice_state_manager_1.VoiceStateManager.getInstance();
    static getStaticChoices(interaction) {
        const choices = [];
        const member = interaction.member;
        const voiceChannels = interaction.guild?.channels.cache.filter((channel) => channel.isVoiceBased());
        // Check if there exists any members in the voice channels
        const hasVoiceMembers = voiceChannels?.some((channel) => channel.members.size > 0);
        if (!hasVoiceMembers) {
            return choices;
        }
        // Get all the members in the voice channels
        const everyone = voiceChannels
            ?.map((channel) => Array.from(channel.members.keys()))
            .flat() ?? [];
        const afk = voiceChannels
            ?.map((channel) => Array.from(channel.members
            .filter((member) => member.voice.selfDeaf || member.voice.selfMute)
            .keys()))
            .flat() ?? [];
        // Check if there exists any members in the voice channels
        if (everyone?.length > 0) {
            choices.push({
                name: "Everyone! Literally, all of em'",
                value: everyone.join(","),
            });
        }
        // Check if the command user is in a voice channel
        if (member && "voice" in member && member.voice.channel) {
            choices.push({ name: "Me, myself and I", value: member.id });
        }
        // Check if there exists AFK users in a voice channel
        if (afk?.length > 0) {
            choices.push({
                name: "AFK bit- I mean, members",
                value: afk.join(","),
            });
        }
        return choices;
    }
    static getVoiceMembers(interaction) {
        const voiceMembers = [];
        if (!interaction.guildId)
            return voiceMembers;
        const commandUserVoiceChannel = interaction.member && "voice" in interaction.member
            ? interaction.member.voice.channel
            : null;
        if (commandUserVoiceChannel) {
            const memberIds = this.voiceStateManager.getVoiceMembers(interaction.guildId, commandUserVoiceChannel.id);
            for (const memberId of memberIds) {
                const member = interaction.guild?.members.cache.get(memberId);
                if (!member || member.user.bot)
                    continue;
                voiceMembers.push({ name: member.displayName, value: member.id });
            }
        }
        return voiceMembers;
    }
    static async handleVoiceMembersAutocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        // Get fresh voice member data
        const voiceMembers = await this.getVoiceMembers(interaction);
        const staticChoices = this.getStaticChoices(interaction);
        const allChoices = [...staticChoices, ...voiceMembers];
        const filtered = allChoices
            .filter((choice) => choice.name.toLowerCase().includes(focusedValue))
            .slice(0, 25);
        await interaction.respond(filtered);
    }
}
exports.AutocompleteActions = AutocompleteActions;
//# sourceMappingURL=autocomplete.js.map