import type { QuestData } from './types'

export const QUESTS: Record<string, QuestData> = {
    'q1_rat_hunter': {
        id: 'q1_rat_hunter',
        name: 'Rat Hunter',
        description: 'Thal, o caçatore pede para eliminar as rats que infestam a cidade.',
        level: 1,
        objectives: [
            { type: 'kill', target: 'rat', count: 10, description: 'Mate 10 Rats' }
        ],
        rewards: { xp: 100, gold: 50, items: [{ itemId: 'leather_armor', count: 1 }] },
        giverNpc: 'Thal',
        giverMap: 'thais'
    },
    'q2_spider_nest': {
        id: 'q2_spider_nest',
        name: 'Spider Nest',
        description: 'Uma colônia de aranhas ameaça os viajantes na floresta.',
        level: 5,
        objectives: [
            { type: 'kill', target: 'spider', count: 15, description: 'Mate 15 Spiders' },
            { type: 'collect', target: 'spider_silk', count: 5, description: 'Colete 5 Spider Silks' }
        ],
        rewards: { xp: 300, gold: 150, items: [{ itemId: 'iron_sword', count: 1 }] },
        giverNpc: 'Ariana',
        giverMap: 'thais'
    },
    'q3_orc_patrol': {
        id: 'q3_orc_patrol',
        name: 'Orc Patrol',
        description: 'Os orcs estão atacando as caravanas no norte.',
        level: 10,
        objectives: [
            { type: 'kill', target: 'orc', count: 20, description: 'Mate 20 Orcs' },
            { type: 'kill', target: 'orc_warrior', count: 5, description: 'Mate 5 Orc Warriors' }
        ],
        rewards: { xp: 800, gold: 400, items: [{ itemId: 'chain_armor', count: 1 }, { itemId: 'iron_helmet', count: 1 }] },
        giverNpc: 'Captain Gnostus',
        giverMap: 'thais'
    },
    'q4_undead_crypt': {
        id: 'q4_undead_crypt',
        name: 'Undead Crypt',
        description: 'Os mortos-vivos estão despertando na cripta antiga.',
        level: 15,
        objectives: [
            { type: 'kill', target: 'skeleton', count: 25, description: 'Mate 25 Skeletons' },
            { type: 'kill', target: 'zombie', count: 15, description: 'Mate 15 Zombies' },
            { type: 'collect', target: 'ancient_scroll', count: 10, description: 'Colete 10 Ancient Scrolls' }
        ],
        rewards: { xp: 1500, gold: 800, items: [{ itemId: 'magic_hat', count: 1 }, { itemId: 'mana_potion', count: 20 }] },
        giverNpc: 'Father Clement',
        giverMap: 'thais'
    },
    'q5_minotaur_maze': {
        id: 'q5_minotaur_maze',
        name: 'Minotaur Maze',
        description: 'Explore o labirinto dos minotauros e traga provas de sua vitória.',
        level: 30,
        objectives: [
            { type: 'kill', target: 'minotaur', count: 30, description: 'Mate 30 Minotaurs' },
            { type: 'kill', target: 'minotaur_guard', count: 10, description: 'Mate 10 Minotaur Guards' },
            { type: 'collect', target: 'magic_crystal', count: 3, description: 'Colete 3 Magic Crystals' }
        ],
        rewards: { xp: 3000, gold: 1500, items: [{ itemId: 'plate_armor', count: 1 }, { itemId: 'tower_shield', count: 1 }] },
        giverNpc: 'Captain Gnostus',
        giverMap: 'thais'
    },
    'q6_dragon_hunt': {
        id: 'q6_dragon_hunt',
        name: 'Dragon Hunt',
        description: 'Um dragão aterroriza as terras ao sul. Elimine-o!',
        level: 45,
        objectives: [
            { type: 'kill', target: 'dragon', count: 5, description: 'Mate 5 Dragons' },
            { type: 'collect', target: 'dragon_scale', count: 10, description: 'Colete 10 Dragon Scales' }
        ],
        rewards: { xp: 5000, gold: 3000, items: [{ itemId: 'magic_sword', count: 1 }] },
        giverNpc: 'Thal',
        giverMap: 'thais',
        prerequisites: ['q3_orc_patrol']
    },
    'q7_dragon_lord': {
        id: 'q7_dragon_lord',
        name: 'Dragon Lord',
        description: 'O Dragão Ancião precisa ser derrotado. Apenas os mais corajosos devem tentar.',
        level: 65,
        objectives: [
            { type: 'kill', target: 'dragon_lord', count: 3, description: 'Mate 3 Dragon Lords' }
        ],
        rewards: { xp: 10000, gold: 8000, items: [{ itemId: 'fire_sword', count: 1 }, { itemId: 'boots_of_haste', count: 1 }] },
        giverNpc: 'Captain Gnostus',
        giverMap: 'thais',
        prerequisites: ['q6_dragon_hunt']
    },
    'q8_demon_hunt': {
        id: 'q8_demon_hunt',
        name: 'Demon Hunt',
        description: 'Demônios estão invadindo o mundo. Você tem coragem de enfrentá-los?',
        level: 80,
        objectives: [
            { type: 'kill', target: 'demon', count: 5, description: 'Mate 5 Demons' },
            { type: 'kill', target: 'archdemon', count: 1, description: 'Mate o Archdemon' }
        ],
        rewards: { xp: 25000, gold: 15000, items: [{ itemId: 'crystal_sword', count: 1 }, { itemId: 'amulet_of_loss', count: 1 }] },
        giverNpc: 'Captain Gnostus',
        giverMap: 'thais',
        prerequisites: ['q7_dragon_lord']
    }
}

export function getQuestById(id: string): QuestData | undefined {
    return QUESTS[id]
}

export function getAvailableQuests(level: number, completedQuests: string[]): QuestData[] {
    return Object.values(QUESTS).filter(quest => {
        if (quest.level > level) return false
        if (completedQuests.includes(quest.id)) return false
        if (quest.prerequisites) {
            for (const prereq of quest.prerequisites) {
                if (!completedQuests.includes(prereq)) return false
            }
        }
        return true
    })
}
