import { QUESTS } from '../data/quests'
import type { QuestData } from '../data/types'

export interface QuestProgress {
    objectives: number[]
    completed: boolean
}

export class QuestSystem {
    active: string[] = []
    completed: string[] = []
    progress = new Map<string, QuestProgress>()
    notifications: { questId: string; message: string; time: number }[] = []

    accept(questId: string): boolean {
        const quest = QUESTS[questId]
        if (!quest) return false
        if (this.active.includes(questId) || this.completed.includes(questId)) return false

        for (const prereq of quest.prerequisites ?? []) {
            if (!this.completed.includes(prereq)) return false
        }

        this.active.push(questId)
        this.progress.set(questId, {
            objectives: quest.objectives.map(() => 0),
            completed: false
        })

        this.notifications.push({
            questId,
            message: `Quest "${quest.name}" aceita!`,
            time: 3
        })
        return true
    }

    complete(questId: string): boolean {
        const index = this.active.indexOf(questId)
        if (index === -1) return false

        this.active.splice(index, 1)
        this.completed.push(questId)

        const prog = this.progress.get(questId)
        if (prog) prog.completed = true

        const quest = QUESTS[questId]
        if (quest) {
            this.notifications.push({
                questId,
                message: `Quest "${quest.name}" completa!`,
                time: 5
            })
        }
        return true
    }

    isActive(questId: string): boolean {
        return this.active.includes(questId)
    }

    isCompleted(questId: string): boolean {
        return this.completed.includes(questId)
    }

    isObjectiveMet(questId: string): boolean {
        const quest = QUESTS[questId]
        const prog = this.progress.get(questId)
        if (!quest || !prog) return false

        return quest.objectives.every((obj, i) => prog.objectives[i] >= obj.count)
    }

    checkObjective(type: string, target: string, amount: number): void {
        for (const questId of this.active) {
            const quest = QUESTS[questId]
            const prog = this.progress.get(questId)
            if (!quest || !prog) continue

            for (let i = 0; i < quest.objectives.length; i++) {
                const obj = quest.objectives[i]
                if (obj.type === type && obj.target === target) {
                    prog.objectives[i] = Math.min(obj.count, prog.objectives[i] + amount)
                }
            }
        }
    }

    getQuestProgress(questId: string): QuestProgress | null {
        return this.progress.get(questId) ?? null
    }

    getActiveQuests(): (QuestData & { progress: QuestProgress })[] {
        return this.active
            .map(id => QUESTS[id])
            .filter((q): q is QuestData => !!q)
            .map(q => ({
                ...q,
                progress: this.progress.get(q.id) ?? { objectives: q.objectives.map(() => 0), completed: false }
            }))
    }

    update(dt: number): void {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].time -= dt
            if (this.notifications[i].time <= 0) {
                this.notifications.splice(i, 1)
            }
        }
    }

    serialize(): { active: string[]; completed: string[]; progress: Record<string, number[]> } {
        const progressObj: Record<string, number[]> = {}
        for (const [key, val] of this.progress) {
            progressObj[key] = val.objectives
        }
        return { active: [...this.active], completed: [...this.completed], progress: progressObj }
    }

    deserialize(data: { active: string[]; completed: string[]; progress: Record<string, number[]> }): void {
        this.active = data.active ?? []
        this.completed = data.completed ?? []
        this.progress.clear()
        for (const [key, val] of Object.entries(data.progress ?? {})) {
            this.progress.set(key, { objectives: val, completed: false })
        }
    }
}
