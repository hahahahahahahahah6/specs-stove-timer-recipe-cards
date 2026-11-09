# Build notes — what shipped vs. what was descoped

The design brief (`design-brief.md`) is the record of what was PLANNED. This file is
the honest record of what actually shipped in this build. Do not edit the brief to match.

## Shipped

- Default recipe: "番茄意大利面 Spaghetti with Tomato Sauce (2人份)", 6 steps, 4 timers
  (garlic 2 min, sauce 10 min, pasta 9 min in parallel, toss 1 min).
- Step navigation via Next/Prev buttons, with per-step instructions and ingredients.
- Two independent burner timers (left pan / right pot) with an explicit burner-occupancy
  model: one active timer per burner, handoff when a new one starts.
- 60x demo mode (minutes compressed to seconds).
- Simulated voice shortcut: plays back a fixed sentence ("add a step: boil pasta, 9
  minutes") and derives the timer from the sentence. No speech recognition.
- One-click importer: parses a bundled schema.org/Recipe JSON-LD payload compiled into
  the Lens. Nothing is fetched from the web.
- Per-control SIK Interactable + collider: every button is its own hit target.
- Subsetted Noto Sans SC bundled; all Text components use it; CJK renders correctly.
- Visual-only alarm at 00:00 (burner card turns red, on-screen callout).

## Descoped (planned in the brief, not built)

- Custom recipe creation + persistence (brief criterion 5): no persistence of any kind,
  no custom-recipe UI. The "New Recipe" button shipped as a restore-the-default-recipe
  button.
- LEAF scenarios: none. No LEAF package, no scenario files, zero criteria have tests.
- Visual progress rings/bars on burner cards: not built; the cards are text-only.
- Notification sound cue on timer finish: not built; visual only.
- SIK Buttons and UIKit widgets: SpectaclesUIKit is installed but unused. Controls are
  raw Text + SIK Interactable + collider. Functionally equivalent for one-tap buttons.
- Hover feedback ("targets are big and highlight when aimed at"): not implemented.
- `DEFAULT_RECIPE.source` still holds an allrecipes.com URL for a recipe that was never
  fetched. The field is never rendered.
