export type TileType = 'grass' | 'water' | 'sand' | 'stone' | 'path' | 'dark_stone' | 'lava' | 'ice'

export type SpecialLocationType = 'temple' | 'shop' | 'stash' | 'training_dummy' | 'portal' | 'chest' | 'npc'

export interface SpecialLocation {
    type: SpecialLocationType
    x: number
    y: number
    label: string
    width?: number
    height?: number
    targetMap?: string
    targetX?: number
    targetY?: number
    interactable?: boolean
}

export interface MapSpawn {
    monsterId: string
    x: number
    y: number
    count: number
}

export interface MapTransition {
    fromMap: string
    toMap: string
    fromX: number
    fromY: number
    toX: number
    toY: number
    label: string
    requiredLevel?: number
}

export interface MapDefinition {
    id: string
    name: string
    width: number
    height: number
    defaultTile: TileType
    tiles: TileType[][]
    specialLocations: SpecialLocation[]
    spawns: MapSpawn[]
    transitions: MapTransition[]
    encounterRate: number
    ambientColor: string
    music?: string
    respawnPoint: { x: number; y: number }
}

export interface MinimapTile {
    color: string
    walkable: boolean
    special?: string
}

const MINIMAP_COLORS: Record<TileType, string> = {
    grass: '#2d5a1e',
    water: '#1a3a8a',
    sand: '#c2a64e',
    stone: '#666',
    path: '#8a7a5a',
    dark_stone: '#333',
    lava: '#cc3300',
    ice: '#aaddee'
}

const SPECIAL_MINIMAP_COLORS: Record<SpecialLocationType, string> = {
    temple: '#FFD700',
    shop: '#4488ff',
    stash: '#aa8844',
    training_dummy: '#ff8844',
    portal: '#cc44ff',
    chest: '#ffcc00',
    npc: '#00ff88'
}

function generateTileGrid(width: number, height: number, defaultTile: TileType): TileType[][] {
    const grid: TileType[][] = []
    for (let y = 0; y < height; y++) {
        const row: TileType[] = []
        for (let x = 0; x < width; x++) {
            row.push(defaultTile)
        }
        grid.push(row)
    }
    return grid
}

function noise(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.21) * 43758.5453
    return n - Math.floor(n)
}

function fillRegion(tiles: TileType[][], x1: number, y1: number, x2: number, y2: number, tile: TileType): void {
    for (let y = Math.max(0, y1); y <= Math.min(tiles.length - 1, y2); y++) {
        for (let x = Math.max(0, x1); x <= Math.min(tiles[0].length - 1, x2); x++) {
            tiles[y][x] = tile
        }
    }
}

function fillEllipse(tiles: TileType[][], cx: number, cy: number, rx: number, ry: number, tile: TileType): void {
    const height = tiles.length
    const width = tiles[0].length
    for (let y = Math.max(0, cy - ry); y <= Math.min(height - 1, cy + ry); y++) {
        for (let x = Math.max(0, cx - rx); x <= Math.min(width - 1, cx + rx); x++) {
            const dx = (x - cx) / rx
            const dy = (y - cy) / ry
            if (dx * dx + dy * dy <= 1) {
                tiles[y][x] = tile
            }
        }
    }
}

function placePath(tiles: TileType[][], x1: number, y1: number, x2: number, y2: number): void {
    let x = x1
    let y = y1
    while (x !== x2 || y !== y2) {
        if (x >= 0 && x < tiles[0].length && y >= 0 && y < tiles.length) {
            tiles[y][x] = 'path'
        }
        if (Math.abs(x - x2) > Math.abs(y - y2)) {
            x += x < x2 ? 1 : -1
        } else {
            y += y < y2 ? 1 : -1
        }
    }
}

function addNoiseTiles(tiles: TileType[][], tile: TileType, seed: number, threshold: number): void {
    const height = tiles.length
    const width = tiles[0].length
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (tiles[y][x] === 'grass' && noise(x, y, seed) > threshold) {
                tiles[y][x] = tile
            }
        }
    }
}

