/**
 * Sample configuration for wrenchbox
 * Phase 3: Define available audio samples
 *
 * When samples are available, they take priority over synths.
 * If a sample fails to load, the synth fallback is used.
 *
 * Audio specifications:
 * - Format: OGG Vorbis (primary), MP3 (fallback)
 * - Sample Rate: 44.1kHz
 * - Channels: Stereo for music, mono for SFX
 * - Loop length: 4 bars at 120 BPM = 8 seconds
 */

const SAMPLE_CONFIG = {
    // Beats
    kick: {
        url: 'assets/sounds/default/kick.ogg',
        urlB: 'assets/sounds/default/kick_b.ogg',
        type: 'beats',
        loopStart: 0,
        loopEnd: 8  // 8 seconds = 4 bars at 120 BPM
    },
    snare: {
        url: 'assets/sounds/default/snare.ogg',
        urlB: 'assets/sounds/default/snare_b.ogg',
        type: 'beats',
        loopStart: 0,
        loopEnd: 8
    },
    hihat: {
        url: 'assets/sounds/default/hihat.ogg',
        urlB: 'assets/sounds/default/hihat_b.ogg',
        type: 'effects',
        loopStart: 0,
        loopEnd: 8
    },

    // Melodic
    bass: {
        url: 'assets/sounds/default/bass.ogg',
        urlB: 'assets/sounds/default/bass_b.ogg',
        type: 'bass',
        loopStart: 0,
        loopEnd: 8
    },
    lead: {
        url: 'assets/sounds/default/lead.ogg',
        urlB: 'assets/sounds/default/lead_b.ogg',
        type: 'melodies',
        loopStart: 0,
        loopEnd: 8
    }
};

/**
 * Check if we're running from a server (samples require HTTP)
 * file:// protocol can't load audio files due to CORS
 */
function canLoadSamples() {
    return window.location.protocol !== 'file:';
}
