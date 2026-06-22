import type { Direction, EquipmentSlot, SaveData, SpellElement } from '../data/types'
import { ITEMS } from '../data/items'

export class PlayerStats {
    x = 15
    y = 15
    level = 1
    xp = 0
    xpToLevel = 50
    gold = 100
    hp = 100
    maxHp = 100
    mp = 30
    maxMp = 30
    baseAttack = 8
    baseDefense = 4
    baseSpeed = 5
    magicLevel = 1
    luck = 2
    direction: Direction = 'down'
    moving = false
    moveTimer = 0
    moveSpeed = 0.15
    dead = false
    respawnTimer = 0

    skills: Record<string, number> = {
        sword: 10,
        axe: 10,
        club: 10,
        distance: 10,
        shielding: 10,
        magic: 10,
        fishing: 10
    }

    equipment: Partial<Record<EquipmentSlot, string>> = {}
    lastDirection: Direction = 'down'

    get totalAttack(): number {
        let atk = this.baseAttack
        for (const itemId of Object.values(this.equipment)) {
            if (itemId) {
                const item = ITEMS[itemId]
                if (item?.attack) atk += item.attack
            }
        }
        return atk
    }

    get totalDefense(): number {
        let def = this.baseDefense
        for (const itemId of Object.values(this.equipment)) {
            if (itemId) {
                const item = ITEMS[itemId]
                if (item?.defense) def += item.defense
            }
        }
        return def
    }

    get totalSpeed(): number {
        let spd = this.baseSpeed
        for (const itemId of Object.values(this.equipment)) {
            if (itemId) {
                const item = ITEMS[itemId]
                if (item?.speed) spd += item.speed
            }
        }
        return spd
    }

    get totalMagicLevel(): number {
        let ml = this.magicLevel
        for (const itemId of Object.values(this.equipment)) {
            if (itemId) {
                const item = ITEMS[itemId]
                if (item?.magicLevel) ml += item.magicLevel
            }
        }
        return ml
    }

    get elementalDefense(): Record<SpellElement, number> {
        const res: Record<SpellElement, number> = {
            physical: 0, fire: 0, ice: 0, energy: 0, earth: 0, holy: 0, death: 0
        }
        for (const itemId of Object.values(this.equipment)) {
            if (itemId) {
                const item = ITEMS[itemId]
                if (item?.elementalDefense) {
                    for (const [element, value] of Object.entries(item.elementalDefense)) {
                        res[element as SpellElement] = (res[element as SpellElement] ?? 0) + (value ?? 0)
                    }
                }
            }
        }
        return res
    }

    takeDamage(amount: number): number {
        if (this.dead) return 0
        const mitigated = Math.max(1, amount - Math.floor(this.totalDefense * 0.5))
        const finalDamage = Math.max(1, mitigated - Math.floor(Math.random() * 3))
        this.hp = Math.max(0, this.hp - finalDamage)
        if (this.hp <= 0) {
            this.die()
        }
        return finalDamage
    }

    heal(amount: number): number {
        const healed = Math.min(amount, this.maxHp - this.hp)
        this.hp += healed
        return healed
    }

    healMana(amount: number): number {
        const healed = Math.min(amount, this.maxMp - this.mp)
        this.mp += healed
        return healed
    }

    useMana(amount: number): boolean {
        if (this.mp < amount) return false
        this.mp -= amount
        return true
    }

    gainXp(amount: number): number {
        this.xp += amount
        let levelsGained = 0
        while (this.xp >= this.xpToLevel) {
            this.xp -= this.xpToLevel
            this.level++
            levelsGained++
            this.xpToLevel = Math.floor(50 * Math.pow(1.2, this.level - 1))
            this.maxHp += 10 + Math.floor(this.level * 0.5)
            this.maxMp += 5 + Math.floor(this.level * 0.3)
            this.hp = this.maxHp
            this.mp = this.maxMp
            this.baseAttack += 2
            this.baseDefense += 1
            this.baseSpeed += 0.5
        }
        return levelsGained
    }

    die(): void {
        this.dead = true
        this.respawnTimer = 10
        this.hp = 0
        this.mp = 0
    }

    respawn(): void {
        this.dead = false
        this.hp = Math.floor(this.maxHp * 0.5)
        this.mp = Math.floor(this.maxMp * 0.5)
        this.respawnTimer = 0
        this.x = 15
        this.y = 15
    }

    equip(itemId: string, slot: EquipmentSlot): string | null {
        const item = ITEMS[itemId]
        if (!item) return null
        const oldItemId = this.equipment[slot] || null
        this.equipment[slot] = itemId
        return oldItemId
    }

    unequip(slot: EquipmentSlot): string | null {
        const oldItemId = this.equipment[slot] || null
        delete this.equipment[slot]
        return oldItemId
    }

    getSaveData(): SaveData['player'] {
        return {
            x: this.x, y: this.y, level: this.level, xp: this.xp, xpToLevel: this.xpToLevel,
            gold: this.gold, hp: this.hp, maxHp: this.maxHp, mp: this.mp, maxMp: this.maxMp,
            baseAttack: this.baseAttack, baseDefense: this.baseDefense, baseSpeed: this.baseSpeed,
            magicLevel: this.magicLevel, direction: this.direction, skills: { ...this.skills }
        }
    }

    loadSaveData(data: SaveData['player']): void {
        this.x = data.x ?? 15
        this.y = data.y ?? 15
        this.level = data.level ?? 1
        this.xp = data.xp ?? 0
        this.xpToLevel = data.xpToLevel ?? 50
        this.gold = data.gold ?? 100
        this.hp = data.hp ?? 100
        this.maxHp = data.maxHp ?? 100
        this.mp = data.mp ?? 30
        this.maxMp = data.maxMp ?? 30
        this.baseAttack = data.baseAttack ?? 8
        this.baseDefense = data.baseDefense ?? 4
        this.baseSpeed = data.baseSpeed ?? 5
        this.magicLevel = data.magicLevel ?? 1
        this.direction = (data.direction as Direction) ?? 'down'
        this.skills = data.skills ?? this.skills
    }

    update(dt: number): void {
        if (this.dead) {
            this.respawnTimer -= dt
            if (this.respawnTimer <= 0) {
                this.respawn()
            }
        }
    }
}