function buildThais(): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'grass')

    fillEllipse(tiles, 25, 25, 8, 6, 'path')

    fillRegion(tiles, 10, 8, 15, 12, 'stone')
    fillRegion(tiles, 20, 12, 25, 16, 'stone')
    fillRegion(tiles, 35, 10, 40, 14, 'path')
    fillRegion(tiles, 5, 30, 12, 35, 'sand')

    fillEllipse(tiles, 10, 10, 3, 2, 'path')
    placePath(tiles, 10, 12, 25, 25)
    placePath(tiles, 25, 25, 40, 14)
    placePath(tiles, 25, 25, 8, 32)
    placePath(tiles, 25, 25, 45, 25)

    addNoiseTiles(tiles, 'sand', 42, 0.92)

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (noise(x, y, 99) > 0.7) {
                tiles[y][x] = 'grass'
            }
        }
    }

    return {
        id: 'thais',
        name: 'Thais',
        width: W,
        height: H,
        defaultTile: 'grass',
        tiles,
        ambientColor: 'rgba(0,0,0,0)',
        encounterRate: 0.03,
        respawnPoint: { x: 13, y: 10 },
        specialLocations: [
            { type: 'temple', x: 10, y: 8, label: 'Templo de Thais', width: 5, height: 4, interactable: true },
            { type: 'shop', x: 20, y: 12, label: 'Armeria', width: 5, height: 4, interactable: true },
            { type: 'stash', x: 35, y: 10, label: 'Depósito', width: 5, height: 3, interactable: true },
            { type: 'training_dummy', x: 30, y: 20, label: 'Espantalho', width: 2, height: 2, interactable: true },
            { type: 'npc', x: 14, y: 15, label: 'Karl', interactable: true },
            { type: 'portal', x: 48, y: 25, label: 'Floresta', targetMap: 'forest', targetX: 2, targetY: 25, interactable: true },
            { type: 'portal', x: 25, y: 48, label: 'Masmorra', targetMap: 'dungeon', targetX: 25, targetY: 2, interactable: true },
        ],
        spawns: [
            { monsterId: 'rat', x: 20, y: 25, count: 5 },
            { monsterId: 'bug', x: 25, y: 20, count: 3 },
            { monsterId: 'snake', x: 30, y: 30, count: 4 }
        ],
        transitions: [
            { fromMap: 'thais', toMap: 'forest', fromX: 48, fromY: 25, toX: 2, toY: 25, label: 'Entrar na Floresta' },
            { fromMap: 'thais', toMap: 'dungeon', fromX: 25, fromY: 48, toX: 25, toY: 2, label: 'Descer à Masmorra' },
        ]
    }
}

function buildForest(): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'grass')

    addNoiseTiles(tiles, 'grass', 7, 0.6)
    addNoiseTiles(tiles, 'grass', 13, 0.75)

    fillEllipse(tiles, 40, 40, 10, 8, 'sand')
    fillEllipse(tiles, 10, 45, 6, 4, 'water')
    fillEllipse(tiles, 35, 5, 5, 3, 'water')

    placePath(tiles, 2, 25, 48, 25)
    placePath(tiles, 25, 25, 25, 2)
    placePath(tiles, 25, 25, 25, 48)

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (tiles[y][x] === 'grass' && noise(x, y, 55) > 0.88) {
                tiles[y][x] = 'grass'
            }
        }
    }

    return {
        id: 'forest',
        name: 'Floresta Somria',
        width: W,
        height: H,
        defaultTile: 'grass',
        tiles,
        ambientColor: 'rgba(0,20,0,0.15)',
        encounterRate: 0.05,
        respawnPoint: { x: 2, y: 25 },
        specialLocations: [
            { type: 'temple', x: 5, y: 22, label: 'Altar da Floresta', width: 3, height: 3, interactable: true },
            { type: 'portal', x: 0, y: 25, label: 'Thais', targetMap: 'thais', targetX: 47, targetY: 25, interactable: true },
            { type: 'portal', x: 25, y: 0, label: 'Masmorra', targetMap: 'dungeon', targetX: 25, targetY: 47, interactable: true },
            { type: 'portal', x: 48, y: 25, label: 'Covil de Dragões', targetMap: 'dragon_lair', targetX: 2, targetY: 25, interactable: true },
            { type: 'chest', x: 42, y: 42, label: 'Baú da Floresta', interactable: true },
        ],
        spawns: [
            { monsterId: 'spider', x: 15, y: 15, count: 6 },
            { monsterId: 'troll', x: 20, y: 20, count: 4 },
            { monsterId: 'goblin', x: 25, y: 25, count: 3 },
            { monsterId: 'wolf', x: 30, y: 18, count: 5 },
        ],
        transitions: [
            { fromMap: 'forest', toMap: 'thais', fromX: 0, fromY: 25, toX: 47, toY: 25, label: 'Voltar a Thais' },
            { fromMap: 'forest', toMap: 'dungeon', fromX: 25, fromY: 0, toX: 25, toY: 47, label: 'Descer à Masmorra' },
            { fromMap: 'forest', toMap: 'dragon_lair', fromX: 48, fromY: 25, toX: 2, toY: 25, label: 'Entrar no Covil de Dragões', requiredLevel: 20 },
        ]
    }
}

