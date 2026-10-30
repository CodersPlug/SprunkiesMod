# Sprunkies Básico

Mod cute de mezcla musical (estilo Sprunki / Incredibox), **sin horror**.

Base: [boxwrench/wrenchbox](https://github.com/boxwrench/wrenchbox) — motor open source con drag & drop y themes.

## Cómo jugar

1. Serví la carpeta con un servidor local (hace falta por los módulos/fetch):

```bash
cd SprunkiesMod
python3 -m http.server 8080
```

2. Abrí http://localhost:8080  
3. Tocá la pantalla para arrancar el audio.  
4. Arrastrá personajes (abajo) a los slots (arriba).  
5. Combinaciones desbloquean bonos (¡Ritmo!, Dúo dulce, Fiesta…).

Theme por defecto: `sprunkies`. Otros themes: `?theme=default` o `?theme=robot-futurism`.

## Personajes (theme sprunkies)

| ID | Nombre | Rol |
|----|--------|-----|
| kick | Tambo | Beat |
| snare | Palma | Beat |
| hihat | Chispa | FX |
| bass | Bajo | Bajo |
| lead | Canto | Melodía |
| voice | Brillo | Voz |

Horror / corruption: **desactivado** en `themes/sprunkies/theme.json`.

## Personalizar

Copiá `themes/sprunkies/` o editá `theme.json` (colores, patrones, BPM, bonos).  
Guía completa del motor: [docs/MODDING_GUIDE.md](docs/MODDING_GUIDE.md).

## Créditos

- Motor: wrenchbox (MIT-style fan engine inspired by Incredibox/Sprunki)
- Theme Sprunkies Básico: personajes y naming originales (no assets de NyankoBfLol / Incredibox oficial)
