/**
 * HorrorEffects - Audio and visual effects for corruption
 * Phase 6: Progressive horror transformation
 *
 * Audio effects by tier:
 * - LOW (25-49%): Subtle detuning (+/- 10 cents)
 * - MEDIUM (50-74%): Bitcrushing (12-bit → 6-bit)
 * - HIGH (75-99%): Ring modulation (30Hz) + distortion
 * - FULL (100%): All effects maxed
 *
 * Visual effects by tier:
 * - LOW: Slight hue shift
 * - MEDIUM: Desaturation, subtle glitch
 * - HIGH: Strong glitch, chromatic aberration
 * - FULL: Full horror mode, inverted colors
 */

class HorrorEffects {
    constructor() {
        // Audio effect chains per slot
        this.effectChains = new Map(); // slotId -> { effects }

        // Global effects (applied to master)
        this.globalEffects = null;

        // Track current tiers
        this.slotTiers = new Map();
    }

    /**
     * Initialize global horror effects
     */
    init() {
        // Create global effect chain for overall horror ambiance
        const reverb = new Tone.Reverb({
            decay: 4,
            wet: 0
        }).toDestination();

        const filter = new Tone.Filter({
            frequency: 20000,
            type: 'lowpass'
        }).connect(reverb);

        this.globalEffects = { reverb, filter };

        console.log('[HorrorEffects] Initialized');
    }

    /**
     * Create effect chain for a slot
     */
    createEffectChain(slotId, channel) {
        // Effects chain initialized here. No channel.disconnect() needed
        // as channel is newly created in AudioEngine.

        // Create effects chain
        const effects = {
            // Detuning via pitch shift
            pitchShift: new Tone.PitchShift({
                pitch: 0,
                wet: 0
            }),

            // Bitcrusher for digital degradation
            bitCrusher: new Tone.BitCrusher({
                bits: 16,
                wet: 0
            }),

            // Ring modulator for metallic/robotic sound
            freqShift: new Tone.FrequencyShifter({
                frequency: 0
            }),

            // Distortion for harsh clipping
            distortion: new Tone.Distortion({
                distortion: 0,
                wet: 0
            }),

            // Tremolo for unsettling wobble
            tremolo: new Tone.Tremolo({
                frequency: 0,
                depth: 0
            }).start()
        };

        // Connect chain: channel → effects → global effects
        channel.connect(effects.pitchShift);
        effects.pitchShift.connect(effects.bitCrusher);
        effects.bitCrusher.connect(effects.freqShift);
        effects.freqShift.connect(effects.distortion);
        effects.distortion.connect(effects.tremolo);
        
        // Final connection to global effects chain
        if (this.globalEffects && this.globalEffects.filter) {
            effects.tremolo.connect(this.globalEffects.filter);
        } else {
            effects.tremolo.toDestination();
        }

        this.effectChains.set(slotId, effects);
        this.slotTiers.set(slotId, 'none');

        return effects;
    }

