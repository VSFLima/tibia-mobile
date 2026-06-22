/**
 * RPG System for WorkAdventure
 * Adds Tibia-style RPG mechanics to the existing game
 */

// ============ RPG DATA TYPES ============
export interface RPGStats {
    level: number
    xp: number
    xpToLevel: number
    gold: number
    hp: number
    maxHp: number
    mp: number
    maxMp: number
    attack: number
    defense: number
    speed: number
    magicLevel: number
}

export interface RPGItem {
    id: string
    name: string
    category: 'weapon' | 'armor' | 'helmet' | 'legs' | 'boots' | 'shield' | 'consumable' | 'money' | 'quest'
    attack?: number
    defense?: number
    speed?: number
    magicLevel?: number
    hp?: number
    mp?: number
    price: number
    sellPrice: number
    stackable: boolean
}

export interface RPGMonster {
    id: string
    name: string
    health: number
    attack: number
    defense: number
    speed: number
    experience: number
    loot: { itemId: string; chance: number; min?: number; max?: number }[]
    behavior: 'passive' | 'aggressive'
    aggroRange: number
}

// ============ ITEMS DATABASE ============
export const RPG_ITEMS: Record<string, RPGItem> = {
    // Weapons
    'wooden_sword': { id: 'wooden_sword', name: 'Espada de Madeira', category: 'weapon', attack: 8, defense: 3, price: 150, sellPrice: 50, stackable: false },
    'iron_sword': { id: 'iron_sword', name: 'Espada de Ferro', category: 'weapon', attack: 15, defense: 6, price: 800, sellPrice: 400, stackable: false },
    'magic_sword': { id: 'magic_sword', name: 'Espada Mágica', category: 'weapon', attack: 28, defense: 10, magicLevel: 1, price: 5000, sellPrice: 2500, stackable: false },
    'fire_sword': { id: 'fire_sword', name: 'Espada de Fogo', category: 'weapon', attack: 42, defense: 14, magicLevel: 3, price: 25000, sellPrice: 12000, stackable: false },

    // Armor
    'leather_armor': { id: 'leather_armor', name: 'Armadura de Couro', category: 'armor', defense: 5, price: 400, sellPrice: 200, stackable: false },
    'chain_armor': { id: 'chain_armor', name: 'Armadura de Malha', category: 'armor', defense: 10, price: 1500, sellPrice: 750, stackable: false },
    'plate_armor': { id: 'plate_armor', name: 'Armadura de Placas', category: 'armor', defense: 15, price: 4000, sellPrice: 2000, stackable: false },

    // Helmets
    'iron_helmet': { id: 'iron_helmet', name: 'Capacete de Ferro', category: 'helmet', defense: 7, price: 900, sellPrice: 450, stackable: false },
    'magic_hat': { id: 'magic_hat', name: 'Chapéu Mágico', category: 'helmet', defense: 3, magicLevel: 3, price: 3000, sellPrice: 1500, stackable: false },

    // Boots
    'soft_boots': { id: 'soft_boots', name: 'Botas Macias', category: 'boots', defense: 1, speed: 2, price: 2000, sellPrice: 1000, stackable: false },
    'boots_of_haste': { id: 'boots_of_haste', name: 'Botas da Pressa', category: 'boots', defense: 2, speed: 8, price: 8000, sellPrice: 4000, stackable: false },

    // Shields
    'magic_shield': { id: 'magic_shield', name: 'Escudo Mágico', category: 'shield', defense: 12, magicLevel: 2, price: 5000, sellPrice: 2500, stackable: false },

    // Consumables
    'health_potion': { id: 'health_potion', name: 'Poção de Vida', category: 'consumable', hp: 75, price: 50, sellPrice: 15, stackable: true },
    'mana_potion': { id: 'mana_potion', name: 'Poção de Mana', category: 'consumable', mp: 75, price: 50, sellPrice: 15, stackable: true },
    'strong_health': { id: 'strong_health', name: 'Poção Forte de Vida', category: 'consumable', hp: 150, price: 150, sellPrice: 50, stackable: true },
    'great_health': { id: 'great_health', name: 'Poção Excelente de Vida', category: 'consumable', hp: 300, price: 350, sellPrice: 120, stackable: true },

    // Money
    'gold_coin': { id: 'gold_coin', name: 'Moeda de Ouro', category: 'money', price: 1, sellPrice: 1, stackable: true },

    // Quest items
    'dragon_scale': { id: 'dragon_scale', name: 'Escama de Dragão', category: 'quest', sellPrice: 500, stackable: true },
    'magic_crystal': { id: 'magic_crystal', name: 'Cristal Mágico', category: 'quest', sellPrice: 800, stackable: true }
}