function buildDungeon(): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'dark_stone')

    fillRegion(tiles, 10, 10, 40, 40, 'stone')
    fillEllipse(tiles, 25, 25, 12, 10, 'stone')

    fillRegion(tiles, 5, 20, 10, 30, 'dark_stone')
    fillRegion(tiles, 40, 20, 45, 30, 'dark_stone')

    fillEllipse(tiles, 15, 35, 4, 3, 'lava')
    fillEllipse(tiles, 38, 15, 3, 2, 'lava')

    placePath(tiles, 25, 2, 25, 48)
    placePath(tiles, 2, 25, 48, 25)
    placePath(tiles, 15, 35, 25, 25)
    placePath(tiles, 38, 15, 25, 25)

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (tiles[y][x] === 'dark_stone' && noise(x, y, 33) > 0.9) {
                tiles[y][x] = 'stone'
            }
        }
    }

    return {
        id: 'dungeon',
        name: 'Masmorra Escura',
        width: W,
        height: H,
        defaultTile: 'dark_stone',
        tiles,
        ambientColor: 'rgba(0,0,0,0.3)',
        encounterRate: 0.07,
        respawnPoint: { x: 25, y: 2 },
        specialLocations: [
            { type: 'temple', x: 23, y: 2, label: 'Fonte Sombria', width: 5, height: 3, interactable: true },
            { type: 'stash', x: 5, y: 22, label: 'Depósito Subterrâneo', width: 4, height: 3, interactable: true },
            { type: 'portal', x: 25, y: 0, label: 'Floresta', targetMap: 'forest', targetX: 25, targetY: 47, interactable: true },
            { type: 'portal', x: 25, y: 48, label: 'Covil de Dragões', targetMap: 'dragon_lair', targetX: 25, targetY: 2, interactable: true },
            { type: 'chest', x: 8, y: 25, label: 'Baú Antigo', interactable: true },
            { type: 'chest', x: 42, y: 25, label: 'Baú Enterrado', interactable: true },
        ],
        spawns: [
            { monsterId: 'skeleton', x: 15, y: 15, count: 8 },
            { monsterId: 'zombie', x: 20, y: 20, count: 6 },
            { monsterId: 'orc', x: 25, y: 25, count: 5 },
            { monsterId: 'orc_warrior', x: 30, y: 30, count: 3 },
        ],
        transitions: [
            { fromMap: 'dungeon', toMap: 'forest', fromX: 25, fromY: 0, toX: 25, toY: 47, label: 'Subir à Floresta' },
            { fromMap: 'dungeon', toMap: 'dragon_lair', fromX: 25, fromY: 48, toX: 25, toY: 2, label: 'Entrar no Covil de Dragões', requiredLevel: 15 },
            { fromMap: 'dungeon', toMap: 'thais', fromX: 2, fromY: 25, toX: 25, toY: 47, label: 'Voltar a Thais' },
        ]
    }
}

