```markdown
# High-End Editorial Design System: Field Companion

## 1. Overview & Creative North Star
**The Creative North Star: "The Luminous Intelligence"**

This design system moves beyond the standard SaaS "dashboard" to create a bespoke, editorial experience. It is designed for high-stakes client visits where information must be absorbed at a glance but feel prestigious in execution. 

We break the "template" look through **Intentional Asymmetry** and **Tonal Depth**. By leaning into the "Linear/Vercel" aesthetic, we prioritize breathing room and high-contrast typography scales over rigid grids. The interface should feel like a series of sophisticated, layered surfaces—less like a software tool and more like a high-end digital concierge.

---

## 2. Colors & Atmospheric Depth

Our color palette is built on "Atmospheric Layering." We do not use color simply to fill shapes; we use it to define light and focus.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` sitting on a `background` to create a logical break. If you feel the need for a line, increase the `spacing` token instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
- **Level 0 (Base):** `surface` (#121317) – The foundation.
- **Level 1 (Sections):** `surface-container-low` (#1a1b20) – For grouping related content areas.
- **Level 2 (Cards):** `surface-container` (#1f1f24) – For interactive elements.
- **Level 3 (Pop-overs):** `surface-container-highest` (#343439) – For active focus states.

### The "Glass & Gradient" Rule
Floating elements (Modals, Command Palettes, Navigation Bars) must use the **Glassmorphism** token:
- **Dark Mode Glass:** `rgba(18,21,30, .72)` with a `16px` backdrop-blur.
- **Light Mode Glass:** `rgba(255,255,255, .65)` with a `16px` backdrop-blur.

**Signature Texture:** Enhance primary CTAs by transitioning from `primary` (#6effc0) to `primary-container` (#00e5a0) in a 45-degree linear gradient. This adds "visual soul" and prevents the UI from feeling flat or clinical.

---

## 3. Typography: The Editorial Voice

Typography is our primary tool for authority. We use a tri-font system to separate intent:

- **Display & Headings (Outfit, 700-900):** Used for big numbers, client names, and section titles. The high weight communicates confidence.
- **Body & UI (Plus Jakarta Sans, 500-700):** Used for notes and interface labels. We avoid "Regular/400" weight to maintain a premium, high-ink-density feel.
- **Data & Timestamps (JetBrains Mono):** Used for visit durations, coordinates, and technical metadata. This introduces a "precision instrument" aesthetic to the intelligence being gathered.

**Scale Philosophy:** Use `display-lg` (3.5rem) for hero metrics and drop immediately to `body-md` (0.875rem) for descriptions. This high-contrast jump creates an editorial, high-end feel.

---

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through light and stacking, not structural boxes.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" without the clutter of drop shadows.
- **Ambient Shadows:** When an element must float (e.g., a Record Button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12)`. For Dark Mode, the shadow should be a tinted version of the surface color, never pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **20% opacity**. 100% opaque borders are strictly forbidden.
- **The Background Mesh:** The background is not static. It consists of three layered radial gradients:
  - **Teal (Accent):** Top-left, 7% opacity.
  - **Purple (Secondary):** Bottom-right, 6% opacity.
  - **Amber (Tertiary):** Top-center, 4% opacity.

---

## 5. Components: Precision Primitives

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), 10px radius. No border.
- **Secondary:** Glass background, `ghost-border` (20% outline-variant). 10px radius.
- **Record Button:** `50px` radius (Circular), `primary` background with a subtle pulse animation using `primary-fixed-dim`.

### Cards & Intelligence Lists
- **Rule:** Absolute prohibition of divider lines.
- **Separation:** Use `spacing-6` (1.5rem) of vertical white space or a shift from `surface-container` to `surface-container-high`.
- **Phase Indicators:** Use the **Phase Colors** as subtle 2px left-accent glows on cards, rather than full-color backgrounds.

### Input Fields
- **Styling:** 10px radius, `surface-container-low` background. 
- **Focus:** Transition the "Ghost Border" from 20% to 100% opacity of the `primary` token.

### Additional Signature Component: "The Intelligence Pulse"
A small, breathing glow component used next to "Live Visit" indicators. It uses the `accent` color with a 12px blur-radius animation to signify active data synchronization.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Negative Space:** If a screen feels "empty," do not add a box. Adjust the typography scale to make the existing content more authoritative.
- **Use Mono for Metrics:** Always use `JetBrains Mono` for any data that is calculated or timed.
- **Layer Glass:** Overlay glass navigation over the gradient mesh background to showcase the `16px` blur.

### Don't:
- **Don't use 100% White/Black:** Use `text` (#f0f1f4) and `bg` (#0a0b0f). Pure white/black kills the premium "editorial" depth.
- **Don't use Standard Shadows:** Never use the default "Drop Shadow" preset in design tools. Always manually craft ambient, low-opacity, large-spread shadows.
- **Don't Use Borders to Separate Content:** Use background tonal shifts or spacing. Borders are a last resort for accessibility, not a layout tool.

---

**Director’s Final Note:** 
This system is about the *feeling* of the data. It should feel as fast as Raycast, as polished as Vercel, and as intentional as a physical magazine. If it looks like a bootstrap template, you haven't used enough white space.```