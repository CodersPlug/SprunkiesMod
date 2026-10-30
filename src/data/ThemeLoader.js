/**
 * ThemeLoader - Load and apply themes from JSON config
 * Phase 4: Data-driven theming system
 *
 * Learning goals:
 * - JSON config loading
 * - Dynamic asset paths
 * - CSS variable injection
 * - Graceful fallbacks
 */

class ThemeLoader {
    constructor() {
        this.theme = null;
        this.themePath = '';
        this.loaded = false;
    }

    /**
     * Load a theme from its folder
     * @param {string} themeId - Theme folder name (e.g., 'default')
     * @returns {Promise<Object>} Theme config
     */
    async load(themeId = 'default') {
        this.themePath = `themes/${themeId}`;

        try {
            const response = await fetch(`${this.themePath}/theme.json`);
            if (!response.ok) {
                throw new Error(`Theme not found: ${themeId}`);
            }

            this.theme = await response.json();
            this.loaded = true;

            console.log('[ThemeLoader] Loaded theme:', this.theme.meta.name);
            return this.theme;
        } catch (err) {
            console.error('[ThemeLoader] Failed to load theme:', err);
            // Return minimal fallback theme
            return this.getFallbackTheme();
        }
    }

    /**
     * Get fallback theme when loading fails
     */
    getFallbackTheme() {
        return {
            meta: { id: 'fallback', name: 'Fallback', bpm: 120 },
            colors: {
                primary: '#1a1a2e',
                accent: '#00ffff',
                beats: '#ff4444',
                effects: '#4488ff',
                melodies: '#44ff88',
                bass: '#ff88ff',
                cursed: '#660000'
            },
            sounds: {},
            bonuses: [],
            corruption: { enabled: false }
        };
    }

    /**
     * Apply theme colors as CSS variables
     */
    applyColors() {
        if (!this.theme?.colors) return;

        const root = document.documentElement;
        const colors = this.theme.colors;

        // Map theme colors to CSS variables
        const cssVars = {
            '--bg-primary': colors.primary,
            '--bg-secondary': colors.secondary,
            '--accent': colors.accent,
            '--text': colors.text,
            '--text-muted': colors.textMuted,
            '--color-beats': colors.beats,
            '--color-effects': colors.effects,
            '--color-melodies': colors.melodies,
            '--color-voices': colors.voices,
            '--color-bass': colors.bass,
            '--color-cursed': colors.cursed
        };

        for (const [varName, value] of Object.entries(cssVars)) {
            if (value) {
                root.style.setProperty(varName, value);
            }
        }

        console.log('[ThemeLoader] Applied theme colors');
    }

    /**
     * Apply background settings
     */
    applyBackground() {
        if (!this.theme?.background) return;

        const bg = this.theme.background;
        const body = document.body;

        if (bg.type === 'gradient' && bg.colors) {
            body.style.background = `linear-gradient(135deg, ${bg.colors[0]} 0%, ${bg.colors[1]} 100%)`;
        } else if (bg.type === 'image' && bg.image) {
            body.style.backgroundImage = `url(${this.getAssetPath(bg.image)})`;
            body.style.backgroundSize = 'cover';
        } else if (bg.type === 'color' && bg.colors?.[0]) {
            body.style.background = bg.colors[0];
        }
    }

    /**
     * Get full asset path
     */
    getAssetPath(relativePath) {
        if (!relativePath) return null;
        return `${this.themePath}/${relativePath}`;
    }

    /**
     * Get sounds config converted for Sequencer
     */
    getSoundsConfig() {
        if (!this.theme?.sounds) return {};

        const sounds = {};
        for (const [id, sound] of Object.entries(this.theme.sounds)) {
            sounds[id] = {
                type: sound.type,
                name: sound.name || id,
                icon: sound.iconEmoji || '🎵',
                iconPath: sound.icon ? this.getAssetPath(sound.icon) : null,
                iconPathViral: sound.icon_viral ? this.getAssetPath(sound.icon_viral) : null,
                pattern: sound.pattern,
                patternB: sound.patternB || sound.pattern,
                subdivision: sound.subdivision,
                cursed: sound.cursed || false,
                soundPath: sound.sound ? this.getAssetPath(sound.sound) : null,
                soundPathB: sound.soundB ? this.getAssetPath(sound.soundB) : null,
                synth: sound.synth
            };
        }
        return sounds;
    }

    /**
     * Get bonuses config
     */
    getBonusesConfig() {
        if (!this.theme?.bonuses) return [];

        return this.theme.bonuses.map(bonus => ({
            ...bonus,
            icon: bonus.iconEmoji || '🎁',
            iconPath: bonus.icon ? this.getAssetPath(bonus.icon) : null,
            videoPath: bonus.video ? this.getAssetPath(bonus.video) : null
        }));
    }

    /**
     * Get corruption config
     */
    getCorruptionConfig() {
        return this.theme?.corruption || { enabled: false };
    }

    /**
     * Get UI config
     */
    getUIConfig() {
        return this.theme?.ui || {
            slotCount: 7,
            slotSize: 100,
            iconSize: 60
        };
    }

    /**
     * Get meta info
     */
    getMeta() {
        return this.theme?.meta || { name: 'Unknown', bpm: 120 };
    }

    /**
     * Check if theme has custom icons (images vs emoji)
     */
    hasCustomIcons() {
        if (!this.theme?.sounds) return false;
        return Object.values(this.theme.sounds).some(s => s.icon);
    }

    /**
     * Check if theme has audio samples
     */
    hasAudioSamples() {
        if (!this.theme?.sounds) return false;
        return Object.values(this.theme.sounds).some(s => s.sound);
    }
}

// Global instance
const themeLoader = new ThemeLoader();
