# Practice Genie Features

## Application Core
* **Infinite Canvas (Whiteboard):** A massive (100,000px x 100,000px) interactive whiteboard area where exercise blocks are placed.
* **Canvas Panning & Zooming:** Ability to pan the canvas using middle/right mouse button, left-click on background, or holding Spacebar. Ability to zoom using the mouse wheel, zooming towards the pointer.
* **Local Storage Persistence:** Application state (blocks, difficulty, tone, theme, vocabulary focus, grammar focus, etc.) is saved to and loaded from `localStorage`.
* **State Export/Import:** Ability to download the current whiteboard state as a JSON file (`.json`) and import it back.
* **Clear Board:** A global action to remove all exercise blocks from the canvas (with confirmation prompt).
* **Activity Logging/Telemetry:** Usage and interactions are logged via `ActivityLogger` context, with the ability to download the activity log.

## UI Navigation & Layout
* **Radial Menu:** A central floating menu at the top of the screen replacing a traditional top bar. Features a main toggle button that expands satellite buttons for:
    * Configuration (Global Settings)
    * Difficulty toggling (cycling through A1-C2)
    * Export State
    * Themes (placeholder)
* **Sidebar:** A sliding panel on the left containing:
    * Configuration toggles for Vocabulary and Grammar focus.
    * An Exercise Library (Accordion style) categorized by pedagogy (PPP, Input, Lexis, Skills, TBLT, Social English, C-R, Production).
    * Draggable exercise cards with tooltips detailing difficulty, pedagogy, description, and an example.
    * Project Actions (Export, Import, Clear Board, Download Activity Log).
* **Mobile Overlay:** A backdrop blur that appears when the sidebar is open on smaller screens.
* **Global Settings Modal:** A floating modal accessible via the Radial Menu to configure default parameters for new exercises (Difficulty, Tone, Theme) and displays Estimated Lesson Time.

## Exercise Blocks Management
* **Drag and Drop Addition:** Drag exercise cards from the sidebar onto the canvas to create new blocks at specific coordinates.
* **Automatic Placement:** Adding an exercise without dragging places it in the first available non-overlapping spot.
* **Block Interaction:**
    * Freely drag blocks around the canvas.
    * Resize blocks (except in presentation mode).
    * Bring clicked blocks to the front (z-index manipulation).
    * Snap-to-align blocks with horizontal and vertical guide lines during dragging.
* **Auto-sizing:** Blocks automatically adjust their height/width based on generated content.
* **Block Header Controls:** Each block has a header displaying its type, pedagogy, and estimated duration, along with controls to:
    * Generate content.
    * Regenerate content.
    * Toggle block-specific settings (Difficulty, Tone, Theme overrides).
    * Remove the block.
    * Enter "Live Mode" (Presentation mode).
    * Adjust generation quantity (amount of questions).

## Presentation / Live Mode
* **Focus View:** Centers and scales a specific exercise block to fill the screen (up to 5.0x zoom), disabling dragging/resizing.
* **Navigation:** Slide-based navigation (Next/Prev buttons and Left/Right arrow keys) to iterate through individual questions/items *within* a generated exercise block.
* **Isolation:** Only the active question/item is visible at a time to preserve input state while hiding the rest.

## Content Generation (AI)
* **Gemini Integration:** Uses an external AI service (`geminiService.ts`) to generate exercise content based on type, difficulty, tone, theme, and focus areas.
* **Vocabulary Focus:** Users can define a list of target vocabulary words and an inclusion rate percentage to force the AI to use those words.
* **Grammar Focus:** Users can define target grammar points and an inclusion rate percentage to force the AI to use them.

## Interactive Exercise Types (32 total)
The application supports the generation and interactive solving of 32 distinct exercise types, grouped by pedagogical function:

### Fill-in-the-Blanks & Text Completion
* **Fill-in-the-Blank (FITB):** Drag and drop words from a bank into blanks. Includes AI answer checking.
* **Collocation Gap-Fill:** FITB focused on specific collocations.
* **Phrasal Verb Gap-Fill:** FITB focused on specific phrasal verbs.
* **Cloze Paragraph:** Dropdown selections within a larger text passage.
* **Dialogue Completion:** Dropdown selections within a conversational dialogue.

### Multiple Choice & Selection
* **Multiple Choice:** Standard MCQ selection with visual feedback (green/red).
* **Prediction (What Happens Next?):** MCQ based on a story prompt.
* **Rule Discovery (C-R):** MCQ based on observing patterns in provided sentences.
* **Spot the Difference (C-R):** MCQ comparing two slightly different sentences.
* **Politeness Scenarios:** MCQ choosing the most appropriate response for a social situation.
* **Inferring Meaning:** MCQ deducing meaning from a dialogue.
* **Collocation Odd One Out:** Identify the word that doesn't collocate with a keyword.

### Matching & Sorting
* **Matching:** Connect prompts to their correct answers.
* **Function Matching:** Connect linguistic functions to examples.
* **Register Sort:** Drag and drop phrases into appropriate register categories (e.g., Formal, Informal).

### Ordering & Sequencing
* **Sentence Scramble:** Click words from a bank to build a correct sentence.
* **Story Sequencing:** Drag and drop story parts to reorder them correctly.

### Error Correction & Transformation
* **Error Correction:** Type a corrected version of a provided incorrect sentence.
* **Word Formation:** Type the correct morphological form of a root word for a blank.

### Reading & Listening
* **Reading for Gist (Skimming):** Read a text and answer a multiple-choice question about the main idea.
* **Reading for Detail (Scanning):** Read a text and type answers to specific questions.
* **Information Transfer:** Read a text and fill in specific form fields based on the information.
* **Listening for Specific Info:** Read a transcript (acting as audio) and answer text-input questions.

### Open Response & Writing (AI Graded)
* **Picture Prompt:** View an image and write questions about it.
* **Moral Dilemma (TBLT):** Read a dilemma and type an explanation of what to do.
* **Functional Writing Prompt:** Complete a writing task based on a scenario.
* **Problem-Solving Scenario:** Type a solution to a described problem.
* **Role-Play Scenario:** Type a response based on an assigned character and situation.
* **Storytelling from Prompts:** Write a story incorporating specific prompt words.
* **Justify Your Opinion:** Write a justification for a given statement.
* **Picture Comparison:** Write a comparison of two text prompts (acting as pictures).
* **Dicto-Gloss (C-R):** Read a text, hide it, and attempt to reconstruct it from memory.

## AI Answer Checking
* Many interactive components include a "Check with AI" button that sends the user's input to the AI service for personalized feedback and grading.
