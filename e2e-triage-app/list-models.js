require('dotenv').config();
async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return;
    }
    console.log(data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name));
  } catch (e) {
    console.error(e);
  }
}
run();
