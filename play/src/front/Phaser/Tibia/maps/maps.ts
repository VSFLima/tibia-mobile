// ============================================
// TIBIA MOBILE - MAP SYSTEM
// Mapas grandes estilo Tibia original
// ============================================

export const TILE_TYPES = {
    GRASS: 0, WATER: 1, SAND: 2, STONE: 3, PATH: 4,
    DARK_STONE: 5, LAVA: 6, ICE: 7, TREE: 8, HOUSE_WALL: 9,
    HOUSE_DOOR: 10, ROOF: 11, FENCE: 12, BRIDGE: 13, CHEST: 14,
    TEMPLE_FLOOR: 15, SHOP_FLOOR: 16, CARPET: 17, WALL_H: 18, WALL_V: 19
}

export const TILE_COLORS = {
    [TILE_TYPES.GRASS]: '#2d5a1e',
    [TILE_TYPES.WATER]: '#1a4a7a',
    [TILE_TYPES.SAND]: '#c4a857',
    [TILE_TYPES.STONE]: '#5a5a5a',
    [TILE_TYPES.PATH]: '#8a7a5a',
    [TILE_TYPES.DARK_STONE]: '#3a3a4a',
    [TILE_TYPES.LAVA]: '#cc3300',
    [TILE_TYPES.ICE]: '#aaddff',
    [TILE_TYPES.TREE]: '#1a4a1a',
    [TILE_TYPES.HOUSE_WALL]: '#6a5040',
    [TILE_TYPES.HOUSE_DOOR]: '#8B4513',
    [TILE_TYPES.ROOF]: '#4a3020',
    [TILE_TYPES.FENCE]: '#7a6a4a',
    [TILE_TYPES.BRIDGE]: '#8a7a5a',
    [TILE_TYPES.CHEST]: '#FFD700',
    [TILE_TYPES.TEMPLE_FLOOR]: '#DDD',
    [TILE_TYPES.SHOP_FLOOR]: '#9a8a6a',
    [TILE_TYPES.CARPET]: '#8B0000',
    [TILE_TYPES.WALL_H]: '#5a4a3a',
    [TILE_TYPES.WALL_V]: '#5a4a3a'
}

