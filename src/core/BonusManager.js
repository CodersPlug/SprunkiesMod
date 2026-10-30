/**
 * BonusManager - Combo detection and bonus rewards for wrenchbox
 * Phase 5: Detect specific sound combinations and trigger rewards
 *
 * Learning goals:
 * - Set comparison algorithms
 * - Event-driven state detection
 * - Overlay/modal management
 * - Animation timing
 */

class BonusManager {
    constructor() {
        this.bonuses = [];
        this.activeBonus = null;
        this.triggeredBonuses = new Set(); // Track which bonuses have been shown this session
        this.onBonusTriggered = null; // Callback when bonus triggers
        this.onBonusEnded = null; // Callback when bonus ends
    }

    /**
     * Register bonus definitions
     * @param {Array} bonusDefs - Array of bonus definitions
     */
    registerBonuses(bonusDefs) {
        this.bonuses = bonusDefs.map(b => ({
            id: b.id,
            title: b.title,
            description: b.description || '',
            requiredSounds: new Set(b.requiredSounds),
            animation: b.animation || 'default',
            duration: b.duration || 5000,
            repeatable: b.repeatable || false,
            icon: b.icon || '🎁'
        }));
        console.log('[BonusManager] Registered', this.bonuses.length, 'bonuses');
    }

    /**
     * Check if any bonus should trigger based on active sounds
     * @param {Array} activeSounds - Array of active sound names
     * @returns {Object|null} Triggered bonus or null
     */
    checkBonus(activeSounds) {
        if (this.activeBonus) return null; // Already showing a bonus

        const activeSet = new Set(activeSounds);

        for (const bonus of this.bonuses) {
            // Skip if already triggered and not repeatable
            if (!bonus.repeatable && this.triggeredBonuses.has(bonus.id)) {
                continue;
            }

            // Check if all required sounds are active
            const allRequired = [...bonus.requiredSounds].every(s => activeSet.has(s));

            if (allRequired) {
                return bonus;
            }
        }

        return null;
    }

    /**
     * Trigger a bonus
     * @param {Object} bonus - The bonus to trigger
     */
    triggerBonus(bonus) {
        if (this.activeBonus) return;

        this.activeBonus = bonus;
        this.triggeredBonuses.add(bonus.id);

        console.log('[BonusManager] Bonus triggered:', bonus.title);

        if (this.onBonusTriggered) {
            this.onBonusTriggered(bonus);
        }

        // Auto-end after duration
        setTimeout(() => {
            this.endBonus();
        }, bonus.duration);
    }

    /**
     * End the current bonus
     */
    endBonus() {
        if (!this.activeBonus) return;

        const bonus = this.activeBonus;
        this.activeBonus = null;

        console.log('[BonusManager] Bonus ended:', bonus.title);

        if (this.onBonusEnded) {
            this.onBonusEnded(bonus);
        }
    }

    /**
     * Check if a bonus is currently active
     */
    isBonusActive() {
        return this.activeBonus !== null;
    }

    /**
     * Get current active bonus
     */
    getActiveBonus() {
        return this.activeBonus;
    }

    /**
     * Reset triggered bonuses (allow re-triggering)
     */
    reset() {
        this.triggeredBonuses.clear();
        this.activeBonus = null;
    }

    /**
     * Get list of all bonuses with their trigger status
     */
    getBonusStatus() {
        return this.bonuses.map(b => ({
            ...b,
            triggered: this.triggeredBonuses.has(b.id),
            requiredSounds: [...b.requiredSounds]
        }));
    }
}

// Global instance
const bonusManager = new BonusManager();
