import type { NpcData } from './types'

export const NPCS: Record<string, NpcData> = {
    'rashid': {
        id: 'rashid',
        name: 'Rashid',
        dialog: [
            'Bem-vindo ao meu stand! Tenho as melhores armas de Thais.',
            'Procura algo especial? Tenho espadas, armaduras e muito mais.',
            'Volte sempre!'
        ],
        trade: {
            buy: [
                { itemId: 'wooden_sword', price: 150 },
                { itemId: 'iron_sword', price: 800 },
                { itemId: 'bone_sword', price: 2500 },
                { itemId: 'magic_sword', price: 5000 },
                { itemId: 'crystal_sword', price: 12000 },
                { itemId: 'fire_sword', price: 25000 },
                { itemId: 'leather_armor', price: 400 },
                { itemId: 'chain_armor', price: 1500 },
                { itemId: 'plate_armor', price: 4000 },
                { itemId: 'magic_robe', price: 6000 },
                { itemId: 'dragon_scale_armor', price: 50000 }
            ],
            sell: [
                { itemId: 'wooden_sword', price: 50 },
                { itemId: 'iron_sword', price: 400 },
                { itemId: 'bone_sword', price: 1200 },
                { itemId: 'magic_sword', price: 2500 },
                { itemId: 'crystal_sword', price: 6000 },
                { itemId: 'fire_sword', price: 12000 },
                { itemId: 'leather_armor', price: 200 },
                { itemId: 'chain_armor', price: 750 },
                { itemId: 'plate_armor', price: 2000 },
                { itemId: 'magic_robe', price: 3000 },
                { itemId: 'dragon_scale_armor', price: 25000 },
                { itemId: 'dragon_scale', price: 500 },
                { itemId: 'magic_crystal', price: 800 }
            ]
        },
        sprite: 'npc_rashid'
    },
    'daniela': {
        id: 'daniela',
        name: 'Daniela',
        dialog: [
            'Olá aventureiro! Precisa de poções?',
            'Temos poções de vida, mana e antidotos.',
            'Cuide-se e volte quando precisar!'
        ],
        trade: {
            buy: [
                { itemId: 'health_potion', price: 50 },
                { itemId: 'mana_potion', price: 50 },
                { itemId: 'strong_health_potion', price: 150 },
                { itemId: 'strong_mana_potion', price: 150 },
                { itemId: 'great_health_potion', price: 350 },
                { itemId: 'great_mana_potion', price: 350 },
                { itemId: 'antidote', price: 20 }
            ],
            sell: [
                { itemId: 'health_potion', price: 15 },
                { itemId: 'mana_potion', price: 15 },
                { itemId: 'strong_health_potion', price: 50 },
                { itemId: 'strong_mana_potion', price: 50 },
                { itemId: 'great_health_potion', price: 120 },
                { itemId: 'great_mana_potion', price: 120 },
                { itemId: 'antidote', price: 5 }
            ]
        },
        sprite: 'npc_daniela'
    },
    '_xod': {
        id: '_xod',
        name: 'Xod',
        dialog: [
            'Xod gosta de runas! Xod vende runas!',
            'Runas fortes para matar monstros!',
            'Xod sempre tem estoque!'
        ],
        trade: {
            buy: [
                { itemId: 'light_magic_missile_rune', price: 20 },
                { itemId: 'fireball_rune', price: 80 },
                { itemId: 'sudden_death_rune', price: 200 }
            ],
            sell: [
                { itemId: 'light_magic_missile_rune', price: 5 },
                { itemId: 'fireball_rune', price: 25 },
                { itemId: 'sudden_death_rune', price: 60 },
                { itemId: 'ancient_scroll', price: 200 },
                { itemId: 'spider_silk', price: 50 }
            ]
        },
        sprite: 'npc_xod'
    },
    'hardek': {
        id: 'hardek',
        name: 'Hardek',
        dialog: [
            'Hardek é o melhor ferreiro de Thais!',
            'Precisa de capacetes, escudos ou botas?',
            'Hardek faz tudo com as próprias mãos!'
        ],
        trade: {
            buy: [
                { itemId: 'iron_helmet', price: 900 },
                { itemId: 'magic_hat', price: 3000 },
                { itemId: 'crown', price: 10000 },
                { itemId: 'tower_shield', price: 8000 },
                { itemId: 'magic_shield', price: 5000 },
                { itemId: 'boots_of_haste', price: 8000 },
                { itemId: 'soft_boots', price: 2000 },
                { itemId: 'plate_legs', price: 1200 },
                { itemId: 'magic_legs', price: 4000 }
            ],
            sell: [
                { itemId: 'iron_helmet', price: 450 },
                { itemId: 'magic_hat', price: 1500 },
                { itemId: 'crown', price: 5000 },
                { itemId: 'tower_shield', price: 4000 },
                { itemId: 'magic_shield', price: 2500 },
                { itemId: 'boots_of_haste', price: 4000 },
                { itemId: 'soft_boots', price: 1000 },
                { itemId: 'plate_legs', price: 600 },
                { itemId: 'magic_legs', price: 2000 }
            ]
        },
        sprite: 'npc_hardek'
    },
    'thal': {
        id: 'thal',
        name: 'Thal',
        dialog: [
            'Thal é um caçatore experiente.',
            'Precisa de amuletos ou anéis?',
            'Thal tem coisas raras de suas viagens.'
        ],
        trade: {
            buy: [
                { itemId: 'ring_of_healing', price: 3000 },
                { itemId: 'ring_of_power', price: 5000 },
                { itemId: 'amulet_of_loss', price: 15000 },
                { itemId: 'steel_amulet', price: 2000 }
            ],
            sell: [
                { itemId: 'ring_of_healing', price: 1500 },
                { itemId: 'ring_of_power', price: 2500 },
                { itemId: 'amulet_of_loss', price: 7500 },
                { itemId: 'steel_amulet', price: 1000 },
                { itemId: 'wolf_paw', price: 100 },
                { itemId: 'spider_silk', price: 50 }
            ]
        },
        questGiver: true,
        sprite: 'npc_thal'
    },
    'captain_gnostus': {
        id: 'captain_gnostus',
        name: 'Captain Gnostus',
        dialog: [
            'Sou o Capitão Gnostus. Tenho missões perigosas.',
            'Se você é forte o suficiente, posso confiar em você.',
            'Complete minhas tarefas e serás recompensado.'
        ],
        questGiver: true,
        sprite: 'npc_gnostus'
    }
}

export function getNpcById(id: string): NpcData | undefined {
    return NPCS[id]
}

export function getNpcsByMap(mapId: string): NpcData[] {
    const mapNpcs: Record<string, string[]> = {
        'thais': ['rashid', 'daniela', '_xod', 'hardek', 'thal', 'captain_gnostus']
    }
    const npcIds = mapNpcs[mapId] ?? []
    return npcIds.map(id => NPCS[id]).filter(Boolean)
}