function buildDragonLair(): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'stone')

    fillEllipse(tiles, 25, 25, 20, 18, 'stone')
    fillEllipse(tiles, 25, 25, 14, 12, 'dark_stone')

    fillEllipse(tiles, 25, 25, 6, 5, 'lava')
    fillEllipse(tiles, 15, 30, 3, 2, 'lava')
    fillEllipse(tiles, 35, 20, 3, 2, 'lava')

    placePath(tiles, 25, 2, 25, 20)
    placePath(tiles, 25, 30, 25, 48)
    placePath(tiles, 2, 25, 20, 25)
    placePath(tiles, 30, 25, 48, 25)

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (tiles[y][x] === 'stone' && noise(x, y, 77) > 0.85) {
                tiles[y][x] = 'dark_stone'
            }
        }
    }

    return {
        id: 'dragon_lair',
        name: 'Covil de Dragões',
        width: W,
        height: H,
        defaultTile: 'stone',
        tiles,
        ambientColor: 'rgba(50,0,0,0.2)',
        encounterRate: 0.08,
        respawnPoint: { x: 25, y: 5 },
        specialLocations: [
            { type: 'temple', x: 23, y: 3, label: 'Pedra de Ressurreição', width: 5, height: 3, interactable: true },
            { type: 'portal', x: 25, y: 0, label: 'Dungeon', targetMap: 'dungeon', targetX: 25, targetY: 47, interactable: true },
            { type: 'portal', x: 0, y: 25, label: 'Floresta', targetMap: 'forest', targetX: 47, targetY: 25, interactable: true },
            { type: 'portal', x: 48, y: 25, label: 'Salão dos Demônios', targetMap: 'demon_hall', targetX: 2, targetY: 25, interactable: true, requiredLevel: 30 },
            { type: 'chest', x: 20, y: 20, label: 'Tesouro do Dragão', interactable: true },
            { type: 'chest', x: 30, y: 30, label: 'Cofre Antigo', interactable: true },
        ],
        spawns: [
            { monsterId: 'dragon', x: 20, y: 20, count: 4 },
            { monsterId: 'dragon_lord', x: 30, y: 30, count: 2 },
        ],
        transitions: [
            { fromMap: 'dragon_lair', toMap: 'dungeon', fromX: 25, fromY: 0, toX: 25, toY: 47, label: 'Voltar à Masmorra' },
            { fromMap: 'dragon_lair', toMap: 'forest', fromX: 0, fromY: 25, toX: 47, toY: 25, label: 'Voltar à Floresta' },
            { fromMap: 'dragon_lair', toMap: 'demon_hall', fromX: 48, fromY: 25, toX: 2, toY: 25, label: 'Entrar no Salão dos Demônios', requiredLevel: 30 },
        ]
    }
}

function buildDemonHall(): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'dark_stone')

    fillEllipse(tiles, 25, 25, 22, 20, 'dark_stone')

    fillEllipse(tiles, 25, 25, 10, 8, 'lava')
    fillEllipse(tiles, 12, 12, 4, 3, 'lava')
    fillEllipse(tiles, 38, 38, 4, 3, 'lava')
    fillEllipse(tiles, 12, 38, 3, 2, 'lava')
    fillEllipse(tiles, 38, 12, 3, 2, 'lava')

    placePath(tiles, 25, 2, 25, 17)
    placePath(tiles, 25, 33, 25, 48)
    placePath(tiles, 2, 25, 15, 25)
    placePath(tiles, 35, 25, 48, 25)

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (tiles[y][x] === 'dark_stone' && noise(x, y, 111) > 0.88) {
                tiles[y][x] = 'lava'
            }
        }
    }

    return {
        id: 'demon_hall',
        name: 'Salão dos Demônios',
        width: W,
        height: H,
        defaultTile: 'dark_stone',
        tiles,
        ambientColor: 'rgba(80,0,0,0.25)',
        encounterRate: 0.10,
        respawnPoint: { x: 25, y: 5 },
        specialLocations: [
            { type: 'temple', x: 23, y: 3, label: 'Altar Infernal', width: 5, height: 3, interactable: true },
            { type: 'stash', x: 45, y: 5, label: 'Depósito Profano', width: 4, height: 3, interactable: true },
            { type: 'portal', x: 0, y: 25, label: 'Covil de Dragões', targetMap: 'dragon_lair', targetX: 47, targetY: 25, interactable: true },
            { type: 'chest', x: 25, y: 25, label: 'Trono do Demônio', interactable: true },
        ],
        spawns: [
            { monsterId: 'minotaur', x: 15, y: 15, count: 5 },
            { monsterId: 'minotaur_guard', x: 20, y: 20, count: 3 },
            { monsterId: 'dark_knight', x: 25, y: 25, count: 2 },
            { monsterId: 'hydra', x: 30, y: 30, count: 2 },
            { monsterId: 'demon', x: 35, y: 35, count: 1 },
            { monsterId: 'archdemon', x: 25, y: 25, count: 1 },
        ],
        transitions: [
            { fromMap: 'demon_hall', toMap: 'dragon_lair', fromX: 0, fromY: 25, toX: 47, toY: 25, label: 'Voltar ao Covil de Dragões' },
        ]
    }
}