// ============================================
// THAIS - Cidade Principal (64x64)
// ============================================
export const THAIS = {
    name: 'Thais',
    width: 64,
    height: 64,
    description: 'A grande cidade de Thais, lar dos aventureiros.',
    bgColor: '#2d5a1e',
    encounterRate: 0.03,
    requiredLevel: 1,
    npcs: [
        {
            id: 'thal', name: 'Thal', x: 20, y: 15,
            dialog: ['Bem-vindo a Thais, aventureiro!', 'Cuidado com as criaturas nas florestas ao norte.', 'Volte quando estiver mais forte.'],
            trade: { buy: [{id:'health_potion',price:50},{id:'mana_potion',price:50},{id:'antidote',price:20}], sell: [] },
            questGiver: true, quests: ['q1_rat_hunt','q6_dragon_hunt']
        },
        {
            id: 'ariana', name: 'Ariana', x: 25, y: 20,
            dialog: ['As aranhas estão ficando cada vez mais perigosas.', 'Preciso de ajuda para limpar o ninho delas.'],
            trade: null, questGiver: true, quests: ['q2_spider_nest']
        },
        {
            id: 'captain', name: 'Captain Gnostus', x: 30, y: 12,
            dialog: ['A ordem dos cavaleiros precisa de heróis!', 'Derrote os orcs que ameaçam nossas fronteiras.'],
            trade: null, questGiver: true, quests: ['q3_orc_patrol','q5_minotaur_maze','q7_dragon_lord','q8_demon_hunt']
        },
        {
            id: 'rashid', name: 'Rashid', x: 35, y: 25,
            dialog: ['Compro e vendo os melhores itens!', 'Viajo por todas as cidades.'],
            trade: {
                buy: [{id:'magic_sword',price:5000},{id:'plate_armor',price:4000},{id:'magic_hat',price:3000},{id:'boots_of_haste',price:8000}],
                sell: [{id:'dragon_scale',price:500},{id:'magic_crystal',price:800}]
            }, questGiver: false
        },
        {
            id: 'daniela', name: 'Daniela', x: 15, y: 30,
            dialog: ['Minhas poções são as melhores da cidade!', 'Cuidado ao explorar as masmorras.'],
            trade: {
                buy: [{id:'health_potion',price:50},{id:'mana_potion',price:50},{id:'strong_health',price:150},{id:'strong_mana',price:150},{id:'great_health',price:350},{id:'great_mana',price:350}],
                sell: []
            }, questGiver: false
        },
        {
            id: 'xod', name: 'Xod', x: 40, y: 35,
            dialog: ['Eu forjo as melhores armas!', 'Traga materiais raros e farei equipamentos únicos.'],
            trade: {
                buy: [{id:'iron_sword',price:800},{id:'bone_sword',price:2500},{id:'chain_armor',price:1500},{id:'iron_helmet',price:900}],
                sell: []
            }, questGiver: false
        }
    ],
    monsterSpawns: [
        { type: 'rat', x: 10, y: 50, count: 8, radius: 8 },
        { type: 'bug', x: 50, y: 10, count: 6, radius: 6 },
        { type: 'snake', x: 55, y: 50, count: 5, radius: 5 }
    ],
    specialLocations: [
        { type: 'temple', x: 20, y: 18, name: 'Templo de Thais', heal: true, respawn: true },
        { type: 'depot', x: 22, y: 18, name: 'Depósito' },
        { type: 'training', x: 35, y: 40, name: 'Área de Treinamento' }
    ],
    transitions: [
        { to: 'forest', x: 62, y: 32, reqLv: 5, name: 'Floresta Somria' },
        { to: 'dungeon_entrance', x: 32, y: 62, reqLv: 15, name: 'Entrada da Masmorra' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.GRASS));

        // Water borders
        for (let x = 0; x < this.width; x++) { map[0][x] = TILE_TYPES.WATER; map[this.height-1][x] = TILE_TYPES.WATER; }
        for (let y = 0; y < this.height; y++) { map[y][0] = TILE_TYPES.WATER; map[y][this.width-1] = TILE_TYPES.WATER; }

        // Main roads
        for (let x = 10; x < 55; x++) { map[32][x] = TILE_TYPES.PATH; map[33][x] = TILE_TYPES.PATH; }
        for (let y = 10; y < 55; y++) { map[y][32] = TILE_TYPES.PATH; map[y][33] = TILE_TYPES.PATH; }

        // Temple building (20,15-22,20)
        for (let y = 15; y <= 20; y++) for (let x = 18; x <= 24; x++) map[y][x] = TILE_TYPES.HOUSE_WALL;
        for (let y = 16; y <= 19; y++) for (let x = 19; x <= 23; x++) map[y][x] = TILE_TYPES.TEMPLE_FLOOR;
        map[20][21] = TILE_TYPES.HOUSE_DOOR;

        // Shop (35,23-38,28)
        for (let y = 23; y <= 28; y++) for (let x = 34; x <= 39; x++) map[y][x] = TILE_TYPES.HOUSE_WALL;
        for (let y = 24; y <= 27; y++) for (let x = 35; x <= 38; x++) map[y][x] = TILE_TYPES.SHOP_FLOOR;
        map[28][37] = TILE_TYPES.HOUSE_DOOR;

        // Armory (40,33-44,38)
        for (let y = 33; y <= 38; y++) for (let x = 39; x <= 45; x++) map[y][x] = TILE_TYPES.HOUSE_WALL;
        for (let y = 34; y <= 37; y++) for (let x = 40; x <= 44; x++) map[y][x] = TILE_TYPES.SHOP_FLOOR;
        map[38][42] = TILE_TYPES.HOUSE_DOOR;

        // Houses around the city
        const houses = [[8,8,12,12],[45,8,50,12],[8,45,12,50],[45,45,50,50],[15,40,20,45],[40,15,45,20]];
        for (const [x1,y1,x2,y2] of houses) {
            for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
                if (y === y1 || y === y2 || x === x1 || x === x2) map[y][x] = TILE_TYPES.HOUSE_WALL;
                else map[y][x] = TILE_TYPES.CARPET;
            }
            map[y2][Math.floor((x1+x2)/2)] = TILE_TYPES.HOUSE_DOOR;
        }

        // Trees scattered
        for (let i = 0; i < 80; i++) {
            const x = 2 + Math.floor(Math.random() * (this.width-4));
            const y = 2 + Math.floor(Math.random() * (this.height-4));
            if (map[y][x] === TILE_TYPES.GRASS && Math.random() < 0.3) map[y][x] = TILE_TYPES.TREE;
        }

        // Transition exits
        map[32][this.width-2] = TILE_TYPES.PATH;
        map[33][this.width-2] = TILE_TYPES.PATH;
        map[this.height-2][32] = TILE_TYPES.PATH;
        map[this.height-2][33] = TILE_TYPES.PATH;

        return map;
    }
}

