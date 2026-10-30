# Wrenchbox Themes

Create custom themes by adding folders here. Each theme is self-contained with its own config and assets.

---

## Never Made a Theme Before?

We have a **[Beginner's Guide](../docs/MODDING_GUIDE.md)** that walks you through everything from scratch.

It covers:
- What free software to download
- How to make your own music loops
- How to pick colors that look good together
- How to test your theme in a browser
- Common mistakes and how to fix them

No coding experience needed. Just follow along step by step.

---

## Quick Start

1. Copy the `default/` folder
2. Rename it (e.g., `my-theme/`)
3. Edit `theme.json`
4. Replace assets in subfolders
5. Load your theme: `index.html?theme=my-theme`

## Folder Structure

```
themes/
└── my-theme/
    ├── theme.json          # Main config (required)
    ├── sounds/             # Audio loops (.ogg, .mp3)
    │   ├── kick.ogg
    │   ├── kick_b.ogg      # Optional B variation
    │   ├── snare.ogg
    │   └── ...
    ├── icons/              # Sound icons (.png, .svg)
    │   ├── kick.png
    │   ├── snare.png
    │   └── ...
    ├── backgrounds/        # Stage backgrounds
    │   ├── normal.png
    │   └── horror.png
    ├── animations/         # Character animations (future)
    │   └── ...
    └── effects/            # Bonus/corruption effects
        ├── bonus_beat.png
        ├── fullband.mp4
        └── ...
```

## theme.json Reference

### meta
```json
{
  "meta": {
    "id": "unique-id",
    "name": "Display Name",
    "description": "Theme description",
    "author": "Your Name",
    "version": "1.0.0",
    "bpm": 120,
    "key": "C Minor",
    "loopBars": 4
  }
}
```

### colors
Define category colors used for icons and slot highlights:
```json
{
  "colors": {
    "primary": "#1a1a2e",
    "accent": "#00ffff",
    "beats": "#ff4444",
    "effects": "#4488ff",
    "melodies": "#44ff88",
    "bass": "#ff88ff",
    "cursed": "#660000"
  }
}
```

### sounds
Each sound needs:
```json
{
  "sounds": {
    "my-sound": {
      "name": "Display Name",
      "type": "beats|effects|melodies|bass|cursed",
      "icon": "icons/my-sound.png",
      "iconEmoji": "🎵",
      "sound": "sounds/my-sound.ogg",
      "soundB": "sounds/my-sound_b.ogg",
      "pattern": ["C2", null, "E2", null],
      "subdivision": "8n|16n",
      "cursed": false
    }
  }
}
```

**Pattern notes:** Use standard notation (C1, Eb2, G4, etc.) or `null` for rests.

**Subdivision:** `"8n"` = 8th notes, `"16n"` = 16th notes

### bonuses
```json
{
  "bonuses": [
    {
      "id": "unique-id",
      "title": "Bonus Name",
      "description": "What triggers it",
      "requiredSounds": ["sound1", "sound2"],
      "iconEmoji": "🎁",
      "animation": "pulse|wave|shake|disco|fireworks",
      "video": "effects/bonus.mp4",
      "duration": 4000,
      "repeatable": true
    }
  ]
}
```

### corruption
```json
{
  "corruption": {
    "enabled": true,
    "triggerSound": "cursed",
    "spreadRate": 0.4,
    "spreadAmount": 15,
    "tickInterval": 2000,
    "cureCombo": ["sound1", "sound2", "sound3"]
  }
}
```

## Audio Specifications

| Property | Requirement |
|----------|-------------|
| Format | OGG Vorbis (primary), MP3 (fallback) |
| Sample Rate | 44.1kHz |
| Bit Depth | 16-bit |
| Channels | Stereo (music), Mono (SFX) |
| Loop Length | Must match `loopBars` at `bpm` |
| Target Size | 50-100KB per loop |

**Loop length formula:** `seconds = (loopBars * 4 * 60) / bpm`

Example: 4 bars at 120 BPM = `(4 * 4 * 60) / 120` = 8 seconds

## Icon Specifications

| Property | Requirement |
|----------|-------------|
| Format | PNG (transparent) or SVG |
| Size | 128x128px recommended |
| Style | Your choice! |

## Tips

- **Start simple:** Copy default, change colors and emoji icons first
- **Test incrementally:** Change one thing, test, repeat
- **Synth fallback:** If audio files are missing, synths play instead
- **Emoji icons:** Use `iconEmoji` if you don't have image assets
- **Horror mode:** Set `corruption.enabled: false` to disable

## Example Themes

Ideas for custom themes:
- **Synthwave** - Neon colors, 80s synth sounds
- **Lo-fi** - Muted colors, vinyl crackle, jazzy loops
- **Horror** - Start corrupted, dark aesthetic
- **Chiptune** - 8-bit sounds, pixel art icons
- **Orchestra** - Classical instruments, elegant UI
