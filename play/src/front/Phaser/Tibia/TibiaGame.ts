import { PlayerStats } from './systems/PlayerStats'
import { Inventory } from './systems/Inventory'
import { BattleSystem } from './systems/BattleSystem'
import { QuestSystem } from './systems/QuestSystem'
import { SaveSystem } from './systems/SaveSystem'
import { SoundManager } from './systems/SoundManager'
import { SpellSystem } from './systems/SpellSystem'
import { ElementSystem } from './systems/ElementSystem'
import { TradeSystem } from './systems/TradeSystem'
import { DeathPenaltySystem } from './systems/DeathPenaltySystem'
import { ExperienceSystem } from './systems/ExperienceSystem'
import { TibiaUI } from './ui/TibiaUI'
import { MonsterManager } from './entities/MonsterManager'
import { ITEMS } from './data/items'
import { MONSTERS } from './data/monsters'
import { QUESTS } from './data/quests'
import { getMap, isWalkable, getSpecialLocationAt, getTransitionAt, renderTile, renderSpecialLocation, renderMinimap } from './maps/MapData'
import type { Direction, EquipmentSlot } from './data/types'

export class TibiaGame {
    player: PlayerStats
    inventory: Inventory
    battle: BattleSystem
    quests: QuestSystem
    saveSystem: SaveSystem
    sound: SoundManager
    spells: SpellSystem
    elements: ElementSystem
    trade: TradeSystem
    deathPenalty: DeathPenaltySystem
    experience: ExperienceSystem
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
        this.spells = new SpellSystem()
        this.elements = new ElementSystem()
        this.trade = new TradeSystem()
        this.deathPenalty = new DeathPenaltySystem()
        this.experience = new ExperienceSystem()
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
                const skillId = skills[this.battle.state.selectedSkill % skills.length]
                const spellResult = this.spells.castSpell(skillId, this.player)
                if (spellResult.success && spellResult.damage > 0) {
                    this.battle.handleAction('skill', this.player, skillId)
                } else if (spellResult.success && spellResult.heal > 0) {
                    this.ui.addMessage(`Curou ${spellResult.heal} HP!`, '#4f4')
                } else {
                    this.ui.addMessage('Não foi possível usar a magia!', '#f44')
                }
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

    private handleSpecialLocation(loc: { type: string; label: string; targetMap?: string; targetX?: number; targetY?: number }): void {
        if (loc.type === 'temple') {
            this.player.hp = this.player.maxHp
            this.player.mp = this.player.maxMp
            this.player.dead = false
            this.player.respawnTimer = 0
            this.sound.play('quest')
            this.ui.addMessage(`❤️ Vida e mana restauradas em ${loc.label}`, '#4f4')
        } else if (loc.type === 'shop') {
            this.ui.addMessage(`🏪 ${loc.label} - Use E para interagir`, '#4af')
        } else if (loc.type === 'stash') {
            this.ui.addMessage(`📦 ${loc.label} - Use E para interagir`, '#aa8844')
        } else if (loc.type === 'training_dummy') {
            this.ui.addMessage(`🎯 ${loc.label} - Use ATK para treinar`, '#ff8844')
        } else if (loc.type === 'portal' && loc.targetMap) {
            this.changeMap(loc.targetMap)
            this.player.x = loc.targetX ?? 25
            this.player.y = loc.targetY ?? 25
        } else if (loc.type === 'chest') {
            this.ui.addMessage(`📦 ${loc.label} encontrado!`, '#FFD700')
        }
    }