// ============ MONSTERS DATABASE ============
export const RPG_MONSTERS: Record<string, RPGMonster> = {
    'rat': { id: 'rat', name: 'Rat', health: 20, attack: 3, defense: 1, speed: 3, experience: 5, loot: [{ itemId: 'gold_coin', chance: 0.5, min: 1, max: 3 }], behavior: 'passive', aggroRange: 4 },
    'bug': { id: 'bug', name: 'Bug', health: 30, attack: 5, defense: 2, speed: 2, experience: 8, loot: [{ itemId: 'gold_coin', chance: 0.6, min: 1, max: 5 }], behavior: 'passive', aggroRange: 4 },
    'snake': { id: 'snake', name: 'Snake', health: 25, attack: 4, defense: 1, speed: 5, experience: 6, loot: [{ itemId: 'gold_coin', chance: 0.4, min: 1, max: 2 }], behavior: 'aggressive', aggroRange: 3 },
    'spider': { id: 'spider', name: 'Spider', health: 40, attack: 6, defense: 2, speed: 4, experience: 12, loot: [{ itemId: 'gold_coin', chance: 0.5, min: 1, max: 5 }], behavior: 'aggressive', aggroRange: 5 },
    'troll': { id: 'troll', name: 'Troll', health: 65, attack: 8, defense: 4, speed: 2, experience: 20, loot: [{ itemId: 'gold_coin', chance: 0.7, min: 2, max: 10 }], behavior: 'aggressive', aggroRange: 5 },
    'orc': { id: 'orc', name: 'Orc', health: 115, attack: 15, defense: 8, speed: 3, experience: 40, loot: [{ itemId: 'gold_coin', chance: 0.8, min: 5, max: 25 }], behavior: 'aggressive', aggroRange: 6 },
    'skeleton': { id: 'skeleton', name: 'Skeleton', health: 80, attack: 12, defense: 5, speed: 3, experience: 35, loot: [{ itemId: 'gold_coin', chance: 0.6, min: 3, max: 15 }], behavior: 'aggressive', aggroRange: 5 },
    'dragon': { id: 'dragon', name: 'Dragon', health: 500, attack: 45, defense: 25, speed: 5, experience: 350, loot: [{ itemId: 'gold_coin', chance: 1, min: 50, max: 150 }, { itemId: 'dragon_scale', chance: 0.3, min: 1, max: 3 }], behavior: 'aggressive', aggroRange: 8 },
    'demon': { id: 'demon', name: 'Demon', health: 2000, attack: 80, defense: 50, speed: 8, experience: 1500, loot: [{ itemId: 'gold_coin', chance: 1, min: 200, max: 500 }], behavior: 'aggressive', aggroRange: 10 }
}

// ============ QUESTS DATABASE ============
export const RPG_QUESTS = [
    { id: 'q1', name: 'Rat Hunter', description: 'Mate 10 Rats', level: 1, target: 'rat', count: 10, rewardXp: 100, rewardGold: 50 },
    { id: 'q2', name: 'Spider Nest', description: 'Mate 15 Spiders', level: 5, target: 'spider', count: 15, rewardXp: 300, rewardGold: 150 },
    { id: 'q3', name: 'Orc Patrol', description: 'Mate 20 Orcs', level: 10, target: 'orc', count: 20, rewardXp: 800, rewardGold: 400 },
    { id: 'q4', name: 'Dragon Hunt', description: 'Mate 5 Dragons', level: 40, target: 'dragon', count: 5, rewardXp: 5000, rewardGold: 3000 },
    { id: 'q5', name: 'Demon Hunt', description: 'Mate 5 Demons', level: 70, target: 'demon', count: 5, rewardXp: 25000, rewardGold: 15000 }
]

