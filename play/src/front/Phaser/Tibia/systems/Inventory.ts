import { ITEMS } from '../data/items'
import type { ItemData } from '../data/types'

export interface InventorySlot {
    itemId: string
    count: number
}

export class Inventory {
    items: InventorySlot[] = []
    maxSlots = 20
    maxWeight = 200

    get currentWeight(): number {
        return this.items.reduce((total, slot) => {
            const item = ITEMS[slot.itemId]
            return total + (item ? item.weight * slot.count : 0)
        }, 0)
    }

    get count(): number {
        return this.items.length
    }

    addItem(itemId: string, count = 1): boolean {
        const item = ITEMS[itemId]
        if (!item) return false

        if (item.stackable) {
            const existing = this.items.find(s => s.itemId === itemId)
            if (existing) {
                existing.count += count
                return true
            }
        }

        if (this.items.length >= this.maxSlots) return false

        this.items.push({ itemId, count })
        return true
    }

    removeItem(itemId: string, count = 1): boolean {
        const index = this.items.findIndex(s => s.itemId === itemId)
        if (index === -1) return false

        const slot = this.items[index]
        if (slot.count <= count) {
            this.items.splice(index, 1)
        } else {
            slot.count -= count
        }
        return true
    }

    hasItem(itemId: string, count = 1): boolean {
        const slot = this.items.find(s => s.itemId === itemId)
        return slot ? slot.count >= count : false
    }

    getItemCount(itemId: string): number {
        const slot = this.items.find(s => s.itemId === itemId)
        return slot ? slot.count : 0
    }

    getItemAt(index: number): InventorySlot | null {
        return this.items[index] || null
    }

    getConsumables(): (InventorySlot & { data: ItemData })[] {
        return this.items
            .filter(slot => {
                const item = ITEMS[slot.itemId]
                return item?.category === 'consumable' && item.usable
            })
            .map(slot => ({
                ...slot,
                data: ITEMS[slot.itemId]!
            }))
    }

    getUsableItems(): (InventorySlot & { data: ItemData })[] {
        return this.items
            .filter(slot => {
                const item = ITEMS[slot.itemId]
                return item?.usable === true
            })
            .map(slot => ({
                ...slot,
                data: ITEMS[slot.itemId]!
            }))
    }

    equipItem(itemId: string): { slot: string; replacedItemId: string | null } | null {
        const item = ITEMS[itemId]
        if (!item) return null

        const equipSlot = item.category as string
        const validSlots = ['weapon', 'shield', 'helmet', 'armor', 'legs', 'boots', 'ring', 'amulet']
        if (!validSlots.includes(equipSlot)) return null

        return { slot: equipSlot, replacedItemId: null }
    }

    sortItems(): void {
        const categoryOrder: Record<string, number> = {
            weapon: 0, helmet: 1, armor: 2, legs: 3, boots: 4,
            shield: 5, ring: 6, amulet: 7, consumable: 8, rune: 9,
            quest: 10, money: 11, other: 12
        }
        this.items.sort((a, b) => {
            const itemA = ITEMS[a.itemId]
            const itemB = ITEMS[b.itemId]
            const orderA = itemA ? (categoryOrder[itemA.category] ?? 99) : 99
            const orderB = itemB ? (categoryOrder[itemB.category] ?? 99) : 99
            if (orderA !== orderB) return orderA - orderB
            return (itemA?.name ?? '').localeCompare(itemB?.name ?? '')
        })
    }

    serialize(): InventorySlot[] {
        return this.items.map(s => ({ itemId: s.itemId, count: s.count }))
    }

    deserialize(data: InventorySlot[]): void {
        this.items = data.map(s => ({ itemId: s.itemId, count: s.count }))
    }
}
