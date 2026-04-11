import { AssistantOrb } from "@/components/AssistantOrb";
import { ChatMessages } from "@/components/ChatMessages";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const Index = () => {
  const {
    state,
    messages,
    currentEmotion,
    transcript,
    startListening,
    stopListening,
    stopSpeaking,
  } = useVoiceAssistant();

  const handleOrbTap = () => {
    if (state === "listening") {
      stopListening();
    } else if (state === "speaking") {
      stopSpeaking();
    } else if (state === "idle") {
      startListening();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 pt-8 sm:pt-12 text-center animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-wider text-glow-primary">
          <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            NOVA
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground font-body tracking-wide">
          Your Intelligent Voice Assistant
        </p>
      </header>

      {/* Orb section */}
      <section className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-16">
          <AssistantOrb state={state} emotion={currentEmotion} onTap={handleOrbTap} />

          {/* Live transcript */}
          {state === "listening" && transcript && (
            <div className="mt-4 px-6 py-3 rounded-2xl bg-muted/60 backdrop-blur-sm border border-border max-w-sm text-center animate-fade-in">
              <p className="text-sm text-foreground font-body italic">"{transcript}"</p>
            </div>
          )}
        </div>
      </section>

      {/* Chat section */}
      <section className="relative z-10 w-full max-w-lg px-4 pb-8">
        <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border p-4">
          <ChatMessages messages={messages} />
        </div>
      </section>
    </div>
  );
};

export default Index;
