# 🎨 CACAO Design System (Layer 1 Architecture)
> This document drives all visual decisions in `style.css`

## 🎨 Color Palette
- `--color-primary`: `#006C67` (Deep Caribbean Ocean Teal) - Used for primary nav, footers.
- `--color-accent`: `#FFC857` (Sunshine Gold) - Used for CTAs, buttons, active states.
- `--color-sunset`: `#E9724C` (Sunset Orange) - Used for section accents, secondary buttons.
- `--color-lush`: `#254E35` (Tropical Leaf Green) - Used for gradient overlays, cards.
- `--color-bg`: `#FAF5EB` (Warm Sand) - Used for the main body background, soft readability.
- `--color-text`: `#2D3142` (Charcoal) - Used for all readable body text.

## 🔤 Typography
- **Heading Font**: `Playfair Display`, serif. Elegant, authoritative, cultural.
- **Body Font**: `Inter`, sans-serif. Highly readable, clean, accessible.
- **Base Size**: `16px` (no smaller for accessibility).

## 📐 Spacing & Layout
- Mobile-first approach. Standard padding is `20px` mobile, `40px` tablet, `80px` desktop.
- Max container width for content: `1200px`.
- Section vertical padding: `80px`.

## 🔘 Components
### Buttons
- **Primary CTA**: Gold background (`#FFC857`), Charcoal text, slight drop shadow, slight scale up on hover. Extremely obvious.
- **Secondary**: Clear background with Sunset Orange (`#E9724C`) border, Orange text.

### Cards
- White background (`#FFFFFF`), rounded corners (`12px`), soft shadow (`box-shadow: 0 4px 20px rgba(0,0,0,0.05)`).

## 🛑 Brand Rules
1. **CACAO** must always be capitalized in text.
2. Background images must have an overlay of `rgba(0,0,0,0.3)` to `0.6` depending on text contrast.
3. Every section must funnel to the "Donate/Apply" scholarship buttons.
