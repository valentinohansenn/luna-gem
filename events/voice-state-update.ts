import { Events, VoiceState } from "discord.js"
import { VoiceStateManager } from "../utils/voice-state-manager"

module.exports = {
	name: Events.VoiceStateUpdate,
	execute(oldState: VoiceState, newState: VoiceState) {
		console.log("Voice state update detected")
		VoiceStateManager.getInstance().updateVoiceState(oldState, newState)

		// Log for debugging
		if (newState.channelId) {
			const members = VoiceStateManager.getInstance().getVoiceMembers(
				newState.guild.id,
				newState.channelId
			)
         console.log(`👋 ${newState.member?.displayName} joined '${newState.channel?.name}'` +
            `   └─ Channel now has ${newState.channel?.members.size} members`)
		} else {
         console.log(`👋 ${oldState.member?.displayName} left '${oldState.channel?.name}'` +
            `   └─ Channel now has ${oldState.channel?.members.size} members`)
      }
	},
}
