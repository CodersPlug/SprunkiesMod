/**
 * Bonus definitions for wrenchbox
 * Phase 5: Define combos that trigger special animations
 *
 * Each bonus requires specific sounds to be active simultaneously.
 * When all required sounds are playing, the bonus triggers.
 */

const BONUS_CONFIG = [
    {
        id: 'full_beat',
        title: 'Full Beat',
        description: 'The complete rhythm section!',
        requiredSounds: ['kick', 'snare', 'hihat'],
        icon: '🥁',
        animation: 'pulse',
        duration: 4000,
        repeatable: true
    },
    {
        id: 'melody_master',
        title: 'Melody Master',
        description: 'Bass and lead in harmony',
        requiredSounds: ['bass', 'lead'],
        icon: '🎼',
        animation: 'wave',
        duration: 4000,
        repeatable: true
    },
    {
        id: 'full_band',
        title: 'Full Band',
        description: 'All instruments playing together!',
        requiredSounds: ['kick', 'snare', 'hihat', 'bass', 'lead'],
        icon: '🎸',
        animation: 'fireworks',
        duration: 6000,
        repeatable: false
    },
    {
        id: 'low_end',
        title: 'Low End Theory',
        description: 'Feel that bass!',
        requiredSounds: ['kick', 'bass'],
        icon: '🔊',
        animation: 'shake',
        duration: 3000,
        repeatable: true
    },
    {
        id: 'groove_machine',
        title: 'Groove Machine',
        description: 'The pocket is locked!',
        requiredSounds: ['kick', 'snare', 'bass'],
        icon: '🕺',
        animation: 'disco',
        duration: 5000,
        repeatable: true
    }
];
