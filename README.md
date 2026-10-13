# Playwright + Gemini Vision: Semantic Visual Assertions

An example of testing "untestable" UI, such as WebGL scenes, canvas and dynamic maps,
with Playwright and Google Gemini vision. Instead of DOM selectors or pixel diffs,
the test takes a screenshot and asks the model YES/NO questions about what is on screen.

## The idea

Google Maps renders the map on a canvas, so there is no locator for "the Harare label".
The test searches for Zimbabwe, waits for the map to settle, and asks Gemini:

1. Is the city of Harare visible?
2. Is the city of Bulawayo visible?
3. Is the city of New York visible? (a control question, must be NO)

The answers are enforced with a strict JSON schema (`YES`/`NO` enum), so the
assertions are plain `expect(...).toBe('YES')`.

## Project layout

- `maps.spec.js` — the test itself: navigation, waiting, questions, assertions.
- `lib/vision.js` — small helper: screenshot, Gemini call with JSON schema, retries,
  and attachments (`vision-input` and `vision-report`) in the Playwright report.
- `playwright.config.js` — viewport, `en-US` locale, retries, trace and screenshot on failure.

## How to run

```bash
npm install
npx playwright install chromium
cp .env.example .env   # put your GEMINI_API_KEY there (or export it in the shell)
npm test               # headless
npm run test:headed    # watch the browser
npm run report         # open the HTML report with the screenshot the model saw
```

Get a key at https://aistudio.google.com/app/apikey.

## Notes

- Both the map and the model are non-deterministic, so the config has one retry locally
  and two in CI. When a run fails, open the HTML report: the `vision-input` attachment is
  the exact frame sent to the model, `vision-report` is its answer with reasoning.
- The model is `gemini-2.5-flash`, called via the `@google/genai` SDK.
