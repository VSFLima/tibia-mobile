export type Direction = 'up' | 'down' | 'left' | 'right'

export type EquipmentSlot = 'helmet' | 'armor' | 'legs' | 'boots' | 'weapon' | 'shield' | 'ring' | 'amulet'

export type ItemCategory = 'weapon' | 'armor' | 'helmet' | 'legs' | 'boots' | 'shield' | 'ring' | 'amulet' | 'consumable' | 'quest' | 'money' | 'other'

export type SpellElement = 'physical' | 'fire' | 'ice' | 'energy' | 'earth' | 'holy' | 'death'

export interface ItemData {
    id: string
    name: string
    description: string
    category: ItemCategory
    weight: number
    stackable: boolean
    usable: boolean
    attack?: number
    defense?: number
    speed?: number
    magicLevel?: number
    hp?: number
    mp?: number
    elementalAttack?: Partial<Record<SpellElement, number>>
    elementalDefense?: Partial<Record<SpellElement, number>>
    buyPrice?: number
    sellPrice?: number
    requiredLevel?: number
    requiredMagicLevel?: number
    sprite?: string
}

export interface MonsterData {
    id: string
    name: string
    health: number
    maxHealth: number
    attack: number
    defense: number
    magicAttack?: number
    speed: number
    experience: number
    loot: { itemId: string; chance: number; min?: number; max?: number }[]
    elements?: { physical?: number; fire?: number; energy?: number; ice?: number; earth?: number; holy?: number; death?: number }
    immunities?: { paralyze?: boolean; invisible?: boolean; death?: boolean }
    flags?: { canBeSeen?: boolean; canPushItems?: boolean; canPushCreatures?: boolean }
    sprite?: string
    behavior: 'passive' | 'aggressive' | 'defensive'
    maxRange?: number
    runHealth?: number
    voices?: string[]
}

export interface NpcData {
    id: string
    name: string
    dialog: string[]
    trade?: { buy: { itemId: string; price: number }[]; sell: { itemId: string; price: number }[] }
    questGiver?: boolean
    sprite?: string
}

export interface QuestData {
    id: string
    name: string
    description: string
    level: number
    objectives: { type: 'kill' | 'collect' | 'talk' | 'explore'; target: string; count: number; description: string }[]
    rewards: { xp: number; gold: number; items?: { itemId: string; count: number }[] }
    giverNpc?: string
    giverMap?: string
    prerequisites?: string[]
}

export interface SaveData {
    player: {
        x: number; y: number; level: number; xp: number; xpToLevel: number
        gold: number; hp: number; maxHp: number; mp: number; maxMp: number
        baseAttack: number; baseDefense: number; baseSpeed: number; magicLevel: number
        direction: Direction; skills: Record<string, number>
    }
    inventory: { itemId: string; count: number }[]
    equipment: Partial<Record<EquipmentSlot, string>>
    quests: { active: string[]; completed: string[]; progress: Record<string, number[]> }
    currentMap: string
    spells?: { knownSpells: string[]; spellSlots: (string | null)[] }
    trade?: { reputation: Record<string, number>; priceModifier: number }
    deathPenalty?: { deathHistory: any[]; consecutiveDeaths: number }
}
