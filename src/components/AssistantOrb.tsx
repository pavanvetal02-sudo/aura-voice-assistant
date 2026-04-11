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
  const gradient = emotionGradients[emotion];
  const animation = stateAnimations[state];

  return (
    <button
      onClick={onTap}
      className="relative group cursor-pointer focus:outline-none"
      aria-label={state === "listening" ? "Stop listening" : "Start listening"}
    >
      {/* Outer ring */}
      <div className={`absolute inset-[-16px] rounded-full border-2 border-neon-purple/30 animate-ring-rotate ${state === "listening" ? "border-neon-cyan/60" : ""}`} />
      <div className={`absolute inset-[-32px] rounded-full border border-neon-blue/15 animate-ring-rotate`} style={{ animationDirection: "reverse", animationDuration: "12s" }} />

      {/* Glow background */}
      <div className={`absolute inset-[-8px] rounded-full bg-gradient-to-r ${gradient} opacity-20 blur-xl transition-opacity duration-500 ${state !== "idle" ? "opacity-40" : ""}`} />

      {/* Main orb */}
      <div
        className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br ${gradient} ${animation} flex items-center justify-center transition-all duration-300`}
      >
        {/* Inner glass effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/20 to-transparent" />

        {/* State indicator */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          {state === "idle" && (
            <svg className="w-10 h-10 text-primary-foreground drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
          {state === "listening" && <WaveAnimation />}
          {state === "processing" && <ProcessingDots />}
          {state === "speaking" && <SpeakingWave />}
        </div>
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
