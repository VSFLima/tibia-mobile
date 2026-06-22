/**
 * Tibia Integration for WorkAdventure
 * Hooks into existing Phaser game systems to add RPG mechanics
 */
import type { GameScene } from '../Game/GameScene'
import { ITEMS } from './data/items'
import { MONSTERS } from './data/monsters'
import { QUESTS } from './data/quests'

// ============ PLAYER RPG DATA ============
export interface PlayerRPGData {
    level: number
    xp: number
    xpToLevel: number
    gold: number
    hp: number
    maxHp: number
    mp: number
    maxMp: number
    baseAttack: number
    baseDefense: number
    baseSpeed: number
    magicLevel: number
    equipment: Record<string, string>
    inventory: { itemId: string; count: number }[]
    skills: Record<string, number>
    activeQuests: string[]
    completedQuests: string[]
    questProgress: Record<string, number>
    dead: boolean
    respawnTimer: number
    currentMap: string
}

// ============ TIBIA INTEGRATION CLASS ============
export class TibiaIntegration {
    private scene: GameScene
    private playerData: PlayerRPGData
    private battleState: any = null
    private messages: { text: string; color: string; time: number }[] = []
    private gameTime: number = 0
    private encounterSteps: number = 0
    private showInventory: boolean = false
    private showStats: boolean = false
    private showQuests: boolean = false
    private showShop: any = null
    private dialogData: { name: string; text: string } | null = null
    private monsters: any[] = []
    private nextMonsterId: number = 0
    private autoSaveTimer: number = 0
    private hudGraphics!: Phaser.GameObjects.Graphics
    private battleGraphics!: Phaser.GameObjects.Graphics
    private textObjects: Phaser.GameObjects.Text[] = []

    constructor(scene: GameScene) {
        this.scene = scene
        this.playerData = this.getDefaultPlayerData()
        this.loadSave()
        this.spawnMonsters()
        this.setupInput()
        this.createGraphics()
    }

    private getDefaultPlayerData(): PlayerRPGData {
        return {
            level: 1, xp: 0, xpToLevel: 50, gold: 100,
            hp: 100, maxHp: 100, mp: 30, maxMp: 30,
            baseAttack: 8, baseDefense: 4, baseSpeed: 5, magicLevel: 1,
            equipment: {}, inventory: [],
            skills: { sword: 10, axe: 10, club: 10, distance: 10, shielding: 10, magic: 10 },
            activeQuests: [], completedQuests: [], questProgress: {},
            dead: false, respawnTimer: 0, currentMap: 'thais'
        }
    }

    private createGraphics(): void {
        this.hudGraphics = this.scene.add.graphics()
        this.hudGraphics.setScrollFactor(0)
        this.hudGraphics.setDepth(1000)
        this.battleGraphics = this.scene.add.graphics()
        this.battleGraphics.setScrollFactor(0)
        this.battleGraphics.setDepth(1001)
    }

    private setupInput(): void {
        const player = this.scene.CurrentPlayer
        if (!player) return

        // Hook into player movement events
        player.on('hasMoved', () => {
            this.onPlayerMoved()
        })
    }

    private onPlayerMoved(): void {
        if (this.playerData.dead) return
        if (this.battleState) return

        this.encounterSteps++
        this.checkTransitions()
        this.checkNPCProximity()

        // Random encounter
        if (this.encounterSteps > 3 && Math.random() < 0.08) {
            this.encounterSteps = 0
            this.startRandomBattle()
        }
    }

    private checkTransitions(): void {
        const player = this.scene.CurrentPlayer
        if (!player) return

        const transitions: Record<string, { to: string; x: number; y: number; reqLv: number }[]> = {
            'thais': [{ to: 'forest', x: 62, y: 32, reqLv: 5 }],
            'forest': [{ to: 'thais', x: 1, y: 32, reqLv: 1 }, { to: 'dungeon', x: 62, y: 32, reqLv: 15 }],
            'dungeon': [{ to: 'forest', x: 1, y: 32, reqLv: 1 }, { to: 'deep_dungeon', x: 32, y: 62, reqLv: 25 }]
        }

        const currentTransitions = transitions[this.playerData.currentMap] || []
        for (const t of currentTransitions) {
            const dist = Math.hypot(player.x / 32 - t.x, player.y / 32 - t.y)
            if (dist < 2) {
                if (this.playerData.level >= t.reqLv) {
                    this.playerData.currentMap = t.to
                    this.spawnMonsters()
                    this.addMessage(`📍 Mapa: ${t.to}`, '#4af')
                    // In real implementation, this would load the new map
                } else {
                    this.addMessage(`Nível ${t.reqLv} necessário!`, '#f44')
                }
            }
        }
    }

