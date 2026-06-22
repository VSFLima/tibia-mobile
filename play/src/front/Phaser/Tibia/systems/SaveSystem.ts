import type { SaveData } from '../data/types'
import type { PlayerStats } from './PlayerStats'
import type { Inventory } from './Inventory'
import type { QuestSystem } from './QuestSystem'
import type { SpellSystem } from './SpellSystem'
import type { TradeSystem } from './TradeSystem'
import type { DeathPenaltySystem } from './DeathPenaltySystem'

const SAVE_KEY = 'tibia_mobile_save'

export class SaveSystem {
    save(
        player: PlayerStats,
        inventory: Inventory,
        currentMap: string,
        questSystem: QuestSystem,
        spellSystem?: SpellSystem,
        tradeSystem?: TradeSystem,
        deathPenaltySystem?: DeathPenaltySystem
    ): void {
        const data: SaveData = {
            player: player.getSaveData(),
            inventory: inventory.serialize(),
            equipment: { ...player.equipment },
            quests: questSystem.serialize(),
            currentMap
        }

        if (spellSystem) {
            data.spells = spellSystem.serialize()
        }
        if (tradeSystem) {
            data.trade = tradeSystem.serialize()
        }
        if (deathPenaltySystem) {
            data.deathPenalty = deathPenaltySystem.serialize()
        }

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data))
        } catch (e) {
            console.error('Failed to save game:', e)
        }
    }

    load(): SaveData | null {
        try {
            const raw = localStorage.getItem(SAVE_KEY)
            if (!raw) return null
            return JSON.parse(raw) as SaveData
        } catch (e) {
            console.error('Failed to load save:', e)
            return null
        }
    }

    deleteSave(): void {
        localStorage.removeItem(SAVE_KEY)
    }

    hasSave(): boolean {
        return localStorage.getItem(SAVE_KEY) !== null
    }
}
