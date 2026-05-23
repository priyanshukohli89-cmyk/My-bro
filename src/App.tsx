import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ZoyaCanvas } from "./components/ZoyaCanvas";
import { PhoneSimulator } from "./components/PhoneSimulator";
import { VoiceController } from "./components/VoiceController";
import { HologramSystem } from "./components/HologramSystem";
import { 
  EmotionType, 
  ChatMessage, 
  SimulatedAppType 
} from "./types";
import { 
  Sparkles, 
  Cpu, 
  Send, 
  User, 
  Compass, 
  Smartphone, 
  Info, 
  RotateCw, 
  CircleDot,
  BotOff
} from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: "1", 
      sender: "zoya", 
      text: "Boss, main aapke liye hamesha ready hoon 😊 Main Hindi aur English dono naturally samajhti hoon!", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: "happy"
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("happy");
  const [isZoyaSpeaking, setIsZoyaSpeaking] = useState<boolean>(false);
  const [voiceActivity, setVoiceActivity] = useState<number>(0);
  const [lastReplyText, setLastReplyText] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Styling customisations
  const [neonColor, setNeonColor] = useState<string>("#00d2ff"); // Default Cyan Core
  const [isBackgroundMode, setIsBackgroundMode] = useState<boolean>(true);

  // Mobile App Launcher simulator variables
  const [activePhoneApp, setActivePhoneApp] = useState<SimulatedAppType>("home");
  const [phoneCommandParam, setPhoneCommandParam] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chats
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Main interaction agent handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Save user message to log
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiProcessing(true);
    setCurrentEmotion("thinking");

    try {
      // API call to our full-stack Express server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userMessage: textToSend,
          messages: messages.map(m => ({ role: m.sender === "zoya" ? "assistant" : "user", content: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Local full-stack chat endpoint returned non-ok status");
      }

      const data = await response.json();
      
      // Post model state
      const zoyaMsg: ChatMessage = {
        id: `z-${Date.now()}`,
        sender: "zoya",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: data.emotion as EmotionType
      };

      setMessages(prev => [...prev, zoyaMsg]);
      setCurrentEmotion(data.emotion as EmotionType || "happy");
      setLastReplyText(data.reply);

      // Launch simulated phone apps if parsed by Gemini
      if (data.command) {
        setActivePhoneApp(data.command as SimulatedAppType);
        setPhoneCommandParam(data.commandParam || "");
      }

    } catch (err) {
      console.error("AI Assistant fetching crashed:", err);
      // Hard fallback inside App if server has structural issues
      const errReply = "Suno Boss, network waves thodi unstable hain. Par main hamesha taiyaar hoon click commands ke liye!";
      const zoyaFallback: ChatMessage = {
        id: `z-${Date.now()}`,
        sender: "zoya",
        text: errReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: "sad"
      };
      setMessages(prev => [...prev, zoyaFallback]);
      setCurrentEmotion("sad");
      setLastReplyText(errReply);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleMicTranscript = (transcript: string) => {
    handleSendMessage(transcript);
  };

  const toggleDemoCommand = (text: string) => {
    setInput(text);
    handleSendMessage(text);
    setInput("");
  };

  return (
    <div id="zoya_root_app" className="min-h-screen bg-[#080712] text-zinc-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Immersive Cyber Chamber Light Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(8,7,18,1)_0%,_rgba(15,10,38,0.3)_100%)] pointer-events-none" />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 pointer-events-none -top-40 -left-40 transition-colors duration-1000"
        style={{ backgroundColor: `${neonColor}22` }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none -bottom-40 -right-40 transition-colors duration-1000"
        style={{ backgroundColor: `${neonColor}11` }}
      />

      {/* HEADER BAR */}
      <header className="relative z-30 border-b border-zinc-900/60 bg-zinc-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-500"
            style={{ borderColor: `${neonColor}66`, boxShadow: `0 0 10px ${neonColor}33`, backgroundColor: `${neonColor}11` }}
          >
            <Sparkles className="w-5 h-5" style={{ color: neonColor }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-sans text-slate-100 flex items-center gap-1.5 select-none">
              ZOYA <span className="text-[10px] font-mono opacity-65 font-medium px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">A.I. Companion</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500">Created with dedication by <span className="text-zinc-400 font-bold">Priyanshu</span></p>
          </div>
        </div>

        {/* Global status line */}
        <div className="flex items-center gap-2 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-400">SYNC_STATUS: ACTIVE</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        
        {/* LEFT COLUMN (GRID SIZE 7): ZOYA COMPANION POD & DIAGNOSTICS */}
        <section id="zoya_pod_section" className="lg:col-span-7 flex flex-col gap-6 h-full justify-between">
          
          {/* Visual Canvas Port */}
          <div className="flex-1 min-h-[300px] md:min-h-[420px] rounded-3xl bg-zinc-950/60 border border-zinc-900 shadow-xl relative overflow-hidden flex flex-col justify-between p-4 backdrop-blur-sm">
            
            {/* Hologram Chamber Scanner Grid visual overlay effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,35,0)_94%,rgba(0,210,255,0.06)_97%,rgba(0,210,255,0.04)_100%)] pointer-events-none bg-[size:100%_28px] animate-[pulse_5s_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(8,7,12,0.65)_100%)] pointer-events-none" />

            {/* Glowing Ring Visualizer wrapper around Zoya */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className={`w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full border-2 border-dashed opacity-25 transition-all duration-305 ${isZoyaSpeaking ? "animate-spin" : "animate-[spin_40s_linear_infinite]"}`}
                style={{ 
                  borderColor: neonColor,
                  transform: isZoyaSpeaking ? `scale(${1.0 + voiceActivity * 0.15})` : "none",
                  animationDuration: isZoyaSpeaking ? "12s" : "40s"
                }}
              />
              <div 
                className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] rounded-full border border-double opacity-20 absolute"
                style={{ 
                  borderColor: neonColor,
                  transform: isZoyaSpeaking ? `scale(${1.0 - voiceActivity * 0.1})` : "none" 
                }}
              />
            </div>

            {/* Zoya Vector Avatar Canvas and mouth lip-sync */}
            <div className="flex-1 relative z-10">
              <ZoyaCanvas 
                emotion={currentEmotion} 
                isSpeaking={isZoyaSpeaking} 
                neonColor={neonColor}
                voiceActivity={voiceActivity}
              />
            </div>

            {/* Speaking voice wave circular waveform representation */}
            <div className="h-10 border-t border-zinc-900/60 pt-3 flex items-center justify-between select-none z-10 px-2">
              <div className="flex items-center gap-1">
                <CircleDot className="w-3.5 h-3.5" style={{ color: neonColor }} />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Holographic Projection Wave</span>
              </div>
              
              {/* Animated wave bars */}
              <div className="flex items-end gap-1 h-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                  const speakHeight = isZoyaSpeaking ? `${20 + Math.random() * 80}%` : "15%";
                  return (
                    <div 
                      key={bar} 
                      className="w-1 rounded-t-full transition-all duration-75"
                      style={{ 
                        height: speakHeight, 
                        backgroundColor: neonColor,
                        opacity: isZoyaSpeaking ? 0.8 : 0.25,
                        boxShadow: isZoyaSpeaking ? `0 0 5px ${neonColor}` : "none"
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Voice controller mic and wake word modules */}
          <VoiceController 
            onTranscript={handleMicTranscript}
            isZoyaSpeaking={isZoyaSpeaking}
            setIsZoyaSpeaking={setIsZoyaSpeaking}
            setVoiceActivity={setVoiceActivity}
            lastReplyText={lastReplyText}
          />

          {/* Hologram customizer settings & tech diagnostics */}
          <HologramSystem 
            emotion={currentEmotion} 
            isBackgroundMode={isBackgroundMode}
            neonColor={neonColor}
            setNeonColor={setNeonColor}
            chatCount={messages.length}
          />

        </section>

        {/* RIGHT COLUMN (GRID SIZE 5): SMARTPHONE WORKSPACE SIMULATOR */}
        <section id="phone_simulator_section" className="lg:col-span-5 flex flex-col gap-5 h-full">
          
          <div className="rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 md:p-5 shadow-xl backdrop-blur-sm flex-1 flex flex-col justify-between">
            
            {/* Header description */}
            <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3 select-none">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4.5 h-4.5 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold text-zinc-200">PRI-MOBILE OS INTERFACE</h3>
                  <p className="text-[9px] text-zinc-500">Virtual sandboxed phone system controller</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-cyan-700/10 text-cyan-400 text-[8px] font-mono rounded border border-cyan-400/20 uppercase tracking-widest animate-pulse">Online</span>
            </div>

            {/* Quick Demo Voice Triggers Carousel */}
            <div className="py-2.5 select-none">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Try Vocals (Click to Run):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: "YouTube open karo", label: "YouTube open karo" },
                  { text: "Mummy ko call karo", label: "Call Mummy" },
                  { text: "Tum Hindi samajhti ho?", label: "Hindi samajhna" },
                  { text: "Set alarm for 7 AM", label: "Alarm 7 AM" },
                  { text: "Zoya camera kholo", label: "Open camera scanner" }
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDemoCommand(demo.text)}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-850 text-[10px] text-zinc-300 rounded-xl transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3 opacity-60" />
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Combined Phone frame display and app states */}
            <div className="flex-1 flex justify-center items-center py-2 h-0 min-h-[360px]">
              <PhoneSimulator 
                activeApp={activePhoneApp}
                setActiveApp={setActivePhoneApp}
                commandParam={phoneCommandParam}
                onZoyaTrigger={handleSendMessage}
                neonColor={neonColor}
                isBackgroundMode={isBackgroundMode}
                setIsBackgroundMode={setIsBackgroundMode}
              />
            </div>

            {/* TEXT INPUT FIELD (Chamber dialogue prompt) */}
            <div className="flex flex-col gap-2 border-t border-zinc-900/80 pt-4 mt-3">
              
              {/* Chat Message Box logs */}
              <div 
                ref={chatContainerRef}
                className="max-h-[110px] min-h-[75px] overflow-y-auto space-y-2 p-1 border border-zinc-900/60 rounded-xl bg-zinc-950/40"
              >
                {messages.slice(-15).map((m) => (
                  <div 
                    key={m.id}
                    className={`flex items-start gap-1 pb-1.5 text-[10px] border-b border-zinc-950 last:border-b-0`}
                  >
                    <span className={`font-mono text-[9px] font-bold ${m.sender === "zoya" ? "text-cyan-400" : "text-purple-400"}`}>
                      {m.sender === "zoya" ? "ZOYA:" : "BOSS:"}
                    </span>
                    <span className="text-zinc-300 leading-relaxed max-w-[210px]">{m.text}</span>
                  </div>
                ))}
              </div>

              {/* Console Input field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (handleSendMessage(input), setInput(""))}
                  placeholder="Command or chat with Zoya (e.g. YouTube search)"
                  disabled={isAiProcessing}
                  className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 placeholder-zinc-600 disabled:opacity-50 font-sans"
                />
                <button
                  onClick={() => {
                    if (input.trim()) {
                      handleSendMessage(input);
                      setInput("");
                    }
                  }}
                  disabled={isAiProcessing || !input.trim()}
                  className="p-2 px-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-extrabold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  {isAiProcessing ? (
                    <RotateCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Send className="w-4 h-4 text-black font-bold fill-none" />
                  )}
                </button>
              </div>

            </div>

          </div>

        </section>

      </main>

      {/* FOOTER METADATA */}
      <footer className="relative z-30 py-3 border-t border-zinc-950 bg-[#06050b] text-center font-mono text-[8px] text-zinc-600 flex flex-col md:flex-row items-center justify-between px-6 gap-2 select-none">
        <div>HOLOGRAPHIC CLIENT ENVELOPE: v3.80 // BUILT WITH GEMINI 3.5 FLASH</div>
        <div>DESIGNED & DEVELOPED INTERACTIVELY BY PRIYANSHU AI LABS</div>
        <div className="flex items-center gap-1.5 opacity-70">
          <CircleDot className="w-2.5 h-2.5 text-emerald-400" />
          <span>PORT_SYSTEM_ONLINE</span>
        </div>
      </footer>

    </div>
  );
}
