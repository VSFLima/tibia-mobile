import type { PlayerStats } from './PlayerStats'
import type { MonsterData } from '../data/types'

export interface BattleMonster {
    data: MonsterData
    currentHp: number
    maxHp: number
    lastAttackTime: number
    aggroTimer: number
    state: 'idle' | 'chasing' | 'attacking' | 'fleeing' | 'dead'
}

export interface BattleState {
    phase: 'intro' | 'action' | 'skill' | 'item' | 'enemy_turn' | 'victory' | 'defeat'
    selectedAction: number
    selectedSkill: number
    selectedItem: number
    monsters: BattleMonster[]
    playerHp: number
    playerMaxHp: number
    playerMp: number
    playerMaxMp: number
    turnCount: number
    messages: string[]
}

export interface BattleResult {
    won: boolean
    xp: number
    gold: number
    loot: string[]
}

export class BattleSystem {
    state: BattleState | null = null
    private encounterRate = 0.08
    private currentMap = 'thais'
    private lastMonsterTypes: string[] = []

    setMap(mapId: string): void {
        this.currentMap = mapId
        const mapEncounterRates: Record<string, number> = {
            'thais': 0.05,
            'forest': 0.1,
            'dungeon': 0.15,
            'dragon_lair': 0.2,
            'demon_hall': 0.25
        }
        this.encounterRate = mapEncounterRates[mapId] ?? 0.08
    }

    getEncounterRate(): number {
        return this.encounterRate
    }

    startBattle(player: PlayerStats, monsters: MonsterData[]): boolean {
        if (monsters.length === 0) return false

        const battleMonsters: BattleMonster[] = monsters.map(m => ({
            data: m,
            currentHp: m.health,
            maxHp: m.health,
            lastAttackTime: 0,
            aggroTimer: 0,
            state: 'idle' as const
        }))

        this.state = {
            phase: 'intro',
            selectedAction: 0,
            selectedSkill: 0,
            selectedItem: 0,
            monsters: battleMonsters,
            playerHp: player.hp,
            playerMaxHp: player.maxHp,
            playerMp: player.mp,
            playerMaxMp: player.maxMp,
            turnCount: 0,
            messages: [`Um ${monsters[0].name} selvagem apareceu!`]
        }

        this.lastMonsterTypes = monsters.map(m => m.id)
        return true
    }

    update(dt: number, player: PlayerStats): BattleResult | null {
        if (!this.state) return null

        if (this.state.phase === 'intro') {
            this.state.phase = 'action'
            this.state.turnCount++
            return null
        }

        if (this.state.phase === 'enemy_turn') {
            this.processEnemyTurn(dt, player)
            return null
        }

        if (this.state.phase === 'victory') {
            return this.calculateReward()
        }

        if (this.state.phase === 'defeat') {
            return { won: false, xp: 0, gold: 0, loot: [] }
        }

        return null
    }

    handleAction(action: string, player: PlayerStats, skill?: string, item?: { hp?: number; mp?: number }): void {
        if (!this.state || this.state.phase === 'enemy_turn') return

        switch (action) {
            case 'attack':
                this.playerAttack(player)
                break
            case 'skill':
                if (skill) this.playerSkill(player, skill)
                break
            case 'item':
                if (item) this.playerUseItem(player, item)
                break
            case 'defend':
                this.playerDefend()
                break
            case 'run':
                this.playerRun()
                break
        }

        if (this.state.phase === 'action' || this.state.phase === 'skill' || this.state.phase === 'item') {
            this.state.phase = 'enemy_turn'
        }
    }

    private playerAttack(player: PlayerStats): void {
        if (!this.state) return
        const target = this.state.monsters.find(m => m.state !== 'dead')
        if (!target) return

        const baseDamage = player.totalAttack
        const variance = Math.floor(Math.random() * 5) - 2
        const damage = Math.max(1, baseDamage + variance - Math.floor(target.data.defense * 0.3))

        target.currentHp -= damage
        this.state.messages.push(`Você atacou ${target.data.name} causando ${damage} de dano!`)

        if (target.currentHp <= 0) {
            target.currentHp = 0
            target.state = 'dead'
            this.state.messages.push(`${target.data.name} foi derrotado!`)

            const allDead = this.state.monsters.every(m => m.state === 'dead')
            if (allDead) {
                this.state.phase = 'victory'
            }
        }
    }