    private spawnMapMonsters(): void {
        this.monsters.monsters = []
        const mapDef = getMap(this.currentMap)

        for (const spawn of mapDef.spawns) {
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
        this.spells.update(dt)
        this.elements.calculatePlayerResistances(this.player.elementalDefense)
    }

    private updateExploration(dt: number): void {
        if (this.player.dead) return

        let dx = 0, dy = 0
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.touchDirection === 'up') dy = -1
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.touchDirection === 'down') dy = 1
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.touchDirection === 'left') dx = -1
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.touchDirection === 'right') dx = 1

        if (!this.player.moving && (dx !== 0 || dy !== 0)) {
            const nx = this.player.x + dx
            const ny = this.player.y + dy
            const mapDef = getMap(this.currentMap)

            if (isWalkable(mapDef, nx, ny)) {
                this.player.x = nx
                this.player.y = ny
                this.player.moving = true
                this.player.moveTimer = 0
                this.encounterSteps++
                this.sound.play('step')

                if (dx !== 0) this.player.direction = dx > 0 ? 'right' : 'left'
                if (dy !== 0) this.player.direction = dy > 0 ? 'down' : 'up'

                const transition = getTransitionAt(mapDef, nx, ny)
                if (transition) {
                    if (transition.requiredLevel && this.player.level < transition.requiredLevel) {
                        this.ui.addMessage(`Nível ${transition.requiredLevel} necessário!`, '#f44')
                    } else {
                        this.changeMap(transition.toMap)
                        this.player.x = transition.toX
                        this.player.y = transition.toY
                    }
                }

                const specialLoc = getSpecialLocationAt(mapDef, nx, ny)
                if (specialLoc && specialLoc.interactable) {
                    this.handleSpecialLocation(specialLoc)
                }
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
                const monsterDataList = this.battle.getLastMonsterTypes().map(id => MONSTERS[id]).filter(Boolean)
                let totalLevelsGained = 0
                let totalFinalXp = 0

                for (const monsterData of monsterDataList) {
                    const xpResult = this.experience.calculateXpGain(monsterData!, this.player)
                    totalLevelsGained += xpResult.levelsGained
                    totalFinalXp += xpResult.finalXp
                }

                if (monsterDataList.length === 0) {
                    const levelsGained = this.player.gainXp(result.xp)
                    totalLevelsGained = levelsGained
                    totalFinalXp = result.xp
                }

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

                this.ui.addMessage(`+${totalFinalXp} XP | +${result.gold}g`, '#ffa500')
                this.sound.play('victory')

                if (totalLevelsGained > 0) {
                    this.ui.addMessage(`⬆️ Nível ${this.player.level}!`, '#FFD700')
                    this.sound.play('levelup')
                }
            } else {
                this.player.die()
                const penalty = this.deathPenalty.calculatePenalty(this.player, this.inventory, 'Unknown', this.currentMap)
                const penaltyMessages = this.deathPenalty.formatPenaltyMessage(penalty)
                for (const msg of penaltyMessages) {
                    this.ui.addMessage(msg, '#f44')
                }
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
        const mapDef = getMap(this.currentMap)
        const tileSize = 32 * scale
        const offsetX = this.canvas.width / 2 - this.player.x * tileSize
        const offsetY = this.canvas.height / 2 - this.player.y * tileSize

        const viewStartX = Math.max(0, Math.floor(this.player.x - this.canvas.width / tileSize / 2) - 1)
        const viewEndX = Math.min(mapDef.width, Math.ceil(this.player.x + this.canvas.width / tileSize / 2) + 1)
        const viewStartY = Math.max(0, Math.floor(this.player.y - this.canvas.height / tileSize / 2) - 1)
        const viewEndY = Math.min(mapDef.height, Math.ceil(this.player.y + this.canvas.height / tileSize / 2) + 1)

        for (let y = viewStartY; y < viewEndY; y++) {
            for (let x = viewStartX; x < viewEndX; x++) {
                const sx = x * tileSize + offsetX
                const sy = y * tileSize + offsetY
                renderTile(this.ctx, mapDef.tiles[y][x], sx, sy, tileSize)
                this.ctx.strokeStyle = 'rgba(50,70,50,0.2)'
                this.ctx.strokeRect(sx, sy, tileSize, tileSize)
            }
        }

        if (mapDef.ambientColor !== 'rgba(0,0,0,0)') {
            this.ctx.fillStyle = mapDef.ambientColor
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        for (const loc of mapDef.specialLocations) {
            renderSpecialLocation(this.ctx, loc, offsetX, offsetY, tileSize, scale)
        }

        renderMinimap(this.ctx, mapDef, this.player.x, this.player.y, 10, 10, 100)
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
        this.saveSystem.save(
            this.player, this.inventory, this.currentMap, this.quests,
            this.spells, this.trade, this.deathPenalty
        )
    }

    loadGame(): void {
        const save = this.saveSystem.load()
        if (save) {
            this.player.loadSaveData(save.player)
            this.inventory.deserialize(save.inventory)
            this.currentMap = save.currentMap || 'thais'
            this.quests.deserialize(save.quests)
            this.battle.setMap(this.currentMap)
            if (save.spells) this.spells.deserialize(save.spells)
            if (save.trade) this.trade.deserialize(save.trade)
            if (save.deathPenalty) this.deathPenalty.deserialize(save.deathPenalty)
            this.ui.addMessage('Jogo carregado!', '#4f4')
        } else {
            this.ui.addMessage('Bem-vindo ao Tibia Mobile!', '#FFD700')
        }
    }
}
