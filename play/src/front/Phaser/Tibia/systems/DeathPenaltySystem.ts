import type { PlayerStats } from './PlayerStats'
import type { Inventory } from './Inventory'
import type { InventorySlot } from './Inventory'
import { ITEMS } from '../data/items'

export interface DeathPenaltyResult {
    goldLost: number
    itemsLost: InventorySlot[]
    skillLosses: Record<string, number>
    xpLost: number
    levelDrained: boolean
    protectionUsed: boolean
}

export interface DeathRecord {
    timestamp: number
    killer: string
    mapId: string
    playerLevel: number
    penalty: DeathPenaltyResult
}

export class DeathPenaltySystem {
    private goldLossPercent = 0.10
    private maxGoldLossPercent = 0.30
    private xpLossPercent = 0.05
    private skillLossChance = 0.05
    private itemLossChance = 0.10
    private protectedItems: Set<string> = new Set([
        'amulet_of_loss',
        'quest_items',
        'blessing_of_the_natural',
        'blessing_of_the_wizard'
    ])
    private deathHistory: DeathRecord[] = []
    private consecutiveDeaths = 0

    calculatePenalty(player: PlayerStats, inventory: Inventory, killerName: string, mapId: string): DeathPenaltyResult {
        const hasAmuletOfLoss = this.hasAmuletProtection(player)
        const levelMultiplier = Math.min(2, 1 + player.level * 0.01)
        const adjustedGoldPercent = Math.min(this.maxGoldLossPercent, this.goldLossPercent * levelMultiplier)

        const goldLost = Math.floor(player.gold * adjustedGoldPercent)
        player.gold = Math.max(0, player.gold - goldLost)

        const itemsLost: InventorySlot[] = []
        if (!hasAmuletOfLoss) {
            const eligibleItems = inventory.items.filter(slot => {
                const item = ITEMS[slot.itemId]
                if (!item) return false
                if (this.protectedItems.has(slot.itemId)) return false
                if (item.category === 'quest') return false
                if (item.category === 'money') return false
                return true
            })

            const maxItemsToLose = Math.min(3, eligibleItems.length)
            const itemsToLose = Math.min(maxItemsToLose, Math.floor(eligibleItems.length * this.itemLossChance * this.consecutiveDeaths))

            for (let i = 0; i < itemsToLose; i++) {
                const idx = Math.floor(Math.random() * eligibleItems.length)
                const slot = eligibleItems[idx]
                if (slot) {
                    itemsLost.push({ itemId: slot.itemId, count: slot.count })
                    inventory.removeItem(slot.itemId, slot.count)
                    eligibleItems.splice(idx, 1)
                }
            }
        }

        const skillLosses: Record<string, number> = {}
        const skillKeys = Object.keys(player.skills)
        for (const skill of skillKeys) {
            if (Math.random() < this.skillLossChance) {
                const currentLevel = player.skills[skill]
                if (currentLevel > 10) {
                    const loss = Math.floor(Math.random() * 3) + 1
                    player.skills[skill] = Math.max(10, currentLevel - loss)
                    skillLosses[skill] = loss
                }
            }
        }

        const xpLost = Math.floor(player.xp * this.xpLossPercent * levelMultiplier)
        player.xp = Math.max(0, player.xp - xpLost)

        let levelDrained = false
        if (player.xp < 0 && player.level > 1) {
            player.level--
            player.xpToLevel = Math.floor(50 * Math.pow(1.2, player.level - 1))
            player.xp = player.xpToLevel + player.xp
            levelDrained = true
        }

        const penalty: DeathPenaltyResult = {
            goldLost,
            itemsLost,
            skillLosses,
            xpLost,
            levelDrained,
            protectionUsed: hasAmuletOfLoss
        }

        this.consecutiveDeaths++
        this.deathHistory.push({
            timestamp: Date.now(),
            killer: killerName,
            mapId,
            playerLevel: player.level,
            penalty
        })

        if (this.deathHistory.length > 100) {
            this.deathHistory = this.deathHistory.slice(-100)
        }

        return penalty
    }

    private hasAmuletProtection(player: PlayerStats): boolean {
        return player.equipment.amulet === 'amulet_of_loss'
    }

    onRespawn(player: PlayerStats): void {
        player.hp = Math.floor(player.maxHp * 0.5)
        player.mp = Math.floor(player.maxMp * 0.5)
    }

    getDeathCount(): number {
        return this.deathHistory.length
    }

    getConsecutiveDeaths(): number {
        return this.consecutiveDeaths
    }

    resetConsecutiveDeaths(): void {
        this.consecutiveDeaths = 0
    }

    getDeathHistory(): DeathRecord[] {
        return [...this.deathHistory]
    }

    getLastDeath(): DeathRecord | null {
        return this.deathHistory.length > 0
            ? this.deathHistory[this.deathHistory.length - 1]
            : null
    }

    formatPenaltyMessage(penalty: DeathPenaltyResult): string[] {
        const messages: string[] = []

        if (penalty.protectionUsed) {
            messages.push('Seu Amulet of Loss absorveu a penalidade!')
        }

        if (penalty.goldLost > 0) {
            messages.push(`Você perdeu ${penalty.goldLost} gold!`)
        }

        if (penalty.itemsLost.length > 0) {
            for (const item of penalty.itemsLost) {
                const itemData = ITEMS[item.itemId]
                const name = itemData?.name ?? item.itemId
                messages.push(`Você perdeu: ${item.count}x ${name}`)
            }
        }

        if (Object.keys(penalty.skillLosses).length > 0) {
            for (const [skill, loss] of Object.entries(penalty.skillLosses)) {
                messages.push(`Skill ${skill} diminuiu em ${loss}`)
            }
        }

        if (penalty.xpLost > 0) {
            messages.push(`Você perdeu ${penalty.xpLost} XP`)
        }

        if (penalty.levelDrained) {
            messages.push('Você perdeu um nível!')
        }

        return messages
    }

    serialize(): { deathHistory: DeathRecord[]; consecutiveDeaths: number } {
        return {
            deathHistory: [...this.deathHistory],
            consecutiveDeaths: this.consecutiveDeaths
        }
    }

    deserialize(data: { deathHistory: DeathRecord[]; consecutiveDeaths: number }): void {
        this.deathHistory = data.deathHistory ?? []
        this.consecutiveDeaths = data.consecutiveDeaths ?? 0
    }
}
