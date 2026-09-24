# Design QA — FamilyHub calendar and Today Mode

## Reference

- Selected direction: `C:\Users\Nevpe\.codex\generated_images\01a0bc93-2767-70e2-a5a1-e203bcdd4486\exec-489ba2be-1a57-40ea-a3ab-310e49badb54.png`
- Implementation: `http://127.0.0.1:5174/`, Calendar → Week
- Comparison viewports: 1440 × 1024 and 390 × 844

## Comparison

The implementation matches the selected direction's warm family dashboard, seven clear day columns, prominent current-day treatment, colour-coded family event cards, member avatars, weather summaries, rounded controls, and fixed FamilyHub navigation. Real household data replaces the mock content while preserving the reference hierarchy and density.

The focused calendar comparison confirmed the date toolbar, view switcher, day headings, current-day emphasis, event cards, empty-day actions, and member colour cues. Dark mode uses the same hierarchy and readable event colours. Below 760 px, the week becomes a vertical day agenda so content remains readable without page-level horizontal overflow.

## Corrections made during QA

- P2: Long event titles were truncated in narrow desktop columns. Event titles now wrap to a maximum of two lines.
- P2: Verified the mobile week layout switches from seven columns to a vertical agenda and does not overflow the page.

## Functional verification

- Event detail modal opens from a week card and closes correctly.
- Clicking a day heading opens Day view.
- Day, Week, Month, and Schedule views all load and retain their existing events.
- Light and dark themes both render the new week board correctly.
- Production build and targeted lint checks pass.
- Browser console has no errors on the final Week view.

## Skylight-style Home QA

- Verified the agenda-first hierarchy with real event, chore, dinner, countdown, shopping, camera, list, recipe, and pantry data at 1440 × 1024.
- Removed the repeated summary line, repeated focus strip, duplicate dinner-planning prompt, and duplicate “Next up” event.
- Verified each subject has one primary Home card: Today, important dates, chores, dinner, weekly overview, shopping, cameras, and lists.
- Verified Weekly Overview totals and seven-day cards after live events, tasks, and meals finished loading.
- Verified Smart Planning only adds new recipe and pantry guidance; its actions open Meals and Pantry.
- Verified the layout collapses to one column at 390 × 844 with no page-level horizontal overflow.
- Verified the full hierarchy and colour-coded event treatment in light and dark mode.
- Production build and targeted lint checks pass. Existing HomePage lint warnings are unchanged and unrelated to this redesign.

## Magic Import QA

- Verified the Calendar action opens a review-first importer in light and dark mode.
- Verified a two-event family notice detects Australian dates, start and end times, event names, and a labelled location correctly.
- Verified every detected event can be selected, edited, removed, and assigned to one or more family members before saving.
- Verified the importer supports pasted notices and emails plus local text, CSV, and ICS files.
- Verified Cancel and Close leave the calendar unchanged; the final import action was intentionally not used during visual QA.
- Verified the modal fits at 1440 × 1024 and 390 × 844 without page-level horizontal overflow.
- Production build passes. Targeted lint reports only existing React guidance warnings and no errors.

## Conflict warning QA

- Verified Add Event flags an overlap only after the affected family member, date, and time are selected.
- Verified a 6:15–6:45 pm event assigned to Connor warns about his existing 6:00–7:00 pm soccer event.
- Verified moving the same draft to Ashley removes the warning, so unrelated family schedules are not treated as conflicts.
- Verified warnings remain advisory and do not prevent an intentional save.
- Magic Import uses the same member-aware overlap check for reviewed events before import.
- Production build and targeted lint checks pass with no new errors.

## Family Routines QA

- Verified the Routines tab now opens a routine-specific form with today, morning, and daily repetition selected by default.
- Verified school, after-school, and bedtime starters fill the title, notes, routine period, and repetition settings while keeping every field editable.
- Verified existing member assignment, reminders, stars, recurrence, and completion tracking remain available.
- Corrected a narrow-screen overflow in the Tasks toolbar and confirmed the Routines page and modal have no horizontal page overflow at 390 × 844.
- Verified light and dark themes and confirmed no routine was saved during QA.

## Daily Brief QA

- Verified Settings includes a Daily Brief switch, delivery time, and an in-app preview.
- Verified the summary uses live counts for today’s events and tasks plus dinner and shopping status.
- Verified the preference and time persist locally and scheduled browser delivery only runs when notification permission is already granted.
- Verified disabled is the default, so adding the feature does not change notification behaviour until the family opts in.
- Verified the controls and preview at 390 × 844 in light and dark mode.

## Shopping Mode QA

- Verified Shopping Mode removes editing and destructive controls while keeping category filtering and one-tap completion available.
- Verified the focused layout uses larger check targets, one item per row, clear quantities, and a live remaining count.
- Verified product rows mark the item bought when tapped in Shopping Mode while normal mode still opens the editor.
- Added a best-effort screen wake lock while Shopping Mode is open on supported devices.
- Verified 28 existing items render without horizontal overflow at 390 × 844 in light and dark mode.
- Exited Shopping Mode after QA and did not complete or modify any shopping items.

