# Creating Your First Wrenchbox Theme

**No coding experience required!**

This guide walks you through creating a custom music theme for wrenchbox. By the end, you'll have a working theme with your own sounds, colors, and personality.

---

## What You'll Create

A wrenchbox theme includes:
- **Colors** - Your custom color scheme
- **Sounds** - Audio loops that play when activated
- **Icons** - Visual representation of each sound
- **Bonuses** - Special combos that trigger animations
- **Corruption** - Optional "horror mode" settings

**Time needed:**
- Quick theme (colors only): 15-30 minutes
- Basic theme (colors + sounds): 2-3 hours
- Full theme (everything): 1-2 days

---

## Step 1: Get the Free Tools

You'll need a few free programs. Here's what to download:

### Required

| Tool | What It's For | Download |
|------|---------------|----------|
| **VS Code** | Edit your theme files | [code.visualstudio.com](https://code.visualstudio.com) |
| **Audacity** | Create/edit audio loops | [audacityteam.org](https://audacityteam.org) |

### Optional (but helpful)

| Tool | What It's For | Download |
|------|---------------|----------|
| **GIMP** | Create custom icons | [gimp.org](https://gimp.org) |
| **Paint.NET** | Simpler image editor (Windows) | [getpaint.net](https://getpaint.net) |
| **Canva** | Easy icon design (web-based) | [canva.com](https://canva.com) |

### For Testing Your Theme

Install the **Live Server** extension in VS Code:
1. Open VS Code
2. Click the Extensions icon (square grid) on the left
3. Search "Live Server"
4. Click Install

This lets you test your theme in a web browser.

---

## Step 2: Copy the Template

1. Find the `themes/` folder in wrenchbox
2. Copy the entire `default/` folder
3. Rename your copy (e.g., `my-awesome-theme/`)

Your theme folder structure:
```
themes/my-awesome-theme/
├── theme.json       <-- Main config file (you'll edit this!)
├── sounds/          <-- Your audio files go here
├── icons/           <-- Your icon images go here
└── effects/         <-- Bonus videos go here (optional)
```

---

## Step 3: Customize Colors (15 minutes)

Open `theme.json` in VS Code. Find the `"colors"` section:

```json
"colors": {
    "primary": "#1a1a2e",
    "secondary": "#16213e",
    "accent": "#00ffff",
    "text": "#ffffff",
    "textMuted": "#888888",
    "beats": "#ff4444",
    "effects": "#4488ff",
    "melodies": "#44ff88",
    "voices": "#ffdd44",
    "bass": "#ff88ff",
    "cursed": "#660000"
}
```

### What Each Color Does

| Color | Used For |
|-------|----------|
| `primary` | Main background color |
| `secondary` | Accent background |
| `accent` | Highlights, active elements |
| `text` | Main text color |
| `textMuted` | Subtle text |
| `beats` | Drum/beat sounds |
| `effects` | FX sounds |
| `melodies` | Melody sounds |
| `bass` | Bass sounds |
| `cursed` | Horror mode sounds |

### How to Pick Colors

1. Go to [coolors.co](https://coolors.co) (free palette generator)
2. Press spacebar until you find colors you like
3. Click a color to copy its hex code (like `#ff4444`)
4. Paste into your theme.json

**Tip:** Use the Lock icon to keep colors you like while generating new ones.

### Changing the Background

Your theme's background is separate from the colors above. Look for the `"background"` section:

```json
"background": {
    "type": "gradient",
    "colors": ["#1a1a2e", "#16213e"]
},
```

Change these two hex codes to update your main background gradient! Use your `primary` and `secondary` colors here if you want them to match.

### Test Your Colors

1. Open the wrenchbox folder in VS Code
2. Right-click `index.html` and select "Open with Live Server"
3. Add `?theme=my-awesome-theme` to the URL
4. Example: `http://localhost:5500/index.html?theme=my-awesome-theme`

---

## Step 4: Create Audio Loops (1-2 hours)

This is the fun part! You'll create the actual sounds for your theme.

### Audio Requirements

Your audio files need these exact settings:

| Setting | Value | Why |
|---------|-------|-----|
| **Format** | OGG (best) or MP3 | Browser compatibility |
| **Sample Rate** | 44100 Hz | Standard quality |
| **Channels** | Stereo | Full sound |
| **Length** | **8 seconds exactly** | 4 bars at 120 BPM |
| **Bit Depth** | 16-bit | Good quality, small files |

### Calculate Loop Length for Different BPM

The formula: `duration = (bars x 4 x 60) / BPM`

| BPM | Loop Duration |
|-----|---------------|
| 90 | 10.67 seconds |
| 100 | 9.6 seconds |
| 120 | 8 seconds |
| 140 | 6.86 seconds |

### Method A: Record Your Own Sounds

1. **Open Audacity**
2. Check sample rate is 44100 Hz (bottom-left corner)
3. Click the **Record** button (red circle)
4. Make your sounds!
5. Click **Stop** when done
6. Select exactly 8 seconds of audio (or your calculated duration)
7. Go to **File > Export > Export as OGG**
8. Save to your theme's `sounds/` folder

**Tips for good loops:**
- Make the end flow smoothly into the beginning
- Avoid sudden stops at the loop point
- Keep it simple - less is more!

### Method B: Use Free Sound Libraries

Great sources for free loops:
- [Freesound.org](https://freesound.org) - Huge library of free sounds
- [Looperman.com](https://looperman.com) - Music loops, many BPM options
- [SampleFocus.com](https://samplefocus.com) - Quality samples

After downloading, use Audacity to:
1. Import the audio
2. Trim to exactly 8 seconds (or your BPM's duration)
3. Export as OGG

### Method C: AI Music Generators (Recommended for Beginners)

Modern AI tools can make instant loops. 

1. **[Suno.ai](https://suno.com)** or **[Udio](https://www.udio.com)**
   - **Mode**: Select "Instrumental" (no lyrics).
   - **Prompt**: Be specific! *"Minimal techno drum beat, 120bpm"*, *"Funky bassline solo, 120bpm"*.
   - **Download**: Get the audio file.

2. **[Soundraw.io](https://soundraw.io)**
   - Great for customizing mood and length directly.

### ✂️ key Step: Making it Loop Perfectly

The difference between a "good" and "bad" theme is the **loop seam**. If your audio clicks or jumps when it repeats, it breaks the immersion.

**How to fix it in Audacity:**

1. **Import** your generated audio.
2. **Find the Grid**: The hardest part is cutting at the exact beat.
   - If you know the BPM (e.g. 120), exactly 4 bars = **8.000 seconds**.
   - In Audacity at the bottom, change "Selection" to **Start and Length**.
   - Set Length to `00h 00m 08.000s`.
3. **Snap to Zero**:
   - Zoom in VERY close to your start and end points.
   - Ensure the wave line is touching the center (zero volume) line.
   - If not, select the whole clip and press **Z** (Find Zero Crossings).
   - This prevents that annoying "click" sound!
4. **Export as OGG**: This format works best for web.

---
 
 ## Step 5: Designing Your "Band" (Composition Guide)
 
 Creating random loops is easy. Creating loops that *sound good together* is an art.
 
 ### 🎵 The Golden Rules of Layering
 
 1. **Same Key**: Ensure every melodic loop is in the same key (e.g., C Minor, F# Major). If you mix keys, it will sound dissonant.
 2. **Same BPM**: You already know this (120 BPM etc).
 3. **Different Frequencies (The "Cake" Theory)**:
    Imagine your sound is a cake with layers. You can't put two cakes in the same space.
    - **Low Layer**: Kick drum, Bassline. (Don't play 2 basslines at once!)
    - **Mid Layer**: Snare, Vocals, Keys, Guitars.
    - **High Layer**: Hi-hats, Cymbals, Flutes, Lead synths.
 
 ### 🥁 Which Loops Should You Make?
 
 A standard Wrenchbox theme has 20 slots. Don't just make 20 drum beats! A balanced "palette" looks like this:
 
 | Category | Recommended Count | Description |
 |----------|-------------------|-------------|
 | **Beats** | 4-5 Loops | **Kick** (Heartbeat), **Snare** (Backbeat), **Hats** (Rhythm), **Percussion** (Flavor). |
 | **Bass** | 3-4 Loops | **Sub** (Deep), **Funk** (Groovy), **Simple** (Just root notes). |
 | **Melodies**| 5-6 Loops | **Chords** (Pads/sustained), **Arps** (Fast moving), **Leads** (The main tune). |
 | **Effects** | 3-4 Loops | **Risers**, **Hits**, **Vocal Chops**, **Textures**. |
 | **Voices** | 2-3 Loops | A Capella snippets or robotic vocals. |
 
 ### 💡 Pro Tip: "Call and Response"
 Avoid having every loop play *all the time*.
 - MAKE: A melody that plays only on the first half of the bar.
 - MAKE: Another melody that plays only on the second half.
 - RESULT: When played together, they "talk" to each other instead of shouting over each other.
 
 ---

## Step 6: Add Sounds to Your Theme

1. Put your audio files in the `sounds/` folder:
   ```
   themes/my-awesome-theme/sounds/
   ├── kick.ogg
   ├── snare.ogg
   ├── hihat.ogg
   ├── bass.ogg
   ├── lead.ogg
   └── cursed.ogg
   ```

2. Update `theme.json` to point to your sounds:

```json
"sounds": {
    "kick": {
        "name": "Kick Drum",
        "type": "beats",
        "iconEmoji": "🥁",
        "sound": "sounds/kick.ogg",
        "pattern": ["C1", null, null, null, "C1", null, null, null],
        "subdivision": "8n"
    },
    "snare": {
        "name": "Snare",
        "type": "beats",
        "iconEmoji": "🪘",
        "sound": "sounds/snare.ogg",
        "pattern": [null, null, "C2", null, null, null, "C2", null],
        "subdivision": "8n"
    }
}
```

### Understanding Sound Config

| Field | Required? | What It Does |
|-------|-----------|--------------|
| `name` | Yes | Display name |
| `type` | Yes | Category: `beats`, `effects`, `melodies`, `bass`, or `cursed` |
| `iconEmoji` | Recommended | Emoji shown in palette |
| `sound` | For samples | Path to your audio file |
| `pattern` | For synths | Notes to play (if no audio file) |
| `subdivision` | For synths | `"8n"` = 8th notes, `"16n"` = 16th notes |

**Tip:** If you provide a `sound` path, the pattern is ignored - your audio file plays instead!

---

## Step 7: Create Icons (Optional)
 
 You have three options for sound icons:
 
 ### Option A: Use Emojis (Easiest!)
 
 Just set `iconEmoji` in your theme.json. They work everywhere and look great!
 ```json
 "kick": {
     "iconEmoji": "🥁",
     ...
 }
 ```
 
 Find emojis at [emojipedia.org](https://emojipedia.org)
 
 ### Option B: AI Generation (Recommended)
 
 You can use AI tools like Bing Image Creator, Midjourney, or DALL-E 3 to make cool icons.
 
 1. **Prompt for "Icon"**: Ask for an "app icon" or "badge" to get a clean look.
    * Example: *"Neon red drum icon, black background, minimal vector style, square"*
 2. **Save as PNG or JPG**: These formats are perfect.
 3. **Use Square Images**: Aim for **512x512** or **256x256** pixels. They will be resized automatically.
 
 **Pro Tip: Faking Transparency**
 AI images usually have a background color (like black). Instead of trying to delete it, just match your icon's background to your theme's background!
 
 - If your theme is dark (`#1a1a2e`), ask for an icon with a "dark blue background".
 - Or just use a black background and set your icon style to blend in.
 
 ### Option C: Custom Design (Canva/GIMP)
 
 1. Create a **Square Design** (e.g. 256x256 px).
 2. Draw your icon.
 3. Save as PNG (transparency is supported if you know how to use it, but not required!).
 4. Save to `icons/` folder.
 
 Then update theme.json:
 ```json
 "kick": {
     "icon": "icons/kick.png",
     "iconEmoji": "🥁",  <-- Fallback if image fails
     ...
 }
 ```

---

## Step 8: Set Up Bonuses

Bonuses are special combos that trigger animations when you play certain sounds together.

```json
"bonuses": [
    {
        "id": "full-beat",
        "title": "FULL BEAT",
        "description": "All drums playing!",
        "requiredSounds": ["kick", "snare", "hihat"],
        "iconEmoji": "🎯",
        "animation": "pulse",
        "duration": 4000,
        "repeatable": true
    }
]
```

### Bonus Config Explained

| Field | What It Does |
|-------|--------------|
| `id` | Unique identifier (no spaces) |
| `title` | Text shown when triggered |
| `description` | Subtitle text |
| `requiredSounds` | Array of sound names that trigger this bonus |
| `iconEmoji` | Icon shown in header and overlay |
| `animation` | Visual effect: `pulse`, `wave`, `shake`, `disco`, or `fireworks` |
| `duration` | How long the animation plays (milliseconds) |
| `repeatable` | `true` = can trigger again, `false` = one-time only |

---

## Step 9: Configure Horror Mode (Optional)

The corruption/horror mode adds a creepy twist where sounds become distorted.

```json
"corruption": {
    "enabled": true,
    "spreadRate": 0.4,
    "spreadAmount": 15,
    "tickInterval": 2000,
    "tiers": {
        "low": { "min": 25 },
        "medium": { "min": 50 },
        "high": { "min": 75 },
        "full": { "min": 100 }
    }
}
```

### 🩸 The Cursed Instrument
To trigger horror mode, you need at least one instrument with `"cursed": true`.

**Important:** You can name this instrument anything you want!
- "The Virus"
- "Darkness"
- "System Failure"
- "Glitch"

It will function as the "Patient Zero" for the corruption.

```json
"virus": {
    "name": "The Virus",  <-- Name it anything!
    "type": "cursed",
    "cursed": true,       <-- This flag is what matters
    ...
}
```
```

### Corruption Settings

| Setting | What It Does | Default |
|---------|--------------|---------|
| `enabled` | Turn horror mode on/off | `true` |
| `spreadRate` | Chance of spreading (0-1) | `0.4` |
| `spreadAmount` | How much corruption spreads | `15` |
| `tickInterval` | Time between spread checks (ms) | `2000` |

**To disable horror mode:** Set `"enabled": false`

---

---

## Step 10: Advanced - Creating a Transformation

Want your theme to physically transform (like "Project Singularity")?

### 1. Changing the Background
You can set a separate `horrorBackground` that activates when corruption starts.

```json
"corruption": {
    "enabled": true,
    ...
    "horrorBackground": {
        "type": "image",
        "image": "backgrounds/bg_viral.png"
    }
}
```

### 2. Evil Icons (`icon_viral`)
You can make icons swap to an "evil" version when corruption hits 50% (Medium Tier).

```json
"kick": {
    "icon": "icons/kick_clean.png",
    "icon_viral": "icons/kick_evil.png",  <-- Swaps to this!
    ...
}
```

### 3. Musical Shift (`patternB`)
For synths, you can define a "Pattern B" that plays when corruption is Medium or higher. This lets you shift from Major to Minor keys!

```json
"lead": {
    "pattern": ["C4", "E4", "G4", "C5"],       <-- Normal (Happy)
    "patternB": ["C4", "Eb4", "G4", "Bb4"],    <-- Cursed (Sad/Evil)
    ...
}
```

---

## Step 11: Test Everything

### Testing Checklist

Before sharing your theme, verify:

- [ ] theme.json has no red squiggly lines in VS Code (syntax errors)
- [ ] All sound files exist at the paths you specified
- [ ] Audio files are the correct length for your BPM
- [ ] Icons appear correctly (or emojis work)
- [ ] Colors look good together
- [ ] Bonuses trigger when expected
- [ ] (If enabled) Horror mode activates with cursed sound

### Common Issues

| Problem | Solution |
|---------|----------|
| Theme doesn't load | Check theme.json for missing commas or quotes |
| Sounds don't play | Make sure you're running on a server (not file://) |
| Colors look wrong | Hex codes must start with `#` |
| Timing feels off | Double-check your loop length matches BPM |
| "undefined" errors | Check for typos in sound names |

### Testing From File

If you see "using synths" instead of your samples, you need to run a server:
1. Use VS Code's Live Server extension
2. Or run `python -m http.server 8080` in terminal
3. Or run `npx serve` if you have Node.js

---

## Step 12: Share Your Theme!

### Option A: Share the Files

1. Zip your entire theme folder
2. Share on:
   - Discord servers
   - Reddit (r/gamedev, r/indiegaming)
   - itch.io

### Option B: Contribute to Wrenchbox

1. Fork wrenchbox on GitHub
2. Add your theme folder to `themes/`
3. Submit a Pull Request

---

## Full theme.json Reference

Here's a complete example with all options:

```json
{
    "meta": {
        "id": "my-theme",
        "name": "My Awesome Theme",
        "description": "A cool custom theme",
        "author": "Your Name",
        "version": "1.0.0",
        "bpm": 120,
        "key": "C Minor",
        "loopBars": 4
    },

    "colors": {
        "primary": "#1a1a2e",
        "secondary": "#16213e",
        "accent": "#00ffff",
        "text": "#ffffff",
        "textMuted": "#888888",
        "beats": "#ff4444",
        "effects": "#4488ff",
        "melodies": "#44ff88",
        "voices": "#ffdd44",
        "bass": "#ff88ff",
        "cursed": "#660000"
    },

    "background": {
        "type": "gradient",
        "colors": ["#1a1a2e", "#16213e"]
    },

    "sounds": {
        "kick": {
            "name": "Kick",
            "type": "beats",
            "iconEmoji": "🥁",
            "icon": "icons/kick.png",
            "sound": "sounds/kick.ogg",
            "pattern": ["C1", null, null, null],
            "subdivision": "8n"
        }
    },

    "bonuses": [
        {
            "id": "my-bonus",
            "title": "BONUS!",
            "description": "You did it!",
            "requiredSounds": ["kick", "snare"],
            "iconEmoji": "⭐",
            "animation": "fireworks",
            "duration": 4000,
            "repeatable": true
        }
    ],

    "corruption": {
        "enabled": true,
        "spreadRate": 0.4,
        "spreadAmount": 15,
        "tickInterval": 2000
    },

    "ui": {
        "slotCount": 7,
        "slotSize": 100,
        "iconSize": 60
    }
}
```

---

## Pattern Notation Reference

If using synth sounds (no audio file), patterns define what notes play:

### Note Names
- `C`, `D`, `E`, `F`, `G`, `A`, `B` = natural notes
- `Eb`, `Gb`, `Bb` = flats
- `null` = rest (silence)

### Octaves
- `C1-B1`: Very low (kick drums)
- `C2-B2`: Low (bass)
- `C3-B3`: Mid-low
- `C4-B4`: Middle (default)
- `C5-B5`: High (leads)

### Example Patterns

**Simple kick (4 on the floor):**
```json
"pattern": ["C1", null, "C1", null, "C1", null, "C1", null]
```

**Basic snare (beats 2 and 4):**
```json
"pattern": [null, null, "C2", null, null, null, "C2", null]
```

**Busy hi-hat:**
```json
"pattern": ["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]
```

---

## Synth Types Reference

If you want to customize the synth sound (advanced):

```json
"synth": {
    "type": "MembraneSynth",
    "options": {
        "pitchDecay": 0.05,
        "octaves": 6
    }
}
```

### Available Synth Types

| Type | Best For |
|------|----------|
| `MembraneSynth` | Kick drums |
| `NoiseSynth` | Snares, cymbals |
| `MetalSynth` | Hi-hats, metallic sounds |
| `MonoSynth` | Bass, leads |
| `FMSynth` | Complex tones |
| `AMSynth` | Ambient sounds |

---

## Need Help?

- Open an issue on [GitHub](https://github.com/your-repo/wrenchbox)
- Check existing themes in the `themes/` folder for examples
- Ask in the community Discord

Happy creating!
