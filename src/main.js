/**
 * wrenchbox - Main Application
 * Complete: Phases 1-6 with data-driven theming
 *
 * Learning goals:
 * - Theme/mod loading from JSON
 * - Dynamic asset paths
 * - CSS variable injection
 * - Graceful fallbacks
 */

// App state
const state = {
    slots: [], // { id, soundName, element, active, muted, soloed }
    initialized: false,
    soloedSlotId: null // Track which slot is soloed (only one at a time)
};

// Config
const CONFIG = {
    NUM_SLOTS: 7,
    BPM: 120
};

// Icons for sounds (fallback)
const SOUND_ICONS = {
    kick: '🥁',
    snare: '🪘',
    hihat: '🎩',
    bass: '🎸',
    lead: '🎹',
    cursed: '💀'
};

/**
 * Build sample config from theme sounds
 * @param {Object} themeSounds - Sounds from themeLoader.getSoundsConfig()
 * @param {Object} meta - Theme metadata with bpm, loopBars
 * @returns {Object} Sample config for SampleManager
 */
function buildSampleConfigFromTheme(themeSounds, meta) {
    if (!themeSounds) return {};

    const bpm = meta.bpm || 120;
    const loopBars = meta.loopBars || 4;
    // Calculate loop duration: (bars * beats * 60) / BPM
    const loopDuration = (loopBars * 4 * 60) / bpm;

    const sampleConfig = {};

    for (const [soundName, config] of Object.entries(themeSounds)) {
        // Only add if theme has a sound path
        if (config.soundPath) {
            sampleConfig[soundName] = {
                url: config.soundPath,
                urlB: config.soundPathB || null,
                type: config.type || 'effects',
                loopStart: 0,
                loopEnd: loopDuration
            };
        }
    }

    if (Object.keys(sampleConfig).length > 0) {
        console.log('[wrenchbox] Built sample config from theme:', Object.keys(sampleConfig));
    }

    return sampleConfig;
}

/**
 * Get theme ID from URL parameter
 * Usage: index.html?theme=my-theme
 */
function getThemeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('theme');
}

/**
 * Initialize the app
 */
function init() {
    const overlay = document.getElementById('startOverlay');
    overlay.addEventListener('click', handleStart);
    console.log('[wrenchbox] Ready - click to start');
}

/**
 * Handle start overlay click
 */
