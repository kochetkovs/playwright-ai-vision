# Playwright + Gemini Vision AI: Semantic WebGL Testing

This project demonstrates a cutting-edge approach to testing **"untestable"** web environments like WebGL, Canvas 3D, and dynamic maps using Playwright and Google Gemini Vision AI (Flash 2.5).

## 🚀 The Challenge
Traditional QA automation relies on DOM selectors (IDs, Classes). However, complex 3D scenes (like Three.js games) or canvas-based maps (Google Maps) offer no internal locators. 

## 💡 The Solution: Semantic Visual Validation
Instead of pixel-matching, this framework uses **Generative AI** to "see" and analyze the screen like a human:
**Semantic Assertions:** Validates geographical data on maps without accessing internal map APIs.

## 🛠️ Tech Stack
- **Framework:** Playwright (Node.js)
- **AI Brain:** Google Gemini 2.5 Flash API
- **Language:** JavaScript

## 📈 Real-world Use Cases
**Geographical Validation:** Verifying the presence of cities (Harare, Bulawayo) and absence of others (New York) on a dynamic map.

## ⚙️  How to Run
1. Clone the repo.
2. Install dependencies: `npm install`.
3. Set your API Key: `export GEMINI_API_KEY='your_key_here'`.
4. Run tests: `npm test`.
