/**
 * GameScene Hook for Tibia Integration
 * This file patches the existing GameScene to include Tibia RPG mechanics
 */
import { GameScene } from '../Game/GameScene'
import { TibiaIntegration, initTibiaIntegration } from './TibiaIntegration'

// Store the original update method
const originalUpdate = GameScene.prototype.update

// Override the update method to include Tibia integration
GameScene.prototype.update = function(time: number, delta: number) {
    // Call original update
    originalUpdate.call(this, time, delta)

    // Initialize Tibia integration if not done yet
    if (!this.tibiaIntegration && this.CurrentPlayer && this.hasJoinedRoom) {
        this.tibiaIntegration = initTibiaIntegration(this)
        console.log('Tibia Integration initialized!')
    }

    // Update Tibia integration
    if (this.tibiaIntegration) {
        this.tibiaIntegration.update(time, delta)
    }
}

// Add tibiaIntegration property to GameScene
declare module '../Game/GameScene' {
    interface GameScene {
        tibiaIntegration?: TibiaIntegration
    }
}

// Hook into keyboard events for Tibia controls
const originalCreate = GameScene.prototype.create
GameScene.prototype.create = function() {
    originalCreate.call(this)

    // Add Tibia keyboard handlers
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        if (this.tibiaIntegration) {
            this.tibiaIntegration.handleKeyPress(event.key)
        }
    })
}

console.log('Tibia GameScene hook loaded!')
