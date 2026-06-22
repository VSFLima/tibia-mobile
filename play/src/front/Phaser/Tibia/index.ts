/**
 * Tibia Mobile - Entry Point
 * Integrates Tibia RPG mechanics into WorkAdventure
 */

// Import the hook to patch GameScene
import './hook'

// Re-export all Tibia systems
export { TibiaIntegration, initTibiaIntegration, getTibiaIntegration } from './TibiaIntegration'
export type { PlayerRPGData } from './TibiaIntegration'

// Export data
export { ITEMS } from './data/items'
export { MONSTERS } from './data/monsters'
export { QUESTS } from './data/quests'

// Export systems
export { PlayerStats } from './systems/PlayerStats'
export { BattleSystem } from './systems/BattleSystem'
export { Inventory } from './systems/Inventory'
export { QuestSystem } from './systems/QuestSystem'

console.log('Tibia Mobile loaded! RPG mechanics enabled.')