async function handleStart() {
    if (state.initialized) return;

    const overlay = document.getElementById('startOverlay');
    const app = document.getElementById('app');
    const startContent = overlay.querySelector('.start-content p');

    try {
        // Load theme first
        startContent.textContent = 'Loading theme...';
        const themeId = getThemeFromUrl() || 'sprunkies';
        await themeLoader.load(themeId);

        // Apply theme colors and background
        themeLoader.applyColors();
        themeLoader.applyBackground();

        // Update config from theme
        const meta = themeLoader.getMeta();
        const uiConfig = themeLoader.getUIConfig();
        CONFIG.BPM = meta.bpm || 120;
        CONFIG.NUM_SLOTS = uiConfig.slotCount || 7;
        if (uiConfig.iconSize) {
            document.documentElement.style.setProperty('--icon-size', `${uiConfig.iconSize}px`);
        }
        
        // Set transport loop end based on theme
        const loopBars = meta.loopBars || 4;
        Tone.Transport.loopEnd = `${loopBars}m`;
        console.log('[wrenchbox] Loop set to', loopBars, 'bars');

        // Initialize Sequencer with theme sounds
        const themeSounds = themeLoader.getSoundsConfig();
        Sequencer.initializeFromTheme(themeSounds);

        // Update overlay to show loading
        startContent.textContent = 'Initializing audio...';

        await audioEngine.init();

        // Build sample config from theme (with fallback to hardcoded)
        const themeSampleConfig = buildSampleConfigFromTheme(themeSounds, meta);

        // Try to preload samples (only works on HTTP, not file://)
        if (typeof sampleManager !== 'undefined') {
            // Use theme samples if available, otherwise fallback to SAMPLE_CONFIG
            const samplesToUse = Object.keys(themeSampleConfig).length > 0
                ? themeSampleConfig
                : (typeof SAMPLE_CONFIG !== 'undefined' ? SAMPLE_CONFIG : {});

            if (Object.keys(samplesToUse).length > 0 && window.location.protocol !== 'file:') {
                startContent.textContent = 'Loading samples...';
                sampleManager.registerSamples(samplesToUse);

                try {
                    await sampleManager.preload((progress, name) => {
                        startContent.textContent = `Loading: ${name} (${Math.round(progress * 100)}%)`;
                    });
                } catch (err) {
                    console.warn('[wrenchbox] Sample preload failed, using synths:', err);
                }
            } else if (window.location.protocol === 'file:') {
                console.log('[wrenchbox] Running from file://, using synths (samples require HTTP server)');
            }
        }

        window.sequencer = new Sequencer(audioEngine, CONFIG.BPM);
        sequencer.init();

        // Initialize bonus system
        setupBonusSystem();

        // Horror only if theme enables corruption
        const corruptionConfig = themeLoader.getCorruptionConfig();
        if (corruptionConfig.enabled !== false) {
            setupHorrorSystem();
        } else if (typeof corruptionManager !== 'undefined') {
            corruptionManager.enabled = false;
        }

        createSlots();
        createSoundIcons();
        createBonusIndicator();
        if (corruptionConfig.enabled !== false) {
            createCureButton();
        }
        setupDragDrop();
        setupEventListeners();
        updateBpmDisplay();
        updateModeIndicator();
        updatePaletteAvailability();

        overlay.style.display = 'none';
        app.style.display = 'flex';

        state.initialized = true;

        const mode = audioEngine.canUseSamples() && sampleManager.loaded ? 'samples' : 'synths';
        const themeName = themeLoader.getMeta().name;
        console.log(`[wrenchbox] Ready! Theme: ${themeName}, Audio: ${mode}`);
    } catch (err) {
        console.error('[wrenchbox] Failed to initialize:', err);
        startContent.textContent = 'Error: ' + err.message;
    }
}

/**
 * Create empty character slots
 */
function createSlots() {
    const container = document.getElementById('slots');

    for (let i = 0; i < CONFIG.NUM_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot empty';
        slot.dataset.slotId = i;

        slot.innerHTML = `
            <div class="slot-content">
                <span class="slot-icon">+</span>
            </div>
            <span class="slot-label">soltá aquí</span>
            <div class="slot-controls">
                <button class="slot-btn mute-btn" title="Mute (click)">M</button>
                <button class="slot-btn solo-btn" title="Solo (S)">S</button>
            </div>
            <div class="beat-indicator"></div>
        `;

        state.slots.push({
            id: i,
            soundName: null,
            element: slot,
            active: false,
            muted: false,
            soloed: false
        });

        container.appendChild(slot);
    }
}

/**
 * Create sound icons in palette
 */
function createSoundIcons() {
    const container = document.getElementById('soundIcons');
    const sounds = Sequencer.getSoundNames();
    const themeSounds = themeLoader.getSoundsConfig();

    for (const soundName of sounds) {
        const sound = Sequencer.getSound(soundName);
        if (!sound || sound.cursed) continue;

        const themeSound = themeSounds[soundName];
        const icon = document.createElement('div');
        icon.className = 'sound-icon';
        icon.dataset.soundName = soundName;
        icon.dataset.type = sound.type;

        // Prefer emoji for Sprunkies (cute); image only if theme provides one
        if (themeSound?.iconPath) {
            icon.innerHTML = `<img src="${themeSound.iconPath}" alt="${soundName}" style="width:100%;height:100%;object-fit:contain;">`;
        } else {
            icon.innerHTML = themeSound?.icon || SOUND_ICONS[soundName] || '🎵';
        }

        const label = themeSound?.name || soundName;
        icon.title = `Arrastrá ${label} a un slot`;

        container.appendChild(icon);
    }
}

