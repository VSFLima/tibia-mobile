import type { SaveData } from '../data/types'
import type { PlayerStats } from './PlayerStats'
import type { Inventory } from './Inventory'
import type { QuestSystem } from './QuestSystem'

const SAVE_KEY = 'tibia_mobile_save'

export class SaveSystem {
    save(player: PlayerStats, inventory: Inventory, currentMap: string, questSystem: QuestSystem): void {
        const data: SaveData = {
            player: player.getSaveData(),
            inventory: inventory.serialize(),
            equipment: { ...player.equipment },
            quests: questSystem.serialize(),
            currentMap
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
