/**
 * AudioEngine - Tone.js wrapper for wrenchbox
 * Phase 3: Supports both samples (Tone.Player) and synths (fallback)
 *
 * Learning goals:
 * - Tone.Player for sample playback
 * - Tone.js synths as fallback
 * - Unified interface for both modes
 * - Tone.Channel for per-slot routing
 */

class AudioEngine {
    constructor() {
        this.initialized = false;
        this.slots = new Map();    // slotId -> { mode, synth?, player?, soundName, channel }
        this.channels = new Map(); // slotId -> Tone.Channel
        this.useSamples = true;    // Try samples first, fall back to synths
    }

    /**
     * Initialize Tone.js (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;

        await Tone.start();
        console.log('[AudioEngine] Tone.js started, context state:', Tone.context.state);

        // Set global BPM and enable looping (critical for Incredibox-style)
        Tone.Transport.bpm.value = 120;
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = '4m'; // Default to 4 bars, main.js will override if needed

        this.initialized = true;
    }

    /**
     * Check if samples can be loaded (requires HTTP server)
     */
    canUseSamples() {
        return this.useSamples &&
               typeof sampleManager !== 'undefined' &&
               window.location.protocol !== 'file:';
    }

    /**
     * Create audio source for a slot (sample or synth)
     * @param {string} soundName - The sound to create
     * @param {number} slotId - Slot identifier
     * @returns {string} 'sample' or 'synth' indicating which mode was used
     */
    createSource(soundName, slotId) {
        // Create a channel for this slot
        const channel = new Tone.Channel({ volume: 0 });
        this.channels.set(slotId, channel);

        let mode = null;

        // Try sample first
        if (this.canUseSamples() && sampleManager.hasSample(soundName)) {
            const player = sampleManager.createPlayer(soundName, slotId, channel);
            if (player) {
                player.sync().start(0);
                this.slots.set(slotId, { mode: 'sample', player, soundName, channel });
                console.log('[AudioEngine] Using synced sample for:', soundName);
                mode = 'sample';
            }
        }

        // Fall back to synth if no sample
        if (!mode) {
            const soundDef = Sequencer.getSound(soundName);
            const synth = this.createSynth(soundName, channel, soundDef?.synth);
            if (synth) {
                this.slots.set(slotId, { mode: 'synth', synth, soundName, channel });
                console.log('[AudioEngine] Using synth for:', soundName);
                mode = 'synth';
            }
        }

        // Routing: delegate to horror effects or fallback to destination
        if (mode) {
            if (typeof horrorEffects !== 'undefined') {
                try {
                    horrorEffects.createEffectChain(slotId, channel);
                } catch (err) {
                    console.warn('[AudioEngine] Horror effects failed, falling back to direct routing:', err);
                    channel.toDestination();
                }
            } else {
                channel.toDestination();
            }
        } else {
            console.warn('[AudioEngine] Failed to create source for:', soundName);
        }

        return mode;
    }

