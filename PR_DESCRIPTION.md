Title: "🧹 [code health improvement description]"

Description:

* 🎯 **What:** Documented that the `getActivityLogger` import is actively used for telemetry and is not dead code, addressing a false positive code health report. Added an inline comment `// Used in handleAnswerItem for telemetry` above the import in `src/components/ExerciseBlock.svelte`.
* 💡 **Why:** The codebase analysis incorrectly flagged `getActivityLogger` as an unused import. However, deleting the import and the associated logging logic would introduce a functional regression, violating the principle of preserving existing functionality. Adding a comment clarifies its purpose to future developers and code analysis tools.
* ✅ **Verification:** Evaluated `src/components/ExerciseBlock.svelte` to confirm that `getActivityLogger` is indeed called within the `handleAnswerItem` function on line 238, which is itself utilized by dynamic Exercise template components. Ran `bun run check` and `bun run build` to ensure the added comment introduces no syntax or build errors.
* ✨ **Result:** The codebase is now safer from accidental deletions of the telemetry logic, and the code health report's concern is explicitly resolved via documentation while preserving 100% of the application's functionality.
