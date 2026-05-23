import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, HelpCircle } from "lucide-react";

interface VoiceControllerProps {
  onTranscript: (text: string) => void;
  isZoyaSpeaking: boolean;
  setIsZoyaSpeaking: (val: boolean) => void;
  setVoiceActivity: (activity: number) => void;
  lastReplyText: string;
}

export function VoiceController({ 
  onTranscript, 
  isZoyaSpeaking, 
  setIsZoyaSpeaking, 
  setVoiceActivity, 
  lastReplyText 
}: VoiceControllerProps) {
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState<boolean>(true);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<string>("Wake word active! Say 'Hey Zoya' or tap Mic.");
  const [supportedVoices, setSupportedVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const voiceActivityIntervalRef = useRef<number | null>(null);
  const activeUtteranceRef = useRef<any>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Filter for Hindi or English female-like or clear sounding voices
      const filtered = voices.filter(v => 
        v.lang.includes("hi") || 
        v.lang.includes("en")
      );
      setSupportedVoices(filtered);
      
      // Auto-choose a Hindi female voice, or English standard female voice
      const preferred = voices.find(v => v.lang.includes("hi") && v.name.includes("Google")) ||
                        voices.find(v => v.lang.includes("hi")) ||
                        voices.find(v => v.lang.includes("en") && (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Hazel"))) ||
                        voices[0];
      
      if (preferred) {
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setRecognitionError("Speech Recognition is not supported in this browser. Please type commands directly in the conversation box below.");
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-IN"; // English + Hindi (Indian Accent parsing) fallback

    rec.onstart = () => {
      setIsListening(true);
      setSystemInfo("Zoya is listening carefully...");
    };

    rec.onerror = (e: any) => {
      console.warn("Speech Recognition Error:", e.error);
      if (e.error === "not-allowed") {
        setRecognitionError("Microphone permission denied. Click to permit micro-line.");
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      // Automatically restart if wake word is toggled active and we are in background standby
      if (wakeWordEnabled && !isZoyaSpeaking) {
        try {
          rec.start();
        } catch {
          // ignore already started
        }
      } else {
        setSystemInfo("Standby. Mic is off.");
      }
    };

    rec.onresult = (e: any) => {
      const idx = e.resultIndex;
      const transcript = e.results[idx][0].transcript.trim().toLowerCase();
      console.log("Recognized Transcript:", transcript);

      // Check Wake Word Detection
      if (wakeWordEnabled) {
        const isWake = 
          transcript.includes("hey zoya") || 
          transcript.includes("zoya listen") || 
          transcript.includes("hello zoya") ||
          transcript.includes("zoya");

        if (isWake) {
          // Extract remainder of intent or notify user
          const parsedPrompt = transcript
            .replace("hey zoya", "")
            .replace("zoya listen", "")
            .replace("hello zoya", "")
            .replace("zoya", "")
            .trim();

          if (parsedPrompt) {
            onTranscript(parsedPrompt);
          } else {
            speakSpeech("Haan Boss? Main bilkul sun rahi hoon!");
            setSystemInfo("Zoya: Yes, Boss?");
          }
        } else {
          // If already actively speaking/processing or standard listening, forward everything
          onTranscript(transcript);
        }
      } else {
        onTranscript(transcript);
      }
    };

    recognitionRef.current = rec;

    // Start listening on boot for continuous hands-free assistant experience
    if (wakeWordEnabled) {
      try {
        rec.start();
      } catch (err) {
        console.log("Voice auto-init skipped (requires gesture first):", err);
      }
    }

    return () => {
      if (rec) rec.abort();
    };
  }, [wakeWordEnabled, onTranscript, isZoyaSpeaking]);

  // Voice Speaking synthesizer
  const speakSpeech = (text: string) => {
    if (!window.speechSynthesis) return;

    // Stop active speech first
    window.speechSynthesis.cancel();
    if (voiceActivityIntervalRef.current) clearInterval(voiceActivityIntervalRef.current);

    setIsZoyaSpeaking(true);
    
    // Clean string from markdown asterisks, emoticons etc. to prevent stuttering
    const cleanText = text
      .replace(/[*#_~]/g, "")
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice from list
    const foundVoice = supportedVoices.find(v => v.name === selectedVoice);
    if (foundVoice) utterance.voice = foundVoice;

    // Soft realistic girl voice settings
    utterance.pitch = 1.15; // slightly higher pitch for young female
    utterance.rate = 0.96; // slightly slower for natural pauses and emotional expression

    utterance.onstart = () => {
      // Simulate real-time mouth movement frequency peaks
      voiceActivityIntervalRef.current = window.setInterval(() => {
        // Random speech oscillations to represent syllables
        const volumePeak = 0.3 + Math.random() * 0.7;
        setVoiceActivity(volumePeak);
      }, 90);
    };

    utterance.onend = () => {
      setIsZoyaSpeaking(false);
      setVoiceActivity(0);
      if (voiceActivityIntervalRef.current) clearInterval(voiceActivityIntervalRef.current);
      setSystemInfo("Zoya finished speaking.");
    };

    utterance.onerror = () => {
      setIsZoyaSpeaking(false);
      setVoiceActivity(0);
      if (voiceActivityIntervalRef.current) clearInterval(voiceActivityIntervalRef.current);
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Perform speak whenever new response arrives from chatbot
  useEffect(() => {
    if (lastReplyText) {
      speakSpeech(lastReplyText);
    }
  }, [lastReplyText]);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      setRecognitionError(null);
      // Cancel speech to prevent audio loops
      window.speechSynthesis.cancel();
      try {
        rec.start();
      } catch (err) {
        console.warn("SpeechRec start error:", err);
      }
    }
  };

  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2.5 shadow-xl select-none">
      
      {/* Top Controller Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-zinc-400 font-mono tracking-wider font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          VOICE CONTROLLER
        </label>
        
        {/* Switch for wake word */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400">
          <span>Wake Word ("Hey Zoya")</span>
          <button
            onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
            className={`relative w-8 h-4 rounded-full transition-colors ${wakeWordEnabled ? "bg-cyan-500" : "bg-zinc-800"}`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${wakeWordEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Voice controls panel */}
      <div className="flex items-center gap-3">
        
        {/* Main interactive Mic Button */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative ${isListening ? "bg-rose-600 shadow-lg shadow-rose-600/30 text-white animate-pulse" : "bg-cyan-700/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-700/30"}`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-zinc-400" />}
          {isListening && (
            <span className="absolute inset-0 w-full h-full rounded-full border border-rose-500 animate-ping opacity-75" />
          )}
        </button>

        {/* Diagnostic log */}
        <div className="flex-1 flex flex-col font-mono text-[9px] text-zinc-300">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-100">
            {isListening ? "Listening Mode" : "Standby Active"}
            <span className={`w-2 h-2 rounded-full ${isListening ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
          </div>
          <div className="text-zinc-400 truncate max-w-[210px] font-sans mt-0.5">{systemInfo}</div>
        </div>

        {/* Voice Selector Dropdown */}
        {supportedVoices.length > 0 && (
          <div className="flex flex-col text-[8px] font-mono text-zinc-500">
            <span>SYNTH VOICE</span>
            <select
              value={selectedVoice}
              onChange={(e) => {
                setSelectedVoice(e.target.value);
                speakSpeech("Zoya voice profile initialized!");
              }}
              className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 text-[8px] focus:outline-none"
            >
              {supportedVoices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name.replace("Google", "").replace("Microsoft", "").trim()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error notification banner */}
      {recognitionError && (
        <div className="p-1 px-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-500 flex items-center gap-1 font-mono">
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{recognitionError}</span>
        </div>
      )}
    </div>
  );
}
