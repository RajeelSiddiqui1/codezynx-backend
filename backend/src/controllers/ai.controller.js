import generateContent from "../services/ai.service.js";

export async function aiResponse(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await generateContent(prompt);
    res.status(200).json({ result: response });
  } catch (error) {
    console.error("AI Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
