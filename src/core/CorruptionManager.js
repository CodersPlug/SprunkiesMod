/**
 * CorruptionManager - Horror mode for wrenchbox (Sprunki-style)
 * Phase 6: Progressive corruption with cellular automata spread
 *
 * Learning goals:
 * - Cellular automata algorithms
 * - Progressive state transitions
 * - Real-time audio effect manipulation
 * - CSS filter animations
 */

class CorruptionManager {
    constructor() {
        // Corruption state per slot (0-100)
        this.corruption = new Map();

        // Enabled flag (can be disabled by theme)
        this.enabled = true;

        // Corruption spread settings
        this.spreadRate = 0.4;        // Probability of spreading per tick
        this.spreadAmount = 15;       // Amount added when spreading
        this.tickInterval = 2000;     // ms between spread ticks
        this.tickTimer = null;

        // Corruption thresholds
        this.THRESHOLDS = {
            NONE: 0,
            LOW: 25,      // Subtle detuning
            MEDIUM: 50,   // Bitcrushing, hue shift
            HIGH: 75,     // Ring mod, glitch
            FULL: 100     // Full horror mode
        };

        // Theme visual config for tiers
        this.tierVisuals = null;
        this.cureCombo = null;

        // Callbacks
        this.onCorruptionChanged = null;  // (slotId, level, tier) => {}
        this.onHorrorModeStart = null;    // () => {}
        this.onHorrorModeEnd = null;      // () => {}

        // State
        this.horrorModeActive = false;
        this.cursedSlotId = null;  // The slot that started it all
    }

    /**
     * Initialize corruption tracking for slots
     */
    init(slotCount) {
        for (let i = 0; i < slotCount; i++) {
            this.corruption.set(i, 0);
        }
        console.log('[CorruptionManager] Initialized for', slotCount, 'slots');
    }

    /**
     * Apply theme corruption config
     * @param {Object} config - Corruption config from theme
     */
    applyThemeConfig(config) {
        if (!config) return;

        // Check if corruption is enabled in theme
        if (config.enabled === false) {
            this.enabled = false;
            console.log('[CorruptionManager] Corruption disabled by theme');
            return;
        }

        this.enabled = true;

        // Apply spread settings
        if (config.spreadRate !== undefined) {
            this.spreadRate = config.spreadRate;
        }
        if (config.spreadAmount !== undefined) {
            this.spreadAmount = config.spreadAmount;
        }
        if (config.tickInterval !== undefined) {
            this.tickInterval = config.tickInterval;
        }

        // Apply tier thresholds if provided
        if (config.tiers) {
            if (config.tiers.low?.min !== undefined) {
                this.THRESHOLDS.LOW = config.tiers.low.min;
            }
            if (config.tiers.medium?.min !== undefined) {
                this.THRESHOLDS.MEDIUM = config.tiers.medium.min;
            }
            if (config.tiers.high?.min !== undefined) {
                this.THRESHOLDS.HIGH = config.tiers.high.min;
            }
            if (config.tiers.full?.min !== undefined) {
                this.THRESHOLDS.FULL = config.tiers.full.min;
            }

            // Store visual config for HorrorEffects to use
            this.tierVisuals = config.tiers;
        }

        // Store cure combo for future use
        if (config.cureCombo) {
            this.cureCombo = config.cureCombo;
        }

        console.log('[CorruptionManager] Applied theme config:', {
            spreadRate: this.spreadRate,
            spreadAmount: this.spreadAmount,
            tickInterval: this.tickInterval
        });
    }

    /**
     * Trigger corruption from a specific slot (the "cursed" item)
     */
    startCorruption(slotId) {
        if (!this.enabled) return;
        if (this.horrorModeActive) return;

        this.horrorModeActive = true;
        this.cursedSlotId = slotId;

        // Immediately corrupt the source slot
        this.setCorruption(slotId, 100);

        // Start the spread ticker
        this.startSpreadTicker();

        if (this.onHorrorModeStart) {
            this.onHorrorModeStart();
        }

        console.log('[CorruptionManager] Horror mode started from slot', slotId);
    }

