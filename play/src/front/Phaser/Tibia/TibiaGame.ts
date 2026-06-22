import { PlayerStats } from './systems/PlayerStats'
import { Inventory } from './systems/Inventory'
import { BattleSystem } from './systems/BattleSystem'
import { QuestSystem } from './systems/QuestSystem'
import { SaveSystem } from './systems/SaveSystem'
import { SoundManager } from './systems/SoundManager'
import { TibiaUI } from './ui/TibiaUI'
import { MonsterManager } from './entities/MonsterManager'
import { ITEMS } from './data/items'
import { MONSTERS } from './data/monsters'
import { QUESTS } from './data/quests'
import type { Direction, EquipmentSlot } from './data/types'

export class TibiaGame {
    player: PlayerStats
    inventory: Inventory
    battle: BattleSystem
    quests: QuestSystem
    saveSystem: SaveSystem
    sound: SoundManager
    ui: TibiaUI
    monsters: MonsterManager
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    currentMap = 'thais'
    inBattle = false
    gameTime = 0
    encounterSteps = 0
    autoSaveTimer = 0

    private keys: Record<string, boolean> = {}
    private touchStartX = 0
    private touchStartY = 0
    private touchDirection: Direction | null = null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.player = new PlayerStats()
        this.inventory = new Inventory()
        this.battle = new BattleSystem()
        this.quests = new QuestSystem()
        this.saveSystem = new SaveSystem()
        this.sound = new SoundManager()
        this.ui = new TibiaUI(canvas)
        this.monsters = new MonsterManager()

