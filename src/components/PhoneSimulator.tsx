import { useState, useEffect, useRef } from "react";
import { 
  SimulatedAppType, 
  Contact, 
  AlarmItem, 
  WhatsAppChat 
} from "../types";
import { 
  Youtube, 
  Music, 
  Instagram, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  Clock, 
  Camera, 
  Search, 
  Settings, 
  Home, 
  Maximize2, 
  Volume2, 
  ShieldCheck, 
  Battery, 
  Wifi, 
  BellRing, 
  SearchCode,
  UserCheck
} from "lucide-react";

interface PhoneSimulatorProps {
  activeApp: SimulatedAppType;
  setActiveApp: (app: SimulatedAppType) => void;
  commandParam: string;
  onZoyaTrigger: (text: string) => void;
  neonColor: string;
  isBackgroundMode: boolean;
  setIsBackgroundMode: (val: boolean) => void;
}

export function PhoneSimulator({ 
  activeApp, 
  setActiveApp, 
  commandParam, 
  onZoyaTrigger, 
  neonColor,
  isBackgroundMode,
  setIsBackgroundMode
}: PhoneSimulatorProps) {
  
  // Simulated State for Dialer
  const [callContact, setCallContact] = useState<string>("Mummy");
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const callIntervalRef = useRef<number | null>(null);

  // Simulated Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: "1", time: "07:00 AM", label: "Wake Up (Boss Duty)", enabled: true },
    { id: "2", time: "10:30 PM", label: "Check System Core", enabled: false },
    { id: "3", time: "12:00 PM", label: "Priyanshu Portfolio Review", enabled: true }
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>("08:00 AM");
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>("New Task");

  // Simulated WhatsApp
  const [whatsappChats, setWhatsappChats] = useState<WhatsAppChat[]>([
    {
      contactName: "Mummy",
      messages: [
        { id: "w1", sender: "contact", text: "Beta, khana khaya tumne?", time: "2:14 PM" },
        { id: "w2", sender: "me", text: "Haan Mummy, just khaya. Aap kaise hain?", time: "2:15 PM" },
        { id: "w3", sender: "contact", text: "Hum sab theek hain. Zoya se baat karayi kya?", time: "2:16 PM" }
      ]
    },
    {
      contactName: "Priyanshu (Creator)",
      messages: [
        { id: "pc1", sender: "contact", text: "Zoya, are you working correctly?", time: "11:00 AM" },
        { id: "pc2", sender: "me", text: "Absolutely, Priyanshu! Boss is very happy.", time: "11:02 AM" }
      ]
    }
  ]);
  const [whatsappInput, setWhatsappInput] = useState<string>("");
  const [whatsChatIndex, setWhatsChatIndex] = useState<number>(0);

  // Camera feed simulator
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraFilter, setCameraFilter] = useState<string>("cyber"); // normal, cyber, thermal, holographic

  // Google Search query and simulated results
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{title: string, desc: string, url: string}[]>([]);

  // System notifications
  const [notifications, setNotifications] = useState<{id: string, app: string, text: string, time: string}[]>([
    { id: "n1", app: "System Core", text: "Zoya background listener optimized for high performance.", time: "Just now" },
    { id: "n2", app: "Instagram", text: "Priyanshu shared a new post on virtual humans.", time: "28m ago" },
    { id: "n3", app: "WhatsApp", text: "Mummy: Message delivered.", time: "1h ago" }
  ]);

  // Playlist track list
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const tracks = [
    { title: "Zoya Cosmic Theme (Lofi)", artist: "Cyber Dreamer", duration: "3:45" },
    { title: "Chaleya (Dynamic Synthesizer Remix)", artist: "Anirudh Ravichander", duration: "4:02" },
    { title: "Priyanshu Neon Beats v2", artist: "Developer Beats", duration: "2:30" },
    { title: "Holographic Rainfall", artist: "Hale-Bopp Core", duration: "5:12" }
  ];

  // Sync parameters passed from Zoya Voice Command
  useEffect(() => {
    if (activeApp === "call") {
      setCallContact(commandParam || "Mummy");
      startCallAction(commandParam || "Mummy");
    } else if (activeApp === "play_song") {
      setIsPlayingSong(true);
      if (commandParam) {
        // search tracks
        const foundIndex = tracks.findIndex(t => t.title.toLowerCase().includes(commandParam.toLowerCase()) || mSearch(t.artist, commandParam));
        if (foundIndex !== -1) setCurrentTrackIndex(foundIndex);
      }
    } else if (activeApp === "google_search") {
      setSearchQuery(commandParam || "Priyanshu AI creator of Zoya");
      triggerSearch(commandParam || "Priyanshu AI creator of Zoya");
    } else if (activeApp === "alarm" && commandParam) {
      // Create parsed alarm
      const match = commandParam.match(/(\d+):?(\d*)?\s*(AM|PM)?/i);
      if (match) {
        const timeStr = `${match[1]?.padStart(2, '0')}:${match[2] || "00"} ${match[3]?.toUpperCase() || "AM"}`;
        const newAlarm = { id: Date.now().toString(), time: timeStr, label: "Voiced Alarm", enabled: true };
        setAlarms(prev => [newAlarm, ...prev]);
      }
    } else if (activeApp === "camera") {
      activateWebcam();
    } else if (activeApp === "whatsapp" && commandParam) {
      if (commandParam.includes(":")) {
        const [contact, txt] = commandParam.split(":");
        sendWhatsAppText(contact.trim(), txt.trim());
      }
    }
  }, [activeApp, commandParam]);

  const mSearch = (target: string, query: string) => target.toLowerCase().includes(query.toLowerCase());

  // Call duration counter
  const startCallAction = (name: string) => {
    setIsCalling(true);
    setCallDuration(0);
    if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    callIntervalRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCallAction = () => {
    setIsCalling(false);
    if (callIntervalRef.current) clearInterval(callIntervalRef.current);
  };

  // WhatsApp simulate trigger
  const sendWhatsAppText = (contact: string, text: string) => {
    // Find chat
    const chatIdx = whatsappChats.findIndex(c => c.contactName.toLowerCase() === contact.toLowerCase());
    const validIdx = chatIdx === -1 ? 0 : chatIdx;
    
    // Add User message
    const newMsg = { id: `m-${Date.now()}`, sender: "me" as const, text, time: "Just now" };
    const updated = [...whatsappChats];
    updated[validIdx].messages.push(newMsg);
    setWhatsappChats(updated);

    // Simulate Reply
    setTimeout(() => {
      const replyMsg = { id: `m2-${Date.now()}`, sender: "contact" as const, text: `Boss! Zoya is relaying your message securely. I got it: "${text}"`, time: "Just now" };
      const updatedReply = [...updated];
      updatedReply[validIdx].messages.push(replyMsg);
      setWhatsappChats(updatedReply);
    }, 1500);
  };

  // Google Search Results
  const triggerSearch = (query: string) => {
    setSearchResults([
      { 
        title: `Priyanshu - Creative Developer & Designer of Zoya AI`, 
        desc: `Learn more about Priyanshu, the programmer specializing in Unreal Engine visual rigs, premium full-stack AI, and immersive cybernetic virtual human systems.`,
        url: "https://github.com/priyanshu" 
      },
      { 
        title: `Zoya Virtual Human Assistant - Documentation`, 
        desc: `Download Zoya, the hyper-realistic assistant that works background tasks, controls device parameters, and features 60FPS hair/eyelid shaders.`, 
        url: "https://zoya-hologram.dev" 
      },
      { 
        title: `How to build hyper-realistic 3D Canvas avatars in React`, 
        desc: `A guide by Priyanshu on designing breathing, blinking, and speaking companion systems utilizing low-latency server-side Gemini 3.5 models.`, 
        url: "https://priyanshu-labs.net/zoya-guide" 
      }
    ]);
  };

  // Camera Webcam implementation
  const activateWebcam = async () => {
    setHasCameraPermission(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn("Camera hardware access denied or not available. Displaying diagnostic simulator mesh.", err);
    }
  };

  const deactivateWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setHasCameraPermission(false);
  };

  useEffect(() => {
    if (activeApp !== "camera") {
      deactivateWebcam();
    }
  }, [activeApp]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, []);

  return (
    <div id="phone_wrapper_housing" className="relative w-full max-w-[340px] aspect-[9/19] rounded-[48px] border-8 border-slate-700 bg-slate-950 p-[10px] shadow-2xl flex flex-col overflow-hidden">
      
      {/* Top notch detail */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-700 rounded-b-2xl z-40 flex items-center justify-center">
        <div className="w-16 h-1 bg-slate-900 rounded-full mb-1" />
        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute right-6 bottom-1 border border-slate-800" />
      </div>

      {/* Dynamic Status Bar */}
      <div className="h-6 px-4 pt-1 flex items-center justify-between z-30 font-mono text-[10px] text-zinc-400 select-none">
        <div className="flex items-center gap-1.5">
          <span>PRI-OS v7</span>
          <Wifi className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="flex items-center gap-1.5">
          <Battery className="w-3.5 h-3.5 text-cyan-400" />
          <span>98%</span>
        </div>
      </div>

      {/* Screen Body View - Scroll-prevented */}
      <div className="flex-1 rounded-[32px] bg-zinc-950 overflow-hidden relative flex flex-col p-3 border border-zinc-900">
        
        {/* APP: HOME / SHELL */}
        {activeApp === "home" && (
          <div className="flex-1 flex flex-col justify-between py-2">
            
            {/* Widget Area */}
            <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Companion Overlay</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-slate-100">Zoya Status</span>
                <span className="px-2 py-0.5 text-[8px] bg-cyan-500/20 text-cyan-400 rounded-full animate-pulse font-mono">STANDBY_LISTENING</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">
                "Hi Boss! Main background me active hoon. Just speak or type anytime!"
              </p>
            </div>

            {/* Simulated Desktop App Grid */}
            <div className="grid grid-cols-4 gap-4 px-2 my-auto">
              {[
                { id: "youtube" as const, name: "YouTube", icon: Youtube, color: "text-red-500" },
                { id: "play_song" as const, name: "Music", icon: Music, color: "text-pink-500" },
                { id: "instagram" as const, name: "Instagram", icon: Instagram, color: "text-orange-400" },
                { id: "whatsapp" as const, name: "WhatsApp", icon: MessageSquare, color: "text-emerald-500" },
                { id: "call" as const, name: "Dialer", icon: PhoneCall, color: "text-cyan-400" },
                { id: "alarm" as const, name: "Alarms", icon: Clock, color: "text-purple-400" },
                { id: "camera" as const, name: "Scanner", icon: Camera, color: "text-rose-400" },
                { id: "google_search" as const, name: "Google", icon: Search, color: "text-blue-400" },
              ].map(app => (
                <button
                  key={app.id}
                  id={`phone_btn_${app.id}`}
                  onClick={() => setActiveApp(app.id)}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                >
                  <div className="w-11 h-11 rounded-1.5xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700">
                    <app.icon className={`w-5 fill-none h-5 ${app.color}`} />
                  </div>
                  <span className="text-[9px] text-zinc-300 font-medium truncate w-full text-center">{app.name}</span>
                </button>
              ))}
            </div>

            {/* Bottom launcher dock */}
            <div className="p-1 px-3 bg-zinc-900/50 rounded-2.5xl border border-zinc-800/60 backdrop-blur-lg flex items-center justify-around">
              <button onClick={() => setActiveApp("settings")} className="p-2 text-zinc-400 hover:text-slate-100"><Settings className="w-4.5 h-4.5" /></button>
              <button onClick={() => setActiveApp("notifications")} className="p-2 text-zinc-400 hover:text-slate-100 relative">
                <BellRing className="w-4.5 h-4.5" />
                {notifications.length > 0 && <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
              </button>
              <button onClick={() => setActiveApp("home")} className="p-2 text-cyan-400 scale-110"><Home className="w-4.5 h-4.5" /></button>
            </div>
          </div>
        )}

        {/* APP: YOUTUBE */}
        {activeApp === "youtube" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1 select-none">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-[12px] font-bold font-sans tracking-tight">YouTube Simulator</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center gap-3 p-4 text-center">
              <div className="w-full aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-zinc-900/40 to-purple-950/20" />
                <Youtube className="w-10 h-10 text-red-500 fill-none animate-bounce mb-1 z-10" />
                <div className="text-[11px] font-mono text-cyan-400 z-10">LIVESTREAMING_ZOYA</div>
                <div className="text-[9px] text-zinc-500 z-10">Creator: Priyanshu AI Labs</div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-zinc-200">
                  {commandParam ? `Playing "${commandParam}"` : "Zoya Voice Search Video Panel"}
                </h4>
                <p className="text-[9px] text-zinc-500">
                  Voice triggers can launch and query any YouTube subject right inside this terminal slot.
                </p>
              </div>

              <div className="w-full flex flex-col gap-1 text-left bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60 font-mono text-[9px] text-zinc-400">
                <div className="flex justify-between"><span className="text-zinc-500">Video Quality:</span> <span className="text-emerald-400">1080p60 (Auto)</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Status:</span> <span className="text-cyan-400">RENDER_IN_IFRAME</span></div>
              </div>
            </div>
          </div>
        )}

        {/* APP: MUSIC */}
        {activeApp === "play_song" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Music className="w-5 h-5 text-pink-500" />
              <span className="text-[12px] font-bold">Cyber Music Player</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-4 select-none">
              <div className="flex flex-col items-center text-center">
                
                {/* Spinning vinyl look */}
                <div className={`relative w-28 h-28 rounded-full border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-lg my-3 ${isPlayingSong ? 'animate-spin' : ''}`} style={{ animationDuration: "6s" }}>
                  <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-zinc-700 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-zinc-200 truncate w-full px-2">
                  {tracks[currentTrackIndex].title}
                </h4>
                <p className="text-[9px] text-zinc-500 mt-0.5">{tracks[currentTrackIndex].artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="px-3 space-y-1">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-1000" 
                    style={{ width: isPlayingSong ? "45%" : "5%" }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                  <span>{isPlayingSong ? "1:22" : "0:00"}</span>
                  <span>{tracks[currentTrackIndex].duration}</span>
                </div>
              </div>

              {/* Track list select */}
              <div className="space-y-1">
                <div className="text-[8px] text-zinc-500 font-semibold px-1 uppercase tracking-wider">Tracks (Pri-Music System)</div>
                <div className="max-h-20 overflow-y-auto space-y-1 font-sans">
                  {tracks.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentTrackIndex(i);
                        setIsPlayingSong(true);
                      }}
                      className={`w-full p-1.5 rounded text-left text-[9px] flex justify-between ${currentTrackIndex === i ? 'bg-pink-500/20 text-pink-400 font-medium' : 'hover:bg-zinc-900 text-zinc-400'}`}
                    >
                      <span className="truncate max-w-[170px]">{t.title}</span>
                      <span className="opacity-60">{t.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APP: WHATSAPP */}
        {activeApp === "whatsapp" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1 h-full">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span className="text-[12px] font-bold">Secure WhatsApp Simulator</span>
            </div>

            {/* Chat List Selection */}
            <div className="flex gap-2 py-2 border-b border-zinc-900 overflow-x-auto select-none">
              {whatsappChats.map((chat, idx) => (
                <button
                  key={idx}
                  onClick={() => setWhatsChatIndex(idx)}
                  className={`px-3 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors ${whatsChatIndex === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
                >
                  {chat.contactName}
                </button>
              ))}
            </div>

            {/* Dialogue list view */}
            <div className="flex-1 flex flex-col justify-end py-2 h-0">
              <div className="flex-1 overflow-y-auto space-y-2 p-1">
                {whatsappChats[whatsChatIndex]?.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[80%] rounded-xl p-2 text-[10px] ${m.sender === "me" ? 'bg-emerald-600 text-white ml-auto rounded-tr-none' : 'bg-zinc-805 bg-zinc-900 text-zinc-200 mr-auto rounded-tl-none'}`}
                  >
                    <span>{m.text}</span>
                    <span className="text-[7px] text-zinc-300 ml-auto mt-1 opacity-70">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-1.5 mt-2 border-t border-zinc-900 pt-2">
                <input
                  type="text"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && whatsappInput.trim() && (sendWhatsAppText(whatsappChats[whatsChatIndex].contactName, whatsappInput), setWhatsappInput(""))}
                  placeholder="Type message..."
                  className="flex-1 bg-zinc-900 border border-zinc-800/80 rounded-xl px-2.5 py-1 text-[10px] text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    if (whatsappInput.trim()) {
                      sendWhatsAppText(whatsappChats[whatsChatIndex].contactName, whatsappInput);
                      setWhatsappInput("");
                    }
                  }}
                  className="p-1 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APP: CALL DIALER */}
        {activeApp === "call" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 select-none">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
              <span className="text-[12px] font-bold">Zoya Call Dialer</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-6">
              
              {/* Contact display */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center mx-auto text-cyan-400 font-bold text-xl uppercase shadow p-1">
                  {callContact.charAt(0)}
                </div>
                <div className="space-y-0.5 select-none">
                  <h4 className="text-sm font-bold text-zinc-100">{callContact}</h4>
                  <p className="text-[10px] text-zinc-400">Cyber Cellular Integration</p>
                </div>
                {isCalling && (
                  <div className="font-mono text-cyan-400 text-xs animate-pulse">
                    Calling ({Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')})
                  </div>
                )}
              </div>

              {/* Dial Panel simulator keys when idle */}
              {!isCalling ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={callContact}
                      onChange={(e) => setCallContact(e.target.value)}
                      placeholder="Enter contact name..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-[10px] text-slate-100 text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 select-none">
                    <button
                      onClick={() => {
                        setCallContact("Mummy");
                        startCallAction("Mummy");
                      }}
                      className="p-2 rounded bg-cyan-700/10 text-cyan-400 hover:bg-cyan-700/20 text-[10px] border border-cyan-400/20 font-medium"
                    >
                      Call Mummy
                    </button>
                    <button
                      onClick={() => {
                        setCallContact("Priyanshu");
                        startCallAction("Priyanshu");
                      }}
                      className="p-2 rounded bg-cyan-700/10 text-cyan-400 hover:bg-cyan-700/20 text-[10px] border border-cyan-400/20 font-medium"
                    >
                      Call Priyanshu
                    </button>
                  </div>
                  
                  <button
                    onClick={() => startCallAction(callContact)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow active:scale-95 transition-transform select-none"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-none" /> Dial Number
                  </button>
                </div>
              ) : (
                <button
                  onClick={endCallAction}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow animate-pulse hover:animate-none active:scale-95 transition-transform select-none"
                >
                  Disconnect Line
                </button>
              )}
            </div>
          </div>
        )}

        {/* APP: ALARMS */}
        {activeApp === "alarm" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 select-none">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-[12px] font-bold">Cyber Alarm Center</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2 overflow-hidden h-full">
              
              {/* Add form */}
              <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850 flex flex-col gap-1.5 select-none text-[9px]">
                <div className="font-bold text-zinc-400">CREATE ALARM</div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    placeholder="e.g. 07:00 AM"
                    className="w-[80px] bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-200"
                  />
                  <input
                    type="text"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    placeholder="Alarm label..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-200"
                  />
                  <button 
                    onClick={() => {
                      if (newAlarmTime.trim()) {
                        setAlarms(prev => [{ id: Date.now().toString(), time: newAlarmTime, label: newAlarmLabel || "Active Task", enabled: true }, ...prev]);
                        setNewAlarmLabel("Alarm");
                      }
                    }}
                    className="px-2 bg-purple-600 rounded text-white font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Alarm List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2 mb-1">
                {alarms.map(alarm => (
                  <div
                    key={alarm.id}
                    className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between"
                  >
                    <div className="select-none">
                      <div className="text-sm font-extrabold font-mono text-purple-400">{alarm.time}</div>
                      <div className="text-[8px] text-zinc-500 truncate max-w-[150px]">{alarm.label}</div>
                    </div>
                    <button
                      onClick={() => {
                        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled: !a.enabled } : a));
                      }}
                      className={`relative w-8 h-4 rounded-full transition-colors ${alarm.enabled ? 'bg-purple-600' : 'bg-zinc-800'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${alarm.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APP: CAMERA SCANNER */}
        {activeApp === "camera" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 select-none">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-400" />
                <span className="text-[12px] font-bold">Cyber Scanner Feed</span>
              </div>
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] rounded font-mono uppercase tracking-widest animate-pulse">Scanning</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
              
              {/* Media viewer */}
              <div className="flex-1 w-full rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
                
                {hasCameraPermission ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover transition-all ${cameraFilter === "thermal" ? "hue-rotate-180 invert brightness-125" : cameraFilter === "cyber" ? "contrast-125 saturate-150 brightness-110" : ""}`}
                  />
                ) : (
                  <div className="text-center p-3 text-zinc-500 select-none space-y-1.5">
                    <Camera className="w-8 h-8 text-rose-400/60 mx-auto fill-none animate-pulse" />
                    <div className="text-[10px] font-semibold text-zinc-300">Grant Permission</div>
                    <p className="text-[8px] leading-relaxed">
                      Zoya can capture high-contrast thermal scans using your camera line. Permit webcam to launch.
                    </p>
                    <button
                      onClick={activateWebcam}
                      className="mt-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-white text-[8px] font-bold"
                    >
                      Initialize Web Camera
                    </button>
                  </div>
                )}

                {/* Hologram Scanner Reticle Grid Overlay */}
                <div className="absolute inset-0 border border-lg border-cyan-400/25 pointer-events-none flex items-center justify-center m-4">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-rose-400 absolute top-0 left-0" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-rose-400 absolute top-0 right-0" />
                  <div className="w-5 h-5 border-b-2 border-l-2 border-rose-400 absolute bottom-0 left-0" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-rose-400 absolute bottom-0 right-0" />
                  
                  {/* Digital crosshair */}
                  <div className="w-3 h-0.5 bg-rose-400/40" />
                  <div className="w-0.5 h-3 bg-rose-400/40" />
                </div>
              </div>

              {/* Filters selector */}
              <div className="flex items-center justify-around py-1 bg-zinc-900/60 rounded-lg border border-zinc-850 mt-1.5 select-none text-[8px] font-mono">
                <button 
                  onClick={() => setCameraFilter("normal")} 
                  className={`px-2 py-0.5 rounded ${cameraFilter === "normal" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500"}`}
                >
                  NORMAL
                </button>
                <button 
                  onClick={() => setCameraFilter("cyber")} 
                  className={`px-2 py-0.5 rounded ${cameraFilter === "cyber" ? "bg-zinc-800 text-rose-400 font-bold" : "text-zinc-500"}`}
                >
                  CYBER
                </button>
                <button 
                  onClick={() => setCameraFilter("thermal")} 
                  className={`px-2 py-0.5 rounded ${cameraFilter === "thermal" ? "bg-zinc-800 text-amber-400 font-bold" : "text-zinc-500"}`}
                >
                  THERMAL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APP: GOOGLE SEARCH */}
        {activeApp === "google_search" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Search className="w-5 h-5 text-blue-400" />
              <span className="text-[12px] font-bold">Smart Cyber Search</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2 text-zinc-100 overflow-hidden h-full">
              
              {/* Search line input */}
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() && triggerSearch(searchQuery)}
                  placeholder="Ask google anything..."
                  className="flex-1 bg-zinc-900 border border-zinc-805 rounded-xl px-2.5 py-1 text-[10px] text-slate-100"
                />
                <button
                  onClick={() => searchQuery.trim() && triggerSearch(searchQuery)}
                  className="p-1 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search Results Display */}
              <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
                {searchResults.length > 0 ? (
                  searchResults.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800 transition-colors select-none"
                    >
                      <a href={res.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1">
                        {res.title}
                        <Maximize2 className="w-2.5 h-2.5 opacity-65" />
                      </a>
                      <p className="text-[8.5px] text-zinc-400 leading-relaxed mt-0.5">{res.desc}</p>
                      <div className="text-[7.5px] text-zinc-600 font-mono mt-1 break-all truncate">{res.url}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 text-zinc-600 select-none">
                    <SearchCode className="w-8 h-8 text-zinc-700 mx-auto mb-1.5 fill-none" />
                    <p className="text-[9px]">Google indexes are synced. Ready for Zoya query triggers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* APP: NOTIFICATIONS */}
        {activeApp === "notifications" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 select-none">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-yellow-400" />
                <span className="text-[12px] font-bold">Unread Notifications</span>
              </div>
              <button 
                onClick={() => setNotifications([])}
                className="text-[8px] text-red-400 font-medium hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 select-none">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-zinc-900/85 border border-zinc-850 rounded-xl relative hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-sky-400 uppercase font-mono">{n.app}</span>
                      <span className="text-[7px] text-zinc-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-300 mt-1 leading-relaxed">{n.text}</p>
                    <button
                      onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                      className="absolute top-1 right-2 text-zinc-500 hover:text-red-400 font-bold text-[9px]"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-zinc-600 select-none">
                  <ShieldCheck className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-[9.5px]">Your notifications feed is completely clear, Boss!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APP: SETTINGS */}
        {activeApp === "settings" && (
          <div className="flex-1 flex flex-col bg-zinc-950 text-slate-100 py-1 text-xs select-none">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Settings className="w-5 h-5 text-cyan-400" />
              <span className="text-[12px] font-bold">Zoya OS Controller</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              
              {/* Creator details */}
              <div className="p-2.5 bg-gradient-to-r from-cyan-900/10 to-indigo-900/10 rounded-xl border border-cyan-500/20 text-[9px]">
                <div className="font-bold text-cyan-400 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> SYSTEM CREATOR</div>
                <div className="mt-1 font-mono text-zinc-300">
                  Zoya companion model designed with precision and dedication by <span className="text-slate-100 font-bold">Priyanshu</span>.
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 text-[10px]">
                <span className="text-[8px] text-zinc-500 font-bold tracking-wider uppercase">Background Execution</span>
                
                <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold">Background Listening</div>
                    <div className="text-[8px] text-zinc-400 mt-0.5">Works in background continuous toggle</div>
                  </div>
                  <button
                    onClick={() => setIsBackgroundMode(!isBackgroundMode)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${isBackgroundMode ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${isBackgroundMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold">Battery Saver</div>
                    <div className="text-[8px] text-zinc-400 mt-0.5">Optimize virtual animations rendering</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded font-mono">ACTIVE</span>
                </div>

                <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold">Secure App Access</div>
                    <div className="text-[8px] text-zinc-400 mt-0.5">Automated permission checks for dialing</div>
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[8px] rounded font-mono">GRANTED</span>
                </div>
              </div>

              {/* App status */}
              <div className="p-2 bg-zinc-900/30 border border-zinc-900 rounded-lg text-[8px] text-zinc-500 font-mono flex flex-col gap-0.5">
                <div>SW_ENGINE: UNREAL_VIRTUAL_2D</div>
                <div>AUDIO_DRV: WEB_SPEECH_API</div>
                <div>LOC_SYNC: MUMBAI_CORE_NODE</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Futuristic Navigation Bar Mock */}
      <div className="h-10 px-6 flex items-center justify-around z-30 select-none">
        <button 
          onClick={() => setActiveApp("home")}
          className="p-1 rounded-full text-zinc-400 hover:text-slate-100 flex items-center justify-center transition-transform hover:scale-110"
        >
          <Home className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveApp("settings")}
          className="p-1 rounded-full text-zinc-400 hover:text-slate-100 flex items-center justify-center transition-transform hover:scale-110"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
