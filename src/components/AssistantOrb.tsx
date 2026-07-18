import { type AssistantState, type Emotion } from "@/hooks/useVoiceAssistant";

interface AssistantOrbProps {
  state: AssistantState;
  emotion: Emotion;
  onTap: () => void;
}

const emotionGradients: Record<Emotion, string> = {
  neutral: "from-neon-purple via-neon-blue to-neon-purple",
  happy: "from-neon-cyan via-neon-blue to-neon-purple",
  sad: "from-blue-600 via-indigo-700 to-purple-900",
  excited: "from-neon-pink via-neon-purple to-neon-cyan",
  friendly: "from-neon-blue via-neon-cyan to-emerald-400",
  comforting: "from-indigo-400 via-purple-500 to-pink-400",
  funny: "from-yellow-400 via-neon-pink to-neon-purple",
};

const stateAnimations: Record<AssistantState, string> = {
  idle: "animate-orb-idle",
  listening: "animate-orb-listening",
  processing: "animate-orb-idle",
  speaking: "animate-orb-speaking",
};

export function AssistantOrb({ state, emotion, onTap }: AssistantOrbProps) {
  const isSpeaking = state === "speaking";

  return (
    <button
      onClick={onTap}
      className={`relative group cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-105`}
      aria-label={state === "listening" ? "Stop listening" : "Start listening"}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-full bg-neon-purple opacity-20 blur-xl transition-opacity duration-500 ${state !== "idle" ? "opacity-60 bg-neon-cyan" : ""}`} />

      {/* Avatar Image container */}
      <div
        className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 ${isSpeaking ? 'border-neon-cyan' : 'border-border/50'} shadow-xl ${isSpeaking ? 'animate-talking' : ''} transition-all duration-300 flex items-center justify-center bg-background`}
      >
        <img 
          src="/sara.png" 
          alt="Aura Avatar" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay state indicator for non-idle states */}
        {state !== "idle" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {state === "listening" && <WaveAnimation />}
            {state === "processing" && <ProcessingDots />}
            {state === "speaking" && <SpeakingWave />}
          </div>
        )}
      </div>

      {/* Label */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs font-heading uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {state === "idle" && "Tap to speak"}
        {state === "listening" && "Listening..."}
        {state === "processing" && "Thinking..."}
        {state === "speaking" && "Speaking..."}
      </span>
    </button>
  );
}

function WaveAnimation() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1.5 bg-primary-foreground rounded-full"
          style={{
            animation: `wave-bar 0.6s ease-in-out ${i * 0.1}s infinite`,
            height: "8px",
          }}
        />
      ))}
    </div>
  );
}

function ProcessingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-primary-foreground"
          style={{
            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SpeakingWave() {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary-foreground rounded-full"
          style={{
            animation: `wave-bar 0.5s ease-in-out ${i * 0.07}s infinite`,
            height: "6px",
          }}
        />
      ))}
    </div>
  );
}