        this.setupInput()
        this.loadGame()
        this.spawnMapMonsters()
    }

    private setupInput(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true
            this.handleKeyPress(e.key)
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false
        })

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault()
            const touch = e.touches[0]
            this.touchStartX = touch.clientX
            this.touchStartY = touch.clientY
        })

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault()
            const touch = e.touches[0]
            const dx = touch.clientX - this.touchStartX
            const dy = touch.clientY - this.touchStartY
            const threshold = 20

            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.touchDirection = dx > 0 ? 'right' : 'left'
                } else {
                    this.touchDirection = dy > 0 ? 'down' : 'up'
                }
            }
        })

        this.canvas.addEventListener('touchend', () => {
            this.touchDirection = null
        })

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            this.ui.handleClick(x, y, this.player, this.inventory, this.battle)
        })

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            this.ui.handleMouseMove(x, y, this.player, this.inventory)
        })
    }

    private handleKeyPress(key: string): void {
        if (key === 'i' || key === 'I') {
            this.ui.toggleInventory()
        }
        if (key === 'c' || key === 'C') {
            this.ui.toggleStats()
        }
        if (key === 'Escape') {
            if (this.ui.isMenuOpen()) {
                this.ui.showInventory = false
                this.ui.showStats = false
                this.ui.dismissDialog()
            }
        }
        if (key === ' ') {
            this.handleAction()
        }
        if (key === 'e' || key === 'E') {
            this.interactNPC()
        }
    }

    private handleAction(): void {
        if (this.inBattle && this.battle.state) {
            const actions = ['attack', 'skill', 'item', 'defend', 'run']
            const selected = actions[this.battle.state.selectedAction]
            if (selected === 'attack') {
                this.battle.handleAction('attack', this.player)
            } else if (selected === 'defend') {
                this.battle.handleAction('defend', this.player)
            } else if (selected === 'run') {
                this.battle.handleAction('run', this.player)
            } else if (selected === 'skill') {
                const skills = ['fire_wave', 'energy_wave', 'ice_wave', 'holy_smite', 'death_strike']
                this.battle.handleAction('skill', this.player, skills[this.battle.state.selectedSkill % skills.length])
            } else if (selected === 'item') {
                const consumables = this.inventory.getConsumables()
                if (consumables.length > 0) {
                    const item = consumables[this.battle.state.selectedItem % consumables.length]
                    this.inventory.removeItem(item.itemId)
                    this.battle.handleAction('item', this.player, undefined, item.data)
                }
            }
        } else if (!this.player.dead) {
            const target = this.monsters.getMonsterAt(this.player.x, this.player.y, 2)
            if (target) {
                this.startBattleWith(target.data.id)
            }
        }
    }

    private interactNPC(): void {
        if (this.inBattle || this.player.dead) return
        // Check nearby for quest-giving NPCs based on current map
        for (const quest of Object.values(QUESTS)) {
            if (quest.giverMap === this.currentMap && !this.quests.isActive(quest.id) && !this.quests.isCompleted(quest.id)) {
                if (this.player.level >= quest.level) {
                    const prereqMet = !quest.prerequisites?.some(p => !this.quests.isCompleted(p))
                    if (prereqMet) {
                        this.quests.accept(quest.id)
                        this.sound.play('quest')
                        this.ui.addMessage(`Nova quest: ${quest.name}`, '#FFD700')
                        return
                    }
                }
            }
        }
    }

    startBattleWith(monsterId: string): void {
        const data = MONSTERS[monsterId]
        if (!data) return

        if (this.battle.startBattle(this.player, [data])) {
            this.inBattle = true
            this.sound.play('hit')
            this.ui.addMessage(`Batalha contra ${data.name}!`, '#f44')
        }
    }

    private spawnMapMonsters(): void {
        this.monsters.monsters = []

        const mapSpawns: Record<string, { monsterId: string; x: number; y: number; count: number }[]> = {
            thais: [
                { monsterId: 'rat', x: 20, y: 25, count: 5 },
                { monsterId: 'bug', x: 25, y: 20, count: 3 },
                { monsterId: 'snake', x: 30, y: 30, count: 4 }
            ],
            forest: [
                { monsterId: 'spider', x: 15, y: 15, count: 6 },
                { monsterId: 'troll', x: 20, y: 20, count: 4 },
                { monsterId: 'goblin', x: 25, y: 25, count: 3 },
                { monsterId: 'wolf', x: 30, y: 18, count: 5 }
            ],
            dungeon: [
                { monsterId: 'skeleton', x: 15, y: 15, count: 8 },
                { monsterId: 'zombie', x: 20, y: 20, count: 6 },
                { monsterId: 'orc', x: 25, y: 25, count: 5 },
                { monsterId: 'orc_warrior', x: 30, y: 30, count: 3 }
            ],
            dragon_lair: [
                { monsterId: 'dragon', x: 20, y: 20, count: 4 },
                { monsterId: 'dragon_lord', x: 30, y: 30, count: 2 }
            ],
            demon_hall: [
                { monsterId: 'minotaur', x: 15, y: 15, count: 5 },
                { monsterId: 'minotaur_guard', x: 20, y: 20, count: 3 },
                { monsterId: 'dark_knight', x: 25, y: 25, count: 2 },
                { monsterId: 'hydra', x: 30, y: 30, count: 2 },
                { monsterId: 'demon', x: 35, y: 35, count: 1 },
                { monsterId: 'archdemon', x: 40, y: 40, count: 1 }
            ]
        }

        const spawns = mapSpawns[this.currentMap] ?? mapSpawns.thais
        for (const spawn of spawns) {
            const data = MONSTERS[spawn.monsterId]
            if (data) {
                this.monsters.spawnGroup(data, spawn.x, spawn.y, spawn.count)
            }
        }
    }

    update(dt: number): void {
        this.gameTime += dt

        if (this.inBattle) {
            this.updateBattle(dt)
        } else {
            this.updateExploration(dt)
        }

        this.ui.update(dt)
        this.quests.update(dt)
        this.player.update(dt)
    }

    private updateExploration(dt: number): void {
        if (this.player.dead) return

        // Movement
        let dx = 0, dy = 0
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.touchDirection === 'up') dy = -1
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.touchDirection === 'down') dy = 1
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.touchDirection === 'left') dx = -1
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.touchDirection === 'right') dx = 1

        if (!this.player.moving && (dx !== 0 || dy !== 0)) {
            const nx = this.player.x + dx
            const ny = this.player.y + dy

            // Simple boundary check
            if (nx >= 0 && nx < 50 && ny >= 0 && ny < 50) {
                this.player.x = nx
                this.player.y = ny
                this.player.moving = true
                this.player.moveTimer = 0
                this.encounterSteps++
                this.sound.play('step')

                if (dx !== 0) this.player.direction = dx > 0 ? 'right' : 'left'
                if (dy !== 0) this.player.direction = dy > 0 ? 'down' : 'up'
            }
        }

        if (this.player.moving) {
            this.player.moveTimer += dt
            if (this.player.moveTimer >= this.player.moveSpeed) {
                this.player.moving = false
                this.player.moveTimer = 0
            }
        }

        // Monster update
        this.monsters.update(dt, this.player.x, this.player.y)

        // Random encounter check
        if (this.encounterSteps > 3 && Math.random() < this.battle.getEncounterRate()) {
            this.encounterSteps = 0
            const nearbyMonsters = this.monsters.getMonstersInRange(this.player.x, this.player.y, 10)
            if (nearbyMonsters.length > 0) {
                const target = nearbyMonsters[Math.floor(Math.random() * nearbyMonsters.length)]
                this.startBattleWith(target.data.id)
            }
        }

        // Auto-save
        this.autoSaveTimer += dt
        if (this.autoSaveTimer >= 30) {
            this.autoSaveTimer = 0
            this.saveGame()
        }
    }

    private updateBattle(dt: number): void {
        const result = this.battle.update(dt, this.player)

        if (result) {
            if (result.won) {
                const levelsGained = this.player.gainXp(result.xp)
                this.player.gold += result.gold
                for (const itemId of result.loot) {
                    this.inventory.addItem(itemId)
                    const item = ITEMS[itemId]
                    if (item) {
                        this.ui.addMessage(`📦 ${item.name}`, '#4f4')
                    }
                }

                // Check quest objectives
                for (const monsterType of this.battle.getLastMonsterTypes()) {
                    this.quests.checkObjective('kill', monsterType, 1)
                }
                for (const itemId of result.loot) {
                    this.quests.checkObjective('collect', itemId, 1)
                }

                // Auto-complete quests
                for (const questId of [...this.quests.active]) {
                    if (this.quests.isObjectiveMet(questId)) {
                        this.quests.complete(questId)
                        const quest = QUESTS[questId]
                        if (quest) {
                            this.player.gold += quest.rewards.gold
                            this.player.gainXp(quest.rewards.xp)
                            for (const reward of quest.rewards.items ?? []) {
                                this.inventory.addItem(reward.itemId, reward.count)
                            }
                            this.sound.play('quest')
                            this.ui.addQuestNotification(`Quest completa: ${quest.name}!`)
                        }
                    }
                }

                this.ui.addMessage(`+${result.xp} XP | +${result.gold}g`, '#ffa500')
                this.sound.play('victory')

                if (levelsGained > 0) {
                    this.ui.addMessage(`⬆️ Nível ${this.player.level}!`, '#FFD700')
                    this.sound.play('levelup')
                }
            } else {
                this.player.die()
                this.sound.play('death')
                this.ui.addMessage('☠️ Você morreu!', '#f44')
            }
            this.inBattle = false
        }
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Background
        this.ctx.fillStyle = '#0a0a15'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const scale = Math.min(this.canvas.width / 800, this.canvas.height / 600)

        if (this.inBattle) {
            this.ui.renderBattleUI(this.battle.state!, this.player, this.inventory)
        } else {
            // Render map grid
            this.renderMap(scale)

            // Render monsters
            this.renderMonsters(scale)

            // Render player
            this.renderPlayer(scale)

            // HUD
            this.ui.renderHUD(this.player, this.currentMap)
            this.ui.renderInventoryPanel(this.player, this.inventory)
            this.ui.renderStatsPanel(this.player)

            // Death overlay
            if (this.player.dead) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.6)'
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
                this.ctx.fillStyle = '#f44'
                this.ctx.font = `bold ${24 * scale}px monospace`
                this.ctx.textAlign = 'center'
                this.ctx.fillText('☠️ Você morreu!', this.canvas.width / 2, this.canvas.height / 2 - 20)
                this.ctx.fillStyle = '#aaa'
                this.ctx.font = `${14 * scale}px monospace`
                this.ctx.fillText(`Ressuscitando em ${Math.ceil(this.player.respawnTimer)}s...`, this.canvas.width / 2, this.canvas.height / 2 + 20)
                this.ctx.textAlign = 'left'
            }

            // Touch controls
            if (!this.ui.isMenuOpen() && !this.player.dead) {
                this.renderTouchControls(scale)
            }
        }
    }

    private renderMap(scale: number): void {
        const tileSize = 32 * scale
        const offsetX = this.canvas.width / 2 - this.player.x * tileSize
        const offsetY = this.canvas.height / 2 - this.player.y * tileSize

        // Draw grid
        for (let x = -2; x < 30; x++) {
            for (let y = -2; y < 22; y++) {
                const sx = x * tileSize + offsetX
                const sy = y * tileSize + offsetY

                // Ground tile
                const isGrass = (x + y) % 3 !== 0
                this.ctx.fillStyle = isGrass ? '#1a3a1a' : '#2a4a2a'
                this.ctx.fillRect(sx, sy, tileSize, tileSize)

                // Random decorations
                const hash = (x * 7 + y * 13) % 20
                if (hash === 0) {
                    this.ctx.fillStyle = '#3a5a3a'
                    this.ctx.fillRect(sx + 8, sy + 4, 16, 24) // tree
                    this.ctx.fillStyle = '#2a4a2a'
                    this.ctx.fillRect(sx + 12, sy, 8, 8)
                } else if (hash === 5) {
                    this.ctx.fillStyle = '#4a3a2a'
                    this.ctx.fillRect(sx + 12, sy + 12, 8, 8) // rock
                } else if (hash === 10) {
                    this.ctx.fillStyle = '#3a6a3a'
                    this.ctx.fillRect(sx + 14, sy + 20, 4, 8) // flower stem
                    this.ctx.fillStyle = '#ff6'
                    this.ctx.fillRect(sx + 12, sy + 16, 8, 6) // flower
                }

                // Grid line
                this.ctx.strokeStyle = 'rgba(50,70,50,0.3)'
                this.ctx.strokeRect(sx, sy, tileSize, tileSize)
            }
        }

        // Map-specific decorations
        if (this.currentMap === 'thais') {
            // Draw buildings
            this.drawBuilding(offsetX + 10 * tileSize, offsetY + 8 * tileSize, tileSize * 4, tileSize * 3, '#5a4a3a', 'Thais Temple')
            this.drawBuilding(offsetX + 20 * tileSize, offsetY + 12 * tileSize, tileSize * 3, tileSize * 2, '#4a3a2a', 'Armory')
        } else if (this.currentMap === 'dungeon') {
            // Darker ground
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    private drawBuilding(x: number, y: number, w: number, h: number, color: string, label: string): void {
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, w, h)
        this.ctx.strokeStyle = '#2a1a0a'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(x, y, w, h)
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `${10 * Math.min(this.canvas.width / 800, this.canvas.height / 600)}px monospace`
        this.ctx.textAlign = 'center'
        this.ctx.fillText(label, x + w / 2, y - 5)
        this.ctx.textAlign = 'left'
    }

    private renderMonsters(scale: number): void {
        const tileSize = 32 * scale
        const offsetX = this.canvas.width / 2 - this.player.x * tileSize
        const offsetY = this.canvas.height / 2 - this.player.y * tileSize

        for (const monster of this.monsters.monsters) {
            if (monster.state === 'dead') continue

            const mx = monster.x * tileSize + offsetX
            const my = monster.y * tileSize + offsetY

            // Monster sprite (colored rectangle with eyes)
            const colors: Record<string, string> = {
                rat: '#8B7355', bug: '#556B2F', snake: '#228B22', spider: '#333',
                troll: '#6B8E23', goblin: '#556B2F', orc: '#8B4513', orc_warrior: '#A0522D',
                wolf: '#696969', skeleton: '#DCDCDC', zombie: '#556B2F',
                minotaur: '#8B0000', minotaur_guard: '#B22222', dark_knight: '#2F4F4F',
                dragon: '#FF4500', dragon_lord: '#DC143C', hydra: '#006400',
                demon: '#8B0000', archdemon: '#4B0082'
            }

            this.ctx.fillStyle = colors[monster.data.id] || '#666'
            this.ctx.fillRect(mx - 12, my - 16, 24, 28)

            // Eyes
            this.ctx.fillStyle = monster.state === 'chasing' ? '#f00' : '#ff0'
            this.ctx.fillRect(mx - 8, my - 10, 4, 4)
            this.ctx.fillRect(mx + 4, my - 10, 4, 4)

            // HP bar
            if (monster.currentHp < monster.maxHp) {
                const barW = 24
                this.ctx.fillStyle = '#333'
                this.ctx.fillRect(mx - barW / 2, my - 22, barW, 3)
                this.ctx.fillStyle = '#f00'
                this.ctx.fillRect(mx - barW / 2, my - 22, barW * (monster.currentHp / monster.maxHp), 3)
            }

            // Name
            if (monster.state === 'chasing') {
                this.ctx.fillStyle = '#f44'
                this.ctx.font = `${8 * scale}px monospace`
                this.ctx.textAlign = 'center'
                this.ctx.fillText(monster.data.name, mx, my + 18)
                this.ctx.textAlign = 'left'
            }
        }
    }

    private renderPlayer(scale: number): void {
        const tileSize = 32 * scale
        const px = this.canvas.width / 2
        const py = this.canvas.height / 2

        // Player body
        this.ctx.fillStyle = '#4488ff'
        this.ctx.fillRect(px - 12, py - 16, 24, 28)

        // Head
        this.ctx.fillStyle = '#ffcc88'
        this.ctx.fillRect(px - 8, py - 22, 16, 12)

        // Eyes
        this.ctx.fillStyle = '#000'
        if (this.player.direction === 'left') {
            this.ctx.fillRect(px - 6, py - 18, 3, 3)
        } else if (this.player.direction === 'right') {
            this.ctx.fillRect(px + 3, py - 18, 3, 3)
        } else {
            this.ctx.fillRect(px - 5, py - 18, 3, 3)
            this.ctx.fillRect(px + 2, py - 18, 3, 3)
        }

        // Weapon
        const weapon = this.player.equipment.weapon
        if (weapon) {
            this.ctx.fillStyle = '#aaa'
            if (this.player.direction === 'right') {
                this.ctx.fillRect(px + 12, py - 8, 16, 4)
            } else if (this.player.direction === 'left') {
                this.ctx.fillRect(px - 28, py - 8, 16, 4)
            }
        }

        // Name
        this.ctx.fillStyle = '#fff'
        this.ctx.font = `${10 * scale}px monospace`
        this.ctx.textAlign = 'center'
        this.ctx.fillText(`Lv.${this.player.level}`, px, py + 22)
        this.ctx.textAlign = 'left'
    }

    private renderTouchControls(scale: number): void {
        const btnSize = 50 * scale
        const x = this.canvas.width - btnSize - 20
        const y = this.canvas.height - btnSize * 3 - 20

        const buttons = [
            { label: '▲', dx: 0, dy: -1 },
            { label: '◀', dx: -1, dy: 0 },
            { label: '▶', dx: 1, dy: 0 },
            { label: '▼', dx: 0, dy: 1 }
        ]

        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i]
            let bx = x + btnSize
            let by = y + btnSize
            if (i === 0) by = y
            else if (i === 1) bx = x
            else if (i === 2) bx = x + btnSize * 2

            this.ctx.fillStyle = 'rgba(100,100,100,0.5)'
            this.ctx.fillRect(bx, by, btnSize, btnSize)
            this.ctx.strokeStyle = '#888'
            this.ctx.strokeRect(bx, by, btnSize, btnSize)
            this.ctx.fillStyle = '#fff'
            this.ctx.font = `${20 * scale}px monospace`
            this.ctx.textAlign = 'center'
            this.ctx.fillText(btn.label, bx + btnSize / 2, by + btnSize * 0.7)
        }

        // Action button
        this.ctx.fillStyle = 'rgba(200,100,100,0.5)'
        this.ctx.fillRect(x - btnSize - 10, y + btnSize, btnSize, btnSize)
        this.ctx.strokeStyle = '#f44'
        this.ctx.strokeRect(x - btnSize - 10, y + btnSize, btnSize, btnSize)
        this.ctx.fillStyle = '#fff'
        this.ctx.font = `${14 * scale}px monospace`
        this.ctx.fillText('ATK', x - btnSize / 2 - 10, y + btnSize * 1.7)

        this.ctx.textAlign = 'left'
    }

    changeMap(mapId: string): void {
        this.currentMap = mapId
        this.battle.setMap(mapId)
        this.spawnMapMonsters()
        this.encounterSteps = 0
        this.ui.addMessage(`📍 Mapa: ${mapId}`, '#4af')
    }

    saveGame(): void {
        this.saveSystem.save(this.player, this.inventory, this.currentMap, this.quests)
    }

    loadGame(): void {
        const save = this.saveSystem.load()
        if (save) {
            this.player.loadSaveData(save.player)
            this.inventory.deserialize(save.inventory)
            this.currentMap = save.currentMap || 'thais'
            this.quests.deserialize(save.quests)
            this.battle.setMap(this.currentMap)
            this.ui.addMessage('Jogo carregado!', '#4f4')
        } else {
            this.ui.addMessage('Bem-vindo ao Tibia Mobile!', '#FFD700')
        }
    }
}