// ============================================
// FLORESTA SOMRIA (64x64)
// ============================================
export const FOREST = {
    name: 'Floresta Somria',
    width: 64,
    height: 64,
    description: 'Uma floresta densa e perigosa. Cuidado com as criaturas!',
    bgColor: '#1a3a1a',
    encounterRate: 0.12,
    requiredLevel: 5,
    npcs: [
        {
            id: 'hermit', name: 'Hermit', x: 30, y: 30,
            dialog: ['Vivo nestas florestas há anos.', 'Os lobos ficaram mais agressivos ultimamente.', 'Se for ao sul, cuidado com os trolls.'],
            trade: { buy: [{id:'health_potion',price:60},{id:'antidote',price:25}], sell: [] }, questGiver: false
        },
        {
            id: 'hunter', name: 'Hunter', x: 15, y: 45,
            dialog: ['Caço aranhas para vender suas sedas.', 'Preciso de ajuda com o ninho delas.'],
            trade: { buy: [], sell: [{id:'spider_silk',price:100}] }, questGiver: true, quests: ['q2_spider_nest']
        }
    ],
    monsterSpawns: [
        { type: 'spider', x: 20, y: 20, count: 8, radius: 10 },
        { type: 'troll', x: 40, y: 40, count: 6, radius: 8 },
        { type: 'goblin', x: 50, y: 20, count: 5, radius: 6 },
        { type: 'wolf', x: 30, y: 50, count: 7, radius: 10 }
    ],
    specialLocations: [
        { type: 'camp', x: 30, y: 30, name: 'Acampamento do Hermit' }
    ],
    transitions: [
        { to: 'thais', x: 1, y: 32, reqLv: 1, name: 'Thais' },
        { to: 'dungeon_entrance', x: 62, y: 32, reqLv: 15, name: 'Entrada da Masmorra' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.GRASS));
        // Dense trees
        for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
            if (Math.random() < 0.35) map[y][x] = TILE_TYPES.TREE;
        }
        // Paths
        for (let x = 0; x < this.width; x++) { map[32][x] = TILE_TYPES.PATH; }
        for (let y = 0; y < this.height; y++) { map[y][32] = TILE_TYPES.PATH; }
        // Water stream
        for (let y = 0; y < this.height; y++) {
            const wx = Math.floor(15 + Math.sin(y * 0.2) * 3);
            if (wx >= 0 && wx < this.width) map[y][wx] = TILE_TYPES.WATER;
        }
        // Clear camp area
        for (let y = 28; y <= 34; y++) for (let x = 28; x <= 34; x++) map[y][x] = TILE_TYPES.GRASS;
        return map;
    }
}

// ============================================
// ENTRADA DA MASمورRA (64x64)
// ============================================
export const DUNGEON_ENTRANCE = {
    name: 'Entrada da Masmorra',
    width: 64,
    height: 64,
    description: 'A entrada sombria de uma masmorra antiga.',
    bgColor: '#2a2a3a',
    encounterRate: 0.15,
    requiredLevel: 15,
    npcs: [
        {
            id: 'guard', name: 'Guard', x: 32, y: 10,
            dialog: ['Ninguém entra sem preparo!', 'Leve poções e equipamento adequado.', 'Os mortos-vivos estão por toda parte.'],
            trade: { buy: [{id:'health_potion',price:75},{id:'mana_potion',price:75},{id:'strong_health',price:150}], sell: [] }, questGiver: false
        },
        {
            id: 'father_clement', name: 'Father Clement', x: 25, y: 15,
            dialog: ['Abençoe você, jovem aventureiro.', 'Os mortos não descansam nestas cryptas.', 'Preciso que você elimine os esqueletos.'],
            trade: null, questGiver: true, quests: ['q4_undead_crypt']
        }
    ],
    monsterSpawns: [
        { type: 'skeleton', x: 30, y: 40, count: 10, radius: 12 },
        { type: 'zombie', x: 20, y: 50, count: 8, radius: 10 },
        { type: 'orc', x: 50, y: 45, count: 6, radius: 8 }
    ],
    specialLocations: [
        { type: 'temple', x: 28, y: 12, name: 'Capela', heal: true, respawn: true }
    ],
    transitions: [
        { to: 'forest', x: 1, y: 32, reqLv: 1, name: 'Floresta Somria' },
        { to: 'deep_dungeon', x: 32, y: 62, reqLv: 25, name: 'Masmorra Profunda' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.DARK_STONE));
        // Walls
        for (let x = 0; x < this.width; x++) { map[0][x] = TILE_TYPES.WALL_H; map[this.height-1][x] = TILE_TYPES.WALL_H; }
        for (let y = 0; y < this.height; y++) { map[y][0] = TILE_TYPES.WALL_V; map[y][this.width-1] = TILE_TYPES.WALL_V; }
        // Rooms
        for (let y = 5; y <= 25; y++) for (let x = 10; x <= 55; x++) map[y][x] = TILE_TYPES.STONE;
        map[25][32] = TILE_TYPES.PATH; // exit to deeper
        // Chapel
        for (let y = 10; y <= 18; y++) for (let x = 22; x <= 35; x++) map[y][x] = TILE_TYPES.TEMPLE_FLOOR;
        return map;
    }
}