## Busy-day dinner QA

- Verified Smart Planning chooses the busiest upcoming day without a planned meal using its event and task count.
- Verified the recommendation pairs that day with the fastest saved recipe and avoids repeating the pantry recipe when another quick option exists.
- Verified the card opens Plan This Meal with the recipe, dinner type, and recommended date already filled in.
- Verified the three-card layout at 1280 × 720 and the stacked layout at 375 × 812 with no horizontal overflow.
- Verified light and dark themes, restored light mode after QA, and confirmed the browser console has no errors.
- Production build passes; targeted lint reports only existing warnings and no errors.

## Recipe capture QA

- Verified Add Recipe now accepts copied recipe text and keeps the existing website-link importer available.
- Verified a sample recipe detected its title, description, prep time, mixed hour/minute cook time, servings, ingredients, numbered method steps, and source link.
- Verified captured details remain editable in the normal recipe form and nothing is saved until Add Recipe is used.
- Verified the capture panel at 1280 × 720 and 375 × 812 in light and dark mode with no page or dialog overflow.
- Cancelled the test form, confirmed no sample recipe was created, restored light mode, and confirmed the browser console has no errors.
- Production build passes; targeted lint reports only existing warnings and no errors.

## Scheduled photo display QA

- Verified Settings can schedule the calm household display with separate start and end times, including an overnight range.
- Verified an active test window opened the display automatically and a tap returned to FamilyHub without immediately reopening it for that window.
- Verified the display keeps the clock, date, weather, dinner, next event, and family summary readable over a rotating family profile photo.
- Verified the manual Preview Display action works without requiring Wall Mode or fullscreen.
- Verified the settings and photo display at 375 × 811 in light and dark mode with no horizontal overflow.
- Restored the default 8:00 pm–6:30 am times, disabled the schedule after QA, restored light mode, and confirmed the browser console has no errors.
- Production build passes; targeted lint reports only existing warnings and no errors.

## Calendar integrations QA

- Replaced the crowded Calendar Sources actions with a Connected Calendars grid for Google Calendar, Apple/iCloud, Outlook, and other ICS feeds.
- Verified the status cards report four connected Google calendars and one existing general calendar feed from live data.
- Verified Apple/iCloud and Outlook actions open provider-specific, editable setup forms without starting an account login or saving a source.
- Apple webcal links are normalized to HTTPS before saving so the existing read-only ICS sync service can refresh them.
- Existing source enablement, sync intervals, manual sync, editing, and deletion remain available below the integration cards.
- Verified the cards and guided forms at 375 × 811 in light and dark mode with no horizontal overflow, then restored light mode.
- Production build passes; targeted lint reports only an existing Settings effect warning and no errors.

## Family check-ins QA

- Added a daily Family Check-in home card for every active family member with Great, Good, Okay, and Hard choices.
- Verified each person can optionally flag that they need a hand and add a private family note of up to 160 characters.
- Verified check-ins update in place for the same person and date, refresh automatically across open FamilyHub screens, and reset naturally on the next day.
- Verified existing saved home layouts gain the new movable, resizable card without losing their current panel order or sizes.
- Completed an isolated end-to-end save and reload test against an in-memory copy of the family database, then reset the test copy so no real check-in remained.
- Verified desktop and phone layouts in light and dark mode, including the expanded check-in form, with no panel overlap.
- Production build passes; lint reports no errors.

## Final result

passed

## Home responsive dashboard QA

- Consolidated the Home-specific responsive rules into a final cascade that preserves the saved desktop dashboard while providing deliberate tablet, phone, and short-landscape layouts.
- Verified 1920 × 1080, 1440 × 900, 1366 × 768, 1180 × 820, 1024 × 768, 820 × 1180, 768 × 1024, 430 × 932, 390 × 844, 375 × 812, 360 × 800, and 844 × 390 viewports.
- Confirmed zero page-level horizontal overflow and zero dashboard-panel overlaps at every tested size.
- Reduced the loaded 390 × 844 Home page from roughly 4,149 pixels tall before the change to roughly 2,197 pixels, and reduced the phone navigation from two rows to one 63-pixel dock.
- Tightened tablet panels and placed Household Lists beside Camera Preview; tablet portrait height dropped from roughly 2,760 pixels to 2,397 pixels while preserving readable two-column cards.
- Verified contained horizontal strips for family filters, the seven-day outlook, smart suggestions, and phone navigation, with the overall page remaining fixed to the viewport width.
- Verified all phone Home controls use touch-friendly targets, long dynamic text wraps or clamps, and phone/tablet cards use compact content-specific layouts.
- Verified the Add Event dialog stays inside a 390 × 844 viewport and remains internally scrollable.
- Verified Home in light and dark themes, including a readable dinner name in both themes, and restored light mode after QA.
- Production build and lint pass with no errors; existing advisory warnings remain. Browser console has no errors.
- Follow-up: corrected Household Lists titles that wrapped letter-by-letter in half-width tablet panels and overrode the older seven-column weekly outlook rule at compact tablet widths; verified the wider tiles at 1104px and 390px with no page overflow.
