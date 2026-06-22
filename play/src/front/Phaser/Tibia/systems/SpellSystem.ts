import type { PlayerStats } from './PlayerStats'

export type SpellElement = 'physical' | 'fire' | 'ice' | 'energy' | 'earth' | 'holy' | 'death'

export interface SpellData {
    id: string
    name: string
    description: string
    element: SpellElement
    manaCost: number
    requiredLevel: number
    requiredMagicLevel: number
    cooldown: number
    baseDamage: number
    magicScaling: number
    aoe: boolean
    aoeTargets?: number
    selfTarget?: boolean
    healAmount?: number
    icon?: string
}

export interface SpellSlot {
    spellId: string | null
    cooldownRemaining: number
}

export const SPELLS: Record<string, SpellData> = {
    // === FIRE SPELLS ===
    'fire_wave': {
        id: 'fire_wave', name: 'Fire Wave', description: 'Uma onda de fogo que queima todos os inimigos à frente.',
        element: 'fire', manaCost: 15, requiredLevel: 1, requiredMagicLevel: 10, cooldown: 2,
        baseDamage: 20, magicScaling: 8, aoe: true, aoeTargets: 3
    },
    'fireball': {
        id: 'fireball', name: 'Fireball', description: 'Uma bola de fogo explosiva.',
        element: 'fire', manaCost: 25, requiredLevel: 15, requiredMagicLevel: 30, cooldown: 4,
        baseDamage: 45, magicScaling: 15, aoe: true, aoeTargets: 5
    },
    'flamestrike': {
        id: 'flamestrike', name: 'Flamestrike', description: 'Um golpe de chamas devastador.',
        element: 'fire', manaCost: 40, requiredLevel: 30, requiredMagicLevel: 50, cooldown: 6,
        baseDamage: 80, magicScaling: 25, aoe: false
    },
    'meteor': {
        id: 'meteor', name: 'Meteor', description: 'Invoca um meteoro de fogo do céu.',
        element: 'fire', manaCost: 65, requiredLevel: 55, requiredMagicLevel: 70, cooldown: 10,
        baseDamage: 150, magicScaling: 40, aoe: true, aoeTargets: 8
    },

    // === ICE SPELLS ===
    'ice_wave': {
        id: 'ice_wave', name: 'Ice Wave', description: 'Uma onda de gelo que congela os inimigos.',
        element: 'ice', manaCost: 18, requiredLevel: 5, requiredMagicLevel: 15, cooldown: 2,
        baseDamage: 22, magicScaling: 9, aoe: true, aoeTargets: 3
    },
    'icicle': {
        id: 'icicle', name: 'Icicle', description: 'Lança um cristal de gelo afiado.',
        element: 'ice', manaCost: 22, requiredLevel: 12, requiredMagicLevel: 25, cooldown: 3,
        baseDamage: 35, magicScaling: 12, aoe: false
    },
    'blizzard': {
        id: 'blizzard', name: 'Blizzard', description: 'Uma tempestade de neve e gelo.',
        element: 'ice', manaCost: 50, requiredLevel: 40, requiredMagicLevel: 60, cooldown: 8,
        baseDamage: 100, magicScaling: 30, aoe: true, aoeTargets: 6
    },
    'frost_portals': {
        id: 'frost_portals', name: 'Frost Portals', description: 'Portais de gelo que destroem tudo ao redor.',
        element: 'ice', manaCost: 70, requiredLevel: 60, requiredMagicLevel: 80, cooldown: 12,
        baseDamage: 180, magicScaling: 45, aoe: true, aoeTargets: 10
    },

    // === ENERGY SPELLS ===
    'energy_wave': {
        id: 'energy_wave', name: 'Energy Wave', description: 'Uma onda de energia elétrica.',
        element: 'energy', manaCost: 20, requiredLevel: 8, requiredMagicLevel: 20, cooldown: 2,
        baseDamage: 25, magicScaling: 10, aoe: true, aoeTargets: 3
    },
    'lightning': {
        id: 'lightning', name: 'Lightning', description: 'Um raio fulminante.',
        element: 'energy', manaCost: 30, requiredLevel: 20, requiredMagicLevel: 35, cooldown: 4,
        baseDamage: 55, magicScaling: 18, aoe: false
    },
    'energy_bomb': {
        id: 'energy_bomb', name: 'Energy Bomb', description: 'Uma bomba de energia explosiva.',
        element: 'energy', manaCost: 45, requiredLevel: 35, requiredMagicLevel: 55, cooldown: 7,
        baseDamage: 90, magicScaling: 28, aoe: true, aoeTargets: 5
    },
    'thunderstorm': {
        id: 'thunderstorm', name: 'Thunderstorm', description: 'Uma tempestade devastadora de raios.',
        element: 'energy', manaCost: 75, requiredLevel: 65, requiredMagicLevel: 85, cooldown: 12,
        baseDamage: 200, magicScaling: 50, aoe: true, aoeTargets: 8
    },

    // === EARTH SPELLS ===
    'poison_wave': {
        id: 'poison_wave', name: 'Poison Wave', description: 'Uma onda venenosa que envenena os inimigos.',
        element: 'earth', manaCost: 12, requiredLevel: 3, requiredMagicLevel: 8, cooldown: 2,
        baseDamage: 18, magicScaling: 7, aoe: true, aoeTargets: 3
    },
    'earthquake': {
        id: 'earthquake', name: 'Earthquake', description: 'Um terremoto devastador.',
        element: 'earth', manaCost: 55, requiredLevel: 45, requiredMagicLevel: 65, cooldown: 10,
        baseDamage: 120, magicScaling: 35, aoe: true, aoeTargets: 8
    },
    'plague': {
        id: 'plague', name: 'Plague', description: 'Uma praga que enfraquece os inimigos.',
        element: 'earth', manaCost: 35, requiredLevel: 25, requiredMagicLevel: 45, cooldown: 6,
        baseDamage: 65, magicScaling: 20, aoe: true, aoeTargets: 4
    },

    // === HOLY SPELLS ===
    'holy_smite': {
        id: 'holy_smite', name: 'Holy Smite', description: 'Um golpe sagrado contra criaturas das trevas.',
        element: 'holy', manaCost: 25, requiredLevel: 10, requiredMagicLevel: 25, cooldown: 3,
        baseDamage: 30, magicScaling: 12, aoe: false
    },
    'divine_missile': {
        id: 'divine_missile', name: 'Divine Missile', description: 'Um míssil divino de luz pura.',
        element: 'holy', manaCost: 35, requiredLevel: 25, requiredMagicLevel: 40, cooldown: 5,
        baseDamage: 60, magicScaling: 20, aoe: false
    },
    'holy_blast': {
        id: 'holy_blast', name: 'Holy Blast', description: 'Uma explosão de energia sagrada.',
        element: 'holy', manaCost: 60, requiredLevel: 50, requiredMagicLevel: 70, cooldown: 8,
        baseDamage: 130, magicScaling: 35, aoe: true, aoeTargets: 5
    },

    // === DEATH SPELLS ===
    'death_strike': {
        id: 'death_strike', name: 'Death Strike', description: 'Um golpe sombrio que drena a vida.',
        element: 'death', manaCost: 30, requiredLevel: 15, requiredMagicLevel: 30, cooldown: 4,
        baseDamage: 35, magicScaling: 15, aoe: false
    },
    'dark_matter': {
        id: 'dark_matter', name: 'Dark Matter', description: 'Matéria escura que consome tudo.',
        element: 'death', manaCost: 50, requiredLevel: 35, requiredMagicLevel: 55, cooldown: 7,
        baseDamage: 85, magicScaling: 28, aoe: true, aoeTargets: 4
    },
    'soul_punishment': {
        id: 'soul_punishment', name: 'Soul Punishment', description: 'Pune a alma do inimigo com energia sombria.',
        element: 'death', manaCost: 80, requiredLevel: 70, requiredMagicLevel: 90, cooldown: 14,
        baseDamage: 220, magicScaling: 55, aoe: false
    },

    // === HEAL SPELLS ===
    'light_healing': {
        id: 'light_healing', name: 'Light Healing', description: 'Cura levemente o jogador.',
        element: 'holy', manaCost: 10, requiredLevel: 1, requiredMagicLevel: 5, cooldown: 1,
        baseDamage: 0, magicScaling: 0, aoe: false, selfTarget: true, healAmount: 50
    },
    'intense_healing': {
        id: 'intense_healing', name: 'Intense Healing', description: 'Cura intensamente o jogador.',
        element: 'holy', manaCost: 25, requiredLevel: 15, requiredMagicLevel: 30, cooldown: 3,
        baseDamage: 0, magicScaling: 0, aoe: false, selfTarget: true, healAmount: 150
    },
    'ultimate_healing': {
        id: 'ultimate_healing', name: 'Ultimate Healing', description: 'Cura completamente o jogador.',
        element: 'holy', manaCost: 50, requiredLevel: 35, requiredMagicLevel: 60, cooldown: 5,
        baseDamage: 0, magicScaling: 0, aoe: false, selfTarget: true, healAmount: 999
    }
}