// ============================================
// MASMORRA PROFUNDA (64x64)
// ============================================
export const DEEP_DUNGEON = {
    name: 'Masmorra Profunda',
    width: 64,
    height: 64,
    description: 'As profundezas da masmorra, lar dos minotauros.',
    bgColor: '#1a1a2a',
    encounterRate: 0.18,
    requiredLevel: 25,
    npcs: [
        {
            id: 'prisoner', name: 'Prisoner', x: 45, y: 30,
            dialog: ['Me salve destes minotauros!', 'Eles me capturaram há semanas.', 'Se me libertar, tenho informações valiosas.'],
            trade: null, questGiver: true, quests: ['q5_minotaur_maze']
        }
    ],
    monsterSpawns: [
        { type: 'minotaur', x: 30, y: 30, count: 8, radius: 15 },
        { type: 'minotaur', x: 50, y: 50, count: 6, radius: 10 },
        { type: 'orc_warrior', x: 15, y: 45, count: 5, radius: 8 },
        { type: 'dark_knight', x: 45, y: 15, count: 3, radius: 6 }
    ],
    specialLocations: [],
    transitions: [
        { to: 'dungeon_entrance', x: 32, y: 1, reqLv: 1, name: 'Entrada da Masmorra' },
        { to: 'dragon_lair', x: 62, y: 32, reqLv: 40, name: 'Covil de Dragões' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.DARK_STONE));
        // Maze-like corridors
        for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
            if (y % 8 < 2 && x % 8 < 2) map[y][x] = TILE_TYPES.WALL_H;
        }
        // Open areas
        for (let y = 20; y <= 40; y++) for (let x = 20; x <= 40; x++) map[y][x] = TILE_TYPES.STONE;
        // Prison cell
        for (let y = 28; y <= 35; y++) for (let x = 42; x <= 50; x++) map[y][x] = TILE_TYPES.STONE;
        map[32][42] = TILE_TYPES.HOUSE_DOOR;
        return map;
    }
}

// ============================================
// COVIL DE DRAGÕES (64x64)
// ============================================
export const DRAGON_LAIR = {
    name: 'Covil de Dragões',
    width: 64,
    height: 64,
    description: 'Um covil perigoso habitado por dragões poderosos.',
    bgColor: '#2a1a0a',
    encounterRate: 0.22,
    requiredLevel: 40,
    npcs: [
        {
            id: 'dragon_slayer', name: 'Dragon Slayer', x: 10, y: 10,
            dialog: ['Sou o único sobrevivente desta região.', 'Os dragões são extremamente perigosos.', 'Tenha cuidado com o Dragão Ancião.'],
            trade: { buy: [{id:'great_health',price:350},{id:'great_mana',price:350}], sell: [] }, questGiver: true, quests: ['q6_dragon_hunt']
        }
    ],
    monsterSpawns: [
        { type: 'dragon', x: 30, y: 30, count: 6, radius: 15 },
        { type: 'dragon', x: 50, y: 50, count: 4, radius: 10 },
        { type: 'dragon_lord', x: 45, y: 45, count: 2, radius: 5 }
    ],
    specialLocations: [
        { type: 'chest', x: 55, y: 55, name: 'Baú do Dragão', loot: ['dragon_scale','dragon_scale','gold_coin'] }
    ],
    transitions: [
        { to: 'deep_dungeon', x: 1, y: 32, reqLv: 1, name: 'Masmorra Profunda' },
        { to: 'demon_hall', x: 62, y: 32, reqLv: 70, name: 'Salão dos Demônios' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.STONE));
        // Lava rivers
        for (let y = 0; y < this.height; y++) {
            const lx = Math.floor(20 + Math.sin(y * 0.15) * 5);
            if (lx >= 0 && lx < this.width) map[y][lx] = TILE_TYPES.LAVA;
            if (lx+1 < this.width) map[y][lx+1] = TILE_TYPES.LAVA;
        }
        // Dragon nests (clear areas)
        const nests = [[25,25],[45,45],[50,20],[20,50]];
        for (const [nx,ny] of nests) {
            for (let y = ny-4; y <= ny+4; y++) for (let x = nx-4; x <= nx+4; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) map[y][x] = TILE_TYPES.STONE;
            }
        }
        return map;
    }
}