/**
 * Set up drag-drop functionality
 */
function setupDragDrop() {
    window.dragDrop = new DragDrop({
        onDrop: (slotId, soundName) => assignSoundToSlot(slotId, soundName),
        onRemove: (slotId) => removeSoundFromSlot(slotId)
    });
    dragDrop.init();
}

/**
 * True if this instrument is already on another slot
 */
function isSoundInUse(soundName, exceptSlotId = null) {
    return state.slots.some(
        (s) => s.soundName === soundName && s.id !== exceptSlotId
    );
}

/**
 * Dim palette icons that are already placed (one instance only)
 */
function updatePaletteAvailability() {
    document.querySelectorAll('.sound-icon').forEach((icon) => {
        const name = icon.dataset.soundName;
        const used = isSoundInUse(name);
        icon.classList.toggle('used', used);
        icon.setAttribute('draggable', 'false');
        icon.setAttribute('aria-disabled', used ? 'true' : 'false');
        if (used) {
            icon.title = 'Ya está en el escenario (solo una vez)';
        } else {
            const themeSound = themeLoader.getSoundsConfig()[name];
            const label = themeSound?.name || name;
            icon.title = `Arrastrá ${label} a un slot`;
        }
    });
}

/**
 * Assign a sound to a slot
 */
function assignSoundToSlot(slotId, soundName) {
    const slot = state.slots[slotId];
    if (!slot) return;

    const sound = Sequencer.getSound(soundName);
    if (!sound) return;

    // One instrument = one slot only
    if (isSoundInUse(soundName, slotId)) {
        console.log('[wrenchbox] Sound already placed:', soundName);
        return;
    }

    // If slot already has a sound, stop it first
    if (slot.active) {
        sequencer.stopPattern(slotId);
    }

    // Update state
    slot.soundName = soundName;
    slot.active = true;
    slot.muted = false;

    // Update UI
    const slotEl = slot.element;
    slotEl.classList.remove('empty');
    slotEl.classList.add('active');
    slotEl.dataset.soundName = soundName;
    slotEl.dataset.type = sound.type;

    const iconEl = slotEl.querySelector('.slot-icon');
    const labelEl = slotEl.querySelector('.slot-label');
    
    // Use theme icon if available
    const themeSounds = themeLoader.getSoundsConfig();
    const themeSound = themeSounds[soundName];
    if (themeSound?.iconPath) {
        iconEl.innerHTML = `<img src="${themeSound.iconPath}" alt="${soundName}" class="icon-img" style="width:100%;height:100%;object-fit:contain;">`;
    } else {
        iconEl.textContent = themeSound?.icon || SOUND_ICONS[soundName] || '🎵';
    }
    
    labelEl.textContent = themeSound?.name || sound.name || soundName;
    slotEl.title = 'Tocá para quitar';

    // Make slot draggable
    dragDrop.updateSlotDraggable(slotEl, true);

    // Start the pattern (quantized to next bar)
    startPatternQuantized(slotId, soundName);

    // Apply current solo state
    updateMuteStates();

    // Check for bonus triggers
    checkForBonus();

    // Check if this is a cursed sound - trigger horror mode
    if (sound.cursed && corruptionManager.enabled && !corruptionManager.isHorrorMode()) {
        corruptionManager.startCorruption(slotId);
    }

    updatePaletteAvailability();
    console.log('[wrenchbox] Assigned', soundName, 'to slot', slotId);
}

/**
 * Remove sound from a slot
 */