export const MAPS: Record<string, MapDefinition> = {
    thais: buildThais(),
    forest: buildForest(),
    dungeon: buildDungeon(),
    dragon_lair: buildDragonLair(),
    demon_hall: buildDemonHall(),
}

export function getMap(id: string): MapDefinition {
    return MAPS[id] ?? MAPS.thais
}

export function isWalkable(mapDef: MapDefinition, x: number, y: number): boolean {
    if (x < 0 || x >= mapDef.width || y < 0 || y >= mapDef.height) return false
    const tile = mapDef.tiles[y][x]
    return tile !== 'water' && tile !== 'lava'
}

export function getSpecialLocationAt(mapDef: MapDefinition, x: number, y: number): SpecialLocation | undefined {
    return mapDef.specialLocations.find(loc => {
        const w = loc.width ?? 1
        const h = loc.height ?? 1
        return x >= loc.x && x < loc.x + w && y >= loc.y && y < loc.y + h
    })
}

export function getTransitionAt(mapDef: MapDefinition, x: number, y: number): MapTransition | undefined {
    return mapDef.transitions.find(t => t.fromX === x && t.fromY === y)
}

export function renderTile(ctx: CanvasRenderingContext2D, tile: TileType, sx: number, sy: number, tileSize: number): void {
    const colors: Record<TileType, string> = {
        grass: '#1a3a1a',
        water: '#1a3a8a',
        sand: '#c2a64e',
        stone: '#555',
        path: '#8a7a5a',
        dark_stone: '#2a2a2a',
        lava: '#cc3300',
        ice: '#aaddee',
    }
    ctx.fillStyle = colors[tile] ?? '#1a3a1a'
    ctx.fillRect(sx, sy, tileSize, tileSize)

    if (tile === 'water') {
        ctx.fillStyle = 'rgba(100,180,255,0.3)'
        ctx.fillRect(sx + 4, sy + tileSize / 2 - 2, tileSize - 8, 4)
    } else if (tile === 'lava') {
        ctx.fillStyle = 'rgba(255,200,0,0.4)'
        ctx.fillRect(sx + 6, sy + 6, tileSize - 12, tileSize - 12)
    } else if (tile === 'path') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.fillRect(sx, sy + tileSize / 2, tileSize, 2)
    }
}

