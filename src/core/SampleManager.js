/**
 * SampleManager - Load and manage audio samples for wrenchbox
 * Phase 3: Sample-based audio using Tone.Player
 *
 * Learning goals:
 * - Tone.Player for sample playback
 * - Tone.Players for managing multiple samples
 * - Asset preloading with Tone.loaded()
 * - Loop A/B variation system
 */

class SampleManager {
    constructor() {
        this.players = new Map();  // slotId -> Tone.Player
        this.samples = new Map();  // soundName -> { url, loaded, buffer }
        this.loaded = false;
        this.loadProgress = 0;
    }

    /**
     * Register samples from config
     * @param {Object} soundConfig - { soundName: { url, loopStart, loopEnd } }
     */
    registerSamples(soundConfig) {
        for (const [name, config] of Object.entries(soundConfig)) {
            this.samples.set(name, {
                url: config.url,
                urlB: config.urlB || null,  // Optional variation
                loopStart: config.loopStart || 0,
                loopEnd: config.loopEnd || null,
                loaded: false,
                buffer: null,
                bufferB: null,
                useVariation: false
            });
        }
    }

    /**
     * Preload all registered samples
     * @returns {Promise} Resolves when all samples loaded
     */
    async preload(onProgress) {
        const sampleList = Array.from(this.samples.entries());
        let loadedCount = 0;

        const loadPromises = sampleList.map(async ([name, config]) => {
            try {
                // Load primary sample
                const buffer = await Tone.Buffer.fromUrl(config.url);
                config.buffer = buffer;
                config.loaded = true;

                // Load variation if exists
                if (config.urlB) {
                    const bufferB = await Tone.Buffer.fromUrl(config.urlB);
                    config.bufferB = bufferB;
                }

                loadedCount++;
                this.loadProgress = loadedCount / sampleList.length;
                if (onProgress) onProgress(this.loadProgress, name);

                console.log('[SampleManager] Loaded:', name);
            } catch (err) {
                console.warn('[SampleManager] Failed to load:', name, err);
                // Mark as not loaded - will fall back to synth
                config.loaded = false;
            }
        });

        await Promise.all(loadPromises);
        this.loaded = true;
        console.log('[SampleManager] All samples loaded');
    }

    /**
     * Check if a sample is available
     */
    hasSample(soundName) {
        const sample = this.samples.get(soundName);
        return sample && sample.loaded;
    }

    /**
     * Create a player for a slot
     * @param {string} soundName - The sound to play
     * @param {number} slotId - Slot identifier
     * @param {Tone.Channel} channel - Output channel
     * @returns {Tone.Player|null}
     */
    createPlayer(soundName, slotId, channel) {
        const sample = this.samples.get(soundName);
        if (!sample || !sample.loaded) {
            return null;
        }

        // Calculate the nearest whole bar for the loop end if not specified
        // This ensures a 1.9s or 2.1s sample snaps perfectly to a 2.0s (1m) bar
        let loopEnd = sample.loopEnd;
        if (!loopEnd && sample.buffer) {
            const barDuration = 60 / Tone.Transport.bpm.value * 4;
            const numBars = Math.max(1, Math.round(sample.buffer.duration / barDuration));
            loopEnd = `${numBars}m`;
        }

        // Create player with the buffer
        const player = new Tone.Player({
            url: sample.buffer,
            loop: true,
            loopStart: sample.loopStart,
            loopEnd: loopEnd,
            fadeIn: 0.005,
            fadeOut: 0.005
        }).connect(channel);

        this.players.set(slotId, {
            player,
            soundName,
            sample,
            currentVariation: 'A'
        });

        return player;
    }

    /**
     * Start playing a sample (quantized)
     * @param {number} slotId - Slot identifier
     * @param {number} time - Tone.Transport time to start
     */
    startPlayer(slotId, time) {
        const data = this.players.get(slotId);
        if (!data) return;

        data.player.start(time);
    }

    /**
     * Stop a player with micro-fade
     * @param {number} slotId - Slot identifier
     * @param {number} time - Tone.Transport time to stop
     */
    stopPlayer(slotId, time) {
        const data = this.players.get(slotId);
        if (!data) return;

        // Micro-fade handled by player's fadeOut setting
        data.player.stop(time);
    }

    /**
     * Toggle between A/B variations
     * @param {number} slotId - Slot identifier
     */
    toggleVariation(slotId) {
        const data = this.players.get(slotId);
        if (!data || !data.sample.bufferB) return;

        const wasPlaying = data.player.state === 'started';
        const currentTime = Tone.now();

        if (data.currentVariation === 'A') {
            data.player.buffer = data.sample.bufferB;
            data.currentVariation = 'B';
        } else {
            data.player.buffer = data.sample.buffer;
            data.currentVariation = 'A';
        }

        // If was playing, restart with new buffer
        if (wasPlaying) {
            data.player.stop(currentTime);
            data.player.start(currentTime + 0.01);
        }

        console.log('[SampleManager] Variation:', data.currentVariation);
    }

    /**
     * Get current variation for a slot
     */
    getVariation(slotId) {
        const data = this.players.get(slotId);
        return data ? data.currentVariation : 'A';
    }

    /**
     * Dispose a player
     */
    disposePlayer(slotId) {
        const data = this.players.get(slotId);
        if (data) {
            data.player.stop();
            data.player.dispose();
            this.players.delete(slotId);
        }
    }

    /**
     * Dispose all players
     */
    disposeAll() {
        for (const slotId of this.players.keys()) {
            this.disposePlayer(slotId);
        }
    }

    /**
     * Get player for a slot
     */
    getPlayer(slotId) {
        const data = this.players.get(slotId);
        return data ? data.player : null;
    }
}

// Global instance
const sampleManager = new SampleManager();
