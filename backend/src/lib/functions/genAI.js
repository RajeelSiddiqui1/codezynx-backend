import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLongDesc(title, description) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Title: ${title}
Description: ${description}

Step 1: Clean and translate the inputs (may be in Roman Urdu or poorly written).
Step 2: Infer the full meaning and expand context.
Step 3: Write a detailed, fluent, high-quality long-form article (1000+ words) in English. No formatting or headings. Plain text only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text || text.length < 100) {
      return "AI failed to generate a proper description.";
    }

    return text;
  } catch (err) {
    console.error("Gemini generation error:", err.message);
    return "AI failed to generate a proper description.";
  }
}

export async function isITRelevant(title, description, attachmentName = '', mimeType = '') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Title: ${title}
Description: ${description}
Attachment Name: ${attachmentName}
Attachment Type: ${mimeType}

Using only the above information (no file content), determine whether this post is related to Information Technology (e.g., programming, software, networking, tech education).

Respond with ONLY "YES" or "NO".
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    return text === "YES";
  } catch (error) {
    console.error("IT relevance check error:", error.message);
    return false;
  }
}

