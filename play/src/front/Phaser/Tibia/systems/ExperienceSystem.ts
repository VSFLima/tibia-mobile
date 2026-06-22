import type { PlayerStats } from './PlayerStats'
import type { MonsterData } from '../data/types'

export interface ExperienceModifier {
    levelDifferenceBonus: number
    groupBonus: number
    staminaBonus: number
    premiumBonus: number
    totalMultiplier: number
}

export interface XpGainResult {
    baseXp: number
    finalXp: number
    modifier: ExperienceModifier
    levelsGained: number
    currentLevel: number
    currentXp: number
    xpToLevel: number
}

export class ExperienceSystem {
    private levelDiffBonusRate = 0.05
    private maxLevelDiffBonus = 2.0
    private maxLevelDiffPenalty = 0.1
    private premiumMultiplier = 1.0
    private groupBonusBase = 0.0

    calculateExperienceModifier(
        playerLevel: number,
        monsterLevel: number,
        groupSize: number = 1,
        isPremium: boolean = false
    ): ExperienceModifier {
        const levelDiff = monsterLevel - playerLevel

        let levelDifferenceBonus: number
        if (levelDiff >= 0) {
            levelDifferenceBonus = Math.min(this.maxLevelDiffBonus, 1.0 + levelDiff * this.levelDiffBonusRate)
        } else {
            const penaltyReduction = Math.abs(levelDiff) * this.levelDiffBonusRate
            levelDifferenceBonus = Math.max(this.maxLevelDiffPenalty, 1.0 - penaltyReduction)
        }

        let groupBonus = this.groupBonusBase
        if (groupSize > 1) {
            groupBonus = Math.min(0.5, (groupSize - 1) * 0.1)
        }

        const staminaBonus = 1.0

        const premiumBonus = isPremium ? this.premiumMultiplier : 1.0

        const totalMultiplier = levelDifferenceBonus * (1 + groupBonus) * staminaBonus * premiumBonus

        return {
            levelDifferenceBonus,
            groupBonus,
            staminaBonus,
            premiumBonus,
            totalMultiplier
        }
    }

    calculateXpGain(
        monster: MonsterData,
        player: PlayerStats,
        groupSize: number = 1,
        isPremium: boolean = false
    ): XpGainResult {
        const monsterLevel = this.estimateMonsterLevel(monster)
        const modifier = this.calculateExperienceModifier(
            player.level,
            monsterLevel,
            groupSize,
            isPremium
        )

        const baseXp = monster.experience
        const finalXp = Math.max(1, Math.floor(baseXp * modifier.totalMultiplier))

        const levelsGained = player.gainXp(finalXp)

        return {
            baseXp,
            finalXp,
            modifier,
            levelsGained,
            currentLevel: player.level,
            currentXp: player.xp,
            xpToLevel: player.xpToLevel
        }
    }

    calculateBatchXp(
        monsters: MonsterData[],
        player: PlayerStats,
        isPremium: boolean = false
    ): XpGainResult[] {
        const results: XpGainResult[] = []

        for (const monster of monsters) {
            const result = this.calculateXpGain(monster, player, 1, isPremium)
            results.push(result)
        }

        return results
    }

    private estimateMonsterLevel(monster: MonsterData): number {
        const hpFactor = monster.health / 50
        const atkFactor = monster.attack / 5
        const xpFactor = Math.sqrt(monster.experience / 5)

        return Math.max(1, Math.floor((hpFactor + atkFactor + xpFactor) / 3))
    }

    getXpToNextLevel(player: PlayerStats): { current: number; needed: number; percent: number } {
        const percent = Math.floor((player.xp / player.xpToLevel) * 100)
        return {
            current: player.xp,
            needed: player.xpToLevel,
            percent
        }
    }

    estimateLevelUpCount(player: PlayerStats, xpAmount: number): number {
        let tempXp = player.xp + xpAmount
        let tempXpToLevel = player.xpToLevel
        let tempLevel = player.level
        let count = 0

        while (tempXp >= tempXpToLevel) {
            tempXp -= tempXpToLevel
            tempLevel++
            tempXpToLevel = Math.floor(50 * Math.pow(1.2, tempLevel - 1))
            count++
        }

        return count
    }

    formatXpMessage(result: XpGainResult): string {
        const diffPct = Math.round((result.modifier.levelDifferenceBonus - 1.0) * 100)
        const diffSign = diffPct >= 0 ? '+' : ''
        let msg = `${result.finalXp} XP (base: ${result.baseXp}${diffSign}${diffPct}% level bonus)`

        if (result.modifier.groupBonus > 0) {
            msg += ` [grupo +${Math.round(result.modifier.groupBonus * 100)}%]`
        }

        return msg
    }

    formatLevelUpMessage(result: XpGainResult): string {
        if (result.levelsGained <= 0) return ''
        return `Level Up! Agora você é nível ${result.currentLevel}!`
    }

    getLevelProgress(player: PlayerStats): {
        level: number
        xp: number
        xpToLevel: number
        percent: number
        totalXp: number
    } {
        let totalXp = 0
        for (let i = 1; i < player.level; i++) {
            totalXp += Math.floor(50 * Math.pow(1.2, i - 1))
        }
        totalXp += player.xp

        return {
            level: player.level,
            xp: player.xp,
            xpToLevel: player.xpToLevel,
            percent: Math.floor((player.xp / player.xpToLevel) * 100),
            totalXp
        }
    }
}