    private checkNPCProximity(): void {
        const player = this.scene.CurrentPlayer
        if (!player) return

        // Check for NPCs in the current map
        const npcs = this.getMapNPCs()
        for (const npc of npcs) {
            const dist = Math.hypot(player.x / 32 - npc.x, player.y / 32 - npc.y)
            if (dist < 2) {
                // Show interaction hint
                this.addMessage(`E: Falar com ${npc.name}`, '#FFD700')
                break
            }
        }
    }

    private getMapNPCs(): any[] {
        const npcsByMap: Record<string, any[]> = {
            'thais': [
                { id: 'thal', name: 'Thal', x: 20, y: 15, dialog: ['Bem-vindo a Thais!'], quests: ['q1', 'q6'] },
                { id: 'captain', name: 'Capt. Gnostus', x: 30, y: 12, dialog: ['A ordem precisa de heróis!'], quests: ['q3', 'q5', 'q7', 'q8', 'q9'] },
                { id: 'rashid', name: 'Rashid', x: 35, y: 25, dialog: ['Compro e vendo itens!'], shop: true }
            ],
            'forest': [
                { id: 'hermit', name: 'Hermit', x: 30, y: 30, dialog: ['Vivo nestas florestas.'], quests: ['q2'] }
            ],
            'dungeon': [
                { id: 'clement', name: 'Father Clement', x: 25, y: 15, dialog: ['Os mortos não descansam.'], quests: ['q4'] }
            ]
        }
        return npcsByMap[this.playerData.currentMap] || []
    }

    private startRandomBattle(): void {
        const monstersByMap: Record<string, string[]> = {
            'thais': ['rat', 'bug', 'snake'],
            'forest': ['spider', 'troll', 'goblin', 'wolf'],
            'dungeon': ['skeleton', 'zombie', 'orc'],
            'deep_dungeon': ['minotaur', 'orc_warrior'],
            'dragon_lair': ['dragon', 'dragon_lord'],
            'demon_hall': ['demon', 'archdemon']
        }

        const available = monstersByMap[this.playerData.currentMap] || ['rat']
        const monsterType = available[Math.floor(Math.random() * available.length)]
        this.startBattle(monsterType)
    }

    startBattle(monsterType: string): void {
        const data = MONSTERS[monsterType]
        if (!data) return

        this.battleState = {
            phase: 'action',
            monster: { type: monsterType, data, hp: data.health, maxHp: data.health },
            turn: 1,
            selected: 0,
            messages: [`Um ${data.name} selvagem apareceu!`]
        }

        this.playerData.hp = this.scene.CurrentPlayer?.hp || this.playerData.hp
        this.playerData.mp = this.scene.CurrentPlayer?.mp || this.playerData.mp

        this.addMessage(`Batalha contra ${data.name}!`, '#f44')
    }

    // ============ BATTLE ACTIONS ============
    battleAttack(): void {
        if (!this.battleState || this.battleState.phase !== 'action') return
        const m = this.battleState.monster
        const dmg = Math.max(1, this.playerData.baseAttack + Math.floor(Math.random() * 5) - 2 - Math.floor(m.data.defense * 0.3))
        m.hp -= dmg
        this.battleState.messages.push(`Você causou ${dmg}!`)
        if (m.hp <= 0) this.victory()
        else this.enemyTurn()
    }

    battleMagic(): void {
        if (!this.battleState || this.battleState.phase !== 'action') return
        if (this.playerData.mp < 15) { this.battleState.messages.push('Mana insuficiente!'); return }
        this.playerData.mp -= 15
        const dmg = 20 + this.playerData.magicLevel * 8 + Math.floor(Math.random() * 20)
        this.battleState.monster.hp -= dmg
        this.battleState.messages.push(`Fire Wave: ${dmg}!`)
        if (this.battleState.monster.hp <= 0) this.victory()
        else this.enemyTurn()
    }