function removeSoundFromSlot(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    // Stop the pattern
    if (slot.active) {
        sequencer.stopPattern(slotId);
    }

    // If this slot was soloed, clear solo
    if (state.soloedSlotId === slotId) {
        state.soloedSlotId = null;
    }

    // Update state
    const oldSound = slot.soundName;
    slot.soundName = null;
    slot.active = false;
    slot.muted = false;
    slot.soloed = false;

    // Update UI
    const slotEl = slot.element;
    slotEl.classList.add('empty');
    slotEl.classList.remove('active', 'muted', 'soloed');
    delete slotEl.dataset.soundName;
    delete slotEl.dataset.type;

    const iconEl = slotEl.querySelector('.slot-icon');
    const labelEl = slotEl.querySelector('.slot-label');
    iconEl.textContent = '+';
    labelEl.textContent = 'soltá aquí';

    // Make slot not draggable
    dragDrop.updateSlotDraggable(slotEl, false);

    // Update mute states for remaining slots
    updateMuteStates();
    updatePaletteAvailability();

    console.log('[wrenchbox] Removed', oldSound, 'from slot', slotId);
}

function startPatternQuantized(slotId, soundName) {
    const slot = state.slots[slotId];

    // Use a small lookahead and quantization to the next beat (4n)
    // This solves the "jitter/off" feeling by ensuring it hits a grid line
    // FIX: Removed Tone.Transport.scheduleOnce because it fails when Transport loops.
    // Tone.js sources (Player.sync, Sequence) automatically align to Transport time.

    if (state.slots[slotId].soundName === soundName) {
        sequencer.startPattern(slotId, soundName);
        updateMuteStates();
    }

    // Ensure transport is running
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
}

/**
 * Toggle mute on a slot
 */
function toggleMute(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    slot.muted = !slot.muted;
    audioEngine.muteSlot(slotId, slot.muted);

    slot.element.classList.toggle('muted', slot.muted);

    console.log('[wrenchbox] Slot', slotId, slot.muted ? 'muted' : 'unmuted');
}

/**
 * Toggle solo on a slot (exclusive - only one at a time)
 */
function toggleSolo(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    if (state.soloedSlotId === slotId) {
        // Unsolo
        state.soloedSlotId = null;
        slot.soloed = false;
        slot.element.classList.remove('soloed');
    } else {
        // Solo this slot, unsolo previous
        if (state.soloedSlotId !== null) {
            const prevSlot = state.slots[state.soloedSlotId];
            prevSlot.soloed = false;
            prevSlot.element.classList.remove('soloed');
        }

        state.soloedSlotId = slotId;
        slot.soloed = true;
        slot.element.classList.add('soloed');
    }

    updateMuteStates();
    console.log('[wrenchbox] Solo:', state.soloedSlotId !== null ? `slot ${state.soloedSlotId}` : 'off');
}

/**
 * Update mute states based on solo
 */
function updateMuteStates() {
    for (const slot of state.slots) {
        if (!slot.soundName) continue;

        let shouldMute = slot.muted;

        // If any slot is soloed, mute all others (unless explicitly muted)
        if (state.soloedSlotId !== null && slot.id !== state.soloedSlotId) {
            shouldMute = true;
        }

        audioEngine.muteSlot(slot.id, shouldMute);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Slot controls + tap to remove instrument
    document.getElementById('slots').addEventListener('click', (e) => {
        const muteBtn = e.target.closest('.mute-btn');
        const soloBtn = e.target.closest('.solo-btn');
        const slot = e.target.closest('.slot');

        if (!slot) return;
        const slotId = parseInt(slot.dataset.slotId);

        if (muteBtn) {
            toggleMute(slotId);
            return;
        }
        if (soloBtn) {
            toggleSolo(slotId);
            return;
        }
        // Tap/click on a filled slot removes the instrument
        if (state.slots[slotId]?.soundName) {
            removeSoundFromSlot(slotId);
            checkForBonus();
        }
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetAll);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // M to mute focused/hovered slot
        // S to solo focused/hovered slot
        // 1-7 to toggle mute on specific slot
        // Space/Escape to reset

        if (key >= '1' && key <= '7') {
            const slotId = parseInt(key) - 1;
            if (slotId < state.slots.length && state.slots[slotId].soundName) {
                toggleMute(slotId);
            }
        } else if (key === ' ' || key === 'escape') {
            e.preventDefault();
            resetAll();
        }
    });
}