// ============ RPG MANAGER CLASS ============
export class RPGManager {
    private stats: RPGStats
    private inventory: { itemId: string; count: number }[] = []
    private equipment: Record<string, string> = {}
    private activeQuests: string[] = []
    private completedQuests: string[] = []
    private questProgress: Record<string, number> = {}

    constructor() {
        this.stats = this.getDefaultStats()
        this.load()
    }

    private getDefaultStats(): RPGStats {
        return {
            level: 1, xp: 0, xpToLevel: 50, gold: 100,
            hp: 100, maxHp: 100, mp: 30, maxMp: 30,
            attack: 8, defense: 4, speed: 5, magicLevel: 1
        }
    }

    getStats(): RPGStats { return { ...this.stats } }
    getInventory(): { itemId: string; count: number }[] { return [...this.inventory] }
    getEquipment(): Record<string, string> { return { ...this.equipment } }

    get totalAttack(): number {
        let atk = this.stats.attack
        for (const slot of Object.values(this.equipment)) {
            const item = RPG_ITEMS[slot]
            if (item?.attack) atk += item.attack
        }
        return atk
    }

    get totalDefense(): number {
        let def = this.stats.defense
        for (const slot of Object.values(this.equipment)) {
            const item = RPG_ITEMS[slot]
            if (item?.defense) def += item.defense
        }
        return def
    }

    get totalSpeed(): number {
        let spd = this.stats.speed
        for (const slot of Object.values(this.equipment)) {
            const item = RPG_ITEMS[slot]
            if (item?.speed) spd += item.speed
        }
        return spd
    }

    get totalMagicLevel(): number {
        let ml = this.stats.magicLevel
        for (const slot of Object.values(this.equipment)) {
            const item = RPG_ITEMS[slot]
            if (item?.magicLevel) ml += item.magicLevel
        }
        return ml
    }

    // ============ DAMAGE SYSTEM ============
    takeDamage(amount: number): number {
        const mitigated = Math.max(1, amount - Math.floor(this.totalDefense * 0.3))
        const finalDamage = Math.max(1, mitigated - Math.floor(Math.random() * 3))
        this.stats.hp = Math.max(0, this.stats.hp - finalDamage)
        if (this.stats.hp <= 0) this.die()
        return finalDamage
    }

    heal(amount: number): number {
        const healed = Math.min(amount, this.stats.maxHp - this.stats.hp)
        this.stats.hp += healed
        return healed
    }

    healMana(amount: number): number {
        const healed = Math.min(amount, this.stats.maxMp - this.stats.mp)
        this.stats.mp += healed
        return healed
    }

    useMana(amount: number): boolean {
        if (this.stats.mp < amount) return false
        this.stats.mp -= amount
        return true
    }

    // ============ XP AND LEVEL ============
    gainXp(amount: number): number {
        this.stats.xp += amount
        let levelsGained = 0
        while (this.stats.xp >= this.stats.xpToLevel) {
            this.stats.xp -= this.stats.xpToLevel
            this.stats.level++
            levelsGained++
            this.stats.xpToLevel = Math.floor(50 * Math.pow(1.2, this.stats.level - 1))
            this.stats.maxHp += 10 + Math.floor(this.stats.level * 0.5)
            this.stats.maxMp += 5 + Math.floor(this.stats.level * 0.3)
            this.stats.hp = this.stats.maxHp
            this.stats.mp = this.stats.maxMp
            this.stats.attack += 2
            this.stats.defense += 1
        }
        return levelsGained
    }

