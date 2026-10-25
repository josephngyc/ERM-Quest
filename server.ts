import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API endpoint to generate quiz questions from ERM notes
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { notesContent, topic, count = 5 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Falling back to built-in course note questions.",
      });
    }

    const promptText = `You are an expert Enterprise Resource Management (ERM) professor creating questions for an educational Super Mario platformer quiz.
Based on the following student lecture notes context, generate exactly ${count} multiple-choice quiz questions.

Topic focus: ${topic || "Enterprise Resource Management (BBT2004) - Topics 1, 2, 3, 4, 6"}
Notes content / context:
${notesContent ? notesContent.slice(0, 10000) : "Default to BBT2004 notes: ERM overview, BPR vs Customization, 3Ps, Data Silos, AI/ML in ERP, Process Maps (SD symbols), Sales Order process, Order fulfilment steps (Picking, Packing, Loading, Goods Issue), Master data vs Transactional data, Sold-to/Ship-to/Bill-to/Payer, Plant/Storage Location/Work Center, BOM, Routing, Lot sizing, MRP 5 inputs, Forward vs Backward scheduling, Safety Stock, Reorder Point (ROP), and Economic Order Quantity (EOQ)."}

Requirements:
1. Each question must test a concrete concept directly from the notes.
2. Provide 4 distinct options (A, B, C, D). Only one is correct.
3. Keep the question crisp and readable on a retro Mario arcade prompt.
4. Provide a clear, educational explanation (1-2 sentences) of why the answer is correct so the student learns immediately.
5. Provide a difficulty level: "normal", "hard", or "expert".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: {
                type: Type.INTEGER,
                description: "0-indexed integer (0 to 3) representing the correct option",
              },
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ["question", "options", "correctIndex", "topic", "explanation"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ success: true, questions: parsed });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate questions with Gemini",
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
