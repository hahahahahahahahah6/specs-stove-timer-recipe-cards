# Stove Timer & Smart Recipe Cards

A hands-free cooking coach for Snap Spectacles (Lens Studio).

## What it does

Cooking goes wrong in the gaps: you are mid-step with oily hands, the sauce needs ten
minutes, the pasta needs nine, and your phone is face-down across the counter. This Lens
puts the whole recipe in your field of view instead. A floating step card shows the
current step, the ingredients that step needs, and a one-pinch "start timer" action. Two
burner cards — left pan and right pot — run fully independent countdowns, so the tomato
sauce and the pasta can simmer and boil in parallel and each burner shows its own MM:SS.
At 00:00 the burner card turns red and calls the finished timer out on screen. The alarm
is visual only — on glasses that is the fallback that always works, muted or not.

It ships with a complete demo recipe (Spaghetti with Tomato Sauce, 2 servings, 6 steps,
4 timers: garlic 2 min, sauce 10 min, pasta 9 min in parallel, toss 1 min), plus three
shortcuts built for the kitchen: a 60x demo mode that compresses minutes into seconds;
a simulated voice shortcut that appends a spoken step ("add a step: boil pasta, 9
minutes") and derives the timer from the sentence; and a one-click importer that reads a
bundled schema.org/Recipe JSON-LD payload and auto-detects the timer durations written in
plain language inside the instructions. The voice button plays back a fixed sentence
rather than running speech recognition, and the importer parses a sample payload compiled
into the Lens rather than fetching a live URL.

Every control is its own Spectacles Interaction Kit target with its own collider, so a
pinch hits exactly one button. All interactions work with the mouse in Lens Studio's
Interactive Preview. The interface is in Chinese, with the recipe title bilingual; a
subsetted Noto Sans SC is bundled with the project so the CJK text renders identically in
the preview and on device.

## Who it is for

Home cooks following an unfamiliar recipe, where the hard part is not the technique but
keeping several things on the heat at once. More broadly, anyone doing a multi-step,
multi-timer task with occupied hands: coffee brewing, bread proofing, home chemistry,
lab prep.

## How to run

1. Open `SpecsBaseTemplate.esproj` in Lens Studio 5.23.2.
2. Press Preview (Interactive). The step card, two burner cards, and control bar appear
   in the preview frame.
3. Click the controls with the mouse, or pinch them on device.

## What we learned

- The timer model, not the UI, is the real design problem. A burner is not a timer; it
  is a slot that different timers occupy over the course of a cook. Modelling burner
  occupancy explicitly — one active timer per burner, with handoff when a new one starts —
  is what makes parallel cooking legible.
- Parsing durations out of free-text instructions is cheap and high-leverage.
- Minutes are untestable. A 60x demo-mode multiplier was the single most useful thing
  built: every 00:00 state, alarm, and parallel-countdown case becomes reachable in
  seconds.
- On glasses, interaction has to be built on SIK hit targets from the start. Screen-tap
  style events have no notion of which control you aimed at.
- A Lens that compiles is not a Lens that runs. Ours type-checked clean and still failed
  at module load. Run the thing, every time.
- The additive display changes what "contrast" means: black renders as transparent, so
  legibility has to come from bright text, not from backgrounds.

## Project files

- `devpost/design-brief.md` — the skill-pack planning document (what was planned).
- `devpost/build-notes.md` — what actually shipped vs. what was descoped.
- `Assets/Scripts/` — the TypeScript/JavaScript implementation.
- `Assets/Fonts/` — subsetted Noto Sans SC for CJK rendering.

## License

MIT