    battleHeal(): void {
        if (!this.battleState || this.battleState.phase !== 'action') return
        if (this.playerData.mp < 10) { this.battleState.messages.push('Mana insuficiente!'); return }
        this.playerData.mp -= 10
        const heal = 30 + this.playerData.magicLevel * 5
        this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + heal)
        this.battleState.messages.push(`Heal: +${heal} HP`)
        this.enemyTurn()
    }

    battleDefend(): void {
        if (!this.battleState || this.battleState.phase !== 'action') return
        this.battleState.messages.push('Defendeu!')
        this.enemyTurn()
    }

    battleRun(): void {
        if (!this.battleState || this.battleState.phase !== 'action') return
        if (Math.random() < 0.5 + this.playerData.baseSpeed * 0.05) {
            this.battleState.messages.push('Fugiu!')
            this.battleState = null
        } else {
            this.battleState.messages.push('Não fugiu!')
            this.enemyTurn()
        }
    }

    private enemyTurn(): void {
        if (!this.battleState) return
        this.battleState.phase = 'enemy'
        setTimeout(() => {
            const m = this.battleState.monster
            const dmg = Math.max(1, m.data.attack + Math.floor(Math.random() * 4) - 1 - Math.floor(this.playerData.baseDefense * 0.3))
            this.playerData.hp = Math.max(0, this.playerData.hp - dmg)
            this.battleState.messages.push(`${m.data.name}: ${dmg}!`)
            if (this.playerData.hp <= 0) {
                this.playerData.dead = true
                this.playerData.respawnTimer = 10
                const goldLoss = Math.floor(this.playerData.gold * 0.2)
                this.playerData.gold = Math.max(0, this.playerData.gold - goldLoss)
                this.battleState.messages.push(`Morreu! -${goldLoss}g`)
                setTimeout(() => this.battleState = null, 2000)
                this.battleState.phase = 'defeat'
            } else {
                this.battleState.phase = 'action'
                this.battleState.turn++
            }
        }, 500)
    }

    private victory(): void {
        if (!this.battleState) return
        const m = this.battleState.monster
        const xp = m.data.experience
        const gold = Math.floor(Math.random() * 20) + 5
        this.playerData.xp += xp
        this.playerData.gold += gold

        // Loot
        for (const drop of m.data.loot) {
            if (Math.random() < drop.chance) {
                const count = drop.min && drop.max ? drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1)) : 1
                this.addItem(drop.itemId, count)
            }
        }

        this.battleState.messages.push(`${m.data.name} derrotado! +${xp}XP +${gold}g`)
        this.checkLevelUp()
        this.checkQuestProgress(m.type)
        this.battleState.phase = 'victory'
        setTimeout(() => this.battleState = null, 1500)
    }

    private checkLevelUp(): void {
        while (this.playerData.xp >= this.playerData.xpToLevel) {
            this.playerData.xp -= this.playerData.xpToLevel
            this.playerData.level++
            this.playerData.xpToLevel = Math.floor(50 * Math.pow(1.2, this.playerData.level - 1))
            this.playerData.maxHp += 10 + Math.floor(this.playerData.level * 0.5)
            this.playerData.maxMp += 5 + Math.floor(this.playerData.level * 0.3)
            this.playerData.hp = this.playerData.maxHp
            this.playerData.mp = this.playerData.maxMp
            this.playerData.baseAttack += 2
            this.playerData.baseDefense += 1
            this.addMessage(`⬆️ Nível ${this.playerData.level}!`, '#FFD700')
        }
    }

    private checkQuestProgress(killedMonster: string): void {
        for (const questId of this.playerData.activeQuests) {
            const quest = QUESTS[questId]
            if (quest && quest.objectives[0].type === 'kill' && quest.objectives[0].target === killedMonster) {
                this.playerData.questProgress[questId] = (this.playerData.questProgress[questId] || 0) + 1
                if (this.playerData.questProgress[questId] >= quest.objectives[0].count) {
                    this.completeQuest(questId)
                }
            }
        }
    }

    private completeQuest(questId: string): void {
        const quest = QUESTS[questId]
        if (!quest) return
        this.playerData.xp += quest.rewards.xp
        this.playerData.gold += quest.rewards.gold
        this.playerData.completedQuests.push(questId)
        this.playerData.activeQuests = this.playerData.activeQuests.filter(id => id !== questId)
        this.addMessage(`Quest "${quest.name}" completa! +${quest.rewards.xp}XP +${quest.rewards.gold}g`, '#FFD700')
        this.checkLevelUp()
    }

    acceptQuest(questId: string): void {
        const quest = QUESTS[questId]
        if (!quest) return
        if (this.playerData.activeQuests.includes(questId) || this.playerData.completedQuests.includes(questId)) return
        if (this.playerData.level < quest.level) return
        this.playerData.activeQuests.push(questId)
        this.playerData.questProgress[questId] = 0
        this.addMessage(`Quest "${quest.name}" aceita!`, '#4af')
    }

    // ============ INVENTORY ============
    addItem(itemId: string, count: number = 1): boolean {
        const item = ITEMS[itemId]
        if (!item) return false
        if (item.stackable) {
            const existing = this.playerData.inventory.find(i => i.itemId === itemId)
            if (existing) { existing.count += count; return true }
        }
        if (this.playerData.inventory.length >= 20) return false
        this.playerData.inventory.push({ itemId, count })
        return true
    }

    removeItem(itemId: string, count: number = 1): boolean {
        const idx = this.playerData.inventory.findIndex(i => i.itemId === itemId)
        if (idx === -1) return false
        if (this.playerData.inventory[idx].count <= count) this.playerData.inventory.splice(idx, 1)
        else this.playerData.inventory[idx].count -= count
        return true
    }

    // ============ MESSAGES ============
    addMessage(text: string, color: string = '#fff'): void {
        this.messages.push({ text, color, time: 4 })
        if (this.messages.length > 8) this.messages.shift()
    }

    // ============ MONSTERS ============
    private spawnMonsters(): void {
        this.monsters = []
        const spawns: Record<string, { type: string; x: number; y: number; count: number }[]> = {
            'thais': [{ type: 'rat', x: 20, y: 50, count: 5 }, { type: 'bug', x: 50, y: 10, count: 3 }],
            'forest': [{ type: 'spider', x: 20, y: 20, count: 6 }, { type: 'troll', x: 40, y: 40, count: 4 }],
            'dungeon': [{ type: 'skeleton', x: 30, y: 40, count: 8 }, { type: 'zombie', x: 20, y: 50, count: 6 }]
        }
        const list = spawns[this.playerData.currentMap] || []
        for (const sp of list) {
            const data = MONSTERS[sp.type]
            if (!data) continue
            for (let i = 0; i < sp.count; i++) {
                this.monsters.push({
                    id: this.nextMonsterId++,
                    type: sp.type,
                    data,
                    x: sp.x + (Math.random() - 0.5) * 6,
                    y: sp.y + (Math.random() - 0.5) * 6,
                    hp: data.health,
                    state: 'idle'
                })
            }
        }
    }

    // ============ SAVE/LOAD ============
    private saveSave(): void {
        try {
            localStorage.setItem('tibia_wa_save', JSON.stringify(this.playerData))
        } catch (e) {}
    }

    private loadSave(): void {
        try {
            const raw = localStorage.getItem('tibia_wa_save')
            if (raw) {
                const data = JSON.parse(raw)
                Object.assign(this.playerData, data)
            }
        } catch (e) {}
    }

    // ============ UPDATE (called from GameScene) ============
    update(time: number, delta: number): void {
        this.gameTime += delta / 1000

        // Update messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].time -= delta / 1000
            if (this.messages[i].time <= 0) this.messages.splice(i, 1)
        }

        // Respawn
        if (this.playerData.dead) {
            this.playerData.respawnTimer -= delta / 1000
            if (this.playerData.respawnTimer <= 0) {
                this.playerData.dead = false
                this.playerData.hp = Math.floor(this.playerData.maxHp * 0.5)
                this.playerData.mp = Math.floor(this.playerData.maxMp * 0.5)
                this.addMessage('Ressuscitou!', '#4f4')
            }
        }

        // Auto-save
        this.autoSaveTimer += delta / 1000
        if (this.autoSaveTimer >= 30) {
            this.autoSaveTimer = 0
            this.saveSave()
        }

        // Render
        this.render()
    }

    // ============ RENDER ============
    private render(): void {
        this.hudGraphics.clear()
        this.battleGraphics.clear()

        // Clear old text
        for (const t of this.textObjects) t.destroy()
        this.textObjects = []

        if (this.battleState) {
            this.renderBattle()
        } else {
            this.renderHUD()
            this.renderMessages()
            this.renderMonsters()
        }
    }

    private renderHUD(): void {
        const cam = this.scene.cameras.main
        const w = cam.width
        const sc = Math.min(w / 800, cam.height / 600)

        // Background panel
        this.hudGraphics.fillStyle(0x000000, 0.7)
        this.hudGraphics.fillRect(5, 5, 200 * sc, 70 * sc)
        this.hudGraphics.lineStyle(2, 0x8B7355)
        this.hudGraphics.strokeRect(5, 5, 200 * sc, 70 * sc)

        // HP bar
        const hpW = 186 * sc
        const hpH = 12 * sc
        this.hudGraphics.fillStyle(0x333333)
        this.hudGraphics.fillRect(12, 26 * sc, hpW, hpH)
        const hpRatio = this.playerData.hp / this.playerData.maxHp
        this.hudGraphics.fillStyle(hpRatio > 0.5 ? 0x00ff00 : hpRatio > 0.25 ? 0xffff00 : 0xff0000)
        this.hudGraphics.fillRect(12, 26 * sc, hpW * hpRatio, hpH)

        // MP bar
        const mpY = 26 * sc + hpH + 3
        this.hudGraphics.fillStyle(0x333333)
        this.hudGraphics.fillRect(12, mpY, hpW, hpH)
        const mpRatio = this.playerData.mp / this.playerData.maxMp
        this.hudGraphics.fillStyle(0x4488ff)
        this.hudGraphics.fillRect(12, mpY, hpW * mpRatio, hpH)

        // Text
        const text1 = this.scene.add.text(12, 20 * sc, `Level ${this.playerData.level}`, {
            fontSize: `${12 * sc}px monospace`, color: '#FFD700'
        })
        const text2 = this.scene.add.text(14, 26 * sc + hpH - 2, `HP: ${this.playerData.hp}/${this.playerData.maxHp}`, {
            fontSize: `${9 * sc}px monospace`, color: '#ffffff'
        })
        const text3 = this.scene.add.text(14, mpY + hpH - 2, `MP: ${this.playerData.mp}/${this.playerData.maxMp}`, {
            fontSize: `${9 * sc}px monospace`, color: '#ffffff'
        })
        const text4 = this.scene.add.text(12, mpY + hpH + 16 * sc, `💰${this.playerData.gold}g  📍${this.playerData.currentMap}`, {
            fontSize: `${10 * sc}px monospace`, color: '#FFD700'
        })
        this.textObjects.push(text1, text2, text3, text4)
    }

    private renderMessages(): void {
        const cam = this.scene.cameras.main
        const sc = Math.min(cam.width / 800, cam.height / 600)
        const my = cam.height - 100 * sc

        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i]
            const alpha = Math.min(1, msg.time)
            const text = this.scene.add.text(10, my + i * 16 * sc, msg.text, {
                fontSize: `${11 * sc}px monospace`,
                color: msg.color
            })
            text.setAlpha(alpha)
            this.textObjects.push(text)
        }
    }

    private renderMonsters(): void {
        // Monsters are rendered by the existing Phaser system
        // We just need to show health bars above them
    }

    private renderBattle(): void {
        const cam = this.scene.cameras.main
        const w = cam.width
        const h = cam.height
        const sc = Math.min(w / 800, h / 600)

        // Battle background
        this.battleGraphics.fillStyle(0x000000, 0.9)
        this.battleGraphics.fillRect(0, 0, w, h)

        const m = this.battleState.monster

        // Monster HP bar
        const hpW = 120 * sc
        this.battleGraphics.fillStyle(0x333333)
        this.battleGraphics.fillRect(w / 2 - hpW / 2, h * 0.35, hpW, 8)
        this.battleGraphics.fillStyle(0xff0000)
        this.battleGraphics.fillRect(w / 2 - hpW / 2, h * 0.35, hpW * (m.hp / m.maxHp), 8)

        // Action menu
        const actions = ['⚔️ Atacar', '🔥 Magia', '💚 Heal', '🛡️ Defend', '🏃 Fugir']
        const menuX = w * 0.05
        const menuY = h * 0.52
        const menuW = w * 0.3
        const ih = 36 * sc

        this.battleGraphics.fillStyle(0x140f0a, 0.95)
        this.battleGraphics.fillRect(menuX, menuY, menuW, ih * 5 + 10)
        this.battleGraphics.lineStyle(2, 0x8B7355)
        this.battleGraphics.strokeRect(menuX, menuY, menuW, ih * 5 + 10)

        for (let i = 0; i < 5; i++) {
            const iy = menuY + 5 + i * ih
            if (i === this.battleState.selected) {
                this.battleGraphics.fillStyle(0x8B7355)
                this.battleGraphics.fillRect(menuX + 2, iy, menuW - 4, ih - 2)
            }
            const text = this.scene.add.text(menuX + 15, iy + ih * 0.65, actions[i], {
                fontSize: `${12 * sc}px monospace`,
                color: i === this.battleState.selected ? '#ffffff' : '#cccccc'
            })
            this.textObjects.push(text)
        }

        // Monster name and HP
        const monsterText = this.scene.add.text(w / 2, h * 0.3, `${m.data.name} (${m.hp}/${m.maxHp})`, {
            fontSize: `${10 * sc}px monospace`, color: '#ffffff'
        }).setOrigin(0.5)
        this.textObjects.push(monsterText)

        // Player stats
        const playerText = this.scene.add.text(w / 2, h * 0.45, `HP:${this.playerData.hp}/${this.playerData.maxHp} MP:${this.playerData.mp}/${this.playerData.maxMp}`, {
            fontSize: `${10 * sc}px monospace`, color: '#4488ff'
        }).setOrigin(0.5)
        this.textObjects.push(playerText)

        // Battle messages
        const msgs = this.battleState.messages.slice(-6)
        for (let i = 0; i < msgs.length; i++) {
            const color = msgs[i].includes('derrotado') ? '#00ff00' : msgs[i].includes('Você') ? '#44aaff' : '#ff4444'
            const text = this.scene.add.text(w - 20, h * 0.52 + i * 18 * sc, msgs[i], {
                fontSize: `${10 * sc}px monospace`, color
            }).setOrigin(1, 0)
            this.textObjects.push(text)
        }

        // Turn counter
        const turnText = this.scene.add.text(w / 2, menuY - 10, `Turno ${this.battleState.turn}`, {
            fontSize: `${12 * sc}px monospace`, color: '#FFD700'
        }).setOrigin(0.5)
        this.textObjects.push(turnText)

        // Controls hint
        const hint = this.scene.add.text(w / 2, h - 15, '2:Atk 3:Mag 4:Heal 5:Def 6:Run | ↑↓ select | Space confirm', {
            fontSize: `${9 * sc}px monospace`, color: '#666666'
        }).setOrigin(0.5)
        this.textObjects.push(hint)
    }

    // ============ INPUT HANDLING ============
    handleKeyPress(key: string): void {
        if (key === 'i' || key === 'I') { this.showInventory = !this.showInventory; this.showStats = false; this.showQuests = false }
        if (key === 'c' || key === 'C') { this.showStats = !this.showStats; this.showInventory = false; this.showQuests = false }
        if (key === 'q' || key === 'Q') { this.showQuests = !this.showQuests; this.showInventory = false; this.showStats = false }
        if (key === 'Escape') { this.showInventory = false; this.showStats = false; this.showQuests = false; this.dialogData = null; this.showShop = null }

        if (key === '1') this.interactWithNPC()
        if (key === '2' && this.battleState?.phase === 'action') this.battleAttack()
        if (key === '3' && this.battleState?.phase === 'action') this.battleMagic()
        if (key === '4' && this.battleState?.phase === 'action') this.battleHeal()
        if (key === '5' && this.battleState?.phase === 'action') this.battleDefend()
        if (key === '6' && this.battleState?.phase === 'action') this.battleRun()
    }

    private interactWithNPC(): void {
        const npcs = this.getMapNPCs()
        const player = this.scene.CurrentPlayer
        if (!player) return

        for (const npc of npcs) {
            const dist = Math.hypot(player.x / 32 - npc.x, player.y / 32 - npc.y)
            if (dist < 3) {
                if (npc.quests) {
                    for (const qid of npc.quests) {
                        const quest = QUESTS[qid]
                        if (quest && this.playerData.level >= quest.level && !this.playerData.activeQuests.includes(qid) && !this.playerData.completedQuests.includes(qid)) {
                            this.acceptQuest(qid)
                            return
                        }
                    }
                }
                this.dialogData = { name: npc.name, text: npc.dialog[Math.floor(Math.random() * npc.dialog.length)] }
                return
            }
        }
    }

    // ============ PUBLIC GETTERS ============
    getPlayerData(): PlayerRPGData { return this.playerData }
    getBattleState(): any { return this.battleState }
    isBattleActive(): boolean { return this.battleState !== null }
}

// ============ GLOBAL INSTANCE ============
let tibiaInstance: TibiaIntegration | null = null

export function initTibiaIntegration(scene: GameScene): TibiaIntegration {
    tibiaInstance = new TibiaIntegration(scene)
    return tibiaInstance
}

export function getTibiaIntegration(): TibiaIntegration | null {
    return tibiaInstance
}
