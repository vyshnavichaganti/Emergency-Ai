import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory cache for common emergencies
  const emergencyCache: Record<string, any> = {
    "snake bite": {
      actions: [
        "Call emergency services immediately.",
        "Keep the person calm and still to slow the spread of venom.",
        "Keep the bite area below heart level if possible.",
        "Remove any jewelry or tight clothing before swelling starts.",
        "Cover the bite with a clean, dry dressing."
      ],
      donts: [
        "Don't apply a tourniquet.",
        "Don't cut the wound or try to suck out the venom.",
        "Don't apply ice or water.",
        "Don't drink caffeine or alcohol."
      ],
      note: "Try to remember the snake's color and shape for identification, but do not try to catch it."
    },
    "fire": {
      actions: [
        "Alert everyone in the building immediately.",
        "Evacuate through the nearest safe exit.",
        "Stay low to the floor to avoid smoke inhalation.",
        "Check doors with the back of your hand before opening.",
        "Call emergency services once you are safe outside."
      ],
      donts: [
        "Don't use elevators.",
        "Don't stop to collect personal belongings.",
        "Don't open a door that feels hot."
      ],
      note: "If your clothes catch fire, Stop, Drop, and Roll."
    }
  };

  // Backend endpoint as requested
  app.post("/api/emergency-help", (req, res) => {
    const { situation } = req.body;
    if (!situation) {
      return res.status(400).json({ error: "Situation is required" });
    }

    const normalized = situation.toLowerCase().trim();
    if (emergencyCache[normalized]) {
      return res.json({ ...emergencyCache[normalized], source: "cache" });
    }

    // For other cases, we'll let the frontend handle the Gemini call 
    // to follow the platform's security guidelines for API keys.
    return res.json({ message: "No cached response found. Using AI fallback.", needsAI: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Emergency Guide Server running on http://localhost:${PORT}`);
  });
}

startServer();