export const SPELL_LIST = Object.keys(SPELLS)

export class SpellSystem {
    knownSpells: Set<string> = new Set(['fire_wave', 'light_healing'])
    spellSlots: SpellSlot[] = Array.from({ length: 8 }, () => ({ spellId: null, cooldownRemaining: 0 }))
    private cooldownTimers: Map<string, number> = new Map()

    learnSpell(spellId: string): boolean {
        if (this.knownSpells.has(spellId)) return false
        this.knownSpells.add(spellId)
        return true
    }

    unlearnSpell(spellId: string): boolean {
        return this.knownSpells.delete(spellId)
    }

    knowsSpell(spellId: string): boolean {
        return this.knownSpells.has(spellId)
    }

    canCastSpell(spellId: string, player: PlayerStats): { canCast: boolean; reason?: string } {
        const spell = SPELLS[spellId]
        if (!spell) return { canCast: false, reason: 'Spell not found' }
        if (!this.knownSpells.has(spellId)) return { canCast: false, reason: 'Spell not learned' }
        if (player.level < spell.requiredLevel) return { canCast: false, reason: `Requires level ${spell.requiredLevel}` }
        if (player.totalMagicLevel < spell.requiredMagicLevel) return { canCast: false, reason: `Requires magic level ${spell.requiredMagicLevel}` }
        if (player.mp < spell.manaCost) return { canCast: false, reason: 'Not enough mana' }
        const remaining = this.cooldownTimers.get(spellId) ?? 0
        if (remaining > 0) return { canCast: false, reason: `Cooldown: ${remaining.toFixed(1)}s` }
        return { canCast: true }
    }

