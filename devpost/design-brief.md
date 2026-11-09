---
status: approved
---

# Design brief: StoveTimer & Recipe Cards (灶台计时器与智能菜谱卡)

## The one spatial moment
The cook stands in front of the kitchen stove with pots bubbling and hands covered in olive oil and flour, glancing at floating step cards and stove timers anchored right above the simmering sauce and pasta pots, keeping their hands free while multiple timers count down simultaneously.

## Why it belongs on glasses
- Uses: leaves your body free, draws in the world, shares your view
- Why it's better than the phone or laptop version: In the kitchen, touching screens with wet or greasy hands ruins phones or creates a mess; checking phones distracts from hot stoves. AR keeps recipes and multiple independent countdown timers floating naturally in the cook's peripheral vision, alerting in real time without physical contact.

## Product or overlay
- Type: overlay (responds to kitchen cooking workflow)
- What the real version would sense: stove burners and pots in the user's kitchen space
- Stand-in for the preview: Virtual floating stove timer anchors and step card panel arranged in front of the user at comfortable kitchen viewing distance (around 80-120cm, eye-level to slightly below eye-level).

## Where things live
- Where the user is looking during the main task: looking forward towards stove burners and cutting board.
- Recipe Step Card Panel: sits center-left, anchored at distance 90cm, height 0cm (relative to camera forward), width ~60cm, showing current step, ingredient details, Next/Prev step buttons, and recipe overview.
- Stove Timers HUD / World Anchors: sits center-right and above burners, distance 95cm, height +10cm, width ~50cm, displaying active timers with visual progress rings/bars, countdown numbers, and pot labels (e.g., "Pan: Garlic", "Sauce Pot: Simmer", "Water Pot: Pasta"). Multiple timers can run in parallel.
- Control & Mode Bar: sits below the step cards (distance 85cm, height -20cm), contains Demo Mode toggle (Minutes -> Seconds), New Recipe button, and Web Import button.
- Custom Recipe / Import Modal: floating center popup (distance 80cm) when user clicks "New Recipe" or "Import".

## Hands and input
- Pinch / tap to click Next Step, Prev Step, Start Timer, Pause Timer, Reset Timer.
- Toggle switch for "Demo Mode: Minutes -> Seconds" (converts 10 min to 10s for live judging demonstration).
- Targets are big and highlight when aimed at (SIK Buttons and UIKit widgets).
- Voice input / speech simulation: Voice button with preset "加一步：煮面 9 分钟" or simulated voice input button for preview convenience.
- Web 1-click import: Import button with verified demo URL ("Spaghetti with Tomato Sauce" schema.org/Recipe JSON-LD) to parse and generate recipe cards and timer steps.

## When things show
- Step card panel: always available during cooking session, updates content as user navigates steps.
- Active timers: appear dynamically when a step with a timer is started (e.g. Step 2 Garlic 2m, Step 3 Sauce 10m, Step 4 Pasta 9m parallel!). Flash/ring alarm when reaching 00:00.
- Timers alert: visual ring highlight + notification sound cue when timer finishes.
- Custom recipe & import panel: shows when triggered, hides on save/cancel.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Display default recipe: "番茄意大利面 Spaghetti with Tomato Sauce (2人份)" with all 6 steps and ingredients list visible.
2. Step navigation works via Next/Prev buttons, showing step instructions and required ingredients for that step.
3. Multiple parallel timers: Step 3 (Sauce 10m) and Step 4 (Pasta 9m) can run simultaneously with independent countdowns and visual progress.
4. Demo mode switch works: toggling it scales minutes to seconds (e.g., 10 min becomes 10s) so timer countdowns and completion alerts can be demonstrated in seconds.
5. Custom Recipe creation: user can create a new recipe or add steps with custom timer duration, persisted in storage.
6. Web Recipe Import: 1-click import from web recipe JSON-LD/schema.org parses title, ingredients, steps, and detects timers automatically.

## Out of scope
- Physical thermal sensor integration on real pans.
- Real-time video optical pan recognition.

## Risks and open questions
- Sound playback in preview: ensure audio cues have visual fallbacks (color flash, badge) so preview works silently if audio is muted.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.