/**
 * Reset all slots
 */
function resetAll() {
    if (!state.initialized) return;

    // Clear solo state
    state.soloedSlotId = null;

    // Remove all sounds from slots
    for (let i = 0; i < state.slots.length; i++) {
        if (state.slots[i].soundName) {
            removeSoundFromSlot(i);
        }
    }

    // Reset sequencer
    sequencer.reset();

    // Reset bonus system (allow re-triggering)
    bonusManager.reset();
    updateBonusIndicator();

    // Reset horror mode (if enabled)
    if (corruptionManager.enabled) {
        corruptionManager.reset();
        horrorEffects.reset();
    }

    updatePaletteAvailability();
    console.log('[wrenchbox] Reset');
}

/**
 * Update BPM display
 */
function updateBpmDisplay() {
    const display = document.getElementById('bpmDisplay');
    if (display) {
        display.textContent = `${CONFIG.BPM} BPM`;
    }
}

/**
 * Set up the bonus system
 */
function setupBonusSystem() {
    // Initialize overlay
    bonusOverlay.init();

    // Register bonus definitions from theme (or fallback to hardcoded)
    const themeBonuses = themeLoader.getBonusesConfig();
    if (themeBonuses.length > 0) {
        bonusManager.registerBonuses(themeBonuses);
    } else if (typeof BONUS_CONFIG !== 'undefined') {
        bonusManager.registerBonuses(BONUS_CONFIG);
    }

    // Set up callbacks
    bonusManager.onBonusTriggered = (bonus) => {
        bonusOverlay.show(bonus);
        updateBonusIndicator();
    };

    bonusManager.onBonusEnded = (bonus) => {
        bonusOverlay.hide();
    };

    console.log('[wrenchbox] Bonus system initialized');
}

/**
 * Create bonus indicator in header
 */
function createBonusIndicator() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    const indicator = document.createElement('div');
    indicator.className = 'bonus-indicator';
    indicator.id = 'bonusIndicator';

    // Create badge for each bonus
    const bonuses = bonusManager.getBonusStatus();
    for (const bonus of bonuses) {
        const badge = document.createElement('div');
        badge.className = 'bonus-badge';
        badge.dataset.bonusId = bonus.id;
        badge.textContent = bonus.icon;
        badge.title = `${bonus.title}: ${bonus.requiredSounds.join(' + ')}`;
        indicator.appendChild(badge);
    }

    controls.insertBefore(indicator, controls.firstChild);
}

/**
 * Update bonus indicator badges
 */
function updateBonusIndicator() {
    const bonuses = bonusManager.getBonusStatus();

    for (const bonus of bonuses) {
        const badge = document.querySelector(`.bonus-badge[data-bonus-id="${bonus.id}"]`);
        if (badge) {
            badge.classList.toggle('unlocked', bonus.triggered);
        }
    }
}

/**
 * Get array of currently active sound names
 */
function getActiveSoundNames() {
    return state.slots
        .filter(s => s.soundName && s.active)
        .map(s => s.soundName);
}

/**
 * Check for bonus triggers
 */
function checkForBonus() {
    const activeSounds = getActiveSoundNames();
    const bonus = bonusManager.checkBonus(activeSounds);

    if (bonus) {
        bonusManager.triggerBonus(bonus);
    }
}

/**
 * Set up the horror mode system
 */
