import { Client, Events, VoiceState } from "discord.js"
import { VoiceStateManager } from "../utils/voice-state-manager"

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		const guilds = await client.guilds.fetch()

		for (const [, guild] of guilds) {
			const fullGuild = await guild.fetch()
			const voiceStates = fullGuild.voiceStates.cache

			console.log(`Initializing voice states for ${fullGuild.name}`)

			VoiceStateManager.getInstance().clearGuildVoiceStates(fullGuild.id)

			voiceStates.forEach((voiceState) => {
				if (voiceState.channelId && voiceState.member) {
					VoiceStateManager.getInstance().updateVoiceState(
						{} as VoiceState,
						voiceState
					)
				}
			})
		}

		console.log("✅ Ready! Voice states initialized.")
	},
}
