# Marvel Snap Clone - UI Design Document

## Screen Layout Overview

```
+------------------------------------------------------------------+
|  [PLAYER]          [CUBE/SNAP]              [ENEMY]              |  <- Header Bar
|   icon               count                   icon                |
|   name                                       name                |
+------------------------------------------------------------------+
|                                                                  |
|  +----------+      +----------+      +----------+                |
|  |  ENEMY   |      |  ENEMY   |      |  ENEMY   |                |  <- Enemy Cards
|  |  CARDS   |      |  CARDS   |      |  CARDS   |                |     (3 columns)
|  |  2x2     |      |  2x2     |      |  2x2     |                |
|  +----------+      +----------+      +----------+                |
|                                                                  |
|  [PWR] +------+ [PWR]  [PWR] +------+ [PWR]  [PWR] +------+ [PWR]|  <- Locations
|        |LOC 1 |              |LOC 2 |              |LOC 3 |      |     with Power
|        +------+              +------+              +------+      |
|                                                                  |
|  +----------+      +----------+      +----------+                |
|  |  PLAYER  |      |  PLAYER  |      |  PLAYER  |                |  <- Player Cards
|  |  CARDS   |      |  CARDS   |      |  CARDS   |                |     (3 columns)
|  |  2x2     |      |  2x2     |      |  2x2     |                |
|  +----------+      +----------+      +----------+                |
|                                                                  |
+------------------------------------------------------------------+
|          [ CARD 1 ][ CARD 2 ][ CARD 3 ][ CARD 4 ]                |  <- Player Hand
+------------------------------------------------------------------+
| [RETREAT]           [ENERGY]              [END TURN]             |  <- Bottom Bar
|                        0                    5/6                  |
+------------------------------------------------------------------+
```

---

## 1. Header Bar

### Layout (Left to Right)
- **Player Section (Left)**: Hexagonal avatar icon + player name below
- **Cube/Snap Counter (Center)**: Glowing circular indicator with cube count (1-8)
- **Enemy Section (Right)**: Hexagonal avatar icon + enemy name below

### Player/Enemy Avatar
- Shape: Hexagonal frame with beveled edges
- Size: ~60x60 pixels
- Contains: Character portrait or profile picture
- Name: Displayed below in stylized font

### Cube/Snap Counter
- Shape: Glowing blue circular orb with cosmic energy effect
- Shows current stake multiplier (1, 2, 4, 8)
- Pulse animation when snapped

---

## 2. Gameplay Area (3x3 Grid)

The central gameplay area is divided into a 3-column layout:

| Column | Left (Index 0) | Middle (Index 1) | Right (Index 2) |
|--------|----------------|------------------|-----------------|
| Top Row | Enemy Cards | Enemy Cards | Enemy Cards |
| Middle Row | Location 1 | Location 2 | Location 3 |
| Bottom Row | Player Cards | Player Cards | Player Cards |

---

## 3. Location Cards

### Location Card Design
- Shape: Hexagonal/shield-shaped card
- Contains:
  - **Header**: Location name in bold stylized text
  - **Artwork**: Thematic location illustration
  - **Description**: Ability text in smaller font

### Power Displays
Each location has TWO power indicators:
- **Top (Enemy Power)**: Hexagonal badge showing enemy's total power at location
- **Bottom (Player Power)**: Hexagonal badge showing player's total power at location

### Power Badge Design
- Shape: Hexagonal/diamond badge
- Background: Color indicates who is winning
  - Blue/Purple: Player winning
  - Red/Orange: Enemy winning
  - Gray: Tied or empty
- Number: Large bold centered text

---

## 4. Card Slots Arrangement

Each location has space for 4 cards per player, arranged in a 2x2 grid.

### Player Side Card Order (Bottom Row)
```
+-----+-----+
|  1  |  2  |  <- Top of 2x2 (closer to location)
+-----+-----+
|  3  |  4  |  <- Bottom of 2x2 (closer to hand)
+-----+-----+
```
Play order: Top-Left(1), Top-Right(2), Bottom-Left(3), Bottom-Right(4)

### Enemy Side Card Order (Top Row) - MIRRORED
```
+-----+-----+
|  4  |  3  |  <- Top of 2x2 (further from location)
+-----+-----+
|  2  |  1  |  <- Bottom of 2x2 (closer to location)
+-----+-----+
```
Play order: Bottom-Right(1), Bottom-Left(2), Top-Right(3), Top-Left(4)

### Empty Slot Appearance
- Translucent card outline
- Subtle glow or silhouette graphic
- Slightly darker than background

---

## 5. Card Design

### Card Dimensions
- Aspect ratio: ~2:3 (portrait orientation)
- Standard size: ~80x120 pixels (scalable)

### Card Layout
```
+------------------+
| [COST]    [PWR]  |  <- Top corners: cost left, power right
|                  |
|    [ARTWORK]     |  <- Card illustration (fills most of card)
|                  |
|==================|
|   [CARD NAME]    |  <- Name banner at bottom
+------------------+
```

### Cost Badge (Top-Left)
- Shape: Rounded hexagon/circle
- Background: Blue gradient
- Number: White bold text
- Size: ~20x20 pixels

### Power Badge (Top-Right)
- Shape: Rounded hexagon/circle
- Background: Orange/gold gradient
- Number: White bold text
- Size: ~20x20 pixels

### Card Name Banner
- Position: Bottom of card
- Background: Dark semi-transparent gradient
- Text: Card name in stylized font (ALL CAPS or mixed)
- Text color: White with subtle glow/outline