    /**
     * Create a synth for a sound type
     * @param {string} soundName - The sound type
     * @param {Tone.Channel} channel - Output channel
     * @param {Object} synthConfig - Optional theme synth config {type, options}
     * @returns {Object} Synth instance
     */
    createSynth(soundName, channel, synthConfig = null) {
        let synth;

        // Try theme config first
        if (synthConfig && synthConfig.type) {
            const SynthClass = Tone[synthConfig.type];
            if (SynthClass) {
                try {
                    synth = new SynthClass(synthConfig.options || {}).connect(channel);
                    if (synthConfig.volume !== undefined) {
                        synth.volume.value = synthConfig.volume;
                    }
                    console.log('[AudioEngine] Created synth from theme config:', synthConfig.type);
                    return synth;
                } catch (err) {
                    console.warn('[AudioEngine] Failed to create theme synth:', err);
                    // Fall through to hardcoded
                }
            } else {
                console.warn('[AudioEngine] Unknown Tone.js synth type:', synthConfig.type);
            }
        }

        // Fall back to hardcoded synths
        switch (soundName) {
            case 'kick':
                synth = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 6,
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.5,
                        sustain: 0,
                        release: 0.2
                    }
                }).connect(channel);
                synth.volume.value = 3; // Boosted for maximum visibility
                break;

            case 'snare':
                synth = new Tone.NoiseSynth({
                    noise: { type: 'white' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.15,
                        sustain: 0,
                        release: 0.05
                    }
                }).connect(channel);
                const snareFilter = new Tone.Filter(3000, 'bandpass').connect(channel);
                synth.connect(snareFilter);
                break;

            case 'hihat':
                synth = new Tone.MetalSynth({
                    frequency: 200,
                    envelope: {
                        attack: 0.001,
                        decay: 0.05,
                        release: 0.01
                    },
                    harmonicity: 5.1,
                    modulationIndex: 32,
                    resonance: 4000,
                    octaves: 1.5
                }).connect(channel);
                synth.volume.value = -6;
                break;

            case 'bass':
                synth = new Tone.MonoSynth({
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 0.2
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.2,
                        sustain: 0.5,
                        release: 0.2,
                        baseFrequency: 200,
                        octaves: 2
                    }
                }).connect(channel);
                break;

            case 'lead':
                synth = new Tone.MonoSynth({
                    oscillator: { type: 'square' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.2,
                        sustain: 0.3,
                        release: 0.3
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.8,
                        release: 0.2,
                        baseFrequency: 400,
                        octaves: 3
                    }
                }).connect(channel);
                synth.volume.value = -12; // Reduced - was too loud
                break;

            case 'cursed':
                // Creepy detuned synth for horror mode trigger
                synth = new Tone.MonoSynth({
                    oscillator: { type: 'sawtooth' },
                    envelope: {
                        attack: 0.1,
                        decay: 0.4,
                        sustain: 0.6,
                        release: 0.8
                    },
                    filterEnvelope: {
                        attack: 0.05,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 0.5,
                        baseFrequency: 100,
                        octaves: 2
                    }
                }).connect(channel);
                synth.volume.value = -4;
                break;

            default:
                console.warn('[AudioEngine] Unknown sound type:', soundName);
                return null;
        }

        return synth;
    }

    /**
     * Get the mode for a slot ('sample' or 'synth')
     */
    getMode(slotId) {
        const slot = this.slots.get(slotId);
        return slot ? slot.mode : null;
    }

    /**
     * Get the synth for a slot (for sequencer triggering)
     */
    getSynth(slotId) {
        const slot = this.slots.get(slotId);
        return slot && slot.mode === 'synth' ? slot.synth : null;
    }

    /**
     * Get the player for a slot
     */
    getPlayer(slotId) {
        const slot = this.slots.get(slotId);
        return slot && slot.mode === 'sample' ? slot.player : null;
    }

    /**
     * Start a sample player (for sample mode)
     * @param {number} slotId - Slot identifier
     * @param {number} time - When to start
     */
    startPlayer(slotId, time) {
        // Since players are synced, we use their volume/mute rather than re-starting
        // but for safety in this architecture, we ensure they are "on"
        const slot = this.slots.get(slotId);
        if (slot && slot.mode === 'sample') {
            // If already synced and started(0), this is a no-op that ensures play state
            if (slot.player.state !== 'started') {
                 slot.player.start(0);
            }
        }
    }

    /**
     * Stop a sample player (for sample mode)
     * @param {number} slotId - Slot identifier
     * @param {number} time - When to stop
     */
    stopPlayer(slotId, time) {
        const slot = this.slots.get(slotId);
        if (slot && slot.mode === 'sample') {
            slot.player.stop(time);
        }
    }

    /**
     * Trigger a synth note (for synth mode, called by Sequencer)
     */
    triggerSound(slotId, note, duration = '8n', time) {
        const slot = this.slots.get(slotId);
        if (!slot || slot.mode !== 'synth') return;

        const { synth, soundName } = slot;

        if (soundName === 'kick') {
            synth.triggerAttackRelease('C2', duration, time);
        } else if (soundName === 'snare' || soundName === 'hihat') {
            synth.triggerAttackRelease(duration, time);
        } else {
            synth.triggerAttackRelease(note, duration, time);
        }
    }

    /**
     * Toggle A/B variation (sample mode only)
     */
    toggleVariation(slotId) {
        const slot = this.slots.get(slotId);
        if (slot && slot.mode === 'sample') {
            sampleManager.toggleVariation(slotId);
        }
    }

    /**
     * Dispose a slot's audio resources
     */
    disposeSlot(slotId) {
        const slot = this.slots.get(slotId);
        if (slot) {
            if (slot.mode === 'sample') {
                sampleManager.disposePlayer(slotId);
            } else if (slot.synth) {
                slot.synth.dispose();
            }
            this.slots.delete(slotId);
        }

        const channel = this.channels.get(slotId);
        if (channel) {
            channel.dispose();
            this.channels.delete(slotId);
        }

        // Dispose horror effects if available
        if (typeof horrorEffects !== 'undefined') {
            horrorEffects.disposeEffectChain(slotId);
        }
    }

    /**
     * Dispose all slots
     */
    disposeAll() {
        for (const slotId of this.slots.keys()) {
            this.disposeSlot(slotId);
        }
    }

    /**
     * Mute a slot
     */
    muteSlot(slotId, muted) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.mute = muted;
        }
    }

    /**
     * Solo a slot
     */
    soloSlot(slotId, solo) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.solo = solo;
        }
    }

    /**
     * Set slot volume (in dB)
     */
    setSlotVolume(slotId, volumeDb) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.volume.value = volumeDb;
        }
    }

    // Legacy methods for backwards compatibility
    createSynthLegacy(soundName, slotId) {
        return this.createSource(soundName, slotId);
    }

    disposeSynth(slotId) {
        return this.disposeSlot(slotId);
    }
}

// Global instance
const audioEngine = new AudioEngine();
