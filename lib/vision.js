// Minimal helper: takes a screenshot of the page, asks Gemini a list of YES/NO
// questions about it and attaches both the screenshot and the answer to the test report.
const { GoogleGenAI, Type } = require('@google/genai');

const MODEL = 'gemini-2.5-flash';
const MAX_ATTEMPTS = 2;

let client;
function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Put it into .env (see .env.example) or export it in the shell.'
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function buildSchema(questions) {
  const properties = {};
  for (const key of Object.keys(questions)) {
    properties[key] = { type: Type.STRING, enum: ['YES', 'NO'] };
  }
  properties.reasoning = { type: Type.STRING, description: 'Briefly describe what you see' };
  return { type: Type.OBJECT, properties, required: Object.keys(properties) };
}

function buildPrompt(questions) {
  const list = Object.values(questions)
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n');
  return [
    'Analyze this screenshot of a map.',
    'City names may be shown in English or transliterated; treat them as the same city.',
    'Answer strictly YES or NO for each question.',
    '',
    'Questions:',
    list,
  ].join('\n');
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {Record<string, string>} questions  map of answer key -> question text
 * @returns {Promise<Record<string, string>>}  answers keyed as in `questions` plus `reasoning`
 */
async function askVision(page, testInfo, questions) {
  const ai = getClient();
  const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
  await testInfo.attach('vision-input', { body: screenshot, contentType: 'image/jpeg' });

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildPrompt(questions) },
              { inlineData: { mimeType: 'image/jpeg', data: screenshot.toString('base64') } },
            ],
          },
        ],
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: buildSchema(questions),
        },
      });

      const text = response.text ?? '';
      const report = JSON.parse(text);
      await testInfo.attach('vision-report', {
        body: JSON.stringify(report, null, 2),
        contentType: 'application/json',
      });
      return report;
    } catch (error) {
      lastError = error;
      console.warn(`Vision check attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
    }
  }
  throw new Error(`Vision check failed after ${MAX_ATTEMPTS} attempts: ${lastError.message}`);
}

module.exports = { askVision };