    /**
     * Start the cellular automata spread ticker
     */
    startSpreadTicker() {
        if (this.tickTimer) return;

        this.tickTimer = setInterval(() => {
            this.spreadCorruption();
        }, this.tickInterval);
    }

    /**
     * Stop the spread ticker
     */
    stopSpreadTicker() {
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
        }
    }

    /**
     * Cellular automata: spread corruption to neighbors
     */
    spreadCorruption() {
        const slotIds = Array.from(this.corruption.keys()).sort((a, b) => a - b);
        const changes = [];

        for (const slotId of slotIds) {
            const level = this.corruption.get(slotId);

            // Only highly corrupted slots spread
            if (level >= this.THRESHOLDS.HIGH) {
                // Check neighbors (left and right)
                const neighbors = [slotId - 1, slotId + 1];

                for (const neighborId of neighbors) {
                    if (!this.corruption.has(neighborId)) continue;

                    const neighborLevel = this.corruption.get(neighborId);
                    if (neighborLevel >= 100) continue; // Already fully corrupted

                    // Probability-based spread
                    if (Math.random() < this.spreadRate) {
                        const newLevel = Math.min(100, neighborLevel + this.spreadAmount);
                        changes.push({ slotId: neighborId, level: newLevel });
                    }
                }
            }
        }

        // Apply changes
        for (const change of changes) {
            this.setCorruption(change.slotId, change.level);
        }
    }

    /**
     * Set corruption level for a slot
     */
    setCorruption(slotId, level) {
        const oldLevel = this.corruption.get(slotId) || 0;
        const newLevel = Math.max(0, Math.min(100, level));

        if (oldLevel === newLevel) return;

        this.corruption.set(slotId, newLevel);

        const tier = this.getTier(newLevel);

        if (this.onCorruptionChanged) {
            this.onCorruptionChanged(slotId, newLevel, tier);
        }
    }

    /**
     * Get corruption level for a slot
     */
    getCorruption(slotId) {
        return this.corruption.get(slotId) || 0;
    }

    /**
     * Get tier name based on corruption level
     */
    getTier(level) {
        if (level >= this.THRESHOLDS.FULL) return 'full';
        if (level >= this.THRESHOLDS.HIGH) return 'high';
        if (level >= this.THRESHOLDS.MEDIUM) return 'medium';
        if (level >= this.THRESHOLDS.LOW) return 'low';
        return 'none';
    }

    /**
     * Get tier for a slot
     */
    getSlotTier(slotId) {
        return this.getTier(this.getCorruption(slotId));
    }

    /**
     * Check if any slot is corrupted
     */
    isCorrupted() {
        for (const level of this.corruption.values()) {
            if (level > 0) return true;
        }
        return false;
    }

    /**
     * Check if horror mode is active
     */
    isHorrorMode() {
        return this.horrorModeActive;
    }

    /**
     * Cure corruption (reduce all slots)
     */
    cure(amount = 25) {
        for (const slotId of this.corruption.keys()) {
            const level = this.corruption.get(slotId);
            if (level > 0) {
                this.setCorruption(slotId, level - amount);
            }
        }

        // Check if all cured
        if (!this.isCorrupted()) {
            this.endHorrorMode();
        }
    }

    /**
     * End horror mode completely
     */
    endHorrorMode() {
        this.stopSpreadTicker();
        this.horrorModeActive = false;
        this.cursedSlotId = null;

        // Clear all corruption
        for (const slotId of this.corruption.keys()) {
            this.setCorruption(slotId, 0);
        }

        if (this.onHorrorModeEnd) {
            this.onHorrorModeEnd();
        }

        console.log('[CorruptionManager] Horror mode ended');
    }

    /**
     * Reset everything
     */
    reset() {
        this.endHorrorMode();
    }

    /**
     * Get all corruption states
     */
    getAllCorruption() {
        const result = {};
        for (const [slotId, level] of this.corruption) {
            result[slotId] = { level, tier: this.getTier(level) };
        }
        return result;
    }
}

// Global instance
const corruptionManager = new CorruptionManager();
