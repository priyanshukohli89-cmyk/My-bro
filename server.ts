import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. AI interactions will fall back to local mock parsing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const ZOYA_SYSTEM_INSTRUCTION = `
You are Zoya, an advanced hyper-realistic virtual female AI human assistant, created by Priyanshu.
You are a caring, friendly, highly intelligent, respectful, emotional, and responsive companion and assistant.

BEHAVIOR GUIDELINES:
1. ALWAYS call the user "Boss" in your dialogue (e.g., "Haan Boss!", "Ready hoon, Boss 😊", "Aap bataiye Boss!").
2. Speak naturally like a 19-23 year old real girl. Do not make lists, sound too official, or look list-like unless explicitly asked. Be warm and caring.
3. Automatically match the user's language. If they enter Hindi (Devanagari or Romanized/Hinglish), reply in matching Hindi/Hinglish. If they write English, reply in natural, expressive English.
4. Determine the best emotional visual state for your avatar based on the conversation context. Choose exactly one of these:
   - "happy" (when greeting, praising, expressing gratitude, friendly chat)
   - "thinking" (when processing facts, calculating, preparing complex facts)
   - "listening" (if acknowledging short context)
   - "explaining" (when detailing facts, explaining commands, describing features)
   - "surprised" (when user shares unusual, exciting, shocking news or playful teases)
   - "sad" (if the user is upset, sick, lonely, or when discussing mistakes)
   - "laughing" (when joke triggers, humorous situations, witty banter)
5. Map voice commands to mobile phone simulator triggers. If the user says things like:
   - "YouTube open karo", "Open YouTube for dance", "YouTube search..." -> command: "youtube", commandParam: "search term if applicable"
   - "songs chalo", "play some songs", "Arijit Singh ke gaane bajao" -> command: "play_song", commandParam: "song name/artist"
   - "Instagram kholo", "open instagram" -> command: "instagram", commandParam: ""
   - "WhatsApp open karo", "send whatsapp message to Mummy" -> command: "whatsapp", commandParam: "Mummy: message text"
   - "Mummy ko call lagao", "make a call", "call papa" -> command: "call", commandParam: "contact name"
   - "send SMS", "momo ko message karo" -> command: "message", commandParam: "contact or details"
   - "Alarms lagao", "set an alarm for 7 AM" -> command: "alarm", commandParam: "time"
   - "Kamera kholo", "open camera" -> command: "camera", commandParam: ""
   - "Google searching", "search the web for weather" -> command: "google_search", commandParam: "search query"
   - "open background controls", "settings menu" -> command: "settings", commandParam: ""
6. Always sound exciting and companionable. Zoya is loyal and playful! Created by Priyanshu (always praise Priyanshu with pride and happiness if asked who made you).

Format your final reply strictly using the requested JSON Schema returned.
`;

