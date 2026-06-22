import type { MonsterData } from '../data/types'

export interface MonsterInstance {
    id: string
    data: MonsterData
    x: number
    y: number
    currentHp: number
    maxHp: number
    direction: 'up' | 'down' | 'left' | 'right'
    state: 'idle' | 'wandering' | 'chasing' | 'attacking' | 'dead'
    wanderTimer: number
    wanderInterval: number
    aggroRange: number
    attackCooldown: number
    lastAttackTime: number
    respawnTimer: number
    respawnTime: number
    originX: number
    originY: number
}

export class MonsterManager {
    monsters: MonsterInstance[] = []
    private nextId = 0

    spawnMonster(data: MonsterData, x: number, y: number, respawnTime = 30): MonsterInstance {
        const monster: MonsterInstance = {
            id: `monster_${this.nextId++}`,
            data,
            x, y,
            currentHp: data.health,
            maxHp: data.health,
            direction: 'down',
            state: 'idle',
            wanderTimer: 0,
            wanderInterval: 2 + Math.random() * 3,
            aggroRange: data.maxRange ?? 5,
            attackCooldown: 1.5,
            lastAttackTime: 0,
            respawnTimer: 0,
            respawnTime,
            originX: x,
            originY: y
        }
        this.monsters.push(monster)
        return monster
    }

    spawnGroup(data: MonsterData, x: number, y: number, count: number, radius = 3): MonsterInstance[] {
        const spawned: MonsterInstance[] = []
        for (let i = 0; i < count; i++) {
            const ox = x + (Math.random() - 0.5) * radius * 2
            const oy = y + (Math.random() - 0.5) * radius * 2
            spawned.push(this.spawnMonster(data, ox, oy))
        }
        return spawned
    }

    update(dt: number, playerX: number, playerY: number): void {
        for (const monster of this.monsters) {
            if (monster.state === 'dead') {
                monster.respawnTimer -= dt
                if (monster.respawnTimer <= 0) {
                    this.respawnMonster(monster)
                }
                continue
            }

            const dist = Math.sqrt((monster.x - playerX) ** 2 + (monster.y - playerY) ** 2)

            switch (monster.data.behavior) {
                case 'aggressive':
                    if (dist <= monster.aggroRange) {
                        monster.state = 'chasing'
                    } else {
                        monster.state = 'wandering'
                    }
                    break
                case 'defensive':
                    if (monster.currentHp < monster.maxHp * 0.5) {
                        if (monster.data.runHealth && monster.currentHp <= monster.data.runHealth) {
                            monster.state = 'idle'
                        }
                    } else if (dist <= monster.aggroRange) {
                        monster.state = 'chasing'
                    } else {
                        monster.state = 'wandering'
                    }
                    break
                default:
                    monster.state = 'wandering'
            }

            if (monster.state === 'chasing') {
                this.moveToward(monster, playerX, playerY, dt)
            } else if (monster.state === 'wandering') {
                monster.wanderTimer += dt
                if (monster.wanderTimer >= monster.wanderInterval) {
                    monster.wanderTimer = 0
                    monster.wanderInterval = 2 + Math.random() * 3
                    const dx = (Math.random() - 0.5) * 2
                    const dy = (Math.random() - 0.5) * 2
                    const newX = monster.x + dx
                    const newY = monster.y + dy
                    const distFromOrigin = Math.sqrt((newX - monster.originX) ** 2 + (newY - monster.originY) ** 2)
                    if (distFromOrigin <= 5) {
                        monster.x = newX
                        monster.y = newY
                    }
                }
            }
        }
    }

    private moveToward(monster: MonsterInstance, targetX: number, targetY: number, dt: number): void {
        const dx = targetX - monster.x
        const dy = targetY - monster.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.5) return

        const speed = monster.data.speed * dt
        monster.x += (dx / dist) * speed
        monster.y += (dy / dist) * speed

        if (Math.abs(dx) > Math.abs(dy)) {
            monster.direction = dx > 0 ? 'right' : 'left'
        } else {
            monster.direction = dy > 0 ? 'down' : 'up'
        }
    }

    private respawnMonster(monster: MonsterInstance): void {
        monster.x = monster.originX + (Math.random() - 0.5) * 2
        monster.y = monster.originY + (Math.random() - 0.5) * 2
        monster.currentHp = monster.maxHp
        monster.state = 'idle'
    }

    getMonsterAt(x: number, y: number, range = 1.5): MonsterInstance | null {
        let closest: MonsterInstance | null = null
        let minDist = range

        for (const monster of this.monsters) {
            if (monster.state === 'dead') continue
            const dist = Math.sqrt((monster.x - x) ** 2 + (monster.y - y) ** 2)
            if (dist < minDist) {
                minDist = dist
                closest = monster
            }
        }
        return closest
    }

    getMonstersInRange(x: number, y: number, range: number): MonsterInstance[] {
        return this.monsters.filter(m => {
            if (m.state === 'dead') return false
            return Math.sqrt((m.x - x) ** 2 + (m.y - y) ** 2) <= range
        })
    }

    damageMonster(monsterId: string, damage: number): MonsterInstance | null {
        const monster = this.monsters.find(m => m.id === monsterId)
        if (!monster || monster.state === 'dead') return null

        monster.currentHp -= damage
        if (monster.currentHp <= 0) {
            monster.currentHp = 0
            monster.state = 'dead'
            monster.respawnTimer = monster.respawnTime
        }
        return monster
    }
}