// ============================================
// SALÃO DOS DEMÔNIOS (64x64)
// ============================================
export const DEMON_HALL = {
    name: 'Salão dos Demônios',
    width: 64,
    height: 64,
    description: 'O reino dos demônios. Apenas os mais fortes ousam entrar.',
    bgColor: '#1a0a0a',
    encounterRate: 0.25,
    requiredLevel: 70,
    npcs: [
        {
            id: 'archmage', name: 'Archmage', x: 10, y: 10,
            dialog: ['Estive estudando os demônios por anos.', 'O Archdemon é o mais perigoso de todos.', 'Precisamos de um herói para derrotá-lo.'],
            trade: { buy: [{id:'sd_rune',price:200},{id:'fireball_rune',price:80}], sell: [] }, questGiver: true, quests: ['q8_archdemon']
        }
    ],
    monsterSpawns: [
        { type: 'minotaur_guard', x: 20, y: 20, count: 5, radius: 8 },
        { type: 'dark_knight', x: 40, y: 20, count: 4, radius: 6 },
        { type: 'demon', x: 30, y: 40, count: 3, radius: 10 },
        { type: 'archdemon', x: 50, y: 50, count: 1, radius: 3 }
    ],
    specialLocations: [
        { type: 'chest', x: 55, y: 55, name: 'Baú do Archdemon', loot: ['fire_sword','crystal_sword','amulet_of_loss'] }
    ],
    transitions: [
        { to: 'dragon_lair', x: 1, y: 32, reqLv: 1, name: 'Covil de Dragões' }
    ],
    generateMap: function() {
        const map = Array(this.height).fill(null).map(() => Array(this.width).fill(TILE_TYPES.DARK_STONE));
        // Lava everywhere
        for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
            if (Math.random() < 0.2) map[y][x] = TILE_TYPES.LAVA;
        }
        // Safe paths
        for (let x = 0; x < this.width; x++) { map[32][x] = TILE_TYPES.STONE; }
        for (let y = 0; y < this.height; y++) { map[y][32] = TILE_TYPES.STONE; }
        // Boss arena
        for (let y = 45; y <= 58; y++) for (let x = 45; x <= 58; x++) map[y][x] = TILE_TYPES.STONE;
        return map;
    }
}

// ============================================
// MAP REGISTRY
// ============================================
export const MAPS = {
    thais: THAIS,
    forest: FOREST,
    dungeon_entrance: DUNGEON_ENTRANCE,
    deep_dungeon: DEEP_DUNGEON,
    dragon_lair: DRAGON_LAIR,
    demon_hall: DEMON_HALL
}

export function getMap(id) { return MAPS[id] || THAIS; }
export function isWalkable(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return false;
    const tileMap = map.generateMap();
    if (y < 0 || y >= map.height || x < 0 || x >= map.width) return false;
    const tile = tileMap[y][x];
    return tile !== TILE_TYPES.WATER && tile !== TILE_TYPES.LAVA && tile !== TILE_TYPES.WALL_H && tile !== TILE_TYPES.WALL_V && tile !== TILE_TYPES.TREE;
}
export function getNPCAt(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.npcs.find(n => Math.abs(n.x - x) <= 1 && Math.abs(n.y - y) <= 1) || null;
}
export function getTransitionAt(mapId, x, y) {
    const map = MAPS[mapId];
    if (!map) return null;
    return map.transitions.find(t => Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1) || null;
}
