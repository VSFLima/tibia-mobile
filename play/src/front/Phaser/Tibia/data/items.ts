import type { ItemData } from './types'

export const ITEMS: Record<string, ItemData> = {
    // === WEAPONS ===
    'magic_sword': {
        id: 'magic_sword', name: 'Magic Sword', description: 'Uma espada encantada com poder mágico.',
        category: 'weapon', weight: 22, stackable: false, usable: false,
        attack: 28, defense: 10, speed: 2, magicLevel: 1,
        buyPrice: 5000, sellPrice: 2500, requiredLevel: 30, sprite: 'item_magic_sword'
    },
    'crystal_sword': {
        id: 'crystal_sword', name: 'Crystal Sword', description: 'Uma espada feita de cristal puro.',
        category: 'weapon', weight: 25, stackable: false, usable: false,
        attack: 35, defense: 12, speed: 1, magicLevel: 2,
        buyPrice: 12000, sellPrice: 6000, requiredLevel: 50, sprite: 'item_crystal_sword'
    },
    'bone_sword': {
        id: 'bone_sword', name: 'Bone Sword', description: 'Uma espada feita de osso de dragão.',
        category: 'weapon', weight: 18, stackable: false, usable: false,
        attack: 22, defense: 8, speed: 3,
        buyPrice: 2500, sellPrice: 1200, requiredLevel: 20, sprite: 'item_bone_sword'
    },
    'iron_sword': {
        id: 'iron_sword', name: 'Iron Sword', description: 'Uma espada básica de ferro.',
        category: 'weapon', weight: 20, stackable: false, usable: false,
        attack: 15, defense: 6, speed: 2,
        buyPrice: 800, sellPrice: 400, requiredLevel: 10, sprite: 'item_iron_sword'
    },
    'wooden_sword': {
        id: 'wooden_sword', name: 'Wooden Sword', description: 'Uma espada simples de madeira.',
        category: 'weapon', weight: 15, stackable: false, usable: false,
        attack: 8, defense: 3, speed: 3,
        buyPrice: 150, sellPrice: 50, sprite: 'item_wooden_sword'
    },
    'fire_sword': {
        id: 'fire_sword', name: 'Fire Sword', description: 'Uma espada que arde em chamas eternas.',
        category: 'weapon', weight: 24, stackable: false, usable: false,
        attack: 42, defense: 14, speed: 2, magicLevel: 3,
        buyPrice: 25000, sellPrice: 12000, requiredLevel: 70, sprite: 'item_fire_sword'
    },

    // === ARMOR ===
    'magic_robe': {
        id: 'magic_robe', name: 'Magic Robe', description: 'Uma túnica que amplifica o poder mágico.',
        category: 'armor', weight: 12, stackable: false, usable: false,
        defense: 8, magicLevel: 4,
        buyPrice: 6000, sellPrice: 3000, requiredLevel: 25, sprite: 'item_magic_robe'
    },
    'plate_armor': {
        id: 'plate_armor', name: 'Plate Armor', description: 'Armadura pesada de placas de aço.',
        category: 'armor', weight: 35, stackable: false, usable: false,
        defense: 15, speed: -2,
        buyPrice: 4000, sellPrice: 2000, requiredLevel: 30, sprite: 'item_plate_armor'
    },
    'chain_armor': {
        id: 'chain_armor', name: 'Chain Armor', description: 'Armadura de malha de ferro.',
        category: 'armor', weight: 25, stackable: false, usable: false,
        defense: 10, speed: -1,
        buyPrice: 1500, sellPrice: 750, requiredLevel: 15, sprite: 'item_chain_armor'
    },
    'leather_armor': {
        id: 'leather_armor', name: 'Leather Armor', description: 'Armadura leve de couro.',
        category: 'armor', weight: 15, stackable: false, usable: false,
        defense: 5,
        buyPrice: 400, sellPrice: 200, requiredLevel: 5, sprite: 'item_leather_armor'
    },
    'dragon_scale_armor': {
        id: 'dragon_scale_armor', name: 'Dragon Scale Armor', description: 'Armadura feita de escamas de dragão.',
        category: 'armor', weight: 40, stackable: false, usable: false,
        defense: 22, speed: -3, magicLevel: 2,
        buyPrice: 50000, sellPrice: 25000, requiredLevel: 80, sprite: 'item_dragon_scale_armor'
    },

    // === HELMETS ===
    'magic_hat': {
        id: 'magic_hat', name: 'Magic Hat', description: 'Um chapéu que aumenta o poder mágico.',
        category: 'helmet', weight: 5, stackable: false, usable: false,
        defense: 3, magicLevel: 3,
        buyPrice: 3000, sellPrice: 1500, requiredLevel: 20, sprite: 'item_magic_hat'
    },
    'iron_helmet': {
        id: 'iron_helmet', name: 'Iron Helmet', description: 'Um capacete de ferro resistente.',
        category: 'helmet', weight: 12, stackable: false, usable: false,
        defense: 7,
        buyPrice: 900, sellPrice: 450, requiredLevel: 10, sprite: 'item_iron_helmet'
    },
    'crown': {
        id: 'crown', name: 'Crown', description: 'Uma coroa real de ouro.',
        category: 'helmet', weight: 8, stackable: false, usable: false,
        defense: 5, magicLevel: 2,
        buyPrice: 10000, sellPrice: 5000, requiredLevel: 40, sprite: 'item_crown'
    },

    // === LEGS ===
    'magic_legs': {
        id: 'magic_legs', name: 'Magic Legs', description: 'Perneiras encantadas que aumentam a velocidade.',
        category: 'legs', weight: 6, stackable: false, usable: false,
        defense: 4, speed: 3, magicLevel: 2,
        buyPrice: 4000, sellPrice: 2000, requiredLevel: 25, sprite: 'item_magic_legs'
    },
    'plate_legs': {
        id: 'plate_legs', name: 'Plate Legs', description: 'Perneiras de placas de aço.',
        category: 'legs', weight: 15, stackable: false, usable: false,
        defense: 8,
        buyPrice: 1200, sellPrice: 600, requiredLevel: 20, sprite: 'item_plate_legs'
    },

    // === BOOTS ===
    'boots_of_haste': {
        id: 'boots_of_haste', name: 'Boots of Haste', description: 'Botas que aumentam significativamente a velocidade.',
        category: 'boots', weight: 7, stackable: false, usable: false,
        defense: 2, speed: 8,
        buyPrice: 8000, sellPrice: 4000, requiredLevel: 30, sprite: 'item_boots_of_haste'
    },
    'soft_boots': {
        id: 'soft_boots', name: 'Soft Boots', description: 'Botas macias e confortáveis.',
        category: 'boots', weight: 5, stackable: false, usable: false,
        defense: 1, speed: 2, magicLevel: 1,
        buyPrice: 2000, sellPrice: 1000, requiredLevel: 10, sprite: 'item_soft_boots'
    },

    // === SHIELDS ===
    'magic_shield': {
        id: 'magic_shield', name: 'Magic Shield', description: 'Um escudo que absorve energia mágica.',
        category: 'shield', weight: 14, stackable: false, usable: false,
        defense: 12, magicLevel: 2,
        buyPrice: 5000, sellPrice: 2500, requiredLevel: 25, sprite: 'item_magic_shield'
    },
    'tower_shield': {
        id: 'tower_shield', name: 'Tower Shield', description: 'Um enorme escudo de torre.',
        category: 'shield', weight: 20, stackable: false, usable: false,
        defense: 18, speed: -2,
        buyPrice: 8000, sellPrice: 4000, requiredLevel: 40, sprite: 'item_tower_shield'
    },

    // === RINGS ===
    'ring_of_healing': {
        id: 'ring_of_healing', name: 'Ring of Healing', description: 'Um anel que regenera vida lentamente.',
        category: 'ring', weight: 0.5, stackable: false, usable: true,
        hp: 50, buyPrice: 3000, sellPrice: 1500, requiredLevel: 15, sprite: 'item_ring_of_healing'
    },
    'ring_of_power': {
        id: 'ring_of_power', name: 'Ring of Power', description: 'Um anel que aumenta o ataque e defesa.',
        category: 'ring', weight: 0.5, stackable: false, usable: true,
        attack: 5, defense: 5, buyPrice: 5000, sellPrice: 2500, requiredLevel: 30, sprite: 'item_ring_of_power'
    },

    // === AMULETS ===
    'amulet_of_loss': {
        id: 'amulet_of_loss', name: 'Amulet of Loss', description: 'Um amuleto que protege contra a perda de itens ao morrer.',
        category: 'amulet', weight: 1, stackable: false, usable: true,
        defense: 3, buyPrice: 15000, sellPrice: 7500, requiredLevel: 50, sprite: 'item_amulet_of_loss'
    },
    'steel_amulet': {
        id: 'steel_amulet', name: 'Steel Amulet', description: 'Um amuleto de aço que protege contra诅咒.',
        category: 'amulet', weight: 2, stackable: false, usable: true,
        defense: 2, hp: 30, buyPrice: 2000, sellPrice: 1000, requiredLevel: 10, sprite: 'item_steel_amulet'
    },

    // === CONSUMABLES ===
    'health_potion': {
        id: 'health_potion', name: 'Health Potion', description: 'Uma poção que restaura 50-100 HP.',
        category: 'consumable', weight: 1.5, stackable: true, usable: true,
        hp: 75, buyPrice: 50, sellPrice: 15, sprite: 'item_health_potion'
    },
    'mana_potion': {
        id: 'mana_potion', name: 'Mana Potion', description: 'Uma poção que restaura 50-100 MP.',
        category: 'consumable', weight: 1.5, stackable: true, usable: true,
        mp: 75, buyPrice: 50, sellPrice: 15, sprite: 'item_mana_potion'
    },
    'strong_health_potion': {
        id: 'strong_health_potion', name: 'Strong Health Potion', description: 'Uma poção forte que restaura 100-200 HP.',
        category: 'consumable', weight: 2, stackable: true, usable: true,
        hp: 150, buyPrice: 150, sellPrice: 50, requiredLevel: 20, sprite: 'item_strong_health_potion'
    },
    'strong_mana_potion': {
        id: 'strong_mana_potion', name: 'Strong Mana Potion', description: 'Uma poção forte que restaura 100-200 MP.',
        category: 'consumable', weight: 2, stackable: true, usable: true,
        mp: 150, buyPrice: 150, sellPrice: 50, requiredLevel: 20, sprite: 'item_strong_mana_potion'
    },
    'great_health_potion': {
        id: 'great_health_potion', name: 'Great Health Potion', description: 'Uma poção excelente que restaura 200-400 HP.',
        category: 'consumable', weight: 2.5, stackable: true, usable: true,
        hp: 300, buyPrice: 350, sellPrice: 120, requiredLevel: 40, sprite: 'item_great_health_potion'
    },
    'great_mana_potion': {
        id: 'great_mana_potion', name: 'Great Mana Potion', description: 'Uma poção excelente que restaura 200-400 MP.',
        category: 'consumable', weight: 2.5, stackable: true, usable: true,
        mp: 300, buyPrice: 350, sellPrice: 120, requiredLevel: 40, sprite: 'item_great_mana_potion'
    },
    'antidote': {
        id: 'antidote', name: 'Antidote', description: 'Cura o veneno.',
        category: 'consumable', weight: 0.5, stackable: true, usable: true,
        buyPrice: 20, sellPrice: 5, sprite: 'item_antidote'
    },

    // === MONEY ===
    'gold_coin': {
        id: 'gold_coin', name: 'Gold Coin', description: 'Uma moeda de ouro.',
        category: 'money', weight: 0.1, stackable: true, usable: false,
        buyPrice: 1, sellPrice: 1, sprite: 'item_gold_coin'
    },
    'platinum_coin': {
        id: 'platinum_coin', name: 'Platinum Coin', description: 'Uma moeda de platina. Vale 100 moedas de ouro.',
        category: 'money', weight: 0.1, stackable: true, usable: false,
        buyPrice: 100, sellPrice: 100, sprite: 'item_platinum_coin'
    },

    // === QUEST ITEMS ===
    'dragon_scale': {
        id: 'dragon_scale', name: 'Dragon Scale', description: 'Uma escama de dragão brilhante.',
        category: 'quest', weight: 3, stackable: true, usable: false,
        sellPrice: 500, sprite: 'item_dragon_scale'
    },
    'magic_crystal': {
        id: 'magic_crystal', name: 'Magic Crystal', description: 'Um cristal pulsante de energia mágica.',
        category: 'quest', weight: 2, stackable: true, usable: false,
        sellPrice: 800, sprite: 'item_magic_crystal'
    },
    'ancient_scroll': {
        id: 'ancient_scroll', name: 'Ancient Scroll', description: 'Um pergaminho antigo com inscrições misteriosas.',
        category: 'quest', weight: 0.5, stackable: true, usable: false,
        sellPrice: 200, sprite: 'item_ancient_scroll'
    },

    // === RUNES ===
    'sudden_death_rune': {
        id: 'sudden_death_rune', name: 'Sudden Death Rune', description: 'Uma runa de morte súbita. Causa 100-200 de dano.',
        category: 'consumable', weight: 0.2, stackable: true, usable: true,
        buyPrice: 200, sellPrice: 60, requiredLevel: 30, sprite: 'item_sudden_death_rune'
    },
    'fireball_rune': {
        id: 'fireball_rune', name: 'Fireball Rune', description: 'Uma runa de bola de fogo. Causa 30-50 de dano.',
        category: 'consumable', weight: 0.2, stackable: true, usable: true,
        buyPrice: 80, sellPrice: 25, requiredLevel: 15, sprite: 'item_fireball_rune'
    },
    'light_magic_missile_rune': {
        id: 'light_magic_missile_rune', name: 'Light Magic Missile Rune', description: 'Uma runa de míssil mágico leve. Causa 10-20 de dano.',
        category: 'consumable', weight: 0.2, stackable: true, usable: true,
        buyPrice: 20, sellPrice: 5, sprite: 'item_light_magic_missile_rune'
    }
}
