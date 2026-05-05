import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertCircle, 
  Search, 
  Mic, 
  Volume2, 
  VolumeX, 
  Flame, 
  Zap, 
  Car, 
  Droplets,
  Stethoscope,
  Info,
  ShieldAlert,
  ArrowRight,
  Phone,
  Crosshair,
  Wind
} from "lucide-react";
import { cn } from "./lib/utils";
import { EmergencyResponse, EmergencyState } from "./types";
import { getEmergencyHelp } from "./services/geminiService";

const QUICK_ACTIONS = [
  { id: "snake bite", label: "Snake Bite", icon: Droplets, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "fire", label: "Fire", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "road accident", label: "Accident", icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "electric shock", label: "Electric Shock", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "burns", label: "Burns", icon: Flame, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "choking", label: "Choking", icon: Wind, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export default function App() {
  const [situation, setSituation] = useState("");
  const [state, setState] = useState<EmergencyState>({
    loading: false,
    error: null,
    result: null,
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSituation(transcript);
        handleRequest(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleRequest = async (query: string = situation) => {
    if (!query.trim()) return;
    stopSpeaking();
    setState({ loading: true, error: null, result: null });
    
    try {
      const response = await fetch("/api/emergency-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: query }),
      });
      const data = await response.json();
      
      if (!data.needsAI) {
        setState({ loading: false, error: null, result: data });
        return;
      }

      const aiResult = await getEmergencyHelp(query);
      setState({ loading: false, error: null, result: aiResult });
    } catch (err: any) {
      setState({ 
        loading: false, 
        error: "Failed to get instructions. Call emergency services immediately.", 
        result: null 
      });
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakInstructions = () => {
    if (!state.result) return;
    const text = `Immediate Actions: ${state.result.actions.join(". ")}. Warning: ${state.result.donts.join(". ")}. Note: ${state.result.note}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/5 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center rounded-xl shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight tracking-tight">EMERGENCY AI</span>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Situational Guide</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Resources</a>
            <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Safety Tips</a>
            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-semibold transition-all">
              About AI Guide
            </button>
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 pt-12 pb-24">
        {/* Editorial Hero */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Active Safety Mesh</span>
              </div>
              <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-bold leading-[0.85] tracking-tighter mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                STAY CALM.<br/>ACT FAST.
              </h1>
              <p className="text-white/50 text-xl max-w-md leading-relaxed border-l-2 border-red-600 pl-6">
                Precision guidance for critical moments. Input your situation below for verified immediate actions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pl-12"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-red-600/20 blur-[60px] group-focus-within:bg-red-600/30 transition-all" />
                <div className="relative bg-white/5 border border-white/10 p-2 rounded-[2rem] backdrop-blur-md shadow-2xl">
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 w-6 h-6 text-white/40 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRequest()}
                      placeholder="Identify the situation..."
                      className="w-full h-16 bg-transparent pl-16 pr-40 text-xl outline-none placeholder:text-white/20 font-medium"
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                       <button
                         onClick={startListening}
                         className={cn(
                           "p-3 rounded-2xl transition-all",
                           isListening ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-white/40 hover:text-white"
                         )}
                       >
                         <Mic className="w-5 h-5" />
                       </button>
                       <button
                         onClick={() => handleRequest()}
                         className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2 group/btn"
                       >
                         Guide <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSituation(action.label);
                      handleRequest(action.id);
                    }}
                    className={cn(
                      "flex flex-col items-start gap-4 p-5 rounded-3xl border transition-all hover:scale-[1.02] active:scale-95 group",
                      "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl transition-colors", action.bg)}>
                      <action.icon className={cn("w-5 h-5", action.color)} />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-white/80 group-hover:text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Content Area */}
        <section className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {state.loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-red-600/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin" />
                  <div className="absolute inset-4 bg-red-600/10 rounded-full animate-pulse" />
                </div>
                <h3 className="mt-8 font-display font-bold text-sm uppercase tracking-[0.3em] text-white/40">Synthesizing Protocol</h3>
              </motion.div>
            )}

            {state.error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-red-600 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-600/40">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Immediate Action Required</h3>
                <p className="text-white/60 mb-8 leading-relaxed italic">{state.error}</p>
                <a
                  href="tel:911"
                  className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-xl hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
                >
                  CALL 911 NOW
                </a>
              </motion.div>
            )}

            {state.result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Result Control Bar */}
                <div className="xl:col-span-12 flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md mb-4">
                  <div className="flex items-center gap-4 px-4">
                    <Crosshair className="w-5 h-5 text-red-500" />
                    <span className="font-mono text-xs uppercase tracking-widest text-white/40">Reference Node: {state.result.source === "cache" ? "LOCAL_REGISTRY" : "AI_ENGINE_OMNI"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isSpeaking ? stopSpeaking : speakInstructions}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        isSpeaking ? "bg-red-600 text-white" : "bg-white/5 hover:bg-white/10 text-white"
                      )}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {isSpeaking ? "Stop Voice" : "Listen Assistant"}
                    </button>
                  </div>
                </div>

                {/* Main Action Card */}
                <div className="xl:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-2xl text-black relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Stethoscope className="w-40 h-40" />
                  </div>
                  
                  <div className="relative">
                    <h3 className="font-display text-4xl font-black tracking-tighter mb-10 flex items-center gap-4">
                      <span className="w-2 h-10 bg-green-500 rounded-full" />
                      IMMEDIATE STEPS
                    </h3>
                    
                    <div className="space-y-6">
                      {state.result.actions.map((action, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-6 items-start group/item"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center font-display font-black text-sm group-hover/item:bg-black group-hover/item:text-white transition-all">
                            {i + 1}
                          </div>
                          <p className="text-xl font-medium leading-tight text-neutral-800 pt-1">
                            {action}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warnings & Notes Panel */}
                <div className="xl:col-span-5 space-y-8">
                  {/* Warning Box */}
                  <div className="bg-[#111111] border-2 border-red-900/30 rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 p-6 opacity-10">
                      <AlertCircle className="w-24 h-24 text-red-600" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-red-500 mb-8 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      CRITICAL WARNINGS
                    </h3>
                    <ul className="space-y-6">
                      {state.result.donts.map((dont, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="scale-x-[-1] text-red-500/50 pt-1 shrink-0">
                            <Info className="w-5 h-5" />
                          </div>
                          <p className="text-white/80 font-medium leading-relaxed italic">{dont}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Context Note */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4 opacity-40">
                      <Info className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Procedural Context</span>
                    </div>
                    <p className="text-white/60 leading-relaxed font-medium">
                      "{state.result.note}"
                    </p>
                  </div>
                </div>

                {/* Global Footer Warning */}
                <div className="xl:col-span-12 mt-12 py-12 border-t border-white/5 text-center">
                  <div className="inline-block px-12 py-8 bg-red-600/5 border border-red-600/10 rounded-[3rem]">
                    <h4 className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs mb-4">Universal Disclaimer</h4>
                    <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
                      AI systems can fail. This information is a temporary measure.
                      <span className="block mt-4 text-white font-black text-xl tracking-tight">CONTACT EMERGENCY SERVICES NOW.</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State Illustration */}
            {!state.result && !state.loading && !state.error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="relative w-48 h-48 mb-12">
                   <div className="absolute inset-0 border border-white/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                   <div className="absolute inset-4 border border-white/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <ShieldAlert className="w-20 h-20 text-white/20" />
                   </div>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/40 text-center">Awaiting Input Signal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Persistent Global Emergency CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]"
      >
        <button
          onClick={() => window.location.href = "tel:911"}
          className="group relative px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-2xl shadow-red-600/40 transition-all active:scale-95 flex items-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Phone className="w-5 h-5 relative z-10" />
          <span className="relative z-10 text-lg tracking-tight">EMERGENCY LINE: 911</span>
        </button>
      </motion.div>
    </div>
  );
}
