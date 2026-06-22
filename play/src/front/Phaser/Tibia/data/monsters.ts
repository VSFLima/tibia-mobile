import type { MonsterData } from './types'

export const MONSTERS: Record<string, MonsterData> = {
    // === LEVEL 1-10 ===
    'rat': {
        id: 'rat', name: 'Rat', health: 20, maxHealth: 20,
        attack: 3, defense: 1, speed: 3, experience: 5,
        loot: [
            { itemId: 'gold_coin', chance: 0.5, min: 1, max: 3 },
            { itemId: 'cheese', chance: 0.1 }
        ],
        behavior: 'passive', maxRange: 4, runHealth: 5
    },
    'bug': {
        id: 'bug', name: 'Bug', health: 30, maxHealth: 30,
        attack: 5, defense: 2, speed: 2, experience: 8,
        loot: [
            { itemId: 'gold_coin', chance: 0.6, min: 1, max: 5 },
            { itemId: 'plate_armor', chance: 0.01 }
        ],
        behavior: 'passive', maxRange: 4
    },
    'snake': {
        id: 'snake', name: 'Snake', health: 25, maxHealth: 25,
        attack: 4, defense: 1, speed: 5, experience: 6,
        loot: [
            { itemId: 'gold_coin', chance: 0.4, min: 1, max: 2 }
        ],
        behavior: 'aggressive', maxRange: 3
    },
    'spider': {
        id: 'spider', name: 'Spider', health: 40, maxHealth: 40,
        attack: 6, defense: 2, speed: 4, experience: 12,
        loot: [
            { itemId: 'gold_coin', chance: 0.5, min: 1, max: 5 },
            { itemId: 'spider_silk', chance: 0.1 }
        ],
        behavior: 'aggressive', maxRange: 5
    },
    'troll': {
        id: 'troll', name: 'Troll', health: 65, maxHealth: 65,
        attack: 8, defense: 4, speed: 2, experience: 20,
        loot: [
            { itemId: 'gold_coin', chance: 0.7, min: 2, max: 10 },
            { itemId: 'wooden_sword', chance: 0.05 },
            { itemId: 'leather_armor', chance: 0.03 }
        ],
        behavior: 'aggressive', maxRange: 5
    },
    'goblin': {
        id: 'goblin', name: 'Goblin', health: 50, maxHealth: 50,
        attack: 7, defense: 3, speed: 4, experience: 15,
        loot: [
            { itemId: 'gold_coin', chance: 0.6, min: 3, max: 15 },
            { itemId: 'iron_sword', chance: 0.02 }
        ],
        behavior: 'aggressive', maxRange: 5
    },

    // === LEVEL 10-30 ===
    'orc': {
        id: 'orc', name: 'Orc', health: 115, maxHealth: 115,
        attack: 15, defense: 8, speed: 3, experience: 40,
        loot: [
            { itemId: 'gold_coin', chance: 0.8, min: 5, max: 25 },
            { itemId: 'chain_armor', chance: 0.02 },
            { itemId: 'iron_helmet', chance: 0.02 },
            { itemId: 'health_potion', chance: 0.1 }
        ],
        behavior: 'aggressive', maxRange: 6
    },
    'orc_warrior': {
        id: 'orc_warrior', name: 'Orc Warrior', health: 180, maxHealth: 180,
        attack: 22, defense: 12, speed: 3, experience: 70,
        loot: [
            { itemId: 'gold_coin', chance: 0.9, min: 10, max: 40 },
            { itemId: 'iron_sword', chance: 0.05 },
            { itemId: 'plate_armor', chance: 0.02 },
            { itemId: 'health_potion', chance: 0.15 }
        ],
        behavior: 'aggressive', maxRange: 6
    },
    'wolf': {
        id: 'wolf', name: 'Wolf', health: 90, maxHealth: 90,
        attack: 18, defense: 6, speed: 7, experience: 50,
        loot: [
            { itemId: 'gold_coin', chance: 0.5, min: 5, max: 20 },
            { itemId: 'wolf_paw', chance: 0.1 }
        ],
        behavior: 'aggressive', maxRange: 8, runHealth: 30
    },
    'skeleton': {
        id: 'skeleton', name: 'Skeleton', health: 80, maxHealth: 80,
        attack: 12, defense: 5, speed: 3, experience: 35,
        loot: [
            { itemId: 'gold_coin', chance: 0.6, min: 3, max: 15 },
            { itemId: 'bone_sword', chance: 0.03 },
            { itemId: 'ancient_scroll', chance: 0.05 }
        ],
        behavior: 'aggressive', maxRange: 5
    },
    'zombie': {
        id: 'zombie', name: 'Zombie', health: 100, maxHealth: 100,
        attack: 10, defense: 4, speed: 1, experience: 30,
        loot: [
            { itemId: 'gold_coin', chance: 0.5, min: 2, max: 10 }
        ],
        behavior: 'aggressive', maxRange: 4
    },

    // === LEVEL 30-50 ===
    'minotaur': {
        id: 'minotaur', name: 'Minotaur', health: 200, maxHealth: 200,
        attack: 28, defense: 15, speed: 4, experience: 100,
        loot: [
            { itemId: 'gold_coin', chance: 0.9, min: 15, max: 50 },
            { itemId: 'plate_armor', chance: 0.03 },
            { itemId: 'iron_helmet', chance: 0.04 },
            { itemId: 'strong_health_potion', chance: 0.1 }
        ],
        behavior: 'aggressive', maxRange: 6
    },
    'minotaur_guard': {
        id: 'minotaur_guard', name: 'Minotaur Guard', health: 300, maxHealth: 300,
        attack: 35, defense: 22, speed: 3, experience: 150,
        loot: [
            { itemId: 'gold_coin', chance: 0.95, min: 25, max: 80 },
            { itemId: 'plate_armor', chance: 0.05 },
            { itemId: 'tower_shield', chance: 0.02 },
            { itemId: 'strong_health_potion', chance: 0.15 }
        ],
        behavior: 'aggressive', maxRange: 5
    },
    'dark_knight': {
        id: 'dark_knight', name: 'Dark Knight', health: 250, maxHealth: 250,
        attack: 32, defense: 18, speed: 5, experience: 120,
        loot: [
            { itemId: 'gold_coin', chance: 0.9, min: 20, max: 60 },
            { itemId: 'magic_sword', chance: 0.02 },
            { itemId: 'magic_hat', chance: 0.02 },
            { itemId: 'strong_health_potion', chance: 0.12 }
        ],
        behavior: 'aggressive', maxRange: 7
    },

    // === LEVEL 50-80 ===
    'dragon': {
        id: 'dragon', name: 'Dragon', health: 500, maxHealth: 500,
        attack: 45, defense: 25, speed: 5, experience: 350,
        elements: { physical: 0.8, fire: 0, ice: 1.2, energy: 0.9, earth: 1.1 },
        loot: [
            { itemId: 'gold_coin', chance: 1, min: 50, max: 150 },
            { itemId: 'dragon_scale', chance: 0.3, min: 1, max: 3 },
            { itemId: 'magic_sword', chance: 0.03 },
            { itemId: 'magic_robe', chance: 0.03 },
            { itemId: 'great_health_potion', chance: 0.2 }
        ],
        behavior: 'aggressive', maxRange: 8, runHealth: 150,
        voices: ['ROOOAAARR!', 'Hssss...']
    },
    'dragon_lord': {
        id: 'dragon_lord', name: 'Dragon Lord', health: 1000, maxHealth: 1000,
        attack: 65, defense: 35, speed: 6, experience: 700,
        elements: { physical: 0.7, fire: 0, ice: 1.3, energy: 0.8, earth: 1.2 },
        loot: [
            { itemId: 'gold_coin', chance: 1, min: 100, max: 300 },
            { itemId: 'dragon_scale', chance: 0.5, min: 2, max: 5 },
            { itemId: 'fire_sword', chance: 0.01 },
            { itemId: 'crystal_sword', chance: 0.02 },
            { itemId: 'great_health_potion', chance: 0.3 },
            { itemId: 'great_mana_potion', chance: 0.2 }
        ],
        behavior: 'aggressive', maxRange: 10, runHealth: 300,
        voices: ['FEEL THE BURN!', 'PREPARE TO DIE!']
    },
    'hydra': {
        id: 'hydra', name: 'Hydra', health: 750, maxHealth: 750,
        attack: 55, defense: 30, speed: 4, experience: 500,
        elements: { physical: 0.9, fire: 0.8, ice: 0.8, energy: 0.8, earth: 1.3, holy: 0.7, death: 1.2 },
        loot: [
            { itemId: 'gold_coin', chance: 1, min: 80, max: 200 },
            { itemId: 'magic_crystal', chance: 0.2, min: 1, max: 2 },
            { itemId: 'crystal_sword', chance: 0.03 },
            { itemId: 'magic_robe', chance: 0.04 },
            { itemId: 'great_health_potion', chance: 0.25 }
        ],
        behavior: 'aggressive', maxRange: 7, runHealth: 200,
        voices: ['Hisssss!', 'Grrrrr...']
    },

    // === BOSS MONSTERS ===
    'demon': {
        id: 'demon', name: 'Demon', health: 2000, maxHealth: 2000,
        attack: 80, defense: 50, speed: 8, experience: 1500,
        elements: { physical: 0.6, fire: 0, ice: 1.1, energy: 0.5, earth: 1.2, holy: 0.3, death: 1.5 },
        immunities: { paralyze: true, invisible: false },
        loot: [
            { itemId: 'gold_coin', chance: 1, min: 200, max: 500 },
            { itemId: 'fire_sword', chance: 0.02 },
            { itemId: 'crystal_sword', chance: 0.03 },
            { itemId: 'dragon_scale_armor', chance: 0.01 },
            { itemId: 'great_health_potion', chance: 0.4 },
            { itemId: 'great_mana_potion', chance: 0.3 }
        ],
        behavior: 'aggressive', maxRange: 10, runHealth: 500,
        voices: ['DIE MORTAL!', 'YOU WILL SUFFER!']
    },
    'archdemon': {
        id: 'archdemon', name: 'Archdemon', health: 5000, maxHealth: 5000,
        attack: 120, defense: 70, speed: 10, experience: 5000,
        elements: { physical: 0.4, fire: 0, ice: 1.2, energy: 0.3, earth: 1.3, holy: 0.1, death: 2.0 },
        immunities: { paralyze: true, invisible: true, death: true },
        loot: [
            { itemId: 'gold_coin', chance: 1, min: 500, max: 1000 },
            { itemId: 'fire_sword', chance: 0.05 },
            { itemId: 'crystal_sword', chance: 0.08 },
            { itemId: 'dragon_scale_armor', chance: 0.03 },
            { itemId: 'amulet_of_loss', chance: 0.01 }
        ],
        behavior: 'aggressive', maxRange: 12, runHealth: 1000,
        voices: ['TREMBLE BEFORE ME!', 'YOUR SOUL IS MINE!']
    }
}

export function getMonsterById(id: string): MonsterData | undefined {
    return MONSTERS[id]
}

export function getMonstersByLevel(minLevel: number, maxLevel: number): MonsterData[] {
    const levelToMonster: Record<number, string[]> = {
        1: ['rat', 'bug'],
        3: ['snake'],
        5: ['spider'],
        8: ['troll', 'goblin'],
        15: ['orc', 'skeleton', 'zombie'],
        25: ['orc_warrior', 'wolf'],
        35: ['minotaur'],
        40: ['minotaur_guard', 'dark_knight'],
        55: ['dragon'],
        65: ['dragon_lord'],
        70: ['hydra'],
        80: ['demon'],
        100: ['archdemon']
    }
    const result: MonsterData[] = []
    for (const [level, ids] of Object.entries(levelToMonster)) {
        const lvl = parseInt(level)
        if (lvl >= minLevel && lvl <= maxLevel) {
            for (const id of ids) {
                if (MONSTERS[id]) result.push(MONSTERS[id])
            }
        }
    }
    return result
}