    // ============ DEATH ============
    die(): void {
        this.stats.hp = 0
        this.stats.mp = 0
        const goldLoss = Math.floor(this.stats.gold * 0.2)
        this.stats.gold = Math.max(0, this.stats.gold - goldLoss)
    }

    respawn(): void {
        this.stats.hp = Math.floor(this.stats.maxHp * 0.5)
        this.stats.mp = Math.floor(this.stats.maxMp * 0.5)
    }

    isDead(): boolean {
        return this.stats.hp <= 0
    }

    // ============ INVENTORY ============
    addItem(itemId: string, count: number = 1): boolean {
        const item = RPG_ITEMS[itemId]
        if (!item) return false
        if (item.stackable) {
            const existing = this.inventory.find(i => i.itemId === itemId)
            if (existing) { existing.count += count; return true }
        }
        if (this.inventory.length >= 20) return false
        this.inventory.push({ itemId, count })
        return true
    }

    removeItem(itemId: string, count: number = 1): boolean {
        const idx = this.inventory.findIndex(i => i.itemId === itemId)
        if (idx === -1) return false
        if (this.inventory[idx].count <= count) this.inventory.splice(idx, 1)
        else this.inventory[idx].count -= count
        return true
    }

    hasItem(itemId: string, count: number = 1): boolean {
        const slot = this.inventory.find(i => i.itemId === itemId)
        return slot ? slot.count >= count : false
    }

    // ============ EQUIPMENT ============
    equip(itemId: string, slot: string): string | null {
        const item = RPG_ITEMS[itemId]
        if (!item) return null
        const oldItemId = this.equipment[slot] || null
        this.equipment[slot] = itemId
        return oldItemId
    }

    unequip(slot: string): string | null {
        const oldItemId = this.equipment[slot] || null
        delete this.equipment[slot]
        return oldItemId
    }

    // ============ QUESTS ============
    acceptQuest(questId: string): boolean {
        const quest = RPG_QUESTS.find(q => q.id === questId)
        if (!quest) return false
        if (this.activeQuests.includes(questId) || this.completedQuests.includes(questId)) return false
        if (this.stats.level < quest.level) return false
        this.activeQuests.push(questId)
        this.questProgress[questId] = 0
        return true
    }

    checkQuestProgress(monsterType: string): void {
        for (const questId of this.activeQuests) {
            const quest = RPG_QUESTS.find(q => q.id === questId)
            if (quest && quest.target === monsterType) {
                this.questProgress[questId] = (this.questProgress[questId] || 0) + 1
                if (this.questProgress[questId] >= quest.count) {
                    this.completeQuest(questId)
                }
            }
        }
    }

    private completeQuest(questId: string): void {
        const quest = RPG_QUESTS.find(q => q.id === questId)
        if (!quest) return
        this.gainXp(quest.rewardXp)
        this.stats.gold += quest.rewardGold
        this.completedQuests.push(questId)
        this.activeQuests = this.activeQuests.filter(id => id !== questId)
    }

    // ============ SAVE/LOAD ============
    save(): void {
        try {
            localStorage.setItem('wa_rpg_save', JSON.stringify({
                stats: this.stats,
                inventory: this.inventory,
                equipment: this.equipment,
                activeQuests: this.activeQuests,
                completedQuests: this.completedQuests,
                questProgress: this.questProgress
            }))
        } catch (e) {}
    }

    load(): void {
        try {
            const raw = localStorage.getItem('wa_rpg_save')
            if (raw) {
                const data = JSON.parse(raw)
                this.stats = data.stats || this.getDefaultStats()
                this.inventory = data.inventory || []
                this.equipment = data.equipment || {}
                this.activeQuests = data.activeQuests || []
                this.completedQuests = data.completedQuests || []
                this.questProgress = data.questProgress || {}
            }
        } catch (e) {}
    }
}

// ============ GLOBAL INSTANCE ============
let rpgManager: RPGManager | null = null

export function getRPGManager(): RPGManager {
    if (!rpgManager) {
        rpgManager = new RPGManager()
    }
    return rpgManager
}