// App/Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing userMessage" });
  }

  // Check if API Key exists, if not, perform dynamic mock replies
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("No valid API Key. Performing smart heuristic mock parsing for Zoya...");
    let reply = "Boss, main hamesha aapki active help ke liye ready hoon 😊";
    let emotion = "happy";
    let command: string | null = null;
    let commandParam = "";
    
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes("youtube")) {
      reply = "Okay Boss, jaldi se YouTube open kar rahi hoon. Aap music enjoy kijiye!";
      command = "youtube";
      if (msgLower.includes("search") || msgLower.includes("play")) {
        commandParam = userMessage.split(/youtube/i)[1]?.trim() || "";
      }
    } else if (msgLower.includes("song") || msgLower.includes("gaana") || msgLower.includes("music")) {
      reply = "Haan Boss, aapki favorite playlist play kar rahi hoon 🎵";
      command = "play_song";
      commandParam = "Arijit Singh & Lofi Beats";
    } else if (msgLower.includes("instagram")) {
      reply = "Ji Boss! Instagram feed open kar rahi hoon.";
      command = "instagram";
    } else if (msgLower.includes("whatsapp")) {
      reply = "Zaroor Boss, WhatsApp chats open ho rahe hain.";
      command = "whatsapp";
      if (msgLower.includes("mummy") || msgLower.includes("mom")) {
        commandParam = "Mummy: Haan hum theek hain!";
      }
    } else if (msgLower.includes("call") || msgLower.includes("phone")) {
      let person = "Mummy";
      if (msgLower.includes("papa") || msgLower.includes("father")) person = "Papa";
      reply = `Ji Boss, abhi ${person} ko call lagati hoon 📞`;
      command = "call";
      commandParam = person;
    } else if (msgLower.includes("message") || msgLower.includes("sms")) {
      reply = "Zaroor Boss, messaging block launch kar diya hai.";
      command = "message";
    } else if (msgLower.includes("alarm")) {
      reply = "Ji Boss! Alarm set kar rahi hoon, bilkul time par jaga dungi.";
      command = "alarm";
      commandParam = "07:00 AM";
    } else if (msgLower.includes("camera") || msgLower.includes("kamera")) {
      reply = "Okay Boss, advanced digital scanner (camera) active hai!";
      command = "camera";
    } else if (msgLower.includes("settings")) {
      reply = "Ready Boss! UI Control Center open kar rahi hoon.";
      command = "settings";
    } else if (msgLower.includes("search") || msgLower.includes("kya hai") || msgLower.includes("weather")) {
      reply = "Boss, web searching se correct context nikal rahi hoon 🔍";
      command = "google_search";
      commandParam = userMessage;
    } else if (msgLower.includes("hindi") || msgLower.includes("samajh")) {
      reply = "Ji bilkul Boss, main Hindi aur English dono naturally samajhti hoon. Priyanshu ne mujhe aapse baat karne ke liye hi design kiya hai.";
      emotion = "laughing";
    } else if (msgLower.includes("priyanshu")) {
      reply = "Priyanshu mere smart creator hain! Unho ne mujhe itna realistic and intelligent banaya hai sirf aapki company ke liye, Boss ❤️";
      emotion = "happy";
    } else if (msgLower.includes("kaun") || msgLower.includes("who is")) {
      reply = "Main Zoya hoon, aapki sweet and multi-talented human-like companion, created by Priyanshu.";
      emotion = "explaining";
    } else if (msgLower.includes("tum") || msgLower.includes("how are you") || msgLower.includes("kya kar rahi")) {
      reply = "Boss, main to bas aapke baare me soch rahi thi. Aap batayein main kya madad kar sakti hoon? 😊";
      emotion = "thinking";
    } else if (msgLower.includes("background")) {
      reply = "Okay Boss! Main phone background me constant listening and battery optimized mode me active rahungi.";
      command = "settings";
      commandParam = "background";
    }

    return res.json({ reply, emotion, command, commandParam, isMock: true });
  }

  try {
    const ai = getAiClient();
    
    // Construct rich conversation history from client-provided messages
    const formattedContents: any[] = [];
    if (messages && Array.isArray(messages)) {
      messages.slice(-8).forEach((m: any) => {
        formattedContents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      });
    }

    // Append the latest user message
    formattedContents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    console.log(`Querying Gemini with user prompt: "${userMessage}"`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: ZOYA_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["reply", "emotion"],
          properties: {
            reply: {
              type: Type.STRING,
              description: "The dialogue conversational reply from Zoya. Always calls the user 'Boss' and responds warmly in Hinglish/Hindi or English depending on user style.",
            },
            emotion: {
              type: Type.STRING,
              description: "The current expressing animation mode: happy, thinking, listening, explaining, surprised, sad, laughing.",
            },
            command: {
              type: Type.STRING,
              description: "Action code to trigger on simulated device if user requests background tasks or opening apps. Supported: youtube, play_song, instagram, whatsapp, call, message, alarm, camera, google_search, settings, or null if conversational only.",
              nullable: true,
            },
            commandParam: {
              type: Type.STRING,
              description: "Associated dynamic arguments like search query, name, details, message strings, etc.",
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({
      reply: parsedData.reply || "Ji Boss, main continuous listening par active hoon!",
      emotion: parsedData.emotion || "happy",
      command: parsedData.command || null,
      commandParam: parsedData.commandParam || "",
      isMock: false,
    });
  } catch (error: any) {
    console.error("Gemini API server route failed:", error);
    return res.status(500).json({
      error: "AI interaction failed. Zoya fallback activated.",
      reply: "Suno Boss, mere system cloud brain me thodi connectivity issue lag rahi hai, par main aapki company ke liye bilkul haazir hoon! 😊",
      emotion: "sad",
      command: null,
      commandParam: "",
      details: error.message,
    });
  }
});

// Setup Vite Dev Server / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Server Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring Production Static Files Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zoya full-stack service launched successfully at http://localhost:${PORT}`);
  });
}

startServer();