    private playerSkill(player: PlayerStats, skill: string): void {
        if (!this.state) return
        const manaCost = this.getSkillManaCost(skill)
        if (player.mp < manaCost) {
            this.state.messages.push('Mana insuficiente!')
            return
        }

        player.mp -= manaCost
        this.state.playerMp = player.mp

        const target = this.state.monsters.find(m => m.state !== 'dead')
        if (!target) return

        const ml = player.totalMagicLevel
        let damage = 0

        switch (skill) {
            case 'fire_wave':
                damage = 20 + ml * 8 + Math.floor(Math.random() * 20)
                break
            case 'energy_wave':
                damage = 25 + ml * 10 + Math.floor(Math.random() * 25)
                break
            case 'ice_wave':
                damage = 22 + ml * 9 + Math.floor(Math.random() * 22)
                break
            case 'holy_smite':
                damage = 30 + ml * 12 + Math.floor(Math.random() * 30)
                break
            case 'death_strike':
                damage = 35 + ml * 15 + Math.floor(Math.random() * 35)
                break
            default:
                damage = 10 + ml * 5
        }

        target.currentHp -= damage
        this.state.messages.push(`Você usou ${skill} causando ${damage} de dano!`)

        if (target.currentHp <= 0) {
            target.currentHp = 0
            target.state = 'dead'
            this.state.messages.push(`${target.data.name} foi derrotado!`)

            const allDead = this.state.monsters.every(m => m.state === 'dead')
            if (allDead) {
                this.state.phase = 'victory'
            }
        }
    }

    private playerUseItem(player: PlayerStats, item: { hp?: number; mp?: number }): void {
        if (!this.state) return

        if (item.hp) {
            const healed = Math.min(item.hp, this.state.playerMaxHp - this.state.playerHp)
            this.state.playerHp += healed
            player.hp = this.state.playerHp
            this.state.messages.push(`Você recuperou ${healed} HP!`)
        }
        if (item.mp) {
            const healed = Math.min(item.mp, this.state.playerMaxMp - this.state.playerMp)
            this.state.playerMp += healed
            player.mp = this.state.playerMp
            this.state.messages.push(`Você recuperou ${healed} MP!`)
        }
    }

    private playerDefend(): void {
        if (!this.state) return
        this.state.messages.push('Você se defendeu! Dano reduzido no próximo turno.')
    }

    private playerRun(): void {
        if (!this.state) return
        if (this.state.monsters.length > 1) {
            this.state.messages.push('Não foi possível fugir!')
            return
        }
        const chance = 0.5 + (player.totalSpeed * 0.05)
        if (Math.random() < chance) {
            this.state.messages.push('Você fugiu da batalha!')
            this.state = null
        } else {
            this.state.messages.push('Não foi possível fugir!')
        }
    }

    private processEnemyTurn(dt: number, player: PlayerStats): void {
        if (!this.state) return

        for (const monster of this.state.monsters) {
            if (monster.state === 'dead') continue

            const baseDamage = monster.data.attack
            const variance = Math.floor(Math.random() * 4) - 1
            const damage = Math.max(1, baseDamage + variance - Math.floor(player.totalDefense * 0.3))

            this.state.playerHp = Math.max(0, this.state.playerHp - damage)
            player.hp = this.state.playerHp
            this.state.messages.push(`${monster.data.name} atacou causando ${damage} de dano!`)

            if (this.state.playerHp <= 0) {
                this.state.phase = 'defeat'
                this.state.messages.push('Você foi derrotado!')
                return
            }
        }

        this.state.phase = 'action'
    }

    private getSkillManaCost(skill: string): number {
        const costs: Record<string, number> = {
            'fire_wave': 15,
            'energy_wave': 20,
            'ice_wave': 18,
            'holy_smite': 25,
            'death_strike': 30
        }
        return costs[skill] ?? 10
    }

    private calculateReward(): BattleResult {
        if (!this.state) return { won: false, xp: 0, gold: 0, loot: [] }

        let totalXp = 0
        let totalGold = 0
        const loot: string[] = []

        for (const monster of this.state.monsters) {
            totalXp += monster.data.experience
            for (const drop of monster.data.loot) {
                if (Math.random() < drop.chance) {
                    const count = drop.min && drop.max
                        ? drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1))
                        : 1
                    for (let i = 0; i < count; i++) {
                        loot.push(drop.itemId)
                    }
                }
            }
            totalGold += Math.floor(Math.random() * 20) + 5
        }

        return { won: true, xp: totalXp, gold: totalGold, loot }
    }

    getLastMonsterTypes(): string[] {
        return this.lastMonsterTypes
    }

    isBattleActive(): boolean {
        return this.state !== null && this.state.phase !== 'victory' && this.state.phase !== 'defeat'
    }
}
