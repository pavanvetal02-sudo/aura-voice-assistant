import { useState } from "react";
import { Send } from "lucide-react";
import { AssistantOrb } from "@/components/AssistantOrb";
import { ChatMessages } from "@/components/ChatMessages";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const {
    state,
    messages,
    currentEmotion,
    transcript,
    startListening,
    stopListening,
    stopSpeaking,
    sendMessage,
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
        <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border p-4 flex flex-col gap-4">
          <ChatMessages messages={messages} onSuggestionClick={sendMessage} />
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim() && state !== "processing") {
                sendMessage(inputValue.trim());
                setInputValue("");
              }
            }}
            className="flex items-center gap-2 relative animate-fade-in"
          >
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Or type a message here..."
              disabled={state === "processing"}
              className="flex-1 bg-background/50 border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || state === "processing"}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-2.5 rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Index;
