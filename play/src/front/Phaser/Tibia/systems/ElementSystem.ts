import type { SpellElement } from './SpellSystem'

export interface ElementalModifiers {
    physical?: number
    fire?: number
    ice?: number
    energy?: number
    earth?: number
    holy?: number
    death?: number
}

export interface ElementalDefense {
    physical: number
    fire: number
    ice: number
    energy: number
    earth: number
    holy: number
    death: number
}

const ELEMENT_LIST: SpellElement[] = ['physical', 'fire', 'ice', 'energy', 'earth', 'holy', 'death']

export function calculateElementalDamage(
    baseDamage: number,
    element: SpellElement,
    attackModifiers: ElementalModifiers,
    defenseModifiers: ElementalModifiers
): { finalDamage: number; element: SpellElement } {
    const attackMult = (attackModifiers[element] ?? 1.0)
    const defenseMult = (defenseModifiers[element] ?? 1.0)

    let finalDamage = Math.floor(baseDamage * attackMult * defenseMult)
    finalDamage = Math.max(1, finalDamage)

    return { finalDamage, element }
}

export function getElementEffectiveness(element: SpellElement, targetModifiers: ElementalModifiers): number {
    return targetModifiers[element] ?? 1.0
}

export function getElementName(element: SpellElement): string {
    const names: Record<SpellElement, string> = {
        physical: 'Físico',
        fire: 'Fogo',
        ice: 'Gelo',
        energy: 'Energia',
        earth: 'Terra',
        holy: 'Sagrado',
        death: 'Morte'
    }
    return names[element]
}

export function getElementColor(element: SpellElement): string {
    const colors: Record<SpellElement, string> = {
        physical: '#cccccc',
        fire: '#ff4400',
        ice: '#44ccff',
        energy: '#ffff00',
        earth: '#88aa00',
        holy: '#ffffff',
        death: '#aa00ff'
    }
    return colors[element]
}

export class ElementSystem {
    private playerResistances: ElementalDefense = {
        physical: 0, fire: 0, ice: 0, energy: 0, earth: 0, holy: 0, death: 0
    }

    calculatePlayerResistances(equipmentBonuses: Partial<Record<SpellElement, number>>): void {
        for (const element of ELEMENT_LIST) {
            this.playerResistances[element] = equipmentBonuses[element] ?? 0
        }
    }

    getPlayerResistances(): ElementalDefense {
        return { ...this.playerResistances }
    }

    applyDamage(
        baseDamage: number,
        element: SpellElement,
        attackerModifiers: ElementalModifiers,
        isMonsterAttack: boolean
    ): { finalDamage: number; resisted: boolean; element: SpellElement } {
        const resistances = isMonsterAttack ? { ...this.playerResistances } : {}
        const attackMult = (attackerModifiers[element] ?? 1.0)
        const defenseMult = isMonsterAttack ? Math.max(0.1, 1.0 - (this.playerResistances[element] ?? 0) / 100) : 1.0

        let finalDamage = Math.floor(baseDamage * attackMult * defenseMult)
        finalDamage = Math.max(1, finalDamage)

        const resisted = finalDamage < baseDamage * attackMult

        return { finalDamage, resisted, element }
    }

    getMonsterElementalDamage(
        baseDamage: number,
        monsterElements: ElementalModifiers
    ): { finalDamage: number; element: SpellElement } {
        let bestElement: SpellElement = 'physical'
        let bestMult = 0

        for (const element of ELEMENT_LIST) {
            const mult = monsterElements[element] ?? 1.0
            if (mult > bestMult) {
                bestMult = mult
                bestElement = element
            }
        }

        const finalDamage = Math.floor(baseDamage * bestMult)
        return { finalDamage: Math.max(1, finalDamage), element: bestElement }
    }

    getElementSummary(elements: ElementalModifiers): string[] {
        const summary: string[] = []
        for (const element of ELEMENT_LIST) {
            const value = elements[element]
            if (value !== undefined && value !== 1.0) {
                const pct = Math.round((value - 1.0) * 100)
                const sign = pct > 0 ? '+' : ''
                summary.push(`${getElementName(element)}: ${sign}${pct}%`)
            }
        }
        return summary
    }
}
