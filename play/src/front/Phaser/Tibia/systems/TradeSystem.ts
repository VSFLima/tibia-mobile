import type { PlayerStats } from './PlayerStats'
import type { Inventory } from './Inventory'
import { ITEMS } from '../data/items'
import type { NpcData } from '../data/types'

export interface TradeOffer {
    itemId: string
    price: number
    name: string
    description: string
    count?: number
}

export interface TradeResult {
    success: boolean
    message: string
    item?: string
    price?: number
}

export interface TradeSession {
    npcId: string
    npcName: string
    buyOffers: TradeOffer[]
    sellOffers: TradeOffer[]
    messages: string[]
    active: boolean
}

export class TradeSystem {
    currentSession: TradeSession | null = null
    private priceModifier = 1.0
    private reputation: Record<string, number> = {}

    openTrade(npc: NpcData): boolean {
        if (!npc.trade) return false
        if (this.currentSession?.active) return false

        const buyOffers: TradeOffer[] = npc.trade.buy.map(offer => {
            const item = ITEMS[offer.itemId]
            return {
                itemId: offer.itemId,
                price: Math.ceil(offer.price * this.priceModifier),
                name: item?.name ?? offer.itemId,
                description: item?.description ?? '',
                count: 1
            }
        }).filter(offer => {
            const item = ITEMS[offer.itemId]
            if (!item) return false
            return true
        })

        const sellOffers: TradeOffer[] = npc.trade.sell.map(offer => ({
            itemId: offer.itemId,
            price: offer.price,
            name: ITEMS[offer.itemId]?.name ?? offer.itemId,
            description: ITEMS[offer.itemId]?.description ?? '',
            count: 1
        }))

        this.currentSession = {
            npcId: npc.id,
            npcName: npc.name,
            buyOffers,
            sellOffers,
            messages: [`Bem-vindo à loja de ${npc.name}!`],
            active: true
        }

        return true
    }

    closeTrade(): void {
        if (this.currentSession) {
            this.currentSession.active = false
            this.currentSession = null
        }
    }

    buyItem(itemId: string, count: number, player: PlayerStats, inventory: Inventory): TradeResult {
        if (!this.currentSession?.active) {
            return { success: false, message: 'Nenhuma troca ativa.' }
        }

        const offer = this.currentSession.buyOffers.find(o => o.itemId === itemId)
        if (!offer) {
            return { success: false, message: 'Item não disponível para compra.' }
        }

        const item = ITEMS[itemId]
        if (!item) {
            return { success: false, message: 'Item inválido.' }
        }

        if (item.requiredLevel && player.level < item.requiredLevel) {
            return { success: false, message: `Nível mínimo: ${item.requiredLevel}` }
        }

        if (item.requiredMagicLevel && player.totalMagicLevel < item.requiredMagicLevel) {
            return { success: false, message: `Nível mágico mínimo: ${item.requiredMagicLevel}` }
        }

        const totalPrice = offer.price * count
        if (player.gold < totalPrice) {
            return { success: false, message: `Ouro insuficiente. Necessário: ${totalPrice}g` }
        }

        const itemWeight = item.weight * count
        if (inventory.currentWeight + itemWeight > inventory.maxWeight) {
            return { success: false, message: 'Peso insuficiente na mochila.' }
        }

        if (count > 1 && !item.stackable && inventory.items.length + count > inventory.maxSlots) {
            return { success: false, message: 'Espaço insuficiente na mochila.' }
        }

        if (!inventory.addItem(itemId, count)) {
            return { success: false, message: 'Mochila cheia.' }
        }

        player.gold -= totalPrice

        const result: TradeResult = {
            success: true,
            message: `Comprou ${count}x ${offer.name} por ${totalPrice}g`,
            item: itemId,
            price: totalPrice
        }

        this.currentSession.messages.push(result.message)
        this.updateReputation(this.currentSession.npcId, count)

        return result
    }

    sellItem(itemId: string, count: number, player: PlayerStats, inventory: Inventory): TradeResult {
        if (!this.currentSession?.active) {
            return { success: false, message: 'Nenhuma troca ativa.' }
        }

        const offer = this.currentSession.sellOffers.find(o => o.itemId === itemId)
        if (!offer) {
            return { success: false, message: 'Este NPC não compra este item.' }
        }

        if (!inventory.hasItem(itemId, count)) {
            return { success: false, message: 'Você não tem este item.' }
        }

        const item = ITEMS[itemId]
        if (!item) {
            return { success: false, message: 'Item inválido.' }
        }

        const unitPrice = offer.price
        const totalPrice = unitPrice * count

        inventory.removeItem(itemId, count)
        player.gold += totalPrice

        const result: TradeResult = {
            success: true,
            message: `Vendeu ${count}x ${item.name} por ${totalPrice}g`,
            item: itemId,
            price: totalPrice
        }

        this.currentSession.messages.push(result.message)

        return result
    }

    getBuyPrice(itemId: string): number | null {
        const offer = this.currentSession?.buyOffers.find(o => o.itemId === itemId)
        return offer ? offer.price : null
    }

    getSellPrice(itemId: string): number | null {
        const offer = this.currentSession?.sellOffers.find(o => o.itemId === itemId)
        return offer ? offer.price : null
    }

    canAfford(itemId: string, count: number, player: PlayerStats): boolean {
        const offer = this.currentSession?.buyOffers.find(o => o.itemId === itemId)
        if (!offer) return false
        return player.gold >= offer.price * count
    }

    private updateReputation(npcId: string, amount: number): void {
        this.reputation[npcId] = (this.reputation[npcId] ?? 0) + amount
        if (this.reputation[npcId] > 100) {
            this.priceModifier = 0.95
        } else if (this.reputation[npcId] > 50) {
            this.priceModifier = 0.98
        }
    }

    getReputation(npcId: string): number {
        return this.reputation[npcId] ?? 0
    }

    getPriceModifier(): number {
        return this.priceModifier
    }

    serialize(): { reputation: Record<string, number>; priceModifier: number } {
        return {
            reputation: { ...this.reputation },
            priceModifier: this.priceModifier
        }
    }

    deserialize(data: { reputation: Record<string, number>; priceModifier: number }): void {
        this.reputation = data.reputation ?? {}
        this.priceModifier = data.priceModifier ?? 1.0
    }
}
