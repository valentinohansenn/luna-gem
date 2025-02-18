import { VoiceState, Collection, GuildMember } from "discord.js"

export class VoiceStateManager {
	private static instance: VoiceStateManager
	private voiceStates: Map<string, Map<string, Set<string>>>

	private constructor() {
		this.voiceStates = new Map()
	}

	public static getInstance(): VoiceStateManager {
		if (!VoiceStateManager.instance) {
			VoiceStateManager.instance = new VoiceStateManager()
		}
		return VoiceStateManager.instance
	}

	public updateVoiceState(oldState: VoiceState, newState: VoiceState): void {
		const guildId = newState.guild.id || oldState.guild.id

		// Initialize guild's voice states if not exists
		if (!this.voiceStates.has(guildId)) {
			this.voiceStates.set(guildId, new Map())
		}

		const guildVoiceStates = this.voiceStates.get(guildId)!

		// Handle member leaving a channel
		if (oldState.channelId && oldState.member) {
			const oldChannelMembers =
				guildVoiceStates.get(oldState.channelId) || new Set()
			oldChannelMembers.delete(oldState.member.id)
			if (oldChannelMembers.size === 0) {
				guildVoiceStates.delete(oldState.channelId)
			} else {
				guildVoiceStates.set(oldState.channelId, oldChannelMembers)
			}
			console.log("Member left channel")
		}

		// Handle member joining a channel
		if (newState.channelId && newState.member) {
			const newChannelMembers =
				guildVoiceStates.get(newState.channelId) || new Set()
			newChannelMembers.add(newState.member.id)
			guildVoiceStates.set(newState.channelId, newChannelMembers)
			console.log("Member joined channel")
		}
	}

	public getVoiceMembers(guildId: string, channelId: string): string[] {
		const guildVoiceStates = this.voiceStates.get(guildId)
		if (!guildVoiceStates) return []

		const channelMembers = guildVoiceStates.get(channelId)
		if (!channelMembers) return []

		return Array.from(channelMembers)
	}

	public getAllGuildVoiceMembers(guildId: string): string[] {
		const guildVoiceStates = this.voiceStates.get(guildId)
		if (!guildVoiceStates) return []

		const allMembers = new Set<string>()
		for (const members of guildVoiceStates.values()) {
			members.forEach((memberId) => allMembers.add(memberId))
		}

		return Array.from(allMembers)
	}

	public clearGuildVoiceStates(guildId: string): void {
		this.voiceStates.delete(guildId)
	}
}
