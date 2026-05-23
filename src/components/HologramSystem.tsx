import { useState, useEffect } from "react";
import { EmotionType } from "../types";
import { 
  Dna, 
  Layers, 
  Activity, 
  Cpu, 
  Palette, 
  Heart, 
  BrainCircuit, 
  Sparkles,
  Command,
  Flame,
  Clock
} from "lucide-react";

interface HologramSystemProps {
  emotion: EmotionType;
  isBackgroundMode: boolean;
  neonColor: string;
  setNeonColor: (color: string) => void;
  chatCount: number;
}

export function HologramSystem({ 
  emotion, 
  isBackgroundMode, 
  neonColor, 
  setNeonColor,
  chatCount
}: HologramSystemProps) {
  const [coreLoad, setCoreLoad] = useState<number>(34);
  const [synapseSync, setSynapseSync] = useState<number>(98.2);
  const [ambientTemp, setAmbientTemp] = useState<number>(31.4);

  // Fluctuating cyber indices for simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCoreLoad(prev => {
        const change = Math.round((Math.random() - 0.5) * 6);
        const next = prev + change;
        return next < 20 ? 20 : next > 55 ? 55 : next;
      });
      setSynapseSync(prev => {
        const next = prev + (Math.random() - 0.5) * 0.4;
        return next < 95 ? 95 : next > 100 ? 100 : Number(next.toFixed(1));
      });
      setAmbientTemp(prev => {
        const next = prev + (Math.random() - 0.5) * 0.2;
        return Number(next.toFixed(1));
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const colorPresets = [
    { name: "Cyan Spark", hex: "#00d2ff" },
    { name: "Neon Violet", hex: "#a855f7" },
    { name: "Green Core", hex: "#22c55e" },
    { name: "Chrono Amber", hex: "#f59e0b" },
    { name: "Cyber Rose", hex: "#f43f5e" }
  ];

  return (
    <div id="hologram_system_panels" className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
      
      {/* PANEL 1: ZOYA COGNITIVE METRICS */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <label className="text-[10px] text-zinc-400 font-mono tracking-wider font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            AI COMPANION BRAIN DIAGNOSTICS
          </label>
          <span className="px-2 py-0.5 text-[8px] rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-400/20">LIVE</span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3">
          
          <div className="space-y-0.5">
            <div className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5" /> EMOTIVE_MATRIX</div>
            <div className="text-sm font-extrabold text-slate-100 uppercase tracking-wide font-sans">{emotion}</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> SYNAPSE_SYNC</div>
            <div className="text-sm font-extrabold text-slate-100 font-mono">{synapseSync}%</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> NEURAL_LOAD</div>
            <div className="text-sm font-extrabold text-slate-100 font-mono">{coreLoad}%</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> TEMP_INTEGRITY</div>
            <div className="text-sm font-extrabold text-slate-100 font-mono">{ambientTemp}°C</div>
          </div>

        </div>

        <div className="bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-xl text-[9px] text-zinc-400 font-mono flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Dialogue Memory Slots:</span>
            <span className="text-cyan-400 font-bold">{chatCount} Chats Saved</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Autonomous Speech Engine:</span>
            <span className="text-emerald-400">Online & Ready</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Low-Power Standby:</span>
            <span className={isBackgroundMode ? "text-cyan-400" : "text-zinc-500"}>{isBackgroundMode ? "BACKGROUND_STANDBY" : "ACTIVE_FOREGROUND"}</span>
          </div>
        </div>
      </div>

      {/* PANEL 2: CYBER HIGHLIGHTS CUSTOMIZER */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <label className="text-[10px] text-zinc-400 font-mono tracking-wider font-bold flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-purple-400" />
            ZOYA CYBER ENHANCER (HIGHLIGHTS)
          </label>
        </div>

        <div className="py-2.5">
          <span className="text-[9px] text-zinc-400 font-mono tracking-wider font-bold block mb-2">NEON HIGHLIGHTS PRESETS:</span>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => setNeonColor(preset.hex)}
                className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-bold flex items-center gap-1.5 transition-all ${neonColor === preset.hex ? "bg-purple-600/10 text-purple-400 border-purple-400 shadow" : "bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:border-zinc-700"}`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-inner" 
                  style={{ backgroundColor: preset.hex, boxShadow: `0 0 6px ${preset.hex}` }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2.5 bg-zinc-950/50 border border-zinc-850 rounded-xl space-y-1.5 select-none">
          <div className="text-[8.5px] font-mono text-zinc-500 flex justify-between">
            <span>ZOYA LED TRIM CORE COLOR</span> 
            <span className="font-bold uppercase tracking-wider" style={{ color: neonColor }}>{neonColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={neonColor}
              onChange={(e) => setNeonColor(e.target.value)}
              className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded-full p-0 flex-shrink-0"
            />
            <p className="text-[8px] text-zinc-500 font-sans leading-relaxed">
              Drag or insert Hex codes above to shift her glowing blue-highlights hair strands and futuristic chest composites instantly!
            </p>
          </div>
        </div>
      </div>

      {/* QUICK COMMANDS HELPER */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md md:col-span-2 flex flex-col justify-between select-none">
        <label className="text-[10px] text-zinc-400 font-mono tracking-wider font-bold block border-b border-zinc-800 pb-2 mb-3">
          💡 DISCOVER SIMULATED DEVICE TRIGGERS (GUIDE)
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px] font-sans">
          <div className="p-2 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-1.5">
            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-lg text-[8px] font-mono mt-0.5 font-bold">YT</span>
            <div>
              <div className="font-bold text-zinc-200">YouTube Launcher</div>
              <p className="text-zinc-500 text-[8.5px] mt-0.5">"Zoya, open YouTube to search Lo-fi hits"</p>
            </div>
          </div>

          <div className="p-2 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-1.5">
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[8px] font-mono mt-0.5 font-bold">WA</span>
            <div>
              <div className="font-bold text-zinc-200">WhatsApp Texting</div>
              <p className="text-zinc-500 text-[8.5px] mt-0.5">"Zoya, Mummy ko WhatsApp message karo"</p>
            </div>
          </div>

          <div className="p-2 bg-zinc-950/40 border border-zinc-850 rounded-xl flex items-start gap-1.5">
            <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-[8px] font-mono mt-0.5 font-bold">TEL</span>
            <div>
              <div className="font-bold text-zinc-200">Phone Calls Dialing</div>
              <p className="text-zinc-500 text-[8.5px] mt-0.5">"Zoya, call Mummy right away"</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