export function renderSpecialLocation(ctx: CanvasRenderingContext2D, loc: SpecialLocation, offsetX: number, offsetY: number, tileSize: number, scale: number): void {
    const sx = loc.x * tileSize + offsetX
    const sy = loc.y * tileSize + offsetY
    const w = (loc.width ?? 1) * tileSize
    const h = (loc.height ?? 1) * tileSize

    const fills: Record<SpecialLocationType, string> = {
        temple: '#5a4a3a',
        shop: '#4a3a2a',
        stash: '#6a5a4a',
        training_dummy: '#7a6a5a',
        portal: '#3a2a5a',
        chest: '#8a7a2a',
        npc: '#3a5a3a',
    }
    ctx.fillStyle = fills[loc.type] ?? '#555'
    ctx.fillRect(sx, sy, w, h)
    ctx.strokeStyle = '#2a1a0a'
    ctx.lineWidth = 2
    ctx.strokeRect(sx, sy, w, h)

    if (loc.type === 'portal') {
        ctx.fillStyle = 'rgba(200,100,255,0.3)'
        ctx.fillRect(sx + 4, sy + 4, w - 8, h - 8)
    } else if (loc.type === 'chest') {
        ctx.fillStyle = '#ffcc00'
        ctx.fillRect(sx + w / 2 - 6, sy + h / 2 - 4, 12, 8)
        ctx.fillStyle = '#aa8800'
        ctx.fillRect(sx + w / 2 - 1, sy + h / 2 - 4, 2, 8)
    } else if (loc.type === 'training_dummy') {
        ctx.fillStyle = '#aa8855'
        ctx.fillRect(sx + w / 2 - 2, sy + 4, 4, h - 8)
        ctx.fillRect(sx + w / 2 - 6, sy + h / 2, 12, 3)
    }

    ctx.fillStyle = '#FFD700'
    ctx.font = `${9 * scale}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(loc.label, sx + w / 2, sy - 4)
    ctx.textAlign = 'left'
}

export function getMinimapTile(mapDef: MapDefinition, x: number, y: number): MinimapTile {
    if (x < 0 || x >= mapDef.width || y < 0 || y >= mapDef.height) {
        return { color: '#000', walkable: false }
    }
    const tile = mapDef.tiles[y][x]
    const walkable = tile !== 'water' && tile !== 'lava'

    const special = mapDef.specialLocations.find(loc => {
        const w = loc.width ?? 1
        const h = loc.height ?? 1
        return x >= loc.x && x < loc.x + w && y >= loc.y && y < loc.y + h
    })

    return {
        color: special ? (SPECIAL_MINIMAP_COLORS[special.type] ?? MINIMAP_COLORS[tile]) : MINIMAP_COLORS[tile],
        walkable,
        special: special?.type,
    }
}

export function renderMinimap(
    ctx: CanvasRenderingContext2D,
    mapDef: MapDefinition,
    playerX: number,
    playerY: number,
    minimapX: number,
    minimapY: number,
    minimapSize: number
): void {
    const tileW = minimapSize / mapDef.width
    const tileH = minimapSize / mapDef.height

    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(minimapX - 2, minimapY - 2, minimapSize + 4, minimapSize + 4)
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 1
    ctx.strokeRect(minimapX - 2, minimapY - 2, minimapSize + 4, minimapSize + 4)

    for (let y = 0; y < mapDef.height; y++) {
        for (let x = 0; x < mapDef.width; x++) {
            const miniTile = getMinimapTile(mapDef, x, y)
            ctx.fillStyle = miniTile.color
            ctx.fillRect(minimapX + x * tileW, minimapY + y * tileH, tileW + 0.5, tileH + 0.5)
        }
    }

    ctx.fillStyle = '#fff'
    ctx.fillRect(minimapX + playerX * tileW - 1, minimapY + playerY * tileH - 1, 3, 3)

    ctx.fillStyle = '#FFD700'
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(mapDef.name, minimapX + minimapSize / 2, minimapY - 4)
    ctx.textAlign = 'left'
}

export function generateRandomDungeon(seed: number, depth: number): MapDefinition {
    const W = 50, H = 50
    const tiles = generateTileGrid(W, H, 'dark_stone')

    const roomCount = 5 + Math.floor(noise(seed, depth, 1) * 6)
    const rooms: { x: number; y: number; w: number; h: number }[] = []

    for (let i = 0; i < roomCount; i++) {
        const rw = 4 + Math.floor(noise(i, seed, 2) * 8)
        const rh = 4 + Math.floor(noise(i, seed, 3) * 6)
        const rx = 2 + Math.floor(noise(i, seed, 4) * (W - rw - 4))
        const ry = 2 + Math.floor(noise(i, seed, 5) * (H - rh - 4))

        let overlap = false
        for (const room of rooms) {
            if (rx < room.x + room.w + 1 && rx + rw + 1 > room.x && ry < room.y + room.h + 1 && ry + rh + 1 > room.y) {
                overlap = true
                break
            }
        }
        if (!overlap) {
            rooms.push({ x: rx, y: ry, w: rw, h: rh })
            fillRegion(tiles, rx, ry, rx + rw - 1, ry + rh - 1, 'stone')
        }
    }

    for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i - 1]
        const b = rooms[i]
        placePath(tiles, a.x + Math.floor(a.w / 2), a.y + Math.floor(a.h / 2), b.x + Math.floor(b.w / 2), b.y + Math.floor(b.h / 2))
    }

    if (rooms.length > 2) {
        const first = rooms[0]
        const last = rooms[rooms.length - 1]
        placePath(tiles, first.x + Math.floor(first.w / 2), first.y + Math.floor(first.h / 2), last.x + Math.floor(last.w / 2), last.y + Math.floor(last.h / 2))
    }

    const lavaCount = 1 + Math.floor(depth / 2)
    for (let i = 0; i < lavaCount; i++) {
        const lx = Math.floor(noise(i, seed, 10) * (W - 10)) + 5
        const ly = Math.floor(noise(i, seed, 11) * (H - 10)) + 5
        const lr = 2 + Math.floor(noise(i, seed, 12) * 3)
        fillEllipse(tiles, lx, ly, lr, lr, 'lava')
    }

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (tiles[y][x] === 'dark_stone' && noise(x, y, seed + depth) > 0.92) {
                tiles[y][x] = 'stone'
            }
        }
    }

    const spawnX = rooms.length > 0 ? rooms[0].x + Math.floor(rooms[0].w / 2) : 25
    const spawnY = rooms.length > 0 ? rooms[0].y + Math.floor(rooms[0].h / 2) : 25

    const dungeonMonsterPool: string[][] = [
        ['skeleton', 'zombie'],
        ['skeleton', 'zombie', 'orc'],
        ['orc', 'orc_warrior', 'skeleton'],
        ['orc_warrior', 'dark_knight', 'minotaur'],
        ['minotaur', 'minotaur_guard', 'dark_knight'],
        ['dark_knight', 'hydra', 'demon'],
        ['demon', 'archdemon', 'hydra'],
    ]
    const monsterPool = dungeonMonsterPool[Math.min(depth, dungeonMonsterPool.length - 1)]

    const specialLocations: SpecialLocation[] = [
        { type: 'temple', x: spawnX - 1, y: spawnY - 1, label: 'Fonte de Vida', width: 3, height: 3, interactable: true },
    ]

    if (rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1]
        specialLocations.push({
            type: 'chest',
            x: lastRoom.x + Math.floor(lastRoom.w / 2),
            y: lastRoom.y + Math.floor(lastRoom.h / 2),
            label: `Tesouro Nv.${depth}`,
            interactable: true,
        })
    }

    const spawns: MapSpawn[] = []
    for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i]
        const monsterId = monsterPool[Math.floor(noise(i, seed, 20) * monsterPool.length)]
        spawns.push({
            monsterId,
            x: room.x + Math.floor(room.w / 2),
            y: room.y + Math.floor(room.h / 2),
            count: 2 + Math.floor(depth * noise(i, seed, 21)),
        })
    }

    return {
        id: `random_dungeon_${seed}_${depth}`,
        name: `Masmorra Aleatória (Nv.${depth})`,
        width: W,
        height: H,
        defaultTile: 'dark_stone',
        tiles,
        ambientColor: `rgba(0,0,0,${0.2 + depth * 0.03})`,
        encounterRate: 0.06 + depth * 0.01,
        respawnPoint: { x: spawnX, y: spawnY },
        specialLocations,
        spawns,
        transitions: [
            { fromMap: `random_dungeon_${seed}_${depth}`, toMap: 'thais', fromX: spawnX, fromY: spawnY, toX: 25, toY: 48, label: 'Voltar a Thais' },
        ],
    }
}