function setupHorrorSystem() {
    // Initialize corruption manager
    corruptionManager.init(CONFIG.NUM_SLOTS);

    // Apply theme corruption config
    const corruptionConfig = themeLoader.getCorruptionConfig();
    corruptionManager.applyThemeConfig(corruptionConfig);

    // Initialize horror effects
    horrorEffects.init();

    // Set up callbacks
    corruptionManager.onCorruptionChanged = (slotId, level, tier) => {
        // Update visual effects on slot
        const slot = state.slots[slotId];
        if (slot && slot.element) {
            horrorEffects.applyVisualCorruption(slot.element, tier, level);
            
            // Swap icon if it hits Medium corruption (50%)
            const iconEl = slot.element.querySelector('.slot-icon img');
            if (iconEl && slot.soundName) {
                const themeSounds = themeLoader.getSoundsConfig();
                const themeSound = themeSounds[slot.soundName];
                
                if (themeSound?.iconPathViral) {
                    const isCorrupted = level >= 50;
                    const targetSrc = isCorrupted ? themeSound.iconPathViral : themeSound.iconPath;
                    if (iconEl.src !== targetSrc) {
                        iconEl.src = targetSrc;
                        console.log(`[wrenchbox] Slot ${slotId} icon swapped to ${isCorrupted ? 'viral' : 'clean'}`);
                    }
                }
            }
        }

        // Update audio effects if slot is active
        horrorEffects.updateSlotEffects(slotId, tier, level);

        // Update global horror ambiance
        const maxCorruption = Math.max(...Array.from(corruptionManager.corruption.values()));
        horrorEffects.updateGlobalEffects(maxCorruption);
    };

    const originalBackground = document.body.style.backgroundImage || document.body.style.background;
    
    corruptionManager.onHorrorModeStart = () => {
        document.body.classList.add('horror-mode');
        
        // Apply horror background from theme if available
        const corruptionConfig = themeLoader.getCorruptionConfig();
        if (corruptionConfig.horrorBackground) {
            const bg = corruptionConfig.horrorBackground;
            if (bg.type === 'image' && bg.image) {
                const bgPath = themeLoader.getAssetPath(bg.image);
                document.body.style.backgroundImage = `url("${bgPath}")`;
                document.body.style.backgroundSize = 'cover';
            } else if (bg.type === 'color' && bg.colors?.[0]) {
                document.body.style.background = bg.colors[0];
            } else if (bg.type === 'gradient' && bg.colors) {
                document.body.style.background = `linear-gradient(135deg, ${bg.colors[0]} 0%, ${bg.colors[1]} 100%)`;
            }
        }
        
        console.log('[wrenchbox] HORROR MODE ACTIVATED');
    };

    corruptionManager.onHorrorModeEnd = () => {
        document.body.classList.remove('horror-mode');

        // Restore original background
        // Re-apply using themeLoader to ensure consistency (gradients vs images)
        themeLoader.applyBackground();

        // Clear all visual corruption
        for (const slot of state.slots) {
            if (slot.element) {
                horrorEffects.applyVisualCorruption(slot.element, 'none', 0);
            }
        }

        // Reset audio effects
        horrorEffects.reset();

        console.log('[wrenchbox] Horror mode ended - peace restored');
    };

    console.log('[wrenchbox] Horror system initialized');
}

/**
 * Create cure button in header
 */
function createCureButton() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    const cureBtn = document.createElement('button');
    cureBtn.className = 'cure-btn';
    cureBtn.textContent = '🌿 Cure';
    cureBtn.title = 'Reduce corruption (or reset to fully cure)';

    cureBtn.addEventListener('click', () => {
        corruptionManager.cure(30);
    });

    controls.appendChild(cureBtn);
}

/**
 * Update mode indicator (theme name + audio mode)
 */
function updateModeIndicator() {
    const badge = document.getElementById('phaseBadge');
    if (badge) {
        const themeName = themeLoader.getMeta().name || 'wrenchbox';
        const hasSamples = typeof sampleManager !== 'undefined' &&
                          sampleManager.loaded &&
                          window.location.protocol !== 'file:';
        const mode = hasSamples ? 'samples' : 'synths';
        badge.textContent = `${themeName} (${mode})`;
    }
}

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', init);