    /**
     * Update effects based on corruption tier
     */
    updateSlotEffects(slotId, tier, level) {
        const effects = this.effectChains.get(slotId);
        if (!effects) return;

        const oldTier = this.slotTiers.get(slotId);
        this.slotTiers.set(slotId, tier);

        // Calculate intensity (0-1) within the tier
        const intensity = (level % 25) / 25;

        switch (tier) {
            case 'none':
                this.resetEffects(effects);
                break;

            case 'low':
                // Subtle detuning
                effects.pitchShift.pitch = (Math.random() - 0.5) * 0.2; // +/- 10 cents
                effects.pitchShift.wet.value = 0.3 + intensity * 0.3;
                effects.tremolo.frequency.value = 2 + intensity * 2;
                effects.tremolo.depth.value = 0.1 + intensity * 0.1;
                break;

            case 'medium':
                // Bitcrushing + increased detuning
                effects.pitchShift.pitch = (Math.random() - 0.5) * 0.4;
                effects.pitchShift.wet.value = 0.6;
                effects.bitCrusher.bits = 12 - Math.floor(intensity * 4); // 12 → 8 bit
                effects.bitCrusher.wet.value = 0.3 + intensity * 0.3;
                effects.tremolo.frequency.value = 4 + intensity * 4;
                effects.tremolo.depth.value = 0.2 + intensity * 0.2;
                break;

            case 'high':
                // Ring modulation + distortion
                effects.pitchShift.pitch = (Math.random() - 0.5) * 0.6;
                effects.pitchShift.wet.value = 0.8;
                effects.bitCrusher.bits = 8 - Math.floor(intensity * 2); // 8 → 6 bit
                effects.bitCrusher.wet.value = 0.6;
                effects.freqShift.frequency.value = 20 + intensity * 20; // 20-40 Hz
                effects.distortion.distortion = 0.3 + intensity * 0.3;
                effects.distortion.wet.value = 0.5;
                effects.tremolo.frequency.value = 8 + intensity * 8;
                effects.tremolo.depth.value = 0.4 + intensity * 0.2;
                break;

            case 'full':
                // Maximum horror
                effects.pitchShift.pitch = (Math.random() - 0.5) * 1;
                effects.pitchShift.wet.value = 1;
                effects.bitCrusher.bits = 4;
                effects.bitCrusher.wet.value = 0.8;
                effects.freqShift.frequency.value = 30 + Math.random() * 20;
                effects.distortion.distortion = 0.8;
                effects.distortion.wet.value = 0.7;
                effects.tremolo.frequency.value = 12 + Math.random() * 8;
                effects.tremolo.depth.value = 0.6;
                break;
        }

        // Log tier change
        if (oldTier !== tier) {
            console.log('[HorrorEffects] Slot', slotId, 'tier:', tier);
        }
    }

    /**
     * Reset effects to clean state
     */
    resetEffects(effects) {
        effects.pitchShift.pitch = 0;
        effects.pitchShift.wet.value = 0;
        effects.bitCrusher.bits = 16;
        effects.bitCrusher.wet.value = 0;
        effects.freqShift.frequency.value = 0;
        effects.distortion.distortion = 0;
        effects.distortion.wet.value = 0;
        effects.tremolo.frequency.value = 0;
        effects.tremolo.depth.value = 0;
    }

    /**
     * Apply visual corruption class to element
     */
    applyVisualCorruption(element, tier, level) {
        // Remove all corruption classes
        element.classList.remove(
            'corruption-none',
            'corruption-low',
            'corruption-medium',
            'corruption-high',
            'corruption-full'
        );

        // Add current tier class
        element.classList.add(`corruption-${tier}`);

        // Set CSS variable for intensity-based effects
        element.style.setProperty('--corruption-level', level / 100);
    }

    /**
     * Update global horror ambiance
     */
    updateGlobalEffects(maxCorruption) {
        if (!this.globalEffects) return;

        const intensity = maxCorruption / 100;

        // Increase reverb as corruption spreads
        this.globalEffects.reverb.wet.value = intensity * 0.3;

        // Darken high frequencies
        this.globalEffects.filter.frequency.value = 20000 - (intensity * 15000);
    }

    /**
     * Dispose effect chain for a slot
     */
    disposeEffectChain(slotId) {
        const effects = this.effectChains.get(slotId);
        if (effects) {
            effects.pitchShift.dispose();
            effects.bitCrusher.dispose();
            effects.freqShift.dispose();
            effects.distortion.dispose();
            effects.tremolo.dispose();
            this.effectChains.delete(slotId);
        }
        this.slotTiers.delete(slotId);
    }

    /**
     * Reset all effects
     */
    reset() {
        for (const [slotId, effects] of this.effectChains) {
            this.resetEffects(effects);
        }

        if (this.globalEffects) {
            this.globalEffects.reverb.wet.value = 0;
            this.globalEffects.filter.frequency.value = 20000;
        }
    }
}

// Global instance
const horrorEffects = new HorrorEffects();