### Card Border Colors (by state/rarity)
| State/Rarity | Border Color |
|--------------|--------------|
| Common | Gray/Silver |
| Uncommon | Green |
| Rare | Blue |
| Epic | Purple |
| Legendary | Gold/Orange |
| Selected/Highlighted | Bright glow effect |
| Playable | Normal + subtle pulse |
| Unplayable | Grayed out/desaturated |

---

## 6. Bottom Bar

### Layout (Left to Right)
- **Retreat Button (Left)**: "RETREAT" or "FORFEIT" text
- **Energy Display (Center)**: Current energy in glowing orb
- **End Turn Button (Right)**: "END TURN" + turn counter

### Retreat/Forfeit Button
- Text: "RETREAT" (during game) or "FORFEIT" (final turn)
- Style: Angled/slanted rectangular button
- Color: Red/maroon gradient

### Energy Display
- Shape: Glowing blue circular orb
- Number: Large centered digit (0-10)
- Animation: Pulsing glow effect
- Filled segments or particles indicate available energy

### End Turn Button
- Text: "END TURN" with turn counter below (e.g., "5/6")
- Style: Angled/slanted rectangular button
- Color: Blue/purple gradient
- States:
  - Normal: Clickable when player can end turn
  - Waiting: Shows "Playing..." or "FINAL TURN"
  - Disabled: Grayed out during animations

---

## 7. Player Hand

### Layout
- Position: Bottom of screen, above bottom bar
- Cards displayed horizontally, overlapping slightly
- Cards fan out from center
- Maximum visible: 7 cards

### Hand Card Interactions
- **Hover**: Card raises up, enlarges slightly
- **Drag**: Card follows cursor, valid locations highlight
- **Invalid Drop**: Card returns to hand with animation

### Card Visibility
- All cards fully visible (no hidden information for player's own hand)
- Cost and power badges always visible
- Card art and name visible

---

## 8. Visual States

### Card States

| State | Visual Treatment |
|-------|------------------|
| In Hand | Normal, hoverable |
| Playable | Subtle glow outline |
| Unplayable (no energy) | Desaturated, dimmed |
| Being Dragged | Elevated, shadow underneath |
| Played (unrevealed) | Face-down, card back shown |
| Revealed | Face-up, flip animation |
| Highlighted | Bright border glow |
| Targeted | Pulsing selection ring |
| Buffed (+power) | Green glow on power badge |
| Debuffed (-power) | Red glow on power badge |
| Destroyed | Shatter/dissolve animation |

### Location States

| State | Visual Treatment |
|-------|------------------|
| Unrevealed | Card back, "?" indicator |
| Revealing | Flip animation |
| Revealed | Full location art and text |
| Full (4 cards) | Subtle "full" indicator |
| Locked | Lock icon overlay |
| Active Effect | Particle effects or glow |

### Turn States

| State | Bottom Bar Display |
|-------|-------------------|
| Player's Turn | "END TURN" active |
| Opponent's Turn | "WAITING..." |
| Card Reveal Phase | "Playing..." |
| Final Turn | "FINAL TURN" |
| Game Over | "COLLECT REWARDS" or "DEFEAT" |

---

## 9. Color Palette

### Primary Colors
| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep Space Blue | #0a1628 |
| UI Panels | Dark Navy | #1a2744 |
| Accent Primary | Electric Blue | #00a8ff |
| Accent Secondary | Cosmic Purple | #8b5cf6 |
| Energy | Bright Blue | #00d4ff |
| Warning/Retreat | Deep Red | #dc2626 |
| Success/Winning | Emerald Green | #10b981 |
| Gold/Legendary | Amber Gold | #f59e0b |

### Text Colors
| Element | Color | Hex |
|---------|-------|-----|
| Primary Text | White | #ffffff |
| Secondary Text | Light Gray | #94a3b8 |
| Disabled Text | Dark Gray | #475569 |
| Power Numbers | White with shadow | #ffffff |

---

## 10. Typography

### Font Styles
| Element | Style |
|---------|-------|
| Player Names | Bold, stylized (comic-style) |
| Card Names | Bold uppercase, slight italic |
| Location Names | Bold, larger size |
| Location Description | Regular, smaller size |
| Power/Cost Numbers | Extra bold, large |
| Button Text | Bold uppercase |
| Turn Counter | Bold numbers |

---

## 11. Animation Descriptions

### Card Animations
| Animation | Description | Duration |
|-----------|-------------|----------|
| Card Play | Card flies from hand to slot | 300ms |
| Card Reveal | 3D flip from back to front | 400ms |
| Card Destroy | Shatter into particles, fade | 500ms |
| Card Move | Slide to new location | 400ms |
| Power Change | Number morphs, +/- indicator flies | 300ms |
| Card Merge | Cards overlap, flash, become one | 400ms |

### UI Animations
| Animation | Description | Duration |
|-----------|-------------|----------|
| Turn Start | Energy fills, turn number updates | 500ms |
| Location Reveal | Card flips, glow effect | 600ms |
| Snap | Cube pulses, doubles indicator | 400ms |
| Victory | Confetti, winning locations glow | 1000ms |
| Defeat | Screen dims, losing text appears | 800ms |

---

## 12. Responsive Considerations

### Portrait Mode (Primary - Mobile)
- Full vertical layout as described above
- Cards scale to fit screen width
- Hand cards may overlap more on smaller screens

### Landscape Mode (Desktop/Tablet)
- Wider card spacing
- Larger card sizes
- Hand spread further apart

