import type { PlayerStats } from '../systems/PlayerStats'
import type { Inventory } from '../systems/Inventory'
import type { BattleSystem, BattleState } from '../systems/BattleSystem'
import type { QuestSystem } from '../systems/QuestSystem'
import { ITEMS } from '../data/items'

export class TibiaUI {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private showInventory = false
    private showStats = false
    private showBattleUI = false
    private showDialog = false
    private dialogName = ''
    private dialogText = ''
    private messages: { text: string; time: number; color: string }[] = []
    private questNotifications: { text: string; time: number }[] = []
    private tooltipItem: string | null = null
    private tooltipX = 0
    private tooltipY = 0
    private hoverSlot = -1
    private hoverAction = -1

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
    }

    addMessage(text: string, color = '#fff'): void {
        this.messages.push({ text, time: 4, color })
        if (this.messages.length > 8) this.messages.shift()
    }

    addQuestNotification(text: string): void {
        this.questNotifications.push({ text, time: 5 })
    }

    showDialogMessage(name: string, text: string): void {
        this.dialogName = name
        this.dialogText = text
        this.showDialog = true
    }

    dismissDialog(): void {
        this.showDialog = false
        this.dialogText = ''
        this.dialogName = ''
    }

    update(dt: number): void {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].time -= dt
            if (this.messages[i].time <= 0) this.messages.splice(i, 1)
        }
        for (let i = this.questNotifications.length - 1; i >= 0; i--) {
            this.questNotifications[i].time -= dt
            if (this.questNotifications[i].time <= 0) this.questNotifications.splice(i, 1)
        }
    }

    renderHUD(player: PlayerStats, currentMap: string): void {
        const w = this.canvas.width
        const h = this.canvas.height
        const scale = Math.min(w / 800, h / 600)

        // Top-left: Player info panel
        const panelW = 200 * scale
        const panelH = 80 * scale
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
        this.ctx.fillRect(5, 5, panelW, panelH)
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(5, 5, panelW, panelH)

        // Player name and level
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `bold ${12 * scale}px monospace`
        this.ctx.textAlign = 'left'
        this.ctx.fillText(`Level ${player.level}`, 12, 20 * scale)

        // HP Bar
        const barX = 12
        const barY = 28 * scale
        const barW = panelW - 14
        const barH = 14 * scale

        this.ctx.fillStyle = '#333'
        this.ctx.fillRect(barX, barY, barW, barH)
        const hpRatio = player.hp / player.maxHp
        this.ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00'
        this.ctx.fillRect(barX, barY, barW * hpRatio, barH)
        this.ctx.fillStyle = '#fff'
        this.ctx.font = `${10 * scale}px monospace`
        this.ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, barX + 4, barY + barH - 3)

        // MP Bar
        const mpBarY = barY + barH + 4
        this.ctx.fillStyle = '#333'
        this.ctx.fillRect(barX, mpBarY, barW, barH)
        const mpRatio = player.mp / player.maxMp
        this.ctx.fillStyle = '#4488ff'
        this.ctx.fillRect(barX, mpBarY, barW * mpRatio, barH)
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText(`MP: ${player.mp}/${player.maxMp}`, barX + 4, mpBarY + barH - 3)

        // XP Bar
        const xpBarY = mpBarY + barH + 4
        this.ctx.fillStyle = '#333'
        this.ctx.fillRect(barX, xpBarY, barW, 8 * scale)
        const xpRatio = player.xp / player.xpToLevel
        this.ctx.fillStyle = '#ffa500'
        this.ctx.fillRect(barX, xpBarY, barW * xpRatio, 8 * scale)

        // Gold
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `${11 * scale}px monospace`
        this.ctx.fillText(`Gold: ${player.gold}`, barX, xpBarY + 18 * scale)

        // Bottom-left: Messages
        const msgY = h - 120 * scale
        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i]
            const alpha = Math.min(1, msg.time)
            this.ctx.globalAlpha = alpha
            this.ctx.fillStyle = msg.color
            this.ctx.font = `${11 * scale}px monospace`
            this.ctx.fillText(msg.text, 10, msgY + i * 16 * scale)
        }
        this.ctx.globalAlpha = 1

        // Quest notifications (top-center)
        for (let i = 0; i < this.questNotifications.length; i++) {
            const notif = this.questNotifications[i]
            const alpha = Math.min(1, notif.time)
            this.ctx.globalAlpha = alpha
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
            const textW = this.ctx.measureText(notif.text).width + 20
            this.ctx.fillRect(w / 2 - textW / 2, 10 + i * 30, textW, 25)
            this.ctx.fillStyle = '#FFD700'
            this.ctx.font = `bold ${12 * scale}px monospace`
            this.ctx.textAlign = 'center'
            this.ctx.fillText(notif.text, w / 2, 27 + i * 30)
            this.ctx.textAlign = 'left'
        }
        this.ctx.globalAlpha = 1

        // Map name (top-right)
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)'
        const mapNameW = this.ctx.measureText(currentMap.toUpperCase()).width + 20
        this.ctx.fillRect(w - mapNameW - 10, 5, mapNameW, 20)
        this.ctx.fillStyle = '#aaa'
        this.ctx.font = `${11 * scale}px monospace`
        this.ctx.textAlign = 'right'
        this.ctx.fillText(currentMap.toUpperCase(), w - 20, 19)
        this.ctx.textAlign = 'left'
    }

    renderBattleUI(state: BattleState, player: PlayerStats, inventory: Inventory): void {
        const w = this.canvas.width
        const h = this.canvas.height
        const scale = Math.min(w / 800, h / 600)

        // Battle background
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)'
        this.ctx.fillRect(0, 0, w, h)

        // Monsters
        const monsterArea = { x: w * 0.1, y: h * 0.1, w: w * 0.8, h: h * 0.35 }
        for (let i = 0; i < state.monsters.length; i++) {
            const m = state.monsters[i]
            const mx = monsterArea.x + (i * 120 + 60) * scale
            const my = monsterArea.y + monsterArea.h * 0.5

            // Monster body (pixel art style)
            if (m.state !== 'dead') {
                this.ctx.fillStyle = this.getMonsterColor(m.data.id)
                this.ctx.fillRect(mx - 20 * scale, my - 30 * scale, 40 * scale, 50 * scale)
                // Eyes
                this.ctx.fillStyle = '#ff0'
                this.ctx.fillRect(mx - 12 * scale, my - 20 * scale, 6 * scale, 6 * scale)
                this.ctx.fillRect(mx + 6 * scale, my - 20 * scale, 6 * scale, 6 * scale)

                // HP bar
                const hpBarW = 60 * scale
                const hpBarH = 6 * scale
                this.ctx.fillStyle = '#333'
                this.ctx.fillRect(mx - hpBarW / 2, my + 28 * scale, hpBarW, hpBarH)
                this.ctx.fillStyle = '#f00'
                this.ctx.fillRect(mx - hpBarW / 2, my + 28 * scale, hpBarW * (m.currentHp / m.maxHp), hpBarH)

                // Name
                this.ctx.fillStyle = '#fff'
                this.ctx.font = `${10 * scale}px monospace`
                this.ctx.textAlign = 'center'
                this.ctx.fillText(m.data.name, mx, my + 45 * scale)
            } else {
                this.ctx.fillStyle = '#666'
                this.ctx.font = `${14 * scale}px monospace`
                this.ctx.textAlign = 'center'
                this.ctx.fillText('💀', mx, my)
            }
        }
        this.ctx.textAlign = 'left'

        // Player area
        const playerY = h * 0.55
        // Player sprite
        this.ctx.fillStyle = '#4488ff'
        this.ctx.fillRect(w * 0.1 - 15 * scale, playerY - 20 * scale, 30 * scale, 40 * scale)
        this.ctx.fillStyle = '#fff'
        this.ctx.font = `${10 * scale}px monospace`
        this.ctx.fillText('Lv.' + player.level, w * 0.1 - 15 * scale, playerY + 30 * scale)

        // Action menu
        const actions = ['Atacar', 'Magia', 'Item', 'Defender', 'Fugir']
        const menuX = w * 0.35
        const menuY = h * 0.5
        const menuW = w * 0.3
        const itemH = 32 * scale

        this.ctx.fillStyle = 'rgba(20,15,10,0.9)'
        this.ctx.fillRect(menuX, menuY, menuW, itemH * actions.length + 10)
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.strokeRect(menuX, menuY, menuW, itemH * actions.length + 10)

        for (let i = 0; i < actions.length; i++) {
            const iy = menuY + 5 + i * itemH
            if (i === state.selectedAction) {
                this.ctx.fillStyle = '#8B7355'
                this.ctx.fillRect(menuX + 2, iy, menuW - 4, itemH - 2)
            }
            this.ctx.fillStyle = i === state.selectedAction ? '#fff' : '#ccc'
            this.ctx.font = `${12 * scale}px monospace`
            this.ctx.fillText(actions[i], menuX + 15, iy + itemH * 0.65)
        }

        // Battle messages
        const msgStartY = h * 0.5
        const maxMsgs = 5
        const recentMsgs = state.messages.slice(-maxMsgs)
        for (let i = 0; i < recentMsgs.length; i++) {
            this.ctx.fillStyle = recentMsgs[i].includes('derrotado') ? '#0f0' :
                recentMsgs[i].includes('Você') ? '#4af' : '#f44'
            this.ctx.font = `${10 * scale}px monospace`
            this.ctx.fillText(recentMsgs[i], w * 0.7, msgStartY + i * 16 * scale)
        }

        // Phase indicator
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `bold ${14 * scale}px monospace`
        this.ctx.textAlign = 'center'
        this.ctx.fillText(`Turno ${state.turnCount}`, w / 2, menuY - 10)
        this.ctx.textAlign = 'left'
    }

    private getMonsterColor(id: string): string {
        const colors: Record<string, string> = {
            rat: '#8B7355', bug: '#556B2F', snake: '#228B22', spider: '#333',
            troll: '#6B8E23', goblin: '#556B2F', orc: '#8B4513', orc_warrior: '#A0522D',
            wolf: '#696969', skeleton: '#DCDCDC', zombie: '#556B2F',
            minotaur: '#8B0000', minotaur_guard: '#B22222', dark_knight: '#2F4F4F',
            dragon: '#FF4500', dragon_lord: '#DC143C', hydra: '#006400',
            demon: '#8B0000', archdemon: '#4B0082'
        }
        return colors[id] || '#666'
    }

    renderInventoryPanel(player: PlayerStats, inventory: Inventory): void {
        if (!this.showInventory) return

        const w = this.canvas.width
        const h = this.canvas.height
        const scale = Math.min(w / 800, h / 600)

        // Background panel
        const panelW = Math.min(350 * scale, w * 0.8)
        const panelH = Math.min(450 * scale, h * 0.85)
        const panelX = (w - panelW) / 2
        const panelY = (h - panelH) / 2

        this.ctx.fillStyle = 'rgba(20,15,10,0.95)'
        this.ctx.fillRect(panelX, panelY, panelW, panelH)
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 3
        this.ctx.strokeRect(panelX, panelY, panelW, panelH)

        // Title
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `bold ${14 * scale}px monospace`
        this.ctx.textAlign = 'center'
        this.ctx.fillText('INVENTÁRIO', panelX + panelW / 2, panelY + 22)

        // Weight
        this.ctx.fillStyle = '#aaa'
        this.ctx.font = `${10 * scale}px monospace`
        this.ctx.fillText(`${inventory.currentWeight.toFixed(1)} / ${inventory.maxWeight} oz`, panelX + panelW / 2, panelY + 38)

        // Items grid
        const cols = 5
        const slotSize = 36 * scale
        const startX = panelX + (panelW - cols * slotSize) / 2
        const startY = panelY + 50

        for (let i = 0; i < inventory.items.length && i < 20; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)
            const sx = startX + col * slotSize
            const sy = startY + row * slotSize

            this.ctx.fillStyle = i === this.hoverSlot ? '#5a4a3a' : '#3a2a1a'
            this.ctx.fillRect(sx, sy, slotSize - 2, slotSize - 2)
            this.ctx.strokeStyle = '#6a5a4a'
            this.ctx.strokeRect(sx, sy, slotSize - 2, slotSize - 2)

            const slot = inventory.items[i]
            const item = ITEMS[slot.itemId]
            if (item) {
                this.ctx.fillStyle = this.getItemColor(item.category)
                this.ctx.fillRect(sx + 4, sy + 4, slotSize - 10, slotSize - 10)
                this.ctx.fillStyle = '#fff'
                this.ctx.font = `${8 * scale}px monospace`
                this.ctx.textAlign = 'center'
                this.ctx.fillText(item.name.substring(0, 3), sx + slotSize / 2 - 1, sy + slotSize / 2 + 3)

                if (slot.count > 1) {
                    this.ctx.fillStyle = '#FFD700'
                    this.ctx.fillText(`${slot.count}`, sx + slotSize - 8, sy + slotSize - 4)
                }
            }
        }
        this.ctx.textAlign = 'left'

        // Equipment slots
        const equipY = startY + Math.ceil(inventory.items.length / cols) * slotSize + 20
        this.ctx.fillStyle = '#8B7355'
        this.ctx.font = `bold ${11 * scale}px monospace`
        this.ctx.fillText('EQUIPAMENTO:', panelX + 15, equipY)

        const equipSlots = ['helmet', 'armor', 'legs', 'boots', 'weapon', 'shield', 'ring', 'amulet'] as const
        for (let i = 0; i < equipSlots.length; i++) {
            const slot = equipSlots[i]
            const itemId = player.equipment[slot]
            const ex = panelX + 15 + (i % 4) * 80 * scale
            const ey = equipY + 15 + Math.floor(i / 4) * 35 * scale

            this.ctx.fillStyle = '#2a1a0a'
            this.ctx.fillRect(ex, ey, 70 * scale, 28 * scale)
            this.ctx.strokeStyle = '#6a5a4a'
            this.ctx.strokeRect(ex, ey, 70 * scale, 28 * scale)

            this.ctx.fillStyle = '#888'
            this.ctx.font = `${8 * scale}px monospace`
            this.ctx.fillText(slot.toUpperCase(), ex + 4, ey + 12)

            if (itemId) {
                const item = ITEMS[itemId]
                if (item) {
                    this.ctx.fillStyle = this.getItemColor(item.category)
                    this.ctx.fillText(item.name, ex + 4, ey + 24)
                }
            }
        }

        // Tooltip
        if (this.tooltipItem) {
            const item = ITEMS[this.tooltipItem]
            if (item) {
                const tipW = 180 * scale
                const tipH = 80 * scale
                let tipX = this.tooltipX + 10
                let tipY = this.tooltipY - tipH
                if (tipX + tipW > w) tipX = this.tooltipX - tipW - 10
                if (tipY < 0) tipY = this.tooltipY + 10

                this.ctx.fillStyle = 'rgba(10,5,0,0.95)'
                this.ctx.fillRect(tipX, tipY, tipW, tipH)
                this.ctx.strokeStyle = '#8B7355'
                this.ctx.strokeRect(tipX, tipY, tipW, tipH)

                this.ctx.fillStyle = '#FFD700'
                this.ctx.font = `bold ${10 * scale}px monospace`
                this.ctx.fillText(item.name, tipX + 8, tipY + 15)
                this.ctx.fillStyle = '#ccc'
                this.ctx.font = `${9 * scale}px monospace`
                this.ctx.fillText(item.description, tipX + 8, tipY + 30)
                if (item.attack) this.ctx.fillText(`ATK: +${item.attack}`, tipX + 8, tipY + 45)
                if (item.defense) this.ctx.fillText(`DEF: +${item.defense}`, tipX + 8 + 70 * scale, tipY + 45)
                if (item.hp) this.ctx.fillText(`HP: +${item.hp}`, tipX + 8, tipY + 58)
                if (item.mp) this.ctx.fillText(`MP: +${item.mp}`, tipX + 8 + 70 * scale, tipY + 58)
                if (item.sellPrice) this.ctx.fillText(`Vende: ${item.sellPrice}g`, tipX + 8, tipY + 72)
            }
        }
    }

    renderStatsPanel(player: PlayerStats): void {
        if (!this.showStats) return

        const w = this.canvas.width
        const h = this.canvas.height
        const scale = Math.min(w / 800, h / 600)

        const panelW = Math.min(300 * scale, w * 0.7)
        const panelH = Math.min(350 * scale, h * 0.7)
        const panelX = (w - panelW) / 2
        const panelY = (h - panelH) / 2

        this.ctx.fillStyle = 'rgba(20,15,10,0.95)'
        this.ctx.fillRect(panelX, panelY, panelW, panelH)
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 3
        this.ctx.strokeRect(panelX, panelY, panelW, panelH)

        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = `bold ${14 * scale}px monospace`
        this.ctx.textAlign = 'center'
        this.ctx.fillText('ATRIBUTOS', panelX + panelW / 2, panelY + 25)

        const stats = [
            { label: 'Level', value: player.level.toString(), color: '#FFD700' },
            { label: 'HP', value: `${player.hp}/${player.maxHp}`, color: '#0f0' },
            { label: 'MP', value: `${player.mp}/${player.maxMp}`, color: '#4488ff' },
            { label: 'XP', value: `${player.xp}/${player.xpToLevel}`, color: '#ffa500' },
            { label: 'Ataque', value: player.totalAttack.toString(), color: '#f44' },
            { label: 'Defesa', value: player.totalDefense.toString(), color: '#4af' },
            { label: 'Velocidade', value: player.totalSpeed.toString(), color: '#0f0' },
            { label: 'Magic Level', value: player.totalMagicLevel.toString(), color: '#a0f' },
            { label: 'Sorte', value: player.luck.toString(), color: '#ff0' },
            { label: 'Ouro', value: `${player.gold}g`, color: '#FFD700' }
        ]

        for (let i = 0; i < stats.length; i++) {
            const sy = panelY + 45 + i * 22 * scale
            this.ctx.fillStyle = '#aaa'
            this.ctx.font = `${10 * scale}px monospace`
            this.ctx.textAlign = 'left'
            this.ctx.fillText(stats[i].label + ':', panelX + 15, sy)
            this.ctx.fillStyle = stats[i].color
            this.ctx.textAlign = 'right'
            this.ctx.fillText(stats[i].value, panelX + panelW - 15, sy)
        }

        // Skills
        const skillsY = panelY + 45 + stats.length * 22 * scale + 15
        this.ctx.fillStyle = '#8B7355'
        this.ctx.font = `bold ${11 * scale}px monospace`
        this.ctx.textAlign = 'left'
        this.ctx.fillText('SKILLS:', panelX + 15, skillsY)

        const skillEntries = Object.entries(player.skills)
        for (let i = 0; i < skillEntries.length; i++) {
            const [name, value] = skillEntries[i]
            const sy = skillsY + 18 + i * 18 * scale
            this.ctx.fillStyle = '#aaa'
            this.ctx.font = `${9 * scale}px monospace`
            this.ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1) + ':', panelX + 20, sy)
            this.ctx.fillStyle = '#FFD700'
            this.ctx.textAlign = 'right'
            this.ctx.fillText(value.toString(), panelX + panelW - 20, sy)
            this.ctx.textAlign = 'left'
        }
    }

    private getItemColor(category: string): string {
        const colors: Record<string, string> = {
            weapon: '#f44', armor: '#44f', helmet: '#4af', legs: '#4fa',
            boots: '#af4', shield: '#44a', ring: '#fa4', amulet: '#f4a',
            consumable: '#4f4', quest: '#ff4', money: '#FFD700', other: '#aaa'
        }
        return colors[category] || '#aaa'
    }

    handleMouseMove(x: number, y: number, player: PlayerStats, inventory: Inventory): void {
        this.tooltipX = x
        this.tooltipY = y
        this.hoverSlot = -1
        this.tooltipItem = null

        if (!this.showInventory) return

        const w = this.canvas.width
        const h = this.canvas.height
        const scale = Math.min(w / 800, h / 600)
        const panelW = Math.min(350 * scale, w * 0.8)
        const panelX = (w - panelW) / 2
        const cols = 5
        const slotSize = 36 * scale
        const startX = panelX + (panelW - cols * slotSize) / 2
        const startY = (h - Math.min(450 * scale, h * 0.85)) / 2 + 50

        for (let i = 0; i < inventory.items.length && i < 20; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)
            const sx = startX + col * slotSize
            const sy = startY + row * slotSize
            if (x >= sx && x <= sx + slotSize && y >= sy && y <= sy + slotSize) {
                this.hoverSlot = i
                this.tooltipItem = inventory.items[i].itemId
                break
            }
        }
    }

    handleClick(x: number, y: number, player: PlayerStats, inventory: Inventory, battle: BattleSystem | null): boolean {
        if (this.showDialog) {
            this.dismissDialog()
            return true
        }

        if (this.showStats) {
            this.showStats = false
            return true
        }

        if (this.showInventory) {
            this.showInventory = false
            return true
        }

        if (this.showBattleUI && battle?.state) {
            const w = this.canvas.width
            const h = this.canvas.height
            const scale = Math.min(w / 800, h / 600)
            const menuX = w * 0.35
            const menuY = h * 0.5
            const menuW = w * 0.3
            const itemH = 32 * scale
            const actions = ['attack', 'skill', 'item', 'defend', 'run']

            for (let i = 0; i < 5; i++) {
                const iy = menuY + 5 + i * itemH
                if (x >= menuX && x <= menuX + menuW && y >= iy && y <= iy + itemH) {
                    battle.state.selectedAction = i
                    return true
                }
            }
        }

        return false
    }

    toggleInventory(): void {
        this.showInventory = !this.showInventory
        this.showStats = false
    }

    toggleStats(): void {
        this.showStats = !this.showStats
        this.showInventory = false
    }

    isMenuOpen(): boolean {
        return this.showInventory || this.showStats || this.showDialog
    }
}