    castSpell(spellId: string, player: PlayerStats): { success: boolean; damage: number; heal: number; element: SpellElement } {
        const check = this.canCastSpell(spellId, player)
        if (!check.canCast) return { success: false, damage: 0, heal: 0, element: 'physical' }

        const spell = SPELLS[spellId]
        player.mp -= spell.manaCost
        this.cooldownTimers.set(spellId, spell.cooldown)

        if (spell.selfTarget && spell.healAmount) {
            const ml = player.totalMagicLevel
            const healPower = Math.floor(ml * 2 + spell.healAmount)
            const healed = player.heal(healPower)
            return { success: true, damage: 0, heal: healed, element: spell.element }
        }

        const ml = player.totalMagicLevel
        const damage = spell.baseDamage + Math.floor(ml * spell.magicScaling * 0.3) + Math.floor(Math.random() * (spell.baseDamage * 0.3))
        return { success: true, damage, heal: 0, element: spell.element }
    }

    getSpellsByElement(element: SpellElement): SpellData[] {
        return Object.values(SPELLS).filter(s => s.element === element)
    }

    getAvailableSpells(player: PlayerStats): SpellData[] {
        return Object.values(SPELLS).filter(s => {
            if (!this.knownSpells.has(s.id)) return false
            if (player.level < s.requiredLevel) return false
            if (player.totalMagicLevel < s.requiredMagicLevel) return false
            return true
        })
    }

    getLearnableSpells(player: PlayerStats): SpellData[] {
        return Object.values(SPELLS).filter(s => {
            if (this.knownSpells.has(s.id)) return false
            if (player.level >= s.requiredLevel) return true
            return false
        })
    }

    setSpellSlot(slot: number, spellId: string | null): void {
        if (slot >= 0 && slot < this.spellSlots.length) {
            this.spellSlots[slot] = { spellId, cooldownRemaining: 0 }
        }
    }

    getSpellFromSlot(slot: number): SpellData | null {
        const slotData = this.spellSlots[slot]
        if (!slotData?.spellId) return null
        return SPELLS[slotData.spellId] ?? null
    }

    update(dt: number): void {
        for (const [spellId, remaining] of this.cooldownTimers) {
            const newTime = remaining - dt
            if (newTime <= 0) {
                this.cooldownTimers.delete(spellId)
            } else {
                this.cooldownTimers.set(spellId, newTime)
            }
        }

        for (const slot of this.spellSlots) {
            if (slot.cooldownRemaining > 0) {
                slot.cooldownRemaining = Math.max(0, slot.cooldownRemaining - dt)
            }
        }
    }

    getCooldown(spellId: string): number {
        return this.cooldownTimers.get(spellId) ?? 0
    }

    serialize(): { knownSpells: string[]; spellSlots: (string | null)[] } {
        return {
            knownSpells: [...this.knownSpells],
            spellSlots: this.spellSlots.map(s => s.spellId)
        }
    }

    deserialize(data: { knownSpells: string[]; spellSlots: (string | null)[] }): void {
        this.knownSpells = new Set(data.knownSpells ?? ['fire_wave', 'light_healing'])
        this.spellSlots = (data.spellSlots ?? []).map(id => ({ spellId: id, cooldownRemaining: 0 }))
        while (this.spellSlots.length < 8) {
            this.spellSlots.push({ spellId: null, cooldownRemaining: 0 })
        }
    }
}
