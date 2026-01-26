const { test, expect } = require('@playwright/test');
const { GoogleGenerativeAI } = require('@google/generative-ai');

test.setTimeout(60000);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" }
});

test('Maps Visual Validation: Zimbabwe Cities', async ({ page }) => {
    // 1. Heading to the Google maps
    await page.goto('https://www.google.com/maps');

    // 2. Acceping cookies policy using selector
    const acceptAll = page.locator('[jsaction="JIbuQc:ldDdv(b3VHJd)"] button').first();
    if (await acceptAll.count()) {
        await acceptAll.click();
        console.log('Cookies accepted.');
    }

    // 3. Searching for Zimbabwe using selector
    const searchBox = page.locator('[name="q"]');
    await searchBox.waitFor({ state: 'visible' });
    await searchBox.fill('Zimbabwe');
    await page.keyboard.press('Enter');
    
    // Wait for the cities to zoom and render
    await page.waitForTimeout(7000);

    // 4. Screenshot
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
    const base64Screenshot = screenshot.toString('base64');

    // 5. Visual AI analysis
    const prompt = `
        Analyze this screenshot of a map. 
        Perform a semantic check and return YES or NO for each question.
        
        Questions:
        1. Is the city of Harare visible?
        2. Is the city of Bulawayo visible?
        3. Is the city of New York visible?
        
        Return JSON format: 
        {
          "harare_present": "YES/NO",
          "bulawayo_present": "YES/NO",
          "ny_present": "YES/NO",
          "reasoning": "briefly describe what you see"
        }
    `;

    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Screenshot, mimeType: 'image/jpeg' } }
    ]);

    const report = JSON.parse(result.response.text());
    console.log('Visual Analysis Results:', report);

    // 6. Business-asserts
    expect(report.harare_present).toBe('YES');
    expect(report.bulawayo_present).toBe('YES');
    expect(report.ny_present).toBe('NO');
});